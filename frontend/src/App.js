import React, { useState } from "react";

// Define la URL base de tu backend desplegado en Render
const API_BASE_URL = "https://excel-analyser-backend.onrender.com";

// Datos de productos consolidados de los archivos CSV.
const PRODUCT_DATA = {
  // Grupos de productos
  groups: [
    "FRASCO SHAMPOO COLOR PROTECT TONO SOBRE TONO",
    "FRASCO MASCARILLA COLOR PROTECT TONO SOBRE TONO",
    "DISPLAY SHAMPOO COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID",
    "DISPLAY MASCARILLA COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID",
    "DOYPACK MASCARILLA COLOR PROTECT TONO SOBRE TONO X 100 ML",
    "MANTEQUILLA CORPORAL X 370 ML",
    "FRASCO MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 160 ML",
    "DISPLAY MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 30 ML",
    "LINEA TERMOPROTECTORA KERAMILK",
    "LINEA SUERO EMERGENCIA CAPILAR SOS",
    "LINEA FASTMEN",
    "LINEA RIZOS EFECTO MEMORIA",
    "LINEA PLUS CAPILAR",
    "LINEA SHAMPOO NEUTRO",
    "LINEA UÑAS REMOVEDOR",
  ],

  // Productos organizados por grupo
  products: {
    "FRASCO SHAMPOO COLOR PROTECT TONO SOBRE TONO": [
      { cod: "NC16", description: "SH BEIGE PERLA", unitPrice: 18750 },
      { cod: "NC18", description: "SH CHOCOLATE LIGTH", unitPrice: 18750 },
      { cod: "NC12", description: "SH GRIS SILVER", unitPrice: 18750 },
      { cod: "NC14", description: "SH NEGRO NIGHT", unitPrice: 18750 },
      { cod: "NC9", description: "SH ROJO INTENSE", unitPrice: 18750 },
      { cod: "NC10", description: "SH VIOLETA ULTRA", unitPrice: 18750 },
      { cod: "NC05", description: "SH CENIZO SPECIAL", unitPrice: 18750 },
      { cod: "NC64", description: "SH COBRE DEEP", unitPrice: 18750 },
      { cod: "NC235", description: "SH MECHAS BLANCAS", unitPrice: 18750 },
    ],
    "FRASCO MASCARILLA COLOR PROTECT TONO SOBRE TONO": [
      { cod: "NC15", description: "MSC BEIGE PERLA", unitPrice: 18750 },
      { cod: "NC17", description: "MSC CHOCOLATE LIGTH", unitPrice: 18750 },
      { cod: "NC11", description: "MSC GRIS SILVER", unitPrice: 18750 },
      { cod: "NC13", description: "MSC NEGRO NIGHT", unitPrice: 18750 },
      { cod: "NC08", description: "MSC ROJO INTENSE", unitPrice: 18750 },
      { cod: "NC07", description: "MSC VIOLETA ULTRA", unitPrice: 18750 },
      { cod: "NC06", description: "MSC CENIZO SPECIAL", unitPrice: 18750 },
      { cod: "NC65", description: "MSC COBRE DEEP", unitPrice: 18750 },
      { cod: "NC67", description: "MSC AZUL PLATINO", unitPrice: 18750 },
      { cod: "NC202", description: "MSC MECHAS BLANCAS", unitPrice: 18750 },
    ],
    "DOYPACK MASCARILLA COLOR PROTECT TONO SOBRE TONO X 100 ML": [
      { cod: "NC39", description: "MSC BEIGE PERLA", unitPrice: 6600 },
      { cod: "NC40", description: "MSC CHOCOLATE LIGTH", unitPrice: 6600 },
      { cod: "NC41", description: "MSC GRIS SILVER", unitPrice: 6600 },
      { cod: "NC42", description: "MSC NEGRO NIGHT", unitPrice: 6600 },
      { cod: "NC43", description: "MSC ROJO INTENSE", unitPrice: 6600 },
      { cod: "NC44", description: "MSC VIOLETA ULTRA", unitPrice: 6600 },
      { cod: "NC45", description: "MSC CENIZO SPECIAL", unitPrice: 6600 },
      { cod: "NC85", description: "MSC COBRE DEEP", unitPrice: 6600 },
      { cod: "NC86", description: "MSC AZUL PLATINO", unitPrice: 6600 },
      { cod: "NC214", description: "MSC MECHAS BLANCAS", unitPrice: 6600 },
    ],
    "LINEA TERMOPROTECTORA KERAMILK": [
      {
        cod: "NC37",
        description: "DOYPACK SHAMPOO KERAMILK X100ML",
        unitPrice: 6000,
      },
      { cod: "NC03", description: "SHAMPOO KERAMILK X 300", unitPrice: 18750 },
      {
        cod: "NC33",
        description: "DISPLAY SHAMPOO KERAMILK X 14 UND",
        unitPrice: 33000,
      },
      {
        cod: "NC36",
        description: "DOYPACK TRATAMIENTO KERAMILK X100ML",
        unitPrice: 6600,
      },
      {
        cod: "NC04",
        description: "TRATAMIENTO KERAMILK X 300",
        unitPrice: 20000,
      },
      {
        cod: "NC216",
        description: "TRATAMIENTO POTE KERAMILK X 370 ML",
        unitPrice: 21700,
      },
      {
        cod: "NC34",
        description: "DISPLAY TRATAMIENTO KERAMILK X 14 UND",
        unitPrice: 33000,
      },
      {
        cod: "NC253",
        description: "TERMOPROTECTOR KERAMILK SPRAY 160 ML",
        unitPrice: 14200,
      },
      {
        cod: "NC254",
        description: "TERMOPROTECTOR KERAMILK SPRAY 300 ML",
        unitPrice: 21700,
      },
    ],
    "LINEA FASTMEN": [
      { cod: "NC55", description: "DOY PACK FAST MEN X100ML", unitPrice: 5300 },
      { cod: "NC50", description: "FAST MEN X160ML", unitPrice: 9900 },
      { cod: "NC217", description: "POTE FAST MEN X 370", unitPrice: 15540 },
      {
        cod: "NC56",
        description: "DISPLAY FAST MEN 14UX30ML",
        unitPrice: 25300,
      },
      {
        cod: "NC218",
        description: "FRASCO SHAMPOO FAST MEN X 300 ML",
        unitPrice: 15500,
      },
    ],
    "LINEA PLUS CAPILAR": [
      {
        cod: "NC02",
        description: "ABLANDADOR DE CANAS CAJA X6U X30ML",
        unitPrice: 27000,
      },
      {
        cod: "NC49",
        description: "SILICONA REGENERADORA UVA X55ML",
        unitPrice: 18500,
      },
      {
        cod: "NC53",
        description: "CAJA X20UNDS DE SILICONA REG UVA X20ML",
        unitPrice: 92000,
      },
      {
        cod: "NC59",
        description: "LACA SUAVE X160ML (Rosada)",
        unitPrice: 11600,
      },
      {
        cod: "NC60",
        description: "LACA EXTRAFUERTE X160ML (Amarilla)",
        unitPrice: 12700,
      },
    ],
    // Los demás grupos estarán vacíos hasta que agregues los productos
    "DISPLAY SHAMPOO COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID": [
      { cod: "NC29", description: "SH BEIGE PERLA", unitPrice: 33000 },
      { cod: "NC32", description: "SH CHOCOLATE LIGTH", unitPrice: 33000 },
      { cod: "NC28", description: "SH GRIS SILVER", unitPrice: 33000 },
      { cod: "NC27", description: "SH NEGRO NIGHT", unitPrice: 33000 },
      { cod: "NC31", description: "SH ROJO INTENSE", unitPrice: 33000 },
      { cod: "NC30", description: "SH VIOLETA ULTRA", unitPrice: 33000 },
      { cod: "NC26", description: "SH CENIZO SPECIAL", unitPrice: 33000 },
      { cod: "NC258", description: "SH MECHAS BLANCAS", unitPrice: 33000 },
      { cod: "NC259", description: "SH COBRE DEEP", unitPrice: 33000 },
    ],
    "DISPLAY MASCARILLA COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID": [
      { cod: "NC22", description: "MSC BEIGE PERLA", unitPrice: 33000 },
      { cod: "NC25", description: "MSC CHOCOLATE LIGTH", unitPrice: 33000 },
      { cod: "NC21", description: "MSC GRIS SILVER", unitPrice: 33000 },
      { cod: "NC20", description: "MSC NEGRO NIGHT", unitPrice: 33000 },
      { cod: "NC24", description: "MSC ROJO INTENSE", unitPrice: 33000 },
      { cod: "NC23", description: "MSC VIOLETA ULTRA", unitPrice: 33000 },
      { cod: "NC19", description: "MSC CENIZO SPECIAL", unitPrice: 33000 },
      { cod: "NC69", description: "MSC AZUL PLATINO", unitPrice: 33000 },
      { cod: "NC68", description: "MSC COBRE DEEP", unitPrice: 33000 },
      { cod: "NC237", description: "MSC MECHAS BLANCAS", unitPrice: 33000 },
    ],
    "MANTEQUILLA CORPORAL X 370 ML": [
      { cod: "NC244", description: "MAN. CORP FRUTOS ROJOS", unitPrice: 24000 },
      { cod: "NC247", description: "MAN. CORP UVA SENTIAL", unitPrice: 24000 },
      {
        cod: "NC246",
        description: "MAN. CORP MARACUYA GLITTER",
        unitPrice: 24000,
      },
      { cod: "NC245", description: "MAN. CORP UNISEX AVENA", unitPrice: 24000 },
      { cod: "NC248", description: "MAN. CORP . CANNABIS", unitPrice: 24000 },
    ],
    "FRASCO MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 160 ML": [
      { cod: "NC71", description: "MSC AZUL FANTASY", unitPrice: 11000 },
      { cod: "NC73", description: "MSC GREEN PASTEL", unitPrice: 11000 },
      { cod: "NC75", description: "MSC MAGENTA PASTEL", unitPrice: 11000 },
      { cod: "NC74", description: "MSC ORANGE FANTASY", unitPrice: 11000 },
      { cod: "NC72", description: "MSC VIOLETA FANTASY", unitPrice: 11000 },
    ],
    "DISPLAY MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 30 ML": [
      { cod: "NC158", description: "MSC AZUL FANTASY", unitPrice: 34500 },
      { cod: "NC156", description: "MSC MAGENTA FANTASY", unitPrice: 34500 },
      {
        cod: "NC159",
        description: "MSC ORANGE PASTEL FANTASY",
        unitPrice: 34500,
      },
      { cod: "NC155", description: "MSC VERDE FANTASY", unitPrice: 34500 },
      { cod: "NC157", description: "MSC VIOLETA FANTASY", unitPrice: 34500 },
    ],
    "LINEA SUERO EMERGENCIA CAPILAR SOS": [
      {
        cod: "NC91",
        description: "SOS TRATAMIENTO X 100 DOY PACK",
        unitPrice: 7200,
      },
      {
        cod: "NC215",
        description: "SOS TRATAMIENTO X 370 ML",
        unitPrice: 24500,
      },
      {
        cod: "NC236",
        description: "SOS SHAMPOOX 14 DISPLAY",
        unitPrice: 33000,
      },
      {
        cod: "NC90",
        description: "SOS TRATAMIENTOX14 DISPLAY",
        unitPrice: 38200,
      },
      {
        cod: "NC219",
        description: "SOS FRASCO SHAMPOO X 300",
        unitPrice: 18750,
      },
      {
        cod: "NC243",
        description: "SHAMPOO SOS DOYPACK X 100 ML",
        unitPrice: 7200,
      },
    ],
    "LINEA RIZOS EFECTO MEMORIA": [
      {
        cod: "NC38",
        description: "DOY PACK FIJADOR FLUIDO X100ML",
        unitPrice: 6000,
      },
      { cod: "NC238", description: "FLUIDO FIJADOR X 300ML", unitPrice: 13600 },
      {
        cod: "NC35",
        description: "DISPLAY FLUIDO FIJADOR X 14",
        unitPrice: 30000,
      },
      { cod: "NC241", description: "SHAMPOO RIZOS X 300 ML", unitPrice: 18750 },
      {
        cod: "NC252",
        description: "SHAMPOO RIZOS DOY PACK 100 ML",
        unitPrice: 6000,
      },
      { cod: "NC242", description: "TRATAMIENTO RIZOS X300", unitPrice: 18800 },
      {
        cod: "NC251",
        description: "TRATAMIENTO RIZOS DOY PACK 100 ML",
        unitPrice: 6200,
      },
      {
        cod: "NC249",
        description: "SHAMPOO RIZOS DISP 14 X 40 ML",
        unitPrice: 35000,
      },
      {
        cod: "NC250",
        description: "TRATAMIENTO RIZOS DISP 14 X 40 ML",
        unitPrice: 35000,
      },
      {
        cod: "NC260",
        description: 'FIJAOR FLUIDO DISP 14 X 40 ML "LLEVE 50ML"',
        unitPrice: 35000,
      },
    ],
    "LINEA SHAMPOO NEUTRO": [
      {
        cod: "NC87",
        description: "DOYPACK SHAMPOO NEUTRO X100ML",
        unitPrice: 6000,
      },
      {
        cod: "NC63",
        description: "SH. NEUTRO SPECIAL X300 ML",
        unitPrice: 18750,
      },
      {
        cod: "NC70",
        description: "DISPLAY SH NEUTRO ESPECIAL X 30 ML",
        unitPrice: 33000,
      },
    ],
    "LINEA UÑAS REMOVEDOR": [
      {
        cod: "NC54",
        description: "REMOVEDOR ECOLOGICO X60ML",
        unitPrice: 3800,
      },
      {
        cod: "NC48",
        description: "REMOVEDOR ECOLOGICO X120ML",
        unitPrice: 6200,
      },
      {
        cod: "NC47",
        description: "REMOVEDOR ECOLOGICO X 250ML",
        unitPrice: 10500,
      },
      {
        cod: "NC220",
        description: "REMOVEDOR ECOLOGICO X 350ML",
        unitPrice: 12000,
      },
      {
        cod: "NC46",
        description: "REMOVEDOR ECOLOGICO X500ML",
        unitPrice: 16800,
      },
      {
        cod: "NC66",
        description: "REMOVEDOR ECOLOGICO X1000ML",
        unitPrice: 28000,
      },
      { cod: "ESM009", description: "UÑAS DE FELINO", unitPrice: 6950 },
    ],
  },

  // Función auxiliar para obtener todos los productos en un array plano (para compatibilidad con código existente)
  getAllProducts: function () {
    let allProducts = [];
    for (const group in this.products) {
      allProducts = allProducts.concat(this.products[group]);
    }
    return allProducts;
  },
};

// Componente para la funcionalidad de Analizar Excel
const ExcelAnalyser = ({ onReturnToMenu }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "text/csv"
      ) {
        setSelectedFile(file);
        setMessage(`Archivo seleccionado: ${file.name}`);
        setFileUploaded(false);
        setAnswer("");
      } else {
        setSelectedFile(null);
        setMessage(
          "Por favor, sube un archivo Excel o CSV válido (.xlsx, .xls o .csv)."
        );
        setFileUploaded(false);
        setAnswer("");
      }
    } else {
      setSelectedFile(null);
      setMessage("");
      setFileUploaded(false);
      setAnswer("");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona un archivo primero.");
      return;
    }

    setMessage("Subiendo archivo...");
    setLoadingAnswer(true);

    try {
      const formData = new FormData();
      formData.append("excelFile", selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(
          `"${
            selectedFile.name
          }" subido y procesado con éxito. Columnas: ${data.columns.join(
            ", "
          )}. Filas: ${data.rows_count}`
        );
        setFileUploaded(true);
        setAnswer("");
      } else {
        const errorData = await response.json();
        setMessage(`Error al subir el archivo: ${errorData.error}`);
        setFileUploaded(false);
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setMessage(
        "Hubo un problema de conexión con el servidor. Asegúrate de que el backend esté corriendo."
      );
      setFileUploaded(false);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setAnswer("Por favor, escribe una pregunta.");
      return;
    }
    if (!fileUploaded) {
      setAnswer(
        "Por favor, sube un archivo Excel primero para hacer preguntas."
      );
      return;
    }

    setLoadingAnswer(true);
    setAnswer("Obteniendo respuesta...");

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
      } else {
        const errorData = await response.json();
        setAnswer(`Error al obtener respuesta: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al enviar la pregunta:", error);
      setAnswer(
        "Hubo un problema de conexión al intentar obtener la respuesta."
      );
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Analizador de Archivos Excel
      </h1>

      <p className="text-gray-600 mb-6 text-center">
        Sube tu archivo .xlsx, .xls o .csv para empezar a analizar tus datos.
      </p>

      {/* Sección de Subida de Archivos */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Seleccionar archivo Excel/CSV:
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100
                       cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {message && (
          <p
            className={`text-sm mt-4 text-center ${
              fileUploaded ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        <button
          onClick={handleFileUpload}
          disabled={!selectedFile || loadingAnswer}
          className={`w-full mt-4 py-3 px-4 rounded-lg text-white font-semibold
                       transition duration-300 ease-in-out
                       ${
                         !selectedFile || loadingAnswer
                           ? "bg-gray-400 cursor-not-allowed"
                           : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                       }`}
        >
          {loadingAnswer && !fileUploaded
            ? "Subiendo..."
            : "Subir y Analizar Archivo"}
        </button>
      </div>

      {/* Sección de Preguntas y Respuestas */}
      {fileUploaded && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Haz una Pregunta sobre los Datos
          </h2>
          <div className="mb-4">
            <label
              htmlFor="question-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tu pregunta:
            </label>
            <textarea
              id="question-input"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y"
              rows="3"
              placeholder="Ej: ¿Cuántos clientes hay en Bogotá?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loadingAnswer}
            ></textarea>
          </div>
          <button
            onClick={handleAskQuestion}
            disabled={loadingAnswer || !question.trim()}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold
                         transition duration-300 ease-in-out
                         ${
                           loadingAnswer || !question.trim()
                             ? "bg-gray-400 cursor-not-allowed"
                             : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                         }`}
          >
            {loadingAnswer ? "Procesando..." : "Obtener Respuesta"}
          </button>

          {answer && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Respuesta:
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>
      )}
      <button
        onClick={onReturnToMenu}
        className="mt-6 w-full py-3 px-4 rounded-lg text-white font-semibold bg-gray-500 hover:bg-gray-600 transition duration-300 ease-in-out"
      >
        Regresar al Menú
      </button>
    </div>
  );
};

// Componente para la funcionalidad de Llenado de Toma de Pedido
const PedidoForm = ({ onReturnToMenu }) => {
  const [clientInfo, setClientInfo] = useState({
    fecha: new Date().toISOString().split("T")[0],
    nit: "",
    vendedor: "",
    cliente: "",
    telefono: "",
    contado: "X",
    credito: "",
    direccion: "",
    ciudad: "",
    listaPrecios: "",
    descuento: 0,
    barrio: "",
    cel: "",
    correo: "",
    ordenSalida: "facturado",
    observaciones: "",
  });

  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [bonus, setBonus] = useState(0);

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleAddProduct = () => {
    if (!selectedProduct || (quantity <= 0 && bonus <= 0)) return;

    const product = PRODUCT_DATA.products[selectedCategory].find(
      (p) => p.cod === selectedProduct
    );

    if (!product) return;

    // Nueva lógica: La bonificación es adicional y no se resta del subtotal
    // El subtotal ahora se calcula multiplicando el precio unitario por la cantidad
    // sin restar la bonificación, ya que la bonificación es gratis
    const newItem = {
      cod: product.cod,
      description: product.description,
      unitPrice: product.unitPrice,
      quantity: Number(quantity),
      bonus: Number(bonus),
      subtotal: product.unitPrice * quantity, // Solo se cobra la cantidad, la bonificación es gratis
      descuento: 0, // Inicializar
      iva: 0, // Inicializar
      total: 0, // Inicializar
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct("");
    setQuantity(0);
    setBonus(0);
  };

  const handleRemoveProduct = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleDownload = () => {
    // Calcular totales antes de usarlos
    const subtotalGlobal = orderItems.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    const descuentoGlobal =
      subtotalGlobal * (parseInt(clientInfo.descuento || 0) / 100);
    const ivaGlobal = subtotalGlobal * 0.19;
    const totalGlobal = subtotalGlobal + ivaGlobal - descuentoGlobal;

    // Crear el contenido HTML basado en la imagen proporcionada
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orden de Pedido - Natural Colors</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ccc;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #1e3a5f;
          margin-bottom: 5px;
        }
        .header h2 {
          color: #666;
          font-weight: normal;
          margin-top: 0;
        }
        .fecha {
          margin-bottom: 15px;
          font-size: 14px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .info-label {
          font-weight: bold;
          width: 100px;
        }
        .info-value {
          flex: 1;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .info-column {
          width: 48%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .totals {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          font-weight: bold;
        }
        .total {
          color: #006400;
          font-size: 18px;
        }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature {
          width: 200px;
          text-align: center;
          border-top: 1px solid #333;
          padding-top: 5px;
        }
        .observations {
          margin-top: 30px;
        }
        .observations-box {
          border: 1px solid #ccc;
          padding: 10px;
          min-height: 60px;
        }
        .delivery-date {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NATURAL COLORS</h1>
          <h2>ORDEN DE PEDIDO</h2>
        </div>
        
        <div class="fecha">Fecha: ${clientInfo.fecha}</div>
        
        <div class="info-section">
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">CLIENTE:</div>
              <div class="info-value">${clientInfo.cliente}</div>
            </div>
            <div class="info-row">
              <div class="info-label">DIRECCIÓN:</div>
              <div class="info-value">${clientInfo.direccion}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Barrio:</div>
              <div class="info-value">${clientInfo.barrio} - ${
      clientInfo.ciudad
    }</div>
            </div>
            <div class="info-row">
              <div class="info-label">Orden De Salida:</div>
              <div class="info-value">${
                clientInfo.ordenSalida === "facturado"
                  ? "FACTURADO"
                  : "SALIDA DE BODEGA"
              }</div>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">NIT:</div>
              <div class="info-value">${clientInfo.nit}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Vendedor:</div>
              <div class="info-value">${clientInfo.vendedor}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Tel:</div>
              <div class="info-value">${clientInfo.telefono}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Cel:</div>
              <div class="info-value">${clientInfo.cel}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Forma De Pago:</div>
              <div class="info-value">${
                clientInfo.contado === "X" ? "CONTADO" : "CRÉDITO"
              }</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>CÓD</th>
              <th>DESCRIPCIÓN</th>
              <th class="text-center">CANT</th>
              <th class="text-center">BON</th>
              <th class="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (item) => `
              <tr>
                <td>${item.cod}</td>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">${item.bonus}</td>
                <td class="text-right">$${item.subtotal?.toLocaleString(
                  "es-CO"
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div>
            <div>SUBTOTAL: $${subtotalGlobal.toLocaleString("es-CO")}</div>
            <div>DESCUENTO(${
              clientInfo.descuento || 0
            }%): $${descuentoGlobal.toLocaleString("es-CO")}</div>
            <div>IVA(19%): $${ivaGlobal.toLocaleString("es-CO")}</div>
          </div>
          <div class="total">TOTAL: $${totalGlobal.toLocaleString(
            "es-CO"
          )}</div>
        </div>
        
        <div class="signatures">
          <div class="signature">ALISTÓ</div>
          <div class="signature">VERIFICÓ</div>
          <div class="signature">EMPACÓ</div>
          <div class="signature">FIRMA CLIENTE</div>
        </div>
        
        
        <div class="observations">
          <div>OBSERVACIONES:</div>
          <div class="observations-box">${clientInfo.observaciones}</div>
        </div>
        
        <div class="delivery-date">
          FECHA ENTREGA: ________________
        </div>
      </div>
    </body>
    </html>
    `;

    // Crear el blob y descargar
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "orden_de_pedido.html");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Generador de Toma de Pedido
        </h1>

        {/* Formulario de información del cliente */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Fecha:
              </label>
              <input
                type="date"
                name="fecha"
                value={clientInfo.fecha}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                NIT:
              </label>
              <input
                type="text"
                name="nit"
                value={clientInfo.nit}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Vendedor:
              </label>
              <input
                type="text"
                name="vendedor"
                value={clientInfo.vendedor}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Cliente:
              </label>
              <input
                type="text"
                name="cliente"
                value={clientInfo.cliente}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Teléfono:
              </label>
              <input
                type="text"
                name="telefono"
                value={clientInfo.telefono}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Dirección:
              </label>
              <input
                type="text"
                name="direccion"
                value={clientInfo.direccion}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Ciudad:
              </label>
              <input
                type="text"
                name="ciudad"
                value={clientInfo.ciudad}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                % Descuento:
              </label>
              <input
                type="number"
                name="descuento"
                value={clientInfo.descuento}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Barrio:
              </label>
              <input
                type="text"
                name="barrio"
                value={clientInfo.barrio}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Celular:
              </label>
              <input
                type="text"
                name="cel"
                value={clientInfo.cel}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Correo:
              </label>
              <input
                type="email"
                name="correo"
                value={clientInfo.correo}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Observaciones:
              </label>
              <textarea
                name="observaciones"
                value={clientInfo.observaciones}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Ingrese sus observaciones aquí"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Forma de Pago:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="pago"
                    value="contado"
                    checked={clientInfo.contado === "X"}
                    onChange={() =>
                      setClientInfo({
                        ...clientInfo,
                        contado: "X",
                        credito: "",
                      })
                    }
                    className="mr-1"
                  />{" "}
                  Contado
                </label>
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="pago"
                    value="credito"
                    checked={clientInfo.credito === "X"}
                    onChange={() =>
                      setClientInfo({
                        ...clientInfo,
                        credito: "X",
                        contado: "",
                      })
                    }
                    className="mr-1"
                  />{" "}
                  Crédito
                </label>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Orden de Salida:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="ordenSalida"
                    value="facturado"
                    checked={clientInfo.ordenSalida === "facturado"}
                    onChange={() =>
                      setClientInfo({
                        ...clientInfo,
                        ordenSalida: "facturado",
                      })
                    }
                    className="mr-1"
                  />{" "}
                  Facturado
                </label>
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="ordenSalida"
                    value="salidaBodega"
                    checked={clientInfo.ordenSalida === "salidaBodega"}
                    onChange={() =>
                      setClientInfo({
                        ...clientInfo,
                        ordenSalida: "salidaBodega",
                      })
                    }
                    className="mr-1"
                  />{" "}
                  Salida de Bodega
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de agregar productos */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Agregar Productos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Categoría:
              </label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedProduct("");
                }}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                {PRODUCT_DATA.groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Producto:
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedCategory}
              >
                <option value="">Selecciona un producto</option>
                {selectedCategory &&
                  PRODUCT_DATA.products[selectedCategory].map((product) => (
                    <option key={product.cod} value={product.cod}>
                      {product.cod} - {product.description}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Cantidad:
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Bonificación:
              </label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                min="0"
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAddProduct}
              className="w-full sm:col-span-2 lg:col-span-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de productos agregados - Modificada para ser responsiva */}
        {orderItems.length > 0 && (
          <div className="bg-gray-50 p-3 sm:p-6 rounded-lg mb-6 max-w-full overflow-hidden">
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-700">
              Productos en el pedido
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-left">
                      Código
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-left">
                      Producto
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                      Cant.
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                      Bonif.
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right">
                      V. Unit.
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right">
                      Subtotal
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b">
                        {item.cod}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b">
                        {item.description}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                        {item.quantity}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                        {item.bonus}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right">
                        ${item.unitPrice?.toLocaleString("es-CO")}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right">
                        ${item.subtotal?.toLocaleString("es-CO")}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calcular totales globales */}
        {/* Resumen del pedido */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          {(() => {
            const subtotalGlobal = orderItems.reduce(
              (sum, item) => sum + (item.subtotal || 0),
              0
            );
            const descuentoGlobal =
              subtotalGlobal * (parseInt(clientInfo.descuento || 0) / 100);
            const ivaGlobal = subtotalGlobal * 0.19;
            const totalGlobal = subtotalGlobal + ivaGlobal - descuentoGlobal;

            return (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  Resumen del Pedido
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>Subtotal: ${subtotalGlobal.toLocaleString("es-CO")}</p>
                    <p>
                      Descuento ({clientInfo.descuento || 0}%): $
                      {descuentoGlobal.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div>
                    <p>IVA (19%): ${ivaGlobal.toLocaleString("es-CO")}</p>
                    <p className="font-bold">
                      Total: ${totalGlobal.toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Botón de descarga y regresar */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
          >
            Generar Orden de Pedido
          </button>
          <button
            onClick={onReturnToMenu}
            className="bg-gray-500 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
          >
            Regresar al Menú
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal que maneja el menú y la renderización condicional
const App = () => {
  const [activeOption, setActiveOption] = useState(null); // Empezamos con null para que se muestre el menú

  const renderContent = () => {
    switch (activeOption) {
      case "analizar-excel":
        return <ExcelAnalyser onReturnToMenu={() => setActiveOption(null)} />;
      case "llenado-pedido":
        return <PedidoForm onReturnToMenu={() => setActiveOption(null)} />;
      default:
        return (
          <div className="w-full max-w-2xl px-4">
            <nav className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setActiveOption("analizar-excel")}
                className="py-3 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg transition duration-300 ease-in-out bg-white text-gray-700 hover:bg-gray-100 shadow-md w-full sm:w-auto"
              >
                Analizar Excel
              </button>
              <button
                onClick={() => setActiveOption("llenado-pedido")}
                className="py-3 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg transition duration-300 ease-in-out bg-white text-gray-700 hover:bg-gray-100 shadow-md w-full sm:w-auto"
              >
                Llenado de Pedido
              </button>
              <button
                disabled
                className="py-3 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg bg-gray-300 text-gray-600 cursor-not-allowed w-full sm:w-auto"
              >
                Próximamente
              </button>
            </nav>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
