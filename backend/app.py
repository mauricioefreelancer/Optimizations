from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import json
import os
import requests
import re
# Importaciones de WeasyPrint para conversión HTML a PDF
from weasyprint import HTML, CSS
# Importaciones de Google
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request
import tempfile
from datetime import datetime
import signal
from functools import wraps

# Funciones para manejo de timeout
def timeout_handler(signum, frame):
    """Manejador de señal para timeout."""
    raise TimeoutError("La operación ha excedido el tiempo límite")

def with_timeout(seconds):
    """Decorador para agregar timeout a funciones."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Configurar la señal de alarma
            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            
            try:
                result = func(*args, **kwargs)
                return result
            except TimeoutError:
                print(f"⚠️ Timeout: {func.__name__} excedió {seconds} segundos")
                return {
                    'success': False,
                    'error': f'Operación cancelada por timeout ({seconds}s)',
                    'timeout': True
                }
            finally:
                # Restaurar el manejador anterior y cancelar la alarma
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
        
        return wrapper
    return decorator

# Inicializa la aplicación Flask
app = Flask(__name__)
# Habilita CORS para permitir solicitudes desde el frontend
CORS(app, origins=[
    "https://naturalcolorsopti.netlify.app",
    "https://localhost:3000",
    # "*"  # Comentado para producción
])

# Configuración de Google Drive usando variables de entorno
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
# Línea 32 - Ampliar los scopes para tener acceso completo a Drive
SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'  # Acceso completo a Google Drive
]

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
excel_data = None

@app.route('/')
def home():
    """Ruta de inicio para verificar que el servidor está funcionando."""
    return "Servidor de Análisis de Excel funcionando. ¡Sube un archivo a /upload!"

@app.route('/upload', methods=['POST'])
def upload_file():
    """Maneja la subida de archivos Excel o CSV."""
    if 'excelFile' not in request.files:
        return jsonify({"error": "No se encontró el archivo en la solicitud."}), 400

    file = request.files['excelFile']

    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo."}), 400

    if file:
        try:
            file_content = io.BytesIO(file.read())

            if file.filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_content, header=2)
            elif file.filename.endswith('.csv'):
                try:
                    df = pd.read_csv(file_content, encoding='utf-8', header=2)
                except UnicodeDecodeError:
                    file_content.seek(0)
                    df = pd.read_csv(file_content, encoding='latin1', header=2)
            else:
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
    """Realiza un cálculo matemático preciso sin usar el LLM."""
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
    """Recibe una pregunta del usuario y la procesa usando el LLM."""
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

        print("Raw LLM Response:", llm_response_text)

        json_match = re.search(r'\{[\s\S]*\}', llm_response_text)

        if json_match:
            json_str = json_match.group(0)
            try:
                parsed_response = json.loads(json_str)
                if parsed_response.get('calculation'):
                    col = parsed_response.get('column')
                    op = parsed_response.get('operation')

                    if col not in excel_data.columns:
                        return jsonify({"answer": f"La columna '{col}' no existe en los datos. Las columnas disponibles son: {', '.join(excel_data.columns)}"}), 400
                    
                    numeric_col = pd.to_numeric(excel_data[col], errors='coerce')
                    
                    non_numeric_count = numeric_col.isna().sum()
                    if non_numeric_count > 0:
                        print(f"ADVERTENCIA: Se encontraron {non_numeric_count} valores no numéricos en la columna '{col}' que serán ignorados en el cálculo.")

                    if op == 'SUM': result = numeric_col.sum()
                    elif op == 'AVERAGE': result = numeric_col.mean()
                    elif op == 'COUNT': result = numeric_col.count()
                    elif op == 'MAX': result = numeric_col.max()
                    elif op == 'MIN': result = numeric_col.min()
                    else: 
                        return jsonify({"answer": f"Operación no válida: '{op}'"}), 400
                    
                    final_answer = f"El cálculo '{op}' en la columna '{col}' dio como resultado: {result:,.2f}"
                    return jsonify({"answer": final_answer}), 200

            except json.JSONDecodeError:
                pass

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
        
        required_fields = ['htmlContent', 'filename', 'zone', 'clientInfo']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido faltante: {field}"}), 400
        
        html_content = data['htmlContent']
        filename = data['filename']
        zone = data['zone']
        client_info = data['clientInfo']
        
        if zone not in ZONE_FOLDER_MAPPING:
            return jsonify({"error": f"Zona '{zone}' no tiene carpeta asignada"}), 400
        
        folder_id = ZONE_FOLDER_MAPPING[zone]
        
        drive_file = upload_file_to_drive(html_content, filename, folder_id)
        
        if drive_file:
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

def get_google_drive_service():
    """Obtiene el servicio de Google Drive autenticado para producción."""
    try:
        credentials_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        private_key_id = os.getenv('GOOGLE_PRIVATE_KEY_ID')
        
        print(f"🔍 Verificando credenciales:")
        print(f"   - CLIENT_ID: {'✅ Configurado' if client_id else '❌ Faltante'}")
        print(f"   - PRIVATE_KEY_ID: {'✅ Configurado' if private_key_id else '❌ Faltante'}")
        print(f"   - CREDENTIALS_JSON: {'✅ Configurado' if credentials_json else '❌ Faltante'}")
        
        if credentials_json:
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
            
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        print(f"📄 Metadata del archivo: {file_metadata}")
        
        file_stream = io.BytesIO(file_content.encode('utf-8'))
        media = MediaIoBaseUpload(file_stream, mimetype='text/html')
        
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

@app.route('/auth/google')
def google_auth():
    """Inicia el flujo de autenticación OAuth2 con Google."""
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
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
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=SCOPES
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        
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
                window.opener.postMessage({{
                    type: 'OAUTH_SUCCESS',
                    access_token: '{credentials.token}'
                }}, '*');
                window.close();
            </script>
        </body>
        </html>
        '''
        
    except Exception as e:
        print(f"❌ Error en OAuth callback: {e}")
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error de Autenticación</title>
        </head>
        <body>
            <h2>❌ Error de autenticación</h2>
            <p>Error: {str(e)}</p>
            <script>
                window.opener.postMessage({{
                    type: 'OAUTH_ERROR',
                    error: '{str(e)}'
                }}, '*');
                window.close();
            </script>
        </body>
        </html>
        '''

@app.route('/upload-to-drive-oauth', methods=['POST'])
def upload_to_drive_oauth():
    """Sube archivos a Google Drive usando OAuth2 con conversión a PDF."""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['htmlContent', 'filename', 'zone', 'access_token', 'clientInfo']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido faltante: {field}"}), 400
        
        html_content = data['htmlContent']
        filename = data['filename']
        zone = data['zone']
        access_token = data['access_token']
        client_info = data['clientInfo']
        
        print(f"🚀 Procesando pedido OAuth2 para zona: {zone}")
        print(f"👤 Cliente: {client_info.get('cliente', 'N/A')}")
        print(f"📧 Correo: {client_info.get('correo', 'No especificado')}")
        
        # 🆕 CONVERTIR HTML A PDF
        print(f"🔄 Convirtiendo HTML a PDF...")
        pdf_content = convert_html_to_pdf(html_content)
        if not pdf_content:
            return jsonify({"error": "Error al convertir HTML a PDF"}), 500
        
        # Cambiar extensión del archivo a PDF
        pdf_filename = filename.replace('.html', '.pdf')
        print(f"📄 Archivo PDF: {pdf_filename}")
        
        # Validar datos para Drive
        is_valid, validation_message = validateForDrive(data)
        if not is_valid:
            return jsonify({
                "error": "Datos inválidos para subir a Drive",
                "details": validation_message
            }), 400
        
        # Verificar zona válida
        if zone not in ZONE_FOLDER_MAPPING:
            return jsonify({"error": f"Zona '{zone}' no tiene carpeta asignada"}), 400
        
        folder_id = ZONE_FOLDER_MAPPING[zone]
        
        # Intentar subir con OAuth2
        print(f"📤 Intentando subida OAuth2...")
        drive_file = upload_file_to_drive_oauth(pdf_content, pdf_filename, folder_id, access_token)
        
        if drive_file:
            print(f"✅ Pedido PDF subido exitosamente a Google Drive")
            print(f"🔗 Link: {drive_file.get('webViewLink', 'N/A')}")
            
            return jsonify({
                "success": True,
                "message": f"Pedido PDF subido exitosamente a Google Drive - Zona {zone}",
                "filename": pdf_filename,
                "zone": zone,
                "fileId": drive_file['id'],
                "webViewLink": drive_file.get('webViewLink'),
                "method": "OAuth2"
            }), 200
        else:
            # Fallback a Service Account
            print(f"⚠️ OAuth2 falló, intentando con Service Account...")
            drive_file = upload_file_to_drive(pdf_content, pdf_filename, folder_id)
            
            if drive_file:
                print(f"✅ Pedido PDF subido con Service Account")
                return jsonify({
                    "success": True,
                    "message": f"Pedido PDF subido exitosamente a Google Drive - Zona {zone} (Service Account)",
                    "filename": pdf_filename,
                    "zone": zone,
                    "fileId": drive_file['id'],
                    "webViewLink": drive_file.get('webViewLink'),
                    "method": "Service Account"
                }), 200
            else:
                # Guardar localmente como último recurso
                print(f"⚠️ Ambos métodos fallaron, guardando localmente...")
                local_path = save_html_locally(html_content, pdf_filename, zone)
                
                return jsonify({
                    "success": True,
                    "message": f"Pedido guardado localmente en {local_path}",
                    "filename": pdf_filename,
                    "zone": zone,
                    "local_path": local_path,
                    "method": "Local Storage"
                }), 200
        
    except Exception as e:
        print(f"❌ Error en upload_to_drive_oauth: {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

def get_google_drive_service_oauth(access_token):
    """Obtiene el servicio de Google Drive usando OAuth2 con timeout."""
    try:
        print(f"🔄 Creando servicio OAuth2...")
        print(f"🔑 Client ID: {GOOGLE_CLIENT_ID[:20]}...")
        print(f"🔑 Token: {access_token[:20]}...")
        
        credentials = Credentials(
            token=access_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            scopes=SCOPES
        )
        
        # Verificar que las credenciales sean válidas
        if not credentials.valid:
            print("⚠️ Credenciales no válidas, intentando refrescar...")
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                print("✅ Token refrescado exitosamente")
            else:
                print("❌ No se puede refrescar el token")
                return None
        
        service = build('drive', 'v3', credentials=credentials)
        
        # Probar el servicio con una consulta simple
        try:
            about = service.about().get(fields='user').execute()
            user_email = about.get('user', {}).get('emailAddress', 'Desconocido')
            print(f"✅ Servicio OAuth2 creado exitosamente para: {user_email}")
        except Exception as test_error:
            print(f"⚠️ Servicio creado pero con advertencias: {test_error}")
        
        return service
        
    except Exception as e:
        print(f"❌ Error al crear servicio OAuth2: {e}")
        print(f"❌ Tipo de error: {type(e).__name__}")
        return None

@with_timeout(30)
def upload_file_to_drive_oauth(file_content, filename, folder_id, access_token):
    """Sube un archivo a Google Drive usando OAuth2 con soporte para PDF."""
    try:
        print(f"🔄 Iniciando subida OAuth2: {filename}")
        print(f"📁 Carpeta destino: {folder_id}")
        
        service = get_google_drive_service_oauth(access_token)
        if not service:
            print("❌ No se pudo crear el servicio de Google Drive")
            return None
        
        # Verificar carpeta
        try:
            folder_info = service.files().get(
                fileId=folder_id, 
                fields='id,name'
            ).execute()
            print(f"✅ Carpeta encontrada: {folder_info.get('name', 'Sin nombre')}")
        except Exception as folder_check_error:
            print(f"⚠️ No se puede acceder a la carpeta: {folder_check_error}")
            return None
        
        # Crear archivo con el tipo MIME correcto
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        # Determinar el tipo MIME y preparar el contenido
        if filename.endswith('.pdf'):
            mimetype = 'application/pdf'
            # Para PDF, file_content ya son bytes
            file_stream = io.BytesIO(file_content)
        else:
            mimetype = 'text/html'
            # Para HTML, convertir string a bytes
            file_stream = io.BytesIO(file_content.encode('utf-8'))
        
        media = MediaIoBaseUpload(file_stream, mimetype=mimetype, resumable=False)
        
        print(f"📤 Subiendo archivo {mimetype}...")
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,name,webViewLink'
        ).execute()
        
        print(f"✅ Archivo subido exitosamente: {file['id']}")
        return file
        
    except TimeoutError:
        print(f"⏰ Timeout al subir archivo OAuth2")
        return None
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error al subir archivo OAuth: {error_msg}")
        
        if "insufficientParentPermissions" in error_msg or "403" in error_msg:
            print("🔍 Error de permisos - usando Service Account como respaldo")
        elif "401" in error_msg:
            print("🔍 Token inválido - usando Service Account como respaldo")
        elif "timeout" in error_msg.lower():
            print("🔍 Timeout de red - usando Service Account como respaldo")
        
        return None

def validateForDrive(data):
    """Valida que los datos requeridos estén presentes para subir a Drive."""
    print(f"🔍 Validando datos: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    # Remover 'htmlContent' de los campos requeridos ya que se convierte a PDF
    required_fields = ['filename', 'zone', 'clientInfo']
    
    for field in required_fields:
        if field not in data or not data[field]:
            print(f"❌ Campo faltante: {field}")
            return False, f"Campo requerido faltante o vacío: {field}"
    
    # Validación específica del campo clientInfo
    client_info = data['clientInfo']
    if not isinstance(client_info, dict):
        print(f"❌ clientInfo no es un objeto: {type(client_info)}")
        return False, "clientInfo debe ser un objeto"
    
    # Validar campos básicos requeridos en clientInfo
    basic_required_fields = ['nit', 'direccion', 'barrio']
    for field in basic_required_fields:
        if field not in client_info or not client_info[field] or str(client_info[field]).strip() == "":
            print(f"❌ Campo {field} faltante en clientInfo: {client_info}")
            return False, f"El campo '{field}' es requerido en clientInfo"
    
    # Validación condicional del correo basada en ordenSalida
    orden_salida = client_info.get('ordenSalida', '')
    if orden_salida == 'facturado':
        if 'correo' not in client_info or not client_info['correo'] or str(client_info['correo']).strip() == "":
            print(f"❌ Campo correo faltante para pedido facturado: {client_info}")
            return False, "El campo 'correo' es requerido para pedidos facturados"
        
        # Validar formato de correo electrónico solo si está presente
        email = client_info['correo']
        print(f"📧 Validando email para pedido facturado: '{email}'")
        
        # Limpiar espacios en blanco
        email = email.strip() if isinstance(email, str) else str(email)
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            print(f"❌ Formato de email inválido: '{email}'")
            return False, f"El formato del correo electrónico no es válido: '{email}'"
    else:
        print(f"ℹ️ Correo no requerido para orden de salida: {orden_salida}")
    
    print(f"✅ Validación exitosa para todos los campos requeridos")
    return True, "Validación exitosa"

# Nueva función para convertir HTML a PDF
def convert_html_to_pdf(html_content):
    """Convierte contenido HTML a PDF usando WeasyPrint."""
    try:
        print(f"🔄 Iniciando conversión HTML a PDF...")
        
        # Crear CSS básico para mejorar el formato del PDF
        css_content = """
        @page {
            size: A4;
            margin: 1cm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .info-section {
            margin-bottom: 15px;
        }
        .info-value {
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        .signature {
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 5px;
            width: 20%;
        }
        """
        
        # Crear objeto HTML desde el string
        html_doc = HTML(string=html_content)
        css_doc = CSS(string=css_content)
        
        # Generar el PDF en memoria
        pdf_bytes = html_doc.write_pdf(stylesheets=[css_doc])
        
        print(f"✅ PDF generado exitosamente. Tamaño: {len(pdf_bytes)} bytes")
        return pdf_bytes
        
    except Exception as e:
        print(f"❌ Error al convertir HTML a PDF: {e}")
        print(f"❌ Tipo de error: {type(e).__name__}")
        return None

@app.route('/append-to-recaudo-sheet', methods=['POST'])
def append_to_recaudo_sheet():
    """Agrega una nueva fila de datos de recaudo al archivo XLSX en Google Drive."""
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['access_token', 'fecha', 'tipoCliente', 'vendedor', 'nombreCliente', 'spreadsheetId']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido faltante: {field}"}), 400
        
        access_token = data['access_token']
        spreadsheet_id = data['spreadsheetId']
        
        # Preparar los datos de la fila exactamente como aparecen en tu Google Sheet
        current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        row_data = [
            data.get('fecha', ''),                                    # A - Fecha
            data.get('tipoCliente', ''),                             # B - Tipo Cliente
            data.get('vendedor', ''),                                # C - Asesor/Vendedor
            data.get('nombreCliente', ''),                           # D - Nombre Cliente
            'TRUE' if data.get('vendio') else 'FALSE',               # E - Vendió (checkbox)
            data.get('valorVendio', '') if data.get('vendio') else '',  # F - Valor Vendido
            'TRUE' if data.get('abono') else 'FALSE',                # G - Abonó (checkbox)
            data.get('valorAbono', '') if data.get('abono') else '',    # H - Valor Abono
            data.get('efectivo', ''),                                # I - Efectivo
            data.get('transferencia', ''),                           # J - Transferencia
            data.get('observaciones', ''),                           # K - Observaciones
            current_timestamp                                        # L - Timestamp
        ]
        
        print(f"🚀 Procesando datos de recaudo para: {data.get('nombreCliente')}")
        print(f"📊 Datos de fila: {row_data}")
        print(f"📋 Spreadsheet ID: {spreadsheet_id}")
        
        # Obtener servicio de Google Sheets
        service = get_google_sheets_service_oauth(access_token)
        if not service:
            return jsonify({"error": "No se pudo autenticar con Google Sheets"}), 401
        
        # Agregar la fila al final de la hoja (columnas A hasta L)
        range_name = 'Tabla_1!A:L'
        
        body = {
            'values': [row_data]
        }
        
        result = service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='USER_ENTERED',  # Cambiado a USER_ENTERED para manejar checkboxes
            body=body
        ).execute()
        
        print(f"✅ Fila agregada exitosamente. Celdas actualizadas: {result.get('updates', {}).get('updatedCells', 0)}")
        
        return jsonify({
            "success": True,
            "message": "Datos de recaudo guardados exitosamente",
            "updatedCells": result.get('updates', {}).get('updatedCells', 0),
            "cliente": data.get('nombreCliente'),
            "timestamp": current_timestamp
        }), 200
        
    except Exception as e:
        print(f"❌ Error al guardar datos de recaudo: {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

def get_google_sheets_service_oauth(access_token):
    """Obtiene el servicio de Google Sheets usando OAuth2."""
    try:
        print(f"🔄 Creando servicio de Google Sheets OAuth2...")
        
        credentials = Credentials(
            token=access_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            scopes=['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
        )
        
        # Verificar que las credenciales sean válidas
        if not credentials.valid:
            print("⚠️ Credenciales no válidas, intentando refrescar...")
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                print("✅ Token refrescado exitosamente")
            else:
                print("❌ No se puede refrescar el token")
                return None
        
        service = build('sheets', 'v4', credentials=credentials)
        print(f"✅ Servicio de Google Sheets creado exitosamente")
        
        return service
        
    except Exception as e:
        print(f"❌ Error al crear servicio de Google Sheets: {e}")
        return None

@app.route('/create-recaudo-spreadsheet', methods=['POST'])
def create_recaudo_spreadsheet():
    """Crea el archivo XLSX base para recaudo en Google Drive."""
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({"error": "Token de acceso requerido"}), 400
        
        # Obtener servicio de Google Sheets
        service = get_google_sheets_service_oauth(access_token)
        if not service:
            return jsonify({"error": "No se pudo autenticar con Google Sheets"}), 401
        
        # Crear nueva hoja de cálculo
        spreadsheet = {
            'properties': {
                'title': f'Reporte de Recaudo - {datetime.now().strftime("%Y-%m-%d")}'
            },
            'sheets': [{
                'properties': {
                    'title': 'Hoja1'
                }
            }]
        }
        
        spreadsheet = service.spreadsheets().create(body=spreadsheet).execute()
        spreadsheet_id = spreadsheet.get('spreadsheetId')
        
        print(f"✅ Hoja de cálculo creada: {spreadsheet_id}")
        
        # Agregar encabezados
        headers = [
            'Fecha', 'Tipo Cliente', 'Vendedor', 'Nombre Cliente', 
            'Vendió', 'Valor Vendió', 'Abonó', 'Valor Abonó', 
            'Efectivo', 'Transferencia', 'Observaciones'
        ]
        
        body = {
            'values': [headers]
        }
        
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='Hoja1!A1:K1',
            valueInputOption='RAW',
            body=body
        ).execute()
        
        print(f"✅ Encabezados agregados a la hoja de cálculo")
        
        return jsonify({
            "success": True,
            "message": "Archivo base de recaudo creado exitosamente",
            "spreadsheetId": spreadsheet_id,
            "webViewLink": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"
        }), 200
        
    except Exception as e:
        print(f"❌ Error al crear archivo de recaudo: {e}")
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, host='0.0.0.0', port=port)