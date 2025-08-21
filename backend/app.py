from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import json
import os
import requests
import re
# Activamos las importaciones de Google Drive
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account  # ← AGREGAR ESTA LÍNEA
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request
import tempfile
from datetime import datetime

# Inicializa la aplicación Flask
app = Flask(__name__)
# Habilita CORS para permitir solicitudes desde el frontend
CORS(app, origins=[
    "https://naturalcolorsopti.netlify.app",
    "http://localhost:3000",
    "*"  # Para desarrollo, remover en producción
])

# Configuración de Google Drive
GOOGLE_CLIENT_ID = "1078133780101-q8dmq8l054uoguf4g7b8mltki0qtgb56.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_REDIRECT_URI = "https://optimizations-c6pm.onrender.com/auth/callback"
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Mapeo de zonas a carpetas específicas de Google Drive
ZONE_FOLDER_MAPPING = {
    "Soacha": "13tmRQBn3gA9cw37bdg47OAjg-MhaM0rv",
    "Suba": "1uqfklUp5qddn5eKDfqPCfJbIiyPmcAor", 
    "Engativa": "1Ro-QkNgezvGRngLH9ALvyIDBiYIroDiz",
    "Usme": "1Isr1JaNtfZUR9Cf7t0BRn1ssaigz641-",
    "Ciudad Bolivar": "1jnM2SpW9avRLUD0VHhNK3bl3JRjpH5i8",
    "Kennedy": "1pNweDshOpW6B1ZZXCY5HnItH7ScEnVlP",
    "Fontibon": "14uzyTwVy1codpnqbUEYoRLvx6xtCHavZ",
    "Costa Atlantica": "1KCguGNzgqg_rb4VOkqBYxLIYtiMsQ1Rn",
    "Oficina": "14h87NczLeUH-wm9F9lI9ehmZ1EZP0W8f"
}

# Variable global para almacenar los datos del archivo Excel en memoria.
# Nota: En una aplicación de producción, sería mejor usar una base de datos o un sistema
# de almacenamiento más robusto para manejar múltiples usuarios y sesiones.
excel_data = None

@app.route('/')
def home():
    """Ruta de inicio para verificar que el servidor está funcionando."""
    return "Servidor de Análisis de Excel funcionando. ¡Sube un archivo a /upload!"

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Maneja la subida de archivos Excel o CSV.
    Recibe el archivo, lo lee con pandas y lo almacena en la variable global.
    """
    # Verifica si el archivo está en la solicitud
    if 'excelFile' not in request.files:
        return jsonify({"error": "No se encontró el archivo en la solicitud."}), 400

    file = request.files['excelFile']

    # Verifica si el nombre del archivo está vacío
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo."}), 400

    if file:
        try:
            # Lee el contenido del archivo en un buffer de bytes
            file_content = io.BytesIO(file.read())

            if file.filename.endswith(('.xlsx', '.xls')):
                # Lee archivos Excel, asumiendo que la fila 3 (índice 2) es el encabezado.
                df = pd.read_excel(file_content, header=2)
            elif file.filename.endswith('.csv'):
                try:
                    # Intenta leer CSV con codificación UTF-8
                    df = pd.read_csv(file_content, encoding='utf-8', header=2)
                except UnicodeDecodeError:
                    # Si falla, intenta con codificación latin1
                    file_content.seek(0)
                    df = pd.read_csv(file_content, encoding='latin1', header=2)
            else:
                # Retorna un error si el tipo de archivo no es compatible
                return jsonify({"error": "Tipo de archivo no soportado. Por favor, sube .xlsx, .xls o .csv."}), 400

            global excel_data
            excel_data = df

            print("Archivo subido y procesado con éxito.")
            print("Columnas:", df.columns.tolist())
            print("Primeras 5 filas:\n", df.head())

            return jsonify({
                "message": "Archivo procesado con éxito.",
                "filename": file.filename,
                "columns": df.columns.tolist(),
                "rows_count": len(df)
            }), 200

        except Exception as e:
            print(f"Error al procesar el archivo: {e}")
            return jsonify({"error": f"Error al procesar el archivo: {str(e)}"}), 500
    
    return jsonify({"error": "Ocurrió un error inesperado."}), 500

@app.route('/calculate', methods=['POST'])
def calculate_precise():
    """
    Realiza un cálculo matemático preciso sin usar el LLM.
    Recibe una columna y una operación directamente desde la UI.
    """
    global excel_data
    if excel_data is None:
        return jsonify({"error": "No hay datos cargados."}), 400

    data = request.get_json()
    col = data.get('column')
    op = data.get('operation')

    if not col or not op:
        return jsonify({"error": "Falta la columna o la operación."}), 400

    if col not in excel_data.columns:
        return jsonify({"answer": f"La columna '{col}' no existe en los datos."}), 400

    numeric_col = pd.to_numeric(excel_data[col], errors='coerce')
    
    if op.upper() == 'SUM': result = numeric_col.sum()
    elif op.upper() == 'AVERAGE': result = numeric_col.mean()
    elif op.upper() == 'COUNT': result = numeric_col.count()
    elif op.upper() == 'MAX': result = numeric_col.max()
    elif op.upper() == 'MIN': result = numeric_col.min()
    else: 
        return jsonify({"error": f"Operación no válida: '{op}'"}), 400

    final_answer = f"El resultado del cálculo '{op}' en la columna '{col}' es: {result:,.2f}"
    return jsonify({"answer": final_answer}), 200

@app.route('/ask', methods=['POST'])
def ask_question():
    """
    Recibe una pregunta del usuario, la procesa usando el LLM y los datos cargados,
    y devuelve una respuesta utilizando la API de Google Gemini.
    """
    global excel_data

    if excel_data is None:
        return jsonify({"error": "No se ha cargado ningún archivo Excel. Por favor, sube uno primero."}), 400

    data = request.get_json()
    user_question = data.get('question')

    if not user_question:
        return jsonify({"error": "No se proporcionó ninguna pregunta."}), 400

    try:
        columns_info = ", ".join(excel_data.columns.astype(str).tolist())
        data_sample_string = excel_data.head(5).to_string()

        # Prompt mejorado que instruye al LLM a devolver JSON para cálculos
        prompt_content = (
            f"""Eres un asistente de análisis de datos. Tu única tarea es analizar la pregunta del usuario y determinar si requiere un cálculo matemático o una respuesta general.
            
            Columnas disponibles en los datos: {columns_info}
            Pregunta del usuario: '{user_question}'

            **Instrucciones estrictas:**
            1.  **Si la pregunta es un cálculo** (suma, promedio, contar, máximo, mínimo), DEBES responder ÚNICAMENTE con un objeto JSON. No incluyas texto adicional, explicaciones o markdown. El formato JSON debe ser:
                `{{"calculation": true, "column": "nombre_de_la_columna_exacta", "operation": "OPERACION"}}`
                - `nombre_de_la_columna_exacta` debe coincidir EXACTAMENTE con una de las columnas disponibles.
                - `OPERACION` debe ser una de: `SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN`.

            2.  **Si la pregunta es general** o no se puede responder con un cálculo simple, responde de forma conversacional y amigable. NO uses el formato JSON.

            Analiza la pregunta y proporciona tu respuesta siguiendo estas reglas al pie de la letra.
            """
        )

        api_key = os.getenv("GEMINI_API_KEY")
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview-0514:generateContent?key={api_key}"

        payload = {"contents": [{"role": "user", "parts": [{"text": prompt_content}]}]}
        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload))
        response.raise_for_status()
        result = response.json()

        llm_response_text = result['candidates'][0]['content']['parts'][0]['text']

        # --- DEBUGGING: Imprime la respuesta cruda del LLM para diagnóstico ---
        print("Raw LLM Response:", llm_response_text)

        # Intenta encontrar un bloque JSON en la respuesta del LLM usando regex
        json_match = re.search(r'\{[\s\S]*\}', llm_response_text)

        if json_match:
            json_str = json_match.group(0)
            try:
                # Intenta interpretar la cadena JSON encontrada
                parsed_response = json.loads(json_str)
                if parsed_response.get('calculation'):
                    col = parsed_response.get('column')
                    op = parsed_response.get('operation')

                    if col not in excel_data.columns:
                        return jsonify({"answer": f"La columna '{col}' no existe en los datos. Las columnas disponibles son: {', '.join(excel_data.columns)}"}), 400
                    
                    # Forzar la conversión a numérico, los errores se convertirán en NaN (Not a Number)
                    numeric_col = pd.to_numeric(excel_data[col], errors='coerce')
                    
                    # Verificar cuántos valores no son numéricos y fueron convertidos a NaN
                    non_numeric_count = numeric_col.isna().sum()
                    if non_numeric_count > 0:
                        print(f"ADVERTENCIA: Se encontraron {non_numeric_count} valores no numéricos en la columna '{col}' que serán ignorados en el cálculo.")

                    if op == 'SUM': result = numeric_col.sum()
                    elif op == 'AVERAGE': result = numeric_col.mean()
                    elif op == 'COUNT': result = numeric_col.count() # count ignora los NaN
                    elif op == 'MAX': result = numeric_col.max()
                    elif op == 'MIN': result = numeric_col.min()
                    else: 
                        return jsonify({"answer": f"Operación no válida: '{op}'"}), 400
                    
                    # Respuesta formateada para indicar que el backend hizo el cálculo
                    final_answer = f"El cálculo '{op}' en la columna '{col}' dio como resultado: {result:,.2f}"
                    return jsonify({"answer": final_answer}), 200

            except json.JSONDecodeError:
                # Si se encontró algo que parecía JSON pero no lo era, se trata como respuesta conversacional.
                pass

        # Si no se encontró JSON, no era válido, o no era un cálculo, se trata como respuesta conversacional
        return jsonify({"answer": llm_response_text}), 200

    except requests.exceptions.RequestException as req_err:
        print(f"Error de conexión con la API: {req_err}")
        return jsonify({"error": f"Error de conexión con el servicio de IA: {str(req_err)}"}), 500
    except Exception as e:
        print(f"Error al procesar la pregunta: {e}")
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

@app.route('/upload-to-drive', methods=['POST'])
def upload_to_drive():
    """Sube archivos directamente a Google Drive en carpetas específicas por zona."""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['htmlContent', 'filename', 'zone', 'clientInfo']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido faltante: {field}"}), 400
        
        html_content = data['htmlContent']
        filename = data['filename']
        zone = data['zone']
        client_info = data['clientInfo']
        
        # Verificar que la zona tenga una carpeta asignada
        if zone not in ZONE_FOLDER_MAPPING:
            return jsonify({"error": f"Zona '{zone}' no tiene carpeta asignada"}), 400
        
        folder_id = ZONE_FOLDER_MAPPING[zone]
        
        # Intentar subir a Google Drive
        drive_file = upload_file_to_drive(html_content, filename, folder_id)
        
        if drive_file:
            # Éxito - archivo subido a Google Drive
            print(f"✅ Pedido subido a Google Drive: {drive_file['name']}")
            print(f"👤 Cliente: {client_info.get('cliente', 'N/A')}")
            print(f"📍 Zona: {zone}")
            print(f"🔗 Link: {drive_file.get('webViewLink', 'N/A')}")
            
            return jsonify({
                "success": True,
                "message": f"Pedido subido exitosamente a Google Drive - Zona {zone}",
                "filename": filename,
                "zone": zone,
                "fileId": drive_file['id'],
                "webViewLink": drive_file.get('webViewLink'),
                "client": client_info.get('cliente', 'N/A')
            }), 200
        else:
            # Fallback - guardar localmente si falla Google Drive
            zone_folder = f"pedidos_{zone.lower().replace(' ', '_')}"
            if not os.path.exists(zone_folder):
                os.makedirs(zone_folder)
            
            file_path = os.path.join(zone_folder, filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"⚠️ Guardado localmente (Google Drive falló): {file_path}")
            
            return jsonify({
                "success": True,
                "message": f"Pedido guardado localmente - Zona {zone} (Google Drive no disponible)",
                "filename": filename,
                "zone": zone,
                "local_path": file_path,
                "client": client_info.get('cliente', 'N/A')
            }), 200
        
    except Exception as e:
        print(f"❌ Error al procesar pedido: {e}")
        return jsonify({"error": f"Error al procesar pedido: {str(e)}"}), 500

# Configuración de Google Drive para producción
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', "1078133780101-q8dmq8l054uoguf4g7b8mltki0qtgb56.apps.googleusercontent.com")
GOOGLE_PRIVATE_KEY_ID = os.getenv('GOOGLE_PRIVATE_KEY_ID', "")
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', "https://optimizations-c6pm.onrender.com/auth/callback")
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_google_drive_service():
    """Obtiene el servicio de Google Drive autenticado para producción."""
    try:
        # Verificar variables de entorno
        credentials_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        private_key_id = os.getenv('GOOGLE_PRIVATE_KEY_ID')
        
        print(f"🔍 Verificando credenciales:")
        print(f"   - CLIENT_ID: {'✅ Configurado' if client_id else '❌ Faltante'}")
        print(f"   - PRIVATE_KEY_ID: {'✅ Configurado' if private_key_id else '❌ Faltante'}")
        print(f"   - CREDENTIALS_JSON: {'✅ Configurado' if credentials_json else '❌ Faltante'}")
        
        if credentials_json:
            # Producción: usar service account desde variable de entorno
            credentials_info = json.loads(credentials_json)
            print(f"📧 Service Account Email: {credentials_info.get('client_email', 'N/A')}")
            
            credentials = service_account.Credentials.from_service_account_info(
                credentials_info,
                scopes=SCOPES
            )
            service = build('drive', 'v3', credentials=credentials)
            print("✅ Google Drive autenticado con service account")
            return service
        else:
            # Desarrollo: fallback local
            print("⚠️ No se encontraron credenciales de Google Drive, usando fallback local")
            return None
            
    except json.JSONDecodeError as e:
        print(f"❌ Error al parsear JSON de credenciales: {e}")
        return None
    except Exception as e:
        print(f"❌ Error al autenticar con Google Drive: {e}")
        print(f"❌ Tipo de error: {type(e).__name__}")
        return None

def upload_file_to_drive(file_content, filename, folder_id):
    """Sube un archivo a una carpeta específica de Google Drive."""
    try:
        print(f"🚀 Intentando subir archivo: {filename}")
        print(f"📁 Carpeta destino: {folder_id}")
        
        service = get_google_drive_service()
        if not service:
            print("❌ No se pudo obtener servicio de Google Drive")
            return None
            
        # Crear metadata del archivo
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        print(f"📄 Metadata del archivo: {file_metadata}")
        
        # Crear el archivo en memoria
        file_stream = io.BytesIO(file_content.encode('utf-8'))
        media = MediaIoBaseUpload(file_stream, mimetype='text/html')
        
        # Subir archivo
        print("⬆️ Subiendo archivo a Google Drive...")
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,name,webViewLink'
        ).execute()
        
        print(f"✅ Archivo subido exitosamente: {file}")
        return file
        
    except Exception as e:
        print(f"❌ Error detallado al subir archivo a Drive:")
        print(f"   - Error: {e}")
        print(f"   - Tipo: {type(e).__name__}")
        print(f"   - Archivo: {filename}")
        print(f"   - Carpeta: {folder_id}")
        return None

# Agregar nuevas rutas para OAuth2
@app.route('/auth/google')
def google_auth():
    """Inicia el flujo de autenticación OAuth2 con Google."""
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": os.getenv('GOOGLE_CLIENT_SECRET', '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'),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=SCOPES
    )
    flow.redirect_uri = GOOGLE_REDIRECT_URI
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return jsonify({
        "auth_url": authorization_url,
        "state": state
    })

@app.route('/auth/callback')
def oauth_callback():
    """Maneja el callback de OAuth2 y envía el token a la ventana padre."""
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": os.getenv('GOOGLE_CLIENT_SECRET', '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'),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=SCOPES
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        # Obtener el token de acceso
        flow.fetch_token(authorization_response=request.url)
        
        # Guardar credenciales
        credentials = flow.credentials
        
        # Retornar HTML que envía el token a la ventana padre
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Autenticación Exitosa</title>
        </head>
        <body>
            <h2>✅ Autenticación exitosa</h2>
            <p>Cerrando ventana...</p>
            <script>
                // Enviar token a la ventana padre
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'OAUTH_SUCCESS',
                        access_token: '{credentials.token}'
                    }}, '*');
                }}
                // Cerrar ventana automáticamente
                setTimeout(() => window.close(), 1000);
            </script>
        </body>
        </html>
        '''
        
    except Exception as e:
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error de Autenticación</title>
        </head>
        <body>
            <h2>❌ Error en autenticación</h2>
            <p>Error: {str(e)}</p>
            <script>
                if (window.opener) {{
                    window.opener.postMessage({{
                        type: 'OAUTH_ERROR',
                        error: '{str(e)}'
                    }}, '*');
                }}
                setTimeout(() => window.close(), 3000);
            </script>
        </body>
        </html>
        '''

# Reemplazar la función get_google_drive_service_oauth (línea 462)
def get_google_drive_service_oauth(access_token):
    """Obtiene el servicio de Google Drive con OAuth2."""
    try:
        print(f"🔐 Creando servicio OAuth2 con token: {access_token[:20]}...")
        
        credentials = Credentials(
            token=access_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET', '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'),
            scopes=SCOPES
        )
        
        service = build('drive', 'v3', credentials=credentials)
        print(f"✅ Servicio OAuth2 creado exitosamente")
        return service
        
    except Exception as e:
        print(f"❌ Error al crear servicio OAuth2: {e}")
        return None

# Agregar después de la línea 315 (antes de las configuraciones duplicadas)

@app.route('/upload-to-drive-oauth', methods=['POST'])
def upload_to_drive_oauth():
    """Sube archivos a Google Drive usando OAuth2 del usuario."""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['htmlContent', 'filename', 'zone', 'clientInfo', 'access_token']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido faltante: {field}"}), 400
        
        html_content = data['htmlContent']
        filename = data['filename']
        zone = data['zone']
        client_info = data['clientInfo']
        access_token = data['access_token']
        
        print(f"🔐 Intentando subir con OAuth2: {filename}")
        print(f"👤 Cliente: {client_info.get('cliente', 'N/A')}")
        print(f"📍 Zona: {zone}")
        
        # Verificar que la zona tenga una carpeta asignada
        if zone not in ZONE_FOLDER_MAPPING:
            return jsonify({"error": f"Zona '{zone}' no tiene carpeta asignada"}), 400
        
        folder_id = ZONE_FOLDER_MAPPING[zone]
        
        # Obtener servicio de Google Drive con OAuth2
        drive_service = get_google_drive_service_oauth(access_token)
        
        if not drive_service:
            return jsonify({"error": "No se pudo autenticar con Google Drive"}), 401
        
        # Subir archivo a Google Drive
        try:
            file_metadata = {
                'name': filename,
                'parents': [folder_id]
            }
            
            media = MediaIoBaseUpload(
                io.BytesIO(html_content.encode('utf-8')),
                mimetype='text/html'
            )
            
            file = drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id,name,webViewLink'
            ).execute()
            
            print(f"✅ Archivo subido exitosamente con OAuth2: {file['name']}")
            print(f"🔗 Link: {file.get('webViewLink', 'N/A')}")
            
            return jsonify({
                "success": True,
                "message": f"Pedido subido exitosamente a Google Drive - Zona {zone}",
                "filename": filename,
                "zone": zone,
                "fileId": file['id'],
                "webViewLink": file.get('webViewLink'),
                "client": client_info.get('cliente', 'N/A'),
                "method": "OAuth2"
            }), 200
            
        except Exception as drive_error:
            print(f"❌ Error de Google Drive OAuth2: {drive_error}")
            
            # Fallback - guardar localmente
            zone_folder = f"pedidos_{zone.lower().replace(' ', '_')}"
            if not os.path.exists(zone_folder):
                os.makedirs(zone_folder)
            
            file_path = os.path.join(zone_folder, filename)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"⚠️ Guardado localmente (OAuth2 falló): {file_path}")
            
            return jsonify({
                "success": True,
                "message": f"Pedido guardado localmente - Zona {zone} (OAuth2 falló: {str(drive_error)})",
                "filename": filename,
                "zone": zone,
                "local_path": file_path,
                "client": client_info.get('cliente', 'N/A'),
                "error_details": str(drive_error)
            }), 200
        
    except Exception as e:
        print(f"❌ Error general en upload OAuth2: {e}")
        return jsonify({"error": f"Error al procesar pedido OAuth2: {str(e)}"}), 500

def get_google_drive_service_oauth(access_token):
    """Obtiene el servicio de Google Drive con OAuth2."""
    try:
        credentials = Credentials(token=access_token)
        service = build('drive', 'v3', credentials=credentials)
        return service
    except Exception as e:
        print(f"Error al crear servicio OAuth2: {e}")
        return None

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)