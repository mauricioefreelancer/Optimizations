from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import json
import os
import requests
import re

# Inicializa la aplicación Flask
app = Flask(__name__)
# Habilita CORS para permitir solicitudes desde el frontend
CORS(app)

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

if __name__ == '__main__':
    # El servicio de hosting proporcionará el puerto a través de una variable de entorno 'PORT'
    port = int(os.environ.get("PORT", 5000))
    # host='0.0.0.0' para que el servidor escuche conexiones desde cualquier IP externa
    app.run(debug=True, host='0.0.0.0', port=port)