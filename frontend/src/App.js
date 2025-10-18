import React, { useState, useEffect } from "react";
import { 
  VENDOR_CONFIG, 
  isVendorAuthorized, 
  getVendorZone, 
  verifyMasterPassword, 
  getAuthorizedVendorsList,
  getAllVendorsList,
  isVendorInSystem
} from "./authorized_vendors";

// Define la URL base de tu backend
const API_BASE_URL = "https://optimizations-c6pm.onrender.com";

// Utilidad para manejar fechas con zona horaria de Colombia
const getColombiaDateTime = () => {
  // Crear fecha en UTC
  const now = new Date();
  
  // Ajustar a zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  
  return colombiaTime;
};

// Obtener fecha en formato YYYY-MM-DD con zona horaria de Colombia
const getColombiaDateString = () => {
  const date = getColombiaDateTime();
  return date.toISOString().split('T')[0];
};

// Obtener timestamp ISO con zona horaria de Colombia
const getColombiaTimestamp = () => {
  const date = getColombiaDateTime();
  // Añadir explícitamente el offset de Colombia (-05:00)
  const isoString = date.toISOString();
  return isoString.replace('Z', '-05:00');
};

const ZONES = [
  "Soacha",
  "Suba",
  "Engativa",
  "Usme",
  "Ciudad Bolivar",
  "Kennedy",
  "Fontibon",
  "Costa Atlantica",
  "Oficina",
  "Periferia",
  "Centro",
];

const SELLERS = [
  "Nohora Triana",
  "Alejandra Niño",
  "Mariela Betancur",
  "Jhon Prada",
  "Dayana Leon",
  "Johana Salazar",
  "Ingrid Rojas",
  "Enrique Herrera",
  "Sebastian Torres",
  "Jenny Gonzalez",
  "Pilar Castrillo"
];

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
    "LINEA UÑAS",
  ],

  // Productos organizados por grupo
  products: {
    "FRASCO SHAMPOO COLOR PROTECT TONO SOBRE TONO": [
      { cod: "NC16", description: "SH BEIGE PERLA X 300ml", unitPrice: 18750 },
      { cod: "NC18", description: "SH CHOCOLATE LIGTH X 300ml", unitPrice: 18750 },
      { cod: "NC12", description: "SH GRIS SILVER X 300ml", unitPrice: 18750 },
      { cod: "NC14", description: "SH NEGRO NIGHT X 300ml", unitPrice: 18750 },
      { cod: "NC9", description: "SH ROJO INTENSE X 300ml", unitPrice: 18750 },
      { cod: "NC10", description: "SH VIOLETA ULTRA X 300ml", unitPrice: 18750 },
      { cod: "NC05", description: "SH CENIZO SPECIAL X 300ml", unitPrice: 18750 },
      { cod: "NC64", description: "SH COBRE DEEP X 300ml", unitPrice: 18750 },
      { cod: "NC235", description: "SH MECHAS BLANCAS X 300ml", unitPrice: 18750 },
    ],
    "FRASCO MASCARILLA COLOR PROTECT TONO SOBRE TONO": [
      { cod: "NC15", description: "MSC BEIGE PERLA X 285ml", unitPrice: 18750 },
      { cod: "NC17", description: "MSC CHOCOLATE LIGTH X 285ml", unitPrice: 18750 },
      { cod: "NC11", description: "MSC GRIS SILVER X 285ml", unitPrice: 18750 },
      { cod: "NC13", description: "MSC NEGRO NIGHT X 285ml", unitPrice: 18750 },
      { cod: "NC08", description: "MSC ROJO INTENSE X 285ml", unitPrice: 18750 },
      { cod: "NC07", description: "MSC VIOLETA ULTRA X 285ml", unitPrice: 18750 },
      { cod: "NC06", description: "MSC CENIZO SPECIAL X 285ml", unitPrice: 18750 },
      { cod: "NC65", description: "MSC COBRE DEEP X 285ml", unitPrice: 18750 },
      { cod: "NC67", description: "MSC AZUL PLATINO X 285ml", unitPrice: 18750 },
      { cod: "NC202", description: "MSC MECHAS BLANCAS X 285ml", unitPrice: 18750 },
    ],
    "DOYPACK MASCARILLA COLOR PROTECT TONO SOBRE TONO X 100 ML": [
      { cod: "NC39", description: "MSC BEIGE PERLA X 100ml", unitPrice: 6600 },
      { cod: "NC40", description: "MSC CHOCOLATE LIGTH X 100ml", unitPrice: 6600 },
      { cod: "NC41", description: "MSC GRIS SILVER X 100ml", unitPrice: 6600 },
      { cod: "NC42", description: "MSC NEGRO NIGHT X 100ml", unitPrice: 6600 },
      { cod: "NC43", description: "MSC ROJO INTENSE X 100ml", unitPrice: 6600 },
      { cod: "NC44", description: "MSC VIOLETA ULTRA X 100ml", unitPrice: 6600 },
      { cod: "NC45", description: "MSC CENIZO SPECIAL X 100ml", unitPrice: 6600 },
      { cod: "NC85", description: "MSC COBRE DEEP X 100ml", unitPrice: 6600 },
      { cod: "NC86", description: "MSC AZUL PLATINO X 100ml", unitPrice: 6600 },
      { cod: "NC214", description: "MSC MECHAS BLANCAS X 100ml", unitPrice: 6600 },
    ],
    "LINEA TERMOPROTECTORA KERAMILK": [
      {
        cod: "NC37",
        description: "DOYPACK SHAMPOO KERAMILK X 100ml",
        unitPrice: 6000,
      },
      { cod: "NC03", description: "SHAMPOO KERAMILK X 300ml", unitPrice: 18750 },
      {
        cod: "NC33",
        description: "DISPLAY SHAMPOO KERAMILK X 14 UND",
        unitPrice: 33000,
      },
      {
        cod: "NC36",
        description: "DOYPACK TRATAMIENTO KERAMILK X 100ml",
        unitPrice: 6600,
      },
      {
        cod: "NC04",
        description: "TRATAMIENTO KERAMILK X 300ml",
        unitPrice: 20000,
      },
      {
        cod: "NC216",
        description: "TRATAMIENTO POTE KERAMILK X 370ml",
        unitPrice: 21700,
      },
      {
        cod: "NC34",
        description: "DISPLAY TRATAMIENTO KERAMILK X 14 UND",
        unitPrice: 33000,
      },
      {
        cod: "NC253",
        description: "TERMOPROTECTOR KERAMILK SPRAY X 160ml",
        unitPrice: 14200,
      },
      {
        cod: "NC254",
        description: "TERMOPROTECTOR KERAMILK SPRAY X 300ml",
        unitPrice: 21700,
      },
    ],
    "LINEA FASTMEN": [
      { cod: "NC55", description: "DOY PACK FAST MEN X 100ml", unitPrice: 5300 },
      { cod: "NC50", description: "FAST MEN X 160ml", unitPrice: 9900 },
      { cod: "NC217", description: "POTE FAST MEN X 370ml", unitPrice: 15540 },
      {
        cod: "NC56",
        description: "DISPLAY FAST MEN X 14 UND",
        unitPrice: 25300,
      },
      {
        cod: "NC218",
        description: "FRASCO SHAMPOO FAST MEN X 300ml",
        unitPrice: 15500,
      },
    ],
    "LINEA PLUS CAPILAR": [
      {
        cod: "NC02",
        description: "DISPLAY ABLANDADOR DE CANAS CAJA X 6UND X30ml",
        unitPrice: 27000,
      },
      {
        cod: "NC49",
        description: "SILICONA REGENERADORA UVA X 55ml",
        unitPrice: 18500,
      },
      {
        cod: "NC53",
        description: "CAJA X 20UND DE SILICONA REG UVA X 20ml",
        unitPrice: 92000,
      },
      {
        cod: "NC59",
        description: "LACA SUAVE X 160ML (Rosada )",
        unitPrice: 11600,
      },
      {
        cod: "NC60",
        description: "LACA EXTRAFUERTE X 160ML (Amarilla)",   
        unitPrice: 12700,
      },
    ],
    // Los demás grupos estarán vacíos hasta que agregues los productos
    "DISPLAY SHAMPOO COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID": [
      { cod: "NC29", description: "DISPLAY SH BEIGE PERLA x 14UND", unitPrice: 33000 },
      { cod: "NC32", description: "DISPLAY SH CHOCOLATE LIGTH x 14UND", unitPrice: 33000 },
      { cod: "NC28", description: "DISPLAY SH GRIS SILVER x 14UND", unitPrice: 33000 },
      { cod: "NC27", description: "DISPLAY SH NEGRO NIGHT x 14UND", unitPrice: 33000 },
      { cod: "NC31", description: "DISPLAY SH ROJO INTENSE x 14UND", unitPrice: 33000 },
      { cod: "NC30", description: "DISPLAY SH VIOLETA ULTRA x 14UND", unitPrice: 33000 },
      { cod: "NC26", description: "DISPLAY SH CENIZO SPECIAL x 14UND", unitPrice: 33000 },
      { cod: "NC258", description: "DISPLAY SH MECHAS BLANCAS x 14UND", unitPrice: 33000 },
      { cod: "NC259", description: "DISPLAY SH COBRE DEEP x 14UND", unitPrice: 33000 },
    ],
    "DISPLAY MASCARILLA COLOR PROTECT TONO SOBRE TONO X 30ML X 14 UNID": [
      { cod: "NC22", description: "DISPLAY MSC BEIGE PERLA x 14UND", unitPrice: 33000 },
      { cod: "NC25", description: "DISPLAY MSC CHOCOLATE LIGTH x 14UND", unitPrice: 33000 },
      { cod: "NC21", description: "DISPLAY MSC GRIS SILVER x 14UND", unitPrice: 33000 },
      { cod: "NC20", description: "DISPLAY MSC NEGRO NIGHT x 14UND", unitPrice: 33000 },
      { cod: "NC24", description: "DISPLAY MSC ROJO INTENSE x 14UND", unitPrice: 33000 },
      { cod: "NC23", description: "DISPLAY MSC VIOLETA ULTRA x 14UND", unitPrice: 33000 },
      { cod: "NC19", description: "DISPLAY MSC CENIZO SPECIAL x 14UND", unitPrice: 33000 },
      { cod: "NC69", description: "DISPLAY MSC AZUL PLATINO x 14UND", unitPrice: 33000 },
      { cod: "NC68", description: "DISPLAY MSC COBRE DEEP x 14UND", unitPrice: 33000 },
      { cod: "NC237", description: "DISPLAY MSC MECHAS BLANCAS x 14UND", unitPrice: 33000 },
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
      { cod: "NC71", description: "MSC AZUL FANTASY X 160ml", unitPrice: 11000 },
      { cod: "NC73", description: "MSC GREEN PASTEL X 160ml", unitPrice: 11000 },
      { cod: "NC75", description: "MSC MAGENTA PASTEL X 160ml", unitPrice: 11000 },
      { cod: "NC74", description: "MSC ORANGE FANTASY X 160ml", unitPrice: 11000 },
      { cod: "NC72", description: "MSC VIOLETA FANTASY X 160ml", unitPrice: 11000 },
    ],
    "DISPLAY MASCARILLA FANTASY COLOR PROTECT TONO SOBRE TONO X 30 ML": [
      { cod: "NC158", description: "DISPLAY MSC AZUL FANTASY X 14UND", unitPrice: 34500 },
      { cod: "NC156", description: "DISPLAY MSC MAGENTA FANTASY X 14UND", unitPrice: 34500 },
      {
        cod: "NC159",
        description: "DISPLAY MSC ORANGE PASTEL FANTASY X 14UND",
        unitPrice: 34500,
      },
      { cod: "NC155", description: "DISPLAY MSC VERDE FANTASY X 14UND", unitPrice: 34500 },
      { cod: "NC157", description: "DISPLAY MSC VIOLETA FANTASY X 14UND", unitPrice: 34500 },
    ],
    "LINEA SUERO EMERGENCIA CAPILAR SOS": [
      {
        cod: "NC91",
        description: "SOS TRATAMIENTO X 100ml DOY PACK",
        unitPrice: 7200,
      },
      {
        cod: "NC215",
        description: "SOS TRATAMIENTO X 370ml",
        unitPrice: 24500,
      },
      {
        cod: "NC236",
        description: "DISPLAY SOS SHAMPOO X 14UND",
        unitPrice: 33000,
      },
      {
        cod: "NC90",
        description: "DISPLAY SOS TRATAMIENTO X 14UND",
        unitPrice: 38200,
      },
      {
        cod: "NC219",
        description: "SOS FRASCO SHAMPOO X 300ml",
        unitPrice: 18750,
      },
      {
        cod: "NC243",
        description: "SOS DOYPACK SHAMPOO X 100ml",
        unitPrice: 6600,
      },
    ],
    "LINEA RIZOS EFECTO MEMORIA": [
      {
        cod: "NC38",
        description: "DOY PACK FIJADOR FLUIDO X 100ml",
        unitPrice: 6000,
      },
      { cod: "NC238", description: "FLUIDO FIJADOR X 300ml", unitPrice: 13600 },
      {
        cod: "NC35",
        description: "DISPLAY FLUIDO FIJADOR X 14UND",
        unitPrice: 30000,
      },
      { cod: "NC241", description: "SHAMPOO RIZOS X 300ml", unitPrice: 18750 },
      {
        cod: "NC252",
        description: "SHAMPOO RIZOS DOY PACK X 100ml",
        unitPrice: 6000,
      },
      { cod: "NC242", description: "TRATAMIENTO RIZOS X 300ml", unitPrice: 18800 },
      {
        cod: "NC251",
        description: "TRATAMIENTO RIZOS DOY PACK X 100ml",
        unitPrice: 6200,
      },
      {
        cod: "NC249",
        description: "DISPLAY SHAMPOO RIZOS 14UND X 40ml",
        unitPrice: 35000,
      },
      {
        cod: "NC250",
        description: "DISPLAY TRATAMIENTO RIZOS 14UND X 40ml",
        unitPrice: 35000,
      },
      {
        cod: "NC260",
        description: 'FIJADOR FLUIDO DISP 14 X 40ml "LLEVE 50ml"',
        unitPrice: 35000,
      },
    ],
    "LINEA SHAMPOO NEUTRO": [
      {
        cod: "NC87",
        description: "DOYPACK SHAMPOO NEUTRO X 100ml",
        unitPrice: 6000,
      },
      {
        cod: "NC63",
        description: "SH. NEUTRO SPECIAL X 300ml",
        unitPrice: 18750,
      },
      {
        cod: "NC70",
        description: "DISPLAY SH NEUTRO ESPECIAL X 30ml",
        unitPrice: 33000,
      },
    ],
    "LINEA UÑAS": {
      "Tratamiento Uñas de Felino": [
        { cod: "ESM009", description: "UÑAS DE FELINO", unitPrice: 6950 }
      ],
      "Bases": [
        { cod: "ESM010", description: "GEL ACRILICO", unitPrice: 3700 },
        { cod: "ESM001", description: "BRILLO", unitPrice: 3100 },
        { cod: "ESM002", description: "BRILLO SECANTE", unitPrice: 3100 },
        { cod: "ESM004", description: "SUPER BASE", unitPrice: 3100 },
        { cod: "ESM005", description: "BASE DE AJO", unitPrice: 3100 },
        { cod: "ESM006", description: "BASE DE CALCIO", unitPrice: 3100 },
        { cod: "ESM007", description: "BASE AJO Y LIMON", unitPrice: 3100 },
        { cod: "ESM008", description: "BASE ROSADA", unitPrice: 3100 }
      ],
      "Kits": [
        { cod: "ESM011", description: "KIT MADRE TIERRA", unitPrice: 9700 },
        { cod: "ESM012", description: "KIT MADRE SELVA", unitPrice: 9700 },
        { cod: "NC255", description: "KIT REDNUT DIAMOND", unitPrice: 9700 },
        { cod: "NC256", description: "KIT SUNSET MINT", unitPrice: 9700 },
        { cod: "NC257", description: "KIT AJEDREZADO", unitPrice: 9700 }
      ],
      "Ref. Esmalte": [
        { cod: "ESM01P", description: "ESMALTE REF. 01 P", unitPrice: 3100 },
        { cod: "ESM01B", description: "ESMALTE REF. 01 B", unitPrice: 3100 },
        { cod: "ESM02", description: "ESMALTE REF. 2", unitPrice: 3100 },
        { cod: "ESM03", description: "ESMALTE REF. 3", unitPrice: 3100 },
        { cod: "ESM04", description: "ESMALTE REF. 4", unitPrice: 3100 },
        { cod: "ESM05", description: "ESMALTE REF. 5", unitPrice: 3100 },
        { cod: "ESM06", description: "ESMALTE REF. 6", unitPrice: 3100 },
        { cod: "ESM07", description: "ESMALTE REF. 7", unitPrice: 3100 },
        { cod: "ESM08", description: "ESMALTE REF. 8", unitPrice: 3100 },
        { cod: "ESM09", description: "ESMALTE REF. 9", unitPrice: 3100 },
        { cod: "ESM10", description: "ESMALTE REF. 10", unitPrice: 3100 },
        { cod: "ESM11", description: "ESMALTE REF. 11", unitPrice: 3100 },
        { cod: "ESM12", description: "ESMALTE REF. 12", unitPrice: 3100 },
        { cod: "ESM13", description: "ESMALTE REF. 13", unitPrice: 3100 },
        { cod: "ESM14", description: "ESMALTE REF. 14", unitPrice: 3100 },
        { cod: "ESM15", description: "ESMALTE REF. 15", unitPrice: 3100 },
        { cod: "ESM16", description: "ESMALTE REF. 16", unitPrice: 3100 },
        { cod: "ESM17", description: "ESMALTE REF. 17", unitPrice: 3100 },
        { cod: "ESM18", description: "ESMALTE REF. 18", unitPrice: 3100 },
        { cod: "ESM19", description: "ESMALTE REF. 19", unitPrice: 3100 },
        { cod: "ESM20", description: "ESMALTE REF. 20", unitPrice: 3100 },
        { cod: "ESM21", description: "ESMALTE REF. 21", unitPrice: 3100 },
        { cod: "ESM22", description: "ESMALTE REF. 22", unitPrice: 3100 },
        { cod: "ESM23", description: "ESMALTE REF. 23", unitPrice: 3100 },
        { cod: "ESM24", description: "ESMALTE REF. 24", unitPrice: 3100 },
        { cod: "ESM25", description: "ESMALTE REF. 25", unitPrice: 3100 },
        { cod: "ESM26", description: "ESMALTE REF. 26", unitPrice: 3100 },
        { cod: "ESM27", description: "ESMALTE REF. 27", unitPrice: 3100 },
        { cod: "ESM28", description: "ESMALTE REF. 28", unitPrice: 3100 },
        { cod: "ESM29", description: "ESMALTE REF. 29", unitPrice: 3100 },
        { cod: "ESM30", description: "ESMALTE REF. 30", unitPrice: 3100 },
        { cod: "ESM31", description: "ESMALTE REF. 31", unitPrice: 3100 },
        { cod: "ESM32", description: "ESMALTE REF. 32", unitPrice: 3100 },
        { cod: "ESM33", description: "ESMALTE REF. 33", unitPrice: 3100 },
        { cod: "ESM34", description: "ESMALTE REF. 34", unitPrice: 3100 },
        { cod: "ESM35", description: "ESMALTE REF. 35", unitPrice: 3100 },
        { cod: "ESM36", description: "ESMALTE REF. 36", unitPrice: 3100 },
        { cod: "ESM37", description: "ESMALTE REF. 37", unitPrice: 3100 },
        { cod: "ESM38", description: "ESMALTE REF. 38", unitPrice: 3100 },
        { cod: "ESM39", description: "ESMALTE REF. 39", unitPrice: 3100 },
        { cod: "ESM40", description: "ESMALTE REF. 40", unitPrice: 3100 },
        { cod: "ESM41", description: "ESMALTE REF. 41", unitPrice: 3100 },
        { cod: "ESM42", description: "ESMALTE REF. 42", unitPrice: 3100 },
        { cod: "ESM43", description: "ESMALTE REF. 43", unitPrice: 3100 },
        { cod: "ESM44", description: "ESMALTE REF. 44", unitPrice: 3100 },
        { cod: "ESM45", description: "ESMALTE REF. 45", unitPrice: 3100 },
        { cod: "ESM46", description: "ESMALTE REF. 46", unitPrice: 3100 },
        { cod: "ESM47", description: "ESMALTE REF. 47", unitPrice: 3100 },
        { cod: "ESM48", description: "ESMALTE REF. 48", unitPrice: 3100 },
        { cod: "ESM49", description: "ESMALTE REF. 49", unitPrice: 3100 },
        { cod: "ESM50", description: "ESMALTE REF. 50", unitPrice: 3100 },
        { cod: "ESM51", description: "ESMALTE REF. 51", unitPrice: 3100 },
        { cod: "ESM52", description: "ESMALTE REF. 52", unitPrice: 3100 },
        { cod: "ESM53", description: "ESMALTE REF. 53", unitPrice: 3100 },
        { cod: "ESM54", description: "ESMALTE REF. 54", unitPrice: 3100 },
        { cod: "ESM55", description: "ESMALTE REF. 55", unitPrice: 3100 },
        { cod: "ESM56", description: "ESMALTE REF. 56", unitPrice: 3100 },
        { cod: "ESM57", description: "ESMALTE REF. 57", unitPrice: 3100 },
        { cod: "ESM58", description: "ESMALTE REF. 58", unitPrice: 3100 },
        { cod: "ESM59B", description: "ESMALTE REF. 59 B", unitPrice: 3100 },
        { cod: "ESM59P", description: "ESMALTE REF. 59 P", unitPrice: 3100 },
        { cod: "ESM60B", description: "ESMALTE REF. 60 B", unitPrice: 3100 },
        { cod: "ESM60P", description: "ESMALTE REF. 60 P", unitPrice: 3100 },
        { cod: "ESM61B", description: "ESMALTE REF. 61 B", unitPrice: 3100 },
        { cod: "ESM61P", description: "ESMALTE REF. 61 P", unitPrice: 3100 },
        { cod: "ESM62", description: "ESMALTE REF. 62", unitPrice: 3100 },
        { cod: "ESM63", description: "ESMALTE REF. 63", unitPrice: 3100 },
        { cod: "ESM64", description: "ESMALTE REF. 64", unitPrice: 3100 },
        { cod: "ESM65", description: "ESMALTE REF. 65", unitPrice: 3100 },
        { cod: "ESM66", description: "ESMALTE REF. 66", unitPrice: 3100 },
        { cod: "ESM67", description: "ESMALTE REF. 67", unitPrice: 3100 },
        { cod: "ESM68", description: "ESMALTE REF. 68", unitPrice: 3100 },
        { cod: "ESM69", description: "ESMALTE REF. 69", unitPrice: 3100 },
        { cod: "ESM70B", description: "ESMALTE REF. 70 B", unitPrice: 3100 },
        { cod: "ESM70P", description: "ESMALTE REF. 70 P", unitPrice: 3100 },
        { cod: "ESM71", description: "ESMALTE REF. 71", unitPrice: 3100 },
        { cod: "ESM72", description: "ESMALTE REF. 72", unitPrice: 3100 },
        { cod: "ESM73", description: "ESMALTE REF. 73", unitPrice: 3100 },
        { cod: "ESM74", description: "ESMALTE REF. 74", unitPrice: 3100 },
        { cod: "ESM75", description: "ESMALTE REF. 75", unitPrice: 3100 },
        { cod: "ESM76", description: "ESMALTE REF. 76", unitPrice: 3100 },
        { cod: "ESM77", description: "ESMALTE REF. 77", unitPrice: 3100 },
        { cod: "ESM78", description: "ESMALTE REF. 78", unitPrice: 3100 },
        { cod: "ESM79", description: "ESMALTE REF. 79", unitPrice: 3100 },
        { cod: "ESM80", description: "ESMALTE REF. 80", unitPrice: 3100 },
        { cod: "ESM81", description: "ESMALTE REF. 81", unitPrice: 3100 },
        { cod: "ESM82", description: "ESMALTE REF. 82", unitPrice: 3100 },
        { cod: "ESM83", description: "ESMALTE REF. 83", unitPrice: 3100 },
        { cod: "ESM84", description: "ESMALTE REF. 84", unitPrice: 3100 },
        { cod: "ESM85", description: "ESMALTE REF. 85", unitPrice: 3100 },
        { cod: "ESM86", description: "ESMALTE REF. 86", unitPrice: 3100 },
        { cod: "ESM87", description: "ESMALTE REF. 87", unitPrice: 3100 },
        { cod: "ESM88", description: "ESMALTE REF. 88", unitPrice: 3100 },
        { cod: "ESM89", description: "ESMALTE REF. 89", unitPrice: 3100 },
        { cod: "ESM90", description: "ESMALTE REF. 90", unitPrice: 3100 },
        { cod: "ESM91", description: "ESMALTE REF. 91", unitPrice: 3100 },
        { cod: "ESM92", description: "ESMALTE REF. 92", unitPrice: 3100 },
        { cod: "ESM93", description: "ESMALTE REF. 93", unitPrice: 3100 },
        { cod: "ESM94", description: "ESMALTE REF. 94", unitPrice: 3100 },
        { cod: "ESM95", description: "ESMALTE REF. 95", unitPrice: 3100 },
        { cod: "ESM96", description: "ESMALTE REF. 96", unitPrice: 3100 },
        { cod: "ESM97", description: "ESMALTE REF. 97", unitPrice: 3100 },
        { cod: "ESM98", description: "ESMALTE REF. 98", unitPrice: 3100 },
        { cod: "ESM99", description: "ESMALTE REF. 99", unitPrice: 3100 },
        { cod: "ESM100", description: "ESMALTE REF. 100", unitPrice: 3100 },
        { cod: "ESM101", description: "ESMALTE REF. 101", unitPrice: 3100 },
        { cod: "ESM102", description: "ESMALTE REF. 102", unitPrice: 3100 },
        { cod: "ESM103", description: "ESMALTE REF. 103", unitPrice: 3100 },
        {
          "cod": "ESM104",
          "description": "ESMALTE REF. 104",
          "unitPrice": 3100
        },
        {
          "cod": "ESM105",
          "description": "ESMALTE REF. 105",
          "unitPrice": 3100
        },
        {
          "cod": "ESM106",
          "description": "ESMALTE REF. 106",
          "unitPrice": 3100
        },
        {
          "cod": "ESM107",
          "description": "ESMALTE REF. 107",
          "unitPrice": 3100
        },
        {
          "cod": "ESM108",
          "description": "ESMALTE REF. 108",
          "unitPrice": 3100
        },
        {
          "cod": "ESM109",
          "description": "ESMALTE REF. 109",
          "unitPrice": 3100
        },
        {
          "cod": "ESM110",
          "description": "ESMALTE REF. 110",
          "unitPrice": 3100
        },
        {
          "cod": "ESM111",
          "description": "ESMALTE REF. 111",
          "unitPrice": 3100
        },
        {
          "cod": "ESM112",
          "description": "ESMALTE REF. 112",
          "unitPrice": 3100
        },
        {
          "cod": "ESM113",
          "description": "ESMALTE REF. 113",
          "unitPrice": 3100
        },
        {
          "cod": "ESM114",
          "description": "ESMALTE REF. 114",
          "unitPrice": 3100
        }
      ],
      "Removedores": [
        {
          cod: "NC54",
          description: "REMOVEDOR ECOLOGICO X60ml",
          unitPrice: 3800,
        },
        {
          cod: "NC48",
          description: "REMOVEDOR ECOLOGICO X120ml",
          unitPrice: 6200,
        },
        {
          cod: "NC47",
          description: "REMOVEDOR ECOLOGICO X 250ml",
          unitPrice: 10500,
        },
        {
          cod: "NC220",
          description: "REMOVEDOR ECOLOGICO X 350ml",
          unitPrice: 12000,
        },
        {
          cod: "NC46",
          description: "REMOVEDOR ECOLOGICO X500ml",
          unitPrice: 16800,
        },
        {
          cod: "NC66",
          description: "REMOVEDOR ECOLOGICO X1000ml",
          unitPrice: 28000,
        }
      ]
    },
    "SHOTS Y BOOSTER MOLECULARES": [
      { cod: "NC261", description: "SHOT MOLECULAR CÉLULAS MADRE CAJA X 10 UND x 10ml", unitPrice: 84000 },
      { cod: "NC262", description: "SHOT MOLECULAR SELLANTE DE CUTÍCULA CAJA X 10 UND x 10ml", unitPrice: 84000 },
      { cod: "NC263", description: "SHOT MOLECULAR ENERGY FORTALECIMIENTO CAJA X 10 UND x 10ml", unitPrice: 84000 },
      { cod: "NC264", description: "SHOT MOLECULAR LAMINADO TERMOPROTECCIÓN CAJA X 10 UND x 10ml", unitPrice: 84000 },
      { cod: "NC265", description: "BOOSTER PLEX MOLECULAR 5G CAJA X 10 UND x 20ml", unitPrice: 100000 }
    ]
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
          `"${selectedFile.name
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
            className={`text-sm mt-4 text-center ${fileUploaded ? "text-green-600" : "text-red-600"
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
                       ${!selectedFile || loadingAnswer
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
                         ${loadingAnswer || !question.trim()
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

      {/* Botón Regresar al Menú */}
      <div className="mt-8 text-center">
        <button
          onClick={onReturnToMenu}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out"
        >
          🏠 Regresar al Menú
        </button>
      </div>

    </div>
  );
};

// Componente para la funcionalidad de Llenado de Toma de Pedido
const PedidoForm = ({ onReturnToMenu, prefilledClientName = "", onOrderComplete, isIntegratedMode = false, onViewOrders = null, currentOrderId = null, prefilledVendor = "", prefilledZone = "" }) => {
  const SELLERS = [
    "Nohora Triana",
    "Alejandra Niño",
    "Mariela Betancur",
    "Jhon Prada",
    "Dayana Leon",
    "Johana Salazar",
    "Ingrid Rojas",
    "Enrique Herrera",
    "Sebastian Torres",
    "Jenny Gonzalez",
    "Pilar Castrillo"
  ];

  const [clientInfo, setClientInfo] = useState({
    fecha: getColombiaDateString(),
    cliente: prefilledClientName || "",
    nit: "",
    vendedor: prefilledVendor || "",
    contado: "X",
    credito: "",
    direccion: "",
    ciudad: "",
    listaPrecios: "",
    descuento: 0,
    cel: "",
    correo: "",
    ordenSalida: "facturado",
    observaciones: "",
    zone: prefilledZone || "",
    barrio: "",
  });

  // Nuevo estado para validación en tiempo real
  const [fieldValidation, setFieldValidation] = useState({
    zone: prefilledZone ? true : false,
    direccion: false,
    barrio: false,
    correo: false,
    vendedor: prefilledVendor ? true : false,
    cliente: prefilledClientName ? true : false,
    nit: false
  });

  // Efecto para actualizar el cliente cuando se proporciona un nombre pre-llenado
  React.useEffect(() => {
    if (prefilledClientName) {
      setClientInfo(prev => ({ ...prev, cliente: prefilledClientName }));
      setFieldValidation(prev => ({ ...prev, cliente: true }));
    }
  }, [prefilledClientName]);

  // Efecto para manejar los datos pre-llenados de vendedor y zona
  React.useEffect(() => {
    if (prefilledVendor || prefilledZone) {
      setClientInfo(prev => ({
        ...prev,
        vendedor: prefilledVendor || prev.vendedor,
        zone: prefilledZone || prev.zone
      }));
      setFieldValidation(prev => ({
        ...prev,
        vendedor: prefilledVendor ? true : prev.vendedor,
        zone: prefilledZone ? true : prev.zone
      }));
    }
  }, [prefilledVendor, prefilledZone]);

  // Función para validar un campo específico
  const validateField = (fieldName, value, ordenSalida = clientInfo.ordenSalida) => {
    switch (fieldName) {
      case 'zone':
        return value && value.trim() !== '';
      case 'direccion':
        return value && value.trim() !== '';
      case 'barrio':
        return value && value.trim() !== '';
      case 'vendedor':
        return value && value.trim() !== '';
      case 'cliente':
        return value && value.trim() !== '';
      case 'nit':
        return value && value.trim() !== '';
      case 'correo':
        // Solo obligatorio si orden de salida es "facturado"
        if (ordenSalida === 'facturado') {
          return value && value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        return true; // No obligatorio para "salida de bodega"
      default:
        return true;
    }
  };

  // Función para obtener clases CSS - ROJO por defecto, VERDE cuando se llena
  const getFieldClasses = (fieldName, baseClasses) => {
    const requiredFields = ['zone', 'direccion', 'barrio', 'vendedor', 'cliente', 'nit'];
    const isRequired = requiredFields.includes(fieldName) || (fieldName === 'correo' && clientInfo.ordenSalida === 'facturado');
    
    if (!isRequired) {
      return baseClasses; // Campo no obligatorio - estilo normal
    }
    
    const isValid = fieldValidation[fieldName];
    
    return isValid 
      ? `${baseClasses} border-green-500 bg-green-50` // ✅ VERDE: Campo lleno y válido
      : `${baseClasses} border-red-500 bg-red-50`;   // ❌ ROJO: Campo vacío o inválido
  };

  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [htmlContent, setHtmlContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModalPedido, setShowSuccessModalPedido] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showAuthErrorModal, setShowAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  
  // Estados para el modal de esmaltes
  const [showEsmalteModal, setShowEsmalteModal] = useState(false);
  const [esmalteQuantities, setEsmalteQuantities] = useState({});

  // Función para limpiar el formulario y empezar uno nuevo
  const handleNewOrder = () => {
    setShowSuccessModalPedido(false);
    setUploadResult(null);
    // Limpiar todos los campos del formulario
    setClientInfo({
      fecha: new Date().toISOString().split("T")[0],
      cliente: "",
      nit: "",
      vendedor: "",
      contado: "X",
      credito: "",
      direccion: "",
      ciudad: "",
      listaPrecios: "",
      descuento: 0,
      cel: "",
      correo: "",
      ordenSalida: "facturado",
      observaciones: "",
      zone: "",
      barrio: "",
    });
    setOrderItems([]);
    setFieldValidation({
      zone: false,
      direccion: false,
      barrio: false,
      correo: false,
      vendedor: false,
      cliente: false,
      nit: false
    });
  };

  // Función para regresar al menú principal
  const handleReturnToMenu = () => {
    setShowSuccessModalPedido(false);
    setUploadResult(null);
    onReturnToMenu();
  };

  const handleRetryAuth = () => {
    setShowAuthErrorModal(false);
    setAuthErrorMessage('');
    // Reintentar la subida a Drive
    handleUploadToDrive();
  };

  const handleReturnToForm = () => {
    setShowAuthErrorModal(false);
    setAuthErrorMessage('');
    // El formulario mantiene todos los datos
  };

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    const newClientInfo = { ...clientInfo, [name]: value };
    setClientInfo(newClientInfo);
    
    // Validación en tiempo real
    const newValidation = { ...fieldValidation };
    
    // Validar el campo que cambió
    newValidation[name] = validateField(name, value, newClientInfo.ordenSalida);
    
    // Si cambió ordenSalida, revalidar correo
    if (name === 'ordenSalida') {
      newValidation.correo = validateField('correo', newClientInfo.correo, value);
    }
    
    setFieldValidation(newValidation);
  };

  // Función para manejar cambios en las cantidades de esmaltes
  const handleEsmalteQuantityChange = (productCod, quantity) => {
    setEsmalteQuantities(prev => ({
      ...prev,
      [productCod]: quantity === '' || quantity === '0' ? '' : quantity
    }));
  };

  // Función para agregar múltiples esmaltes desde el modal
  const handleAddMultipleEsmaltes = () => {
    const esmalteProducts = PRODUCT_DATA.products["LINEA UÑAS"]["Ref. Esmalte"];
    const newItems = [];

    Object.entries(esmalteQuantities).forEach(([productCod, quantity]) => {
      if (quantity && parseInt(quantity) > 0) {
        const product = esmalteProducts.find(p => p.cod === productCod);
        if (product) {
          const newItem = {
            cod: product.cod,
            description: product.description,
            unitPrice: product.unitPrice,
            quantity: parseInt(quantity),
            bonus: 0, // Los esmaltes no tienen bonificaciones
            subtotal: product.unitPrice * parseInt(quantity),
            descuento: 0,
            iva: 0,
            total: 0,
          };
          newItems.push(newItem);
        }
      }
    });

    if (newItems.length > 0) {
      setOrderItems(prev => [...prev, ...newItems]);
    }

    // Limpiar y cerrar modal
    setEsmalteQuantities({});
    setShowEsmalteModal(false);
    setSelectedSubCategory("");
    setSelectedCategory(null);
  };

  // Función para cerrar el modal de esmaltes
  const handleCloseEsmalteModal = () => {
    setShowEsmalteModal(false);
    setEsmalteQuantities({});
    setSelectedSubCategory("");
  };

  const handleAddProduct = () => {
    if (!selectedProduct || (quantity <= 0 && bonus <= 0)) return;

    let product;
    if (selectedCategory === "LINEA UÑAS") {
      // Buscar en la subcategoría seleccionada de LINEA UÑAS
      product = PRODUCT_DATA.products[selectedCategory][selectedSubCategory].find(p => p.cod === selectedProduct);
    } else if (typeof PRODUCT_DATA.products[selectedCategory] === 'object' && !Array.isArray(PRODUCT_DATA.products[selectedCategory])) {
      // Buscar en las subcategorías para otras categorías
      for (const subCategory of Object.values(PRODUCT_DATA.products[selectedCategory])) {
        product = subCategory.find(p => p.cod === selectedProduct);
        if (product) break;
      }
    } else {
      // Buscar directamente en la categoría
      product = PRODUCT_DATA.products[selectedCategory].find(p => p.cod === selectedProduct);
    }

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

  // Función para validar campos obligatorios para Google Drive
  const validateForDrive = () => { 
    const errors = [];
    
    if (!clientInfo.zone || clientInfo.zone === "") {
      errors.push("Zona");
    }
    if (!clientInfo.vendedor || clientInfo.vendedor.trim() === "") {
      errors.push("Vendedor");
    }
    if (!clientInfo.cliente || clientInfo.cliente.trim() === "") {
      errors.push("Cliente");
    }
    if (!clientInfo.direccion || clientInfo.direccion.trim() === "") {
      errors.push("Dirección");
    }
    if (!clientInfo.barrio || clientInfo.barrio.trim() === "") {
      errors.push("Barrio");
    }
    if (!clientInfo.nit || clientInfo.nit.trim() === "") {
      errors.push("NIT");
    }
    
    // Validación condicional del correo: obligatorio solo si orden de salida es "facturado"
    if (clientInfo.ordenSalida === "facturado") {
      if (!clientInfo.correo || clientInfo.correo.trim() === "") {
        errors.push("Correo (obligatorio para pedidos facturados)");
      }
    }
    
    return errors;
  };

  // Función para generar y guardar el contenido HTML
  const generateHtmlContent = (serialNumber = null) => {
    const subtotalGlobal = orderItems.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    const descuentoGlobal =
      subtotalGlobal * (parseInt(clientInfo.descuento || 0) / 100);
    
    // Cálculo condicional del IVA basado en ordenSalida
    const ivaRate = clientInfo.ordenSalida === 'facturado' ? 0.19 : 0;
    const ivaGlobal = subtotalGlobal * ivaRate;
    const totalGlobal = subtotalGlobal + ivaGlobal - descuentoGlobal;
    
    // Cálculo de totales de productos
    const totalProductos = orderItems.reduce((sum, item) => sum + (item.quantity || 0) + (item.bonus || 0), 0);
    const totalBonificados = orderItems.reduce((sum, item) => sum + (item.bonus || 0), 0);
    const totalRegistrados = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Generar serial único si no se proporciona
    const serial = serialNumber || `Pedido__${clientInfo.fecha}_${getColombiaDateTime().getTime()}`;

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
          padding: 16px;
          font-size: 8.96px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 16px;
        }
        .header {
          text-align: center;
          margin-bottom: 16px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }
        .header-title {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
        }
        .header h1 {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
          color: green;
        }
        .header h1::after {
          content: " -";
          color: green;
        }
        .header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
          color: green;
          margin-left: 4px;
        }
        .info-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 11px;
          line-height: 1.2;
        }
        .info-line .left {
          display: flex;
          align-items: center;
          text-align: left;
        }
        .info-line .center {
          display: flex;
          align-items: center;
          text-align: center;
        }
        .info-line .right {
          display: flex;
          align-items: center;
          text-align: right;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px; /* Reducido de 12px a 8px */
        }
        .info-column {
          flex: 1;
          margin-right: 12px; /* Reducido de 16px a 12px */
        }
        .info-column:last-child {
          margin-right: 0;
        }
        .info-row {
          display: flex;
          margin-bottom: 3px; /* Reducido de 4px a 3px */
        }
        .info-label {
          font-weight: bold;
          min-width: 80px; /* Reducido de 96px a 80px */
          font-size: 9.5px; /* Reducido de 11.2px a 9.5px */
        }
        .info-value {
          flex: 1;
          font-size: 9.5px; /* Reducido de 11.2px a 9.5px */
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12.8px;
          font-size: 6.72px;
        }
        th, td {
          border: 1px solid #000;
          padding: 3.84px;
          text-align: left;
          font-size: 6.72px;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          font-size: 11.2px;
        }
        .total {
          font-size: 14.4px; /* 80% de 18px */
          font-weight: bold;
          color: #2c5530;
        }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .signature {
          text-align: center;
          border-top: 1px solid #333;
          padding-top: 4px;
          width: 120px; /* 80% de 150px */
          font-size: 9.6px; /* 80% de 12px */
        }
        .observations {
          margin-bottom: 16px;
          font-size: 11.2px;
        }
        .observations-box {
          border: 1px solid #ccc;
          padding: 8px;
          min-height: 24px; /* Reducido de 48px a 24px (50% menos) */
          font-size: 11.2px;
        }
        .delivery-date {
          margin-top: 8px;
          font-size: 11.2px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-title">
            <h1>NATURAL COLORS</h1>
            <h2> ORDEN DE PEDIDO</h2>
          </div>
        </div>
        
        <div class="info-line">
          <div class="left">
            <span>Fecha: ${clientInfo.fecha}</span>
          </div>
          <div class="center">
            <span>Zona: ${clientInfo.zone}</span>
          </div>
          <div class="right">
            <span><strong>No: ${serial.replace('Pedido__', '').replace(clientInfo.fecha + '_', '')}</strong></span>
          </div>
        </div>
        
        <div class="info-section">
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">Cliente:</div>
              <div class="info-value">${clientInfo.cliente}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Dirección:</div>
              <div class="info-value">${clientInfo.direccion} - ${clientInfo.ciudad} - ${clientInfo.barrio}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Orden de salida:</div>
              <div class="info-value"><strong style="text-decoration: underline;">${clientInfo.ordenSalida === "facturado" ? "FACTURADO" : "SALIDA DE BODEGA"}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-label">Forma de pago:</div>
              <div class="info-value">${clientInfo.contado === "X" ? "CONTADO" : "CRÉDITO"}</div>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-row">
              <div class="info-label">Nit:</div>
              <div class="info-value">${clientInfo.nit || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Vendedor:</div>
              <div class="info-value">${clientInfo.vendedor}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Cel:</div>
              <div class="info-value">${clientInfo.cel || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Correo:</div>
              <div class="info-value">${clientInfo.correo && clientInfo.correo.trim() !== '' ? clientInfo.correo : ''}</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Cód</th>
            <th>Descripción</th>
            <th class="text-center">Cant</th>
            <th class="text-center">Bon</th>
            <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems.map(item => `
              <tr>
                <td>${item.cod}</td>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-center">${item.bonus}</td>
                <td class="text-right">$${item.subtotal?.toLocaleString("es-CO")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div>
            <div>Subtotal: $${subtotalGlobal.toLocaleString("es-CO")}</div>
            <div>Descuento(${clientInfo.descuento || 0}%): $${descuentoGlobal.toLocaleString("es-CO")}</div>
            <div>Iva(${ivaRate === 0.19 ? '19' : '0'}%): $${ivaGlobal.toLocaleString("es-CO")}</div>
            <div>Total Productos: ${totalProductos}</div>
            <div>Total Bonificados: ${totalBonificados}</div>
            <div>Productos Registrados: ${totalRegistrados}</div>
          </div>
          <div class="total">Total: $${totalGlobal.toLocaleString("es-CO")}</div>
        </div>
        
        <div class="signatures">
          <div class="signature">Alistó</div>
          <div class="signature">Verificó</div>
          <div class="signature">Empacó</div>
        </div>
        
        <div class="observations">
          <div><strong>Observaciones:</strong></div>
          <div class="observations-box"><strong style="color: red;">${clientInfo.observaciones}</strong></div>
        </div>
      </div>
    </body>
    </html>
    `;

    return htmlContent;
  };

  // Función para autenticar con Google (AUTOMATIZADA)
  const authenticateWithGoogle = async () => {
    try {
      console.log('🔐 Iniciando autenticación OAuth2 automatizada...');
      
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      const data = await response.json();
      
      if (data.auth_url) {
        // Abrir ventana de autenticación
        const authWindow = window.open(
          data.auth_url, 
          'google-auth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Automatizar captura del token
        return new Promise((resolve, reject) => {
          // Escuchar mensajes de la ventana de autenticación
          const messageListener = (event) => {
            // Verificar origen por seguridad
            if (event.origin !== window.location.origin && 
                !event.origin.includes('optimizations-c6pm.onrender.com')) {
              return;
            }
            
            if (event.data.type === 'OAUTH_SUCCESS' && event.data.access_token) {
              console.log('✅ Token OAuth2 obtenido automáticamente');
              // Guardar token en localStorage
              localStorage.setItem('google_access_token', event.data.access_token);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              resolve(event.data.access_token);
            } else if (event.data.type === 'OAUTH_ERROR') {
              console.error('❌ Error en OAuth2:', event.data.error);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              reject(new Error(event.data.error || 'Error en autenticación'));
            }
          };
          
          window.addEventListener('message', messageListener);
          
          // Verificar si la ventana se cerró sin completar autenticación
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              reject(new Error('Autenticación cancelada por el usuario'));
            }
          }, 1000);
          
          // Timeout de seguridad (5 minutos)
          setTimeout(() => {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            if (!authWindow.closed) {
              authWindow.close();
            }
            reject(new Error('Timeout de autenticación'));
          }, 300000);
        });
      } else {
        throw new Error('No se pudo obtener URL de autenticación');
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  };

  // Función para verificar si el botón debe estar habilitado
  const isUploadButtonEnabled = () => {
    const validationErrors = validateForDrive();
    return validationErrors.length === 0 && orderItems.length > 0 && !isUploading;
  };

  // Función para subir a Google Drive - SIN ALERT
  const handleUploadToDrive = async () => {
    const validationErrors = validateForDrive();
    
    // Si hay errores de validación, no hacer nada (el botón ya está deshabilitado)
    if (validationErrors.length > 0) {
      return;
    }

    if (orderItems.length === 0) {
      return;
    }

    try {
      setIsUploading(true);
      
      console.log('🚀 Iniciando proceso de subida OAuth2...');
      
      // Primero autenticar con Google y obtener token
      const accessToken = await authenticateWithGoogle();
      
      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso');
      }
      
      // Guardar token en localStorage para uso posterior
      localStorage.setItem('google_access_token', accessToken);
      
      // Crear nombre del archivo con fecha y cliente
      const timestamp = getColombiaDateTime().getTime();
      const serial = `Pedido__${clientInfo.fecha}_${timestamp}`;
      const fileName = `${serial}.pdf`;
      
      // Generar el contenido HTML con el serial
      const htmlContent = generateHtmlContent(serial);
      setHtmlContent(htmlContent);
      
      // Datos para enviar al backend (usando el nuevo endpoint OAuth2)
      const uploadData = {
        htmlContent: htmlContent,
        filename: fileName,
        zone: clientInfo.zone,
        access_token: accessToken,
        clientInfo: {
          cliente: clientInfo.cliente,
          nit: clientInfo.nit,
          correo: clientInfo.correo,
          zona: clientInfo.zone,
          fecha: clientInfo.fecha,
          vendedor: clientInfo.vendedor,
          direccion: clientInfo.direccion,
          barrio: clientInfo.barrio,
          ordenSalida: clientInfo.ordenSalida
        }
      };
      
      console.log('📤 Enviando datos al backend...');
      
      const response = await fetch(`${API_BASE_URL}/upload-to-drive-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subida exitosa:', result);
        console.log('🔍 Configurando modal de éxito...');
        // REEMPLAZAR ALERT CON MODAL
        setUploadResult(result);
        setShowSuccessModalPedido(true);
        console.log('🔍 Estados configurados - showSuccessModalPedido: true, uploadResult:', result);
        
        // Notificar al componente padre si hay un callback
        if (onOrderComplete) {
          const driveLink = result.webViewLink || result.file_url || result.driveLink || null;
          onOrderComplete(currentOrderId, driveLink, clientInfo.cliente);
        }
        
        // Si estamos en modo integrado y hay un currentOrderId, significa que venimos de 'Tomar Pedido'
        // En este caso, el pedido ya está registrado en la tabla y solo necesitamos marcarlo como subido
        if (isIntegratedMode && currentOrderId) {
          console.log(`✅ Pedido ${currentOrderId} subido exitosamente desde 'Tomar Pedido'`);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir el archivo');
      }
      
    } catch (error) {
      console.error('❌ Error uploading to Drive:', error);
      
      // Verificar si es error de autenticación cancelada
      if (error.message.includes('Autenticación cancelada por el usuario') || 
          error.message.includes('Authentication cancelled') ||
          error.message.includes('cancelada')) {
        setAuthErrorMessage(error.message);
        setShowAuthErrorModal(true);
      } else {
        alert(`Error al subir a Google Drive: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    // Generar serial único para descarga
    const timestamp = Date.now();
    const serial = `Pedido__${clientInfo.fecha}_${timestamp}`;
    
    const htmlContent = generateHtmlContent(serial);
    setHtmlContent(htmlContent); // Guardar para uso posterior
    
    // Crear el blob y descargar
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${serial}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Modal de Error de Autenticación */}
      {showAuthErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Autenticación Cancelada
              </h3>
              
              <div className="text-sm text-gray-600 mb-6 space-y-2">
                <p className="font-medium text-red-600">
                  Por favor verifique que está usando el correo empresarial que le fue entregado para su zona.
                </p>
                <p>
                  La autenticación con Google Drive es necesaria para subir los pedidos.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReturnToForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Regresar al Formulario
                </button>
                
                <button
                  onClick={handleRetryAuth}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Verificar de Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Esmaltes */}
      {showEsmalteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Selección de Esmaltes</h2>
                  <p className="text-purple-100 text-sm sm:text-base">Ingresa las cantidades para cada referencia de esmalte que necesites</p>
                </div>
                <button
                  onClick={handleCloseEsmalteModal}
                  className="text-white hover:text-purple-200 transition-colors flex-shrink-0 ml-2"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {PRODUCT_DATA.products["LINEA UÑAS"]["Ref. Esmalte"].map((product) => (
                  <div key={product.cod} className="bg-gray-50 p-3 sm:p-4 rounded-lg border hover:border-purple-300 transition-colors">
                    <div className="mb-2 sm:mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm">{product.cod}</h3>
                      <p className="text-gray-600 text-xs mb-1">{product.description}</p>
                      <p className="text-purple-600 font-medium text-sm">{product.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-gray-600 mb-1">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        value={esmalteQuantities[product.cod] || ''}
                        onChange={(e) => handleEsmalteQuantityChange(product.cod, e.target.value)}
                        min="0"
                        placeholder="0"
                        className="p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 p-3 sm:p-6 rounded-b-2xl border-t flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  onClick={handleCloseEsmalteModal}
                  className="px-4 sm:px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMultipleEsmaltes}
                  className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                >
                  Agregar Esmaltes Seleccionados
                </button>
              </div>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                <p>💡 <strong>Tip:</strong> Deja en 0 o vacío las referencias que no necesites. Solo se agregarán los esmaltes con cantidad mayor a 0.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Éxito */}
      {showSuccessModalPedido && uploadResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Pedido Subido Exitosamente!</h2>
              <p className="text-green-100 text-sm">Tu pedido ha sido guardado en Google Drive</p>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">🆔 No. Documento:</span>
                  <span className="text-gray-800 font-semibold">{uploadResult.filename || 'Documento generado'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">📍 Zona:</span>
                  <span className="text-gray-800 font-semibold">{uploadResult.zone || 'N/A'}</span>
                </div>
                {uploadResult.webViewLink && (
                  <div className="pt-2 border-t border-gray-200">
                    <a 
                      href={uploadResult.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                    >
                      🔗 Ver archivo en Google Drive
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              
              {/* Botones de Acción */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSuccessModalPedido(false);
                    setUploadResult(null);
                    onReturnToMenu();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  🏠 Regresar al Menú
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      

      
      <div className="container mx-auto p-4 sm:p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
          Generador de Toma de Pedido
        </h1>

        {/* Formulario de información del cliente */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-700">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Fecha:
              </label>
              <input
                type="date"
                name="fecha"
                value={clientInfo.fecha}
                readOnly
                className="p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Vendedor: * {prefilledVendor && <span className="text-green-600 text-xs">(Pre-asignado)</span>}
              </label>
              {prefilledVendor ? (
                <div className="p-2 border border-green-300 rounded-md bg-green-50 text-green-800 font-medium">
                  🔒 {clientInfo.vendedor}
                </div>
              ) : (
                <select
                  name="vendedor"
                  value={clientInfo.vendedor}
                  onChange={handleClientInfoChange}
                  className={getFieldClasses('vendedor', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
                >
                  <option value="">Seleccione un vendedor</option>
                  {SELLERS.map((seller) => (
                    <option key={seller} value={seller}>{seller}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Cliente: *
              </label>
              <input
                type="text"
                name="cliente"
                placeholder="Nombre del cliente"
                value={clientInfo.cliente}
                onChange={handleClientInfoChange}
                className={getFieldClasses('cliente', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Dirección: *
              </label>
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={clientInfo.direccion}
                onChange={handleClientInfoChange}
                className={getFieldClasses('direccion', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                NIT: *
              </label>
              <input
                type="text"
                name="nit"
                placeholder="NIT"
                value={clientInfo.nit}
                onChange={handleClientInfoChange}
                className={getFieldClasses('nit', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Ciudad:
              </label>
              <input
                type="text"
                name="ciudad"
                placeholder="Ciudad"
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
                Barrio: *
              </label>
              <input
                type="text"
                name="barrio"
                placeholder="Barrio"
                value={clientInfo.barrio}
                onChange={handleClientInfoChange}
                className={getFieldClasses('barrio', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Celular:
              </label>
              <input
                type="text"
                name="cel"
                placeholder="Celular"
                value={clientInfo.cel}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Correo: {clientInfo.ordenSalida === 'facturado' ? '*' : ''}
              </label>
              <input
                type="email"
                name="correo"
                placeholder="Correo"
                value={clientInfo.correo}
                onChange={handleClientInfoChange}
                className={getFieldClasses('correo', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Zona: * {prefilledZone && <span className="text-green-600 text-xs">(Pre-asignada)</span>}
              </label>
              {prefilledZone ? (
                <div className="p-2 border border-green-300 rounded-md bg-green-50 text-green-800 font-medium">
                  🔒 {clientInfo.zone}
                </div>
              ) : (
                <select
                  name="zone"
                  value={clientInfo.zone}
                  onChange={handleClientInfoChange}
                  className={getFieldClasses('zone', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
                >
                  <option value="">Seleccione una zona</option>
                  {ZONES.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              )}
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
                {Object.entries(PRODUCT_DATA.products).map(([group, products]) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            {selectedCategory === "LINEA UÑAS" ? (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Subcategoría:
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => {
                    const subCategory = e.target.value;
                    setSelectedSubCategory(subCategory);
                    setSelectedProduct("");
                    
                    // Si selecciona "Ref. Esmalte", abrir el modal especial
                    if (subCategory === "Ref. Esmalte") {
                      setShowEsmalteModal(true);
                    }
                  }}
                  className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona una subcategoría</option>
                  {Object.keys(PRODUCT_DATA.products[selectedCategory]).map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Producto:
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedCategory || (selectedCategory === "LINEA UÑAS" && !selectedSubCategory) || (selectedCategory === "LINEA UÑAS" && selectedSubCategory === "Ref. Esmalte")}
              >
                <option value="">Selecciona un producto</option>
                {selectedCategory && selectedSubCategory !== "Ref. Esmalte" && (
                  selectedCategory === "LINEA UÑAS" ?
                    (selectedSubCategory && PRODUCT_DATA.products[selectedCategory][selectedSubCategory].map((product) => (
                      <option key={product.cod} value={product.cod}>
                        {product.cod} - {product.description}
                      </option>
                    ))) :
                    (typeof PRODUCT_DATA.products[selectedCategory] === 'object' && !Array.isArray(PRODUCT_DATA.products[selectedCategory]) ?
                      Object.entries(PRODUCT_DATA.products[selectedCategory]).map(([subCategory, products]) => (
                        <optgroup key={subCategory} label={subCategory}>
                          {products.map((product) => (
                            <option key={product.cod} value={product.cod}>
                              {product.cod} - {product.description}
                            </option>
                          ))}
                        </optgroup>
                      )) :
                      PRODUCT_DATA.products[selectedCategory].map((product) => (
                        <option key={product.cod} value={product.cod}>
                          {product.cod} - {product.description}
                        </option>
                      ))
                    )
                )}
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
                disabled={selectedCategory === "LINEA UÑAS" && selectedSubCategory === "Ref. Esmalte"}
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
                disabled={selectedCategory === "LINEA UÑAS" && selectedSubCategory === "Ref. Esmalte"}
              />
            </div>
            <button
              onClick={handleAddProduct}
              className="w-full sm:col-span-2 lg:col-span-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              disabled={selectedCategory === "LINEA UÑAS" && selectedSubCategory === "Ref. Esmalte"}
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
              <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-left text-xs sm:text-sm">
                      Código
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-left text-xs sm:text-sm">
                      Producto
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm">
                      Cant.
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm hidden sm:table-cell">
                      Bonif.
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right text-xs sm:text-sm hidden sm:table-cell">
                      V. Unit.
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right text-xs sm:text-sm">
                      Subtotal
                    </th>
                    <th className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-xs sm:text-sm">
                        {item.cod}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-xs sm:text-sm">
                        <div className="max-w-[120px] sm:max-w-none truncate sm:whitespace-normal">
                          {item.description}
                        </div>
                        {/* Mostrar información adicional en móvil */}
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          Bonif: {item.bonus} | V.Unit: {item.unitPrice?.toLocaleString("es-CO")}
                        </div>
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm">
                        {item.quantity}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm hidden sm:table-cell">
                        {item.bonus}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right text-xs sm:text-sm hidden sm:table-cell">
                        {item.unitPrice?.toLocaleString("es-CO")}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right text-xs sm:text-sm font-semibold">
                        {item.subtotal?.toLocaleString("es-CO")}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center">
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-500 hover:text-red-700 text-sm sm:text-base"
                        >
                          ✕
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
        {/* Resumen del pedido - OPTIMIZADO PARA MÓVIL */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          {(() => {
            const subtotalGlobal = orderItems.reduce(
              (sum, item) => sum + (item.subtotal || 0),
              0
            );
            const descuentoGlobal =
              subtotalGlobal * (parseInt(clientInfo.descuento || 0) / 100);
            const ivaRate = clientInfo.ordenSalida === 'facturado' ? 0.19 : 0;
            const ivaGlobal = subtotalGlobal * ivaRate;
            const totalGlobal = subtotalGlobal + ivaGlobal - descuentoGlobal;
            
            // Calcular totales de productos
            const totalProductos = orderItems.reduce(
              (sum, item) => sum + (item.quantity || 0) + (item.bonus || 0),
              0
            );
            const totalBonificados = orderItems.reduce(
              (sum, item) => sum + (item.bonus || 0),
              0
            );
            const totalRegistrados = orderItems.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0
            );

            return (
              <>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Resumen del Pedido
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base">
                  <div className="space-y-1">
                    <p>Subtotal: {subtotalGlobal.toLocaleString("es-CO")}</p>
                    <p>
                      Descuento ({clientInfo.descuento || 0}%): $
                      {descuentoGlobal.toLocaleString("es-CO")}
                    </p>
                    <p>Total Productos: {totalProductos}</p>
                  </div>
                  <div className="space-y-1">
                    <p>IVA ({ivaRate === 0.19 ? '19' : '0'}%): {ivaGlobal.toLocaleString("es-CO")}</p>
                    <p className="font-bold text-lg">
                      Total: {totalGlobal.toLocaleString("es-CO")}
                    </p>
                    <p>Total Bonificados: {totalBonificados}</p>
                    <p>Productos Registrados: {totalRegistrados}</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Botones de descarga y subir a Drive - VERSIÓN OPTIMIZADA PARA MÓVIL */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white font-bold text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Descargar
          </button>
          
          <button
            onClick={handleUploadToDrive}
            disabled={!isUploadButtonEnabled()}
            className={`font-bold text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-lg transition duration-300 transform w-full sm:w-auto ${
              !isUploadButtonEnabled()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
            title={!isUploadButtonEnabled() ? 'Complete todos los campos obligatorios para habilitar' : 'Subir pedido a Google Drive'}
          >
            {isUploading ? 'Subiendo...' : 'Subir a Drive'}
          </button>
          
          {/* Botón Regresar al Menú */}
          <button
            onClick={onReturnToMenu}
            className="bg-gray-600 text-white font-bold text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-lg hover:bg-gray-700 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            🏠 Regresar al Menú
          </button>

        </div>
      </div>
    </div>
  );
};

// Componente para la verificación de vendedores autorizados
const VendorAuthModal = ({ onVendorAuthenticated, onCancel }) => {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);

  const handleVendorChange = (e) => {
    const vendor = e.target.value;
    setSelectedVendor(vendor);
    setError("");
    setShowUnauthorizedMessage(false);

    // Si el vendedor no está autorizado, mostrar mensaje inmediatamente
    if (vendor && !isVendorAuthorized(vendor)) {
      setShowUnauthorizedMessage(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validar que se haya seleccionado un vendedor
    if (!selectedVendor) {
      setError("Por favor seleccione su nombre");
      setIsLoading(false);
      return;
    }

    // Si el vendedor no está autorizado, no procesar
    if (!isVendorAuthorized(selectedVendor)) {
      setIsLoading(false);
      return;
    }

    // Validar que se haya ingresado la clave
    if (!password) {
      setError("Por favor ingrese la clave de acceso");
      setIsLoading(false);
      return;
    }

    // Verificar la clave maestra
    if (!verifyMasterPassword(password)) {
      setError("Clave de acceso incorrecta");
      setIsLoading(false);
      return;
    }

    // Si todo está correcto, obtener la zona y autenticar
    const vendorZone = getVendorZone(selectedVendor);
    
    setTimeout(() => {
      setIsLoading(false);
      onVendorAuthenticated({
        vendorName: selectedVendor,
        vendorZone: vendorZone
      });
    }, 500); // Pequeña pausa para mostrar el loading
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🔐 Verificación de Vendedor
          </h2>
          <p className="text-gray-600">
            Ingrese sus credenciales para acceder al sistema de pedidos
          </p>
        </div>

        {!showUnauthorizedMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de Vendedor */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Seleccione su nombre: *
              </label>
              <select
                value={selectedVendor}
                onChange={handleVendorChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">-- Seleccione su nombre --</option>
                {getAllVendorsList().map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor} {isVendorAuthorized(vendor) ? "✅" : "❌"}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de Clave - Solo para vendedores autorizados */}
            {selectedVendor && isVendorAuthorized(selectedVendor) && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Clave de acceso: *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la clave de acceso"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Mostrar zona asignada si hay vendedor seleccionado */}
            {selectedVendor && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Zona asignada:</strong> {getVendorZone(selectedVendor)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {isVendorAuthorized(selectedVendor) ? "✅ Autorizado" : "❌ No autorizado"}
                </p>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
                disabled={isLoading || !selectedVendor || !isVendorAuthorized(selectedVendor)}
              >
                {isLoading ? "Verificando..." : "Ingresar"}
              </button>
            </div>
          </form>
        ) : (
          /* Mensaje para vendedores no autorizados */
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">⚠️</span>
                <h3 className="text-lg font-semibold text-orange-800">
                  Acceso No Autorizado
                </h3>
              </div>
              <p className="text-orange-700 mb-3">
                Señor(a) <strong>{selectedVendor}</strong> de la zona <strong>{getVendorZone(selectedVendor)}</strong>, 
                no tiene autorizado llenar el toma pedido sin hacer el registro en su gestión diaria del vendedor.
              </p>
              <p className="text-sm text-orange-600">
                Por favor contacte con su supervisor para obtener los permisos necesarios.
              </p>
            </div>

            {/* Botón para volver al menú */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Volver al Menú Principal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para la funcionalidad de Reporte de Recaudo
const RecaudoForm = ({ onReturnToMenu, isIntegratedMode = false, onSaveForLater = null, userEmail = null }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  
  // Estados para el modal de error de autenticación
  const [showAuthErrorModal, setShowAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  
  // Estados para el modal de éxito - CORREGIDO
  const [showSuccessModalRecaudo, setShowSuccessModalRecaudo] = useState(false);
  const [recaudoResult, setRecaudoResult] = useState(null);
  
  // Estados para el modal de configuración de hojas
  const [showSheetConfigModal, setShowSheetConfigModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newSheetId, setNewSheetId] = useState('');
  
  // Estado del formulario de recaudo
  const [recaudoData, setRecaudoData] = useState({
    fecha: getColombiaDateString(),
    tipoCliente: '', // nuevo/antiguo
    asesor: '',
    nombreCliente: '',
    vendio: false, // NUEVO CAMPO - checkbox (true = Sí, false = No)
    recaudo: '', // NUEVO CAMPO
    efectivo: '',
    transferencia: '',
    dondeTransfirieron: '', // NUEVO CAMPO
    generoAcuerdo: false, // NUEVO CAMPO
    valorAcuerdo: '', // NUEVO CAMPO
    fechaCompromiso: '', // NUEVO CAMPO
    observaciones: ''
  });
  
  // Mapeo de vendedores a IDs de hojas de cálculo (predefinido)
  const [vendedorSheetIds, setVendedorSheetIds] = useState({
    // IDs reales de las hojas de cálculo para cada vendedor
    "Nohora Triana": "1YoeopGj783aByKZIf1Nh0bx9pNUlm8IaeLHKQF-Ijkw",
    "Alejandra Niño": "1xtBMnS1tHIQOMapQWcVP8NVhXNv2TD3L-I7tlOfRoNA",
    "Mariela Betancur": "1nvNT2ZGLnt32bJjYaEXFflJIgpbV7kmmXwG_P2Tvyqg",
    "Jhon Prada": "1CkutfI-leD800auwrZlSvPsQRNYzuAjNB81zEV7Hkq8",
    "Dayana Leon": "1o2cWLF6WWDzHj94q2tOJ2P3f2c22tCelvX8bEEiDfYw",
    "Johana Salazar": "1Ua7mCtWDtOD-OqYtiGroHW9WsiPzYS1_bVuxlBhz9Vo",
    "Ingrid Rojas": "192sAq47XTQYtkewwm-j3hueMci-LAsFDdl05J4iKJLs",
    "Enrique Herrera": "1RjNg0qjqEn0Ri-tA-GM6mEZR6kspGp0B99MoAuyH-L0",
    "Sebastian Torres": "1RjNg0qjqEn0Ri-tA-GM6mEZR6kspGp0B99MoAuyH-L0", // Mismo ID que Enrique Herrera (oficina compartida)
    "Jenny Gonzalez": "1RjNg0qjqEn0Ri-tA-GM6mEZR6kspGp0B99MoAuyH-L0", // Mismo ID que Enrique Herrera y Sebastian Torres (oficina compartida)
    "Pilar Castrillo": "1WQEJLoVHurF9rfzscKo3LQqdKw3AGGL7jA-9oXQ7CyE"
  });
  
  // Lista de vendedores disponibles (para el selector)
  const vendedoresDisponibles = Object.keys(vendedorSheetIds);
  
  // Función para configurar un nuevo ID de hoja para un vendedor
  const configureVendorSheet = (vendedor, sheetId) => {
    setVendedorSheetIds(prev => ({
      ...prev,
      [vendedor]: sheetId
    }));
    
    // Guardar en localStorage para persistencia
    const savedSheetIds = JSON.parse(localStorage.getItem('vendedor_sheet_ids') || '{}');
    savedSheetIds[vendedor] = sheetId;
    localStorage.setItem('vendedor_sheet_ids', JSON.stringify(savedSheetIds));
    
    console.log(`✅ Configurada hoja para ${vendedor}: ${sheetId}`);
  };
  
  // Cargar IDs de hojas guardados al iniciar
  useEffect(() => {
    // Combinar los IDs predefinidos con los guardados en localStorage
    const savedSheetIds = JSON.parse(localStorage.getItem('vendedor_sheet_ids') || '{}');

    // Migrar clave antigua a nueva si existe
    if (savedSheetIds["Pilar Molano"] && !savedSheetIds["Mariela Betancur"]) {
      savedSheetIds["Mariela Betancur"] = savedSheetIds["Pilar Molano"];
      delete savedSheetIds["Pilar Molano"];
      localStorage.setItem('vendedor_sheet_ids', JSON.stringify(savedSheetIds));
      console.log("🔁 Migrada hoja de 'Pilar Molano' a 'Mariela Betancur'");
    }

    setVendedorSheetIds(prev => ({
      ...prev,
      ...savedSheetIds
    }));
    console.log('📋 IDs de hojas cargados:', savedSheetIds);
  }, []);

  // Función de autenticación OAuth 2.0 (reutilizada del PedidoForm)
  const authenticateWithGoogle = async () => {
    try {
      console.log('🔐 Iniciando autenticación OAuth2 para Recaudo...');
      
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      const data = await response.json();
      
      if (data.auth_url) {
        const authWindow = window.open(
          data.auth_url, 
          'google-auth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        return new Promise((resolve, reject) => {
          const messageListener = (event) => {
            if (event.origin !== window.location.origin && 
                !event.origin.includes('optimizations-c6pm.onrender.com')) {
              return;
            }
            
            if (event.data.type === 'OAUTH_SUCCESS' && event.data.access_token) {
              console.log('✅ Token OAuth2 obtenido para Recaudo');
              // Guardar token en localStorage
              localStorage.setItem('google_access_token', event.data.access_token);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              resolve(event.data.access_token);
            } else if (event.data.type === 'OAUTH_ERROR') {
              console.error('❌ Error en OAuth2:', event.data.error);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              reject(new Error(event.data.error || 'Error en autenticación'));
            }
          };
          
          window.addEventListener('message', messageListener);
          
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              reject(new Error('Autenticación cancelada por el usuario'));
            }
          }, 1000);
          
          setTimeout(() => {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            if (!authWindow.closed) {
              authWindow.close();
            }
            reject(new Error('Timeout de autenticación'));
          }, 300000);
        });
      } else {
        throw new Error('No se pudo obtener URL de autenticación');
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  };

  // Función para manejar el retorno al formulario desde el modal de error
  const handleReturnToFormRecaudo = () => {
    setShowAuthErrorModal(false);
    setAuthErrorMessage('');
    onReturnToMenu();
  };
  
  // Función para limpiar el formulario y empezar uno nuevo
  const handleNewRecaudo = () => {
    setShowSuccessModalRecaudo(false);
    setRecaudoResult(null);
    // Limpiar todos los campos del formulario
    setRecaudoData({
      fecha: new Date().toISOString().split('T')[0],
      tipoCliente: '',
      asesor: '',
      nombreCliente: '',
      vendio: false, // NUEVO CAMPO - checkbox (true = Sí, false = No)
      recaudo: '', // NUEVO CAMPO
      efectivo: '',
      transferencia: '',
      dondeTransfirieron: '', // NUEVO CAMPO
      generoAcuerdo: false, // NUEVO CAMPO
      valorAcuerdo: '', // NUEVO CAMPO
      fechaCompromiso: '', // NUEVO CAMPO
      observaciones: ''
    });
    setFieldValidation({
          fecha: true,
          tipoCliente: true,
          asesor: false,
          nombreCliente: false,
          matematica: true
        });
  };

  // Función para regresar al menú principal
  const handleReturnToMenuFromSuccess = () => {
    setShowSuccessModalRecaudo(false);
    setRecaudoResult(null);
    onReturnToMenu();
  };
  
  // Función para reintentar autenticación
  const handleRetryAuth = async () => {
    setShowAuthErrorModal(false);
    setAuthErrorMessage('');
    setIsAuthenticating(true);
    
    try {
      const token = await authenticateWithGoogle();
      setAccessToken(token);
      setIsAuthenticated(true);
      console.log('✅ Reintento de autenticación exitoso para Recaudo');
    } catch (error) {
      console.error('❌ Error en reintento de autenticación:', error);
      setAuthErrorMessage(error.message);
      setShowAuthErrorModal(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Autenticación automática al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      setIsAuthenticating(true);
      try {
        const token = await authenticateWithGoogle();
        setAccessToken(token);
        setIsAuthenticated(true);
        console.log('✅ Autenticación exitosa para Recaudo');
      } catch (error) {
        console.error('❌ Error en autenticación automática:', error);
        setAuthErrorMessage(error.message);
        setShowAuthErrorModal(true);
      } finally {
        setIsAuthenticating(false);
      }
    };

    initAuth();
  }, []);

  // Nuevo estado para validación en tiempo real - EXPANDIDO
  const [fieldValidation, setFieldValidation] = useState({
    fecha: true,
    tipoCliente: false,  // ❌ ROJO por defecto hasta que se seleccione
    asesor: false,       // ✅ Validación para asesor
    nombreCliente: false,
    valorAcuerdo: true,  // Validación para valor del acuerdo
    fechaCompromiso: true, // Validación para fecha de compromiso
    matematica: true     // Validación matemática
  });

  // Función para validar un campo específico - SIMPLIFICADA
  const validateField = (fieldName, value, formData = recaudoData) => {
    switch (fieldName) {
      case 'fecha':
      case 'tipoCliente':
      case 'asesor':
      case 'nombreCliente':
        return value && value.trim() !== '';
      case 'matematica':
        const efectivo = parseFloat(parseCurrency(formData.efectivo) || '0');
        const transferencia = parseFloat(parseCurrency(formData.transferencia) || '0');
        const recaudo = parseFloat(parseCurrency(formData.recaudo) || '0');
        const totalFormasPago = efectivo + transferencia;
        return Math.abs(totalFormasPago - recaudo) < 0.01;
      case 'dondeTransfirieron':
        // Obligatorio solo si hay valor en transferencia
        const transferenciaValue = parseFloat(parseCurrency(formData.transferencia) || '0');
        return transferenciaValue === 0 || (value && value.trim() !== '');
      case 'valorAcuerdo':
      case 'fechaCompromiso':
        // Obligatorio solo si generoAcuerdo es true
        return !formData.generoAcuerdo || (value && value.trim() !== '');
      default:
        return true;
    }
  };

  // Función para obtener clases CSS - EXPANDIDA para más campos
  const getFieldClasses = (fieldName, baseClasses) => {
    const isValid = fieldValidation[fieldName];
    
    // Todos los campos obligatorios tienen validación visual rojo/verde
    if (fieldName === 'tipoCliente' || fieldName === 'asesor' || fieldName === 'nombreCliente' || 
        fieldName === 'valorAcuerdo' || fieldName === 'fechaCompromiso') {
      return isValid 
        ? `${baseClasses} border-green-500 bg-green-50` // ✅ VERDE: Campo válido
        : `${baseClasses} border-red-500 bg-red-50`;   // ❌ ROJO: Campo con error
    }
    
    return baseClasses; // Campos no obligatorios mantienen estilo normal
  };

  // Función para verificar si el botón de guardar debe estar habilitado - MEJORADA
  const isSubmitButtonEnabled = () => {
    // Validaciones básicas
    const basicValidation = fieldValidation.nombreCliente && fieldValidation.asesor && fieldValidation.tipoCliente;
    
    // Validación matemática (la nueva lógica)
    const mathematicalValidation = fieldValidation.matematica;
    
    // Validación condicional para campos de acuerdo de pago
    const acuerdoValidation = !recaudoData.generoAcuerdo || (fieldValidation.valorAcuerdo && fieldValidation.fechaCompromiso);
    
    return basicValidation && mathematicalValidation && acuerdoValidation && !isSubmitting;
  };

  // Función para obtener el mensaje de error del botón
  const getButtonErrorMessage = () => {
    if (!fieldValidation.tipoCliente) {
      return 'Debe seleccionar el tipo de cliente';
    }
    if (!fieldValidation.nombreCliente) {
      return 'Debe ingresar el nombre del cliente';
    }
    if (!fieldValidation.asesor) {
      return 'Debe seleccionar un asesor';
    }
    if (recaudoData.generoAcuerdo && !fieldValidation.valorAcuerdo) {
      return 'Debe ingresar el valor del acuerdo de pago';
    }
    if (recaudoData.generoAcuerdo && !fieldValidation.fechaCompromiso) {
      return 'Debe ingresar la fecha de compromiso de pago';
    }
    if (!fieldValidation.matematica) {
      const recaudo = parseCurrency(recaudoData.recaudo);
      const efectivo = parseCurrency(recaudoData.efectivo);
      const transferencia = parseCurrency(recaudoData.transferencia);
      const totalFormasPago = efectivo + transferencia;
      
      return `Error matemático: Recaudo = $${formatCurrency(recaudo.toString())} debe ser igual a (Efectivo + Transferencia) = $${formatCurrency(totalFormasPago.toString())}`;
    }
    
    return 'Formulario válido - Listo para guardar';
  };

  // Función para formatear números como moneda colombiana
  const formatCurrency = (value) => {
    if (!value || value === '') return '';
    
    // Convertir a número y eliminar decimales
    const numValue = parseInt(value.toString().replace(/[^0-9]/g, ''));
    if (isNaN(numValue) || numValue === 0) return '';
    
    // Formatear con separadores de miles usando apostrofe
    return '$' + numValue.toLocaleString('es-CO').replace(/,/g, "'");
  };

  // Función para parsear el valor formateado y obtener el número
  const parseCurrency = (formattedValue) => {
    if (!formattedValue) return '';
    // Remover $ y apostrofes, mantener solo números
    return formattedValue.replace(/[$']/g, '');
  };

  // Función especial para manejar cambios en campos monetarios - CORREGIDA
  const handleCurrencyChange = (fieldName, value) => {
    // Remover caracteres no numéricos (mantener solo dígitos)
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Validar que no exceda un límite razonable (ej: 10 dígitos)
    const limitedValue = numericValue.slice(0, 10);
    
    // Actualizar el estado con el valor numérico limpio
    const updatedData = {
      ...recaudoData,
      [fieldName]: limitedValue
    };
    
    setRecaudoData(updatedData);
    
    // Validación en tiempo real con datos actualizados
    const newValidation = { ...fieldValidation };
    
    // Validar matemática siempre
    newValidation.matematica = validateField('matematica', null, updatedData);
    
    // Si es valorAcuerdo, validar también ese campo específico
    if (fieldName === 'valorAcuerdo') {
      newValidation.valorAcuerdo = validateField('valorAcuerdo', limitedValue, updatedData);
    }
    
    setFieldValidation(newValidation);
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Validaciones de tipo de datos
    if (name === 'nombreCliente') {
      // Solo permitir letras, espacios y algunos caracteres especiales para nombres
      newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]/g, '');
      // Limitar longitud a 50 caracteres
      newValue = newValue.slice(0, 50);
    } else if (name === 'observaciones') {
      // Para observaciones, permitir más caracteres pero limitar longitud
      newValue = value.slice(0, 200);
      // Remover caracteres que puedan causar problemas en Excel
      newValue = newValue.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
    
    const updatedData = { ...recaudoData, [name]: newValue };
    setRecaudoData(updatedData);
    
    // Validación en tiempo real para el campo que cambió
    const isValid = validateField(name, newValue, updatedData);
    setFieldValidation(prev => ({ ...prev, [name]: isValid }));
    
    // Si cambió generoAcuerdo, revalidar campos de acuerdo
    if (name === 'generoAcuerdo') {
      const valorAcuerdoValid = validateField('valorAcuerdo', updatedData.valorAcuerdo, updatedData);
      const fechaCompromisoValid = validateField('fechaCompromiso', updatedData.fechaCompromiso, updatedData);
      setFieldValidation(prev => ({ 
        ...prev, 
        valorAcuerdo: valorAcuerdoValid,
        fechaCompromiso: fechaCompromisoValid
      }));
    }
    
    // Validación matemática
    const matematicaValid = validateField('matematica', null, updatedData);
    setFieldValidation(prev => ({ ...prev, matematica: matematicaValid }));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = [];
    
    // Campos obligatorios básicos
    if (!recaudoData.tipoCliente) errors.push('Tipo de Cliente');
    if (!recaudoData.asesor) errors.push('Asesor/Vendedor');
    if (!recaudoData.nombreCliente.trim()) errors.push('Nombre del Cliente');
    
    // Validación condicional: Donde Transfirieron
    const transferenciaValue = parseFloat(parseCurrency(recaudoData.transferencia) || '0');
    if (transferenciaValue > 0 && !recaudoData.dondeTransfirieron.trim()) {
      errors.push('¿Dónde Transfirieron? (requerido cuando hay transferencia)');
    }
    
    // Validación condicional: Campos de acuerdo de pago
    if (recaudoData.generoAcuerdo) {
      if (!recaudoData.valorAcuerdo.trim()) errors.push('Valor del Acuerdo');
      if (!recaudoData.fechaCompromiso.trim()) errors.push('Fecha de Compromiso');
    }
    
    return errors;
  };

  // Enviar datos al archivo XLSX en Google Drive
  const handleSubmitRecaudo = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      // En lugar de alert, actualizar validación visual
      const newValidation = { ...fieldValidation };
      
      // Marcar campos faltantes como inválidos
      if (!recaudoData.tipoCliente) newValidation.tipoCliente = false;
      if (!recaudoData.asesor) newValidation.asesor = false;
      if (!recaudoData.nombreCliente.trim()) newValidation.nombreCliente = false;
      
      // Validar campos de acuerdo de pago si es necesario
      if (recaudoData.generoAcuerdo) {
        if (!recaudoData.valorAcuerdo.trim()) newValidation.valorAcuerdo = false;
        if (!recaudoData.fechaCompromiso.trim()) newValidation.fechaCompromiso = false;
      }
      
      setFieldValidation(newValidation);
      return;
    }

    if (!isAuthenticated || !accessToken) {
      // Mostrar error de autenticación en el modal existente
      setAuthErrorMessage('Error: No hay autenticación válida. Por favor recargue la página.');
      setShowAuthErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Preparar datos para envío
      const timestamp = getColombiaTimestamp();
      const recaudoEntry = {
        fecha: recaudoData.fecha,
        tipoCliente: recaudoData.tipoCliente,
        asesor: recaudoData.asesor,
        nombreCliente: recaudoData.nombreCliente,
        recaudo: recaudoData.recaudo || '0',
        efectivo: recaudoData.efectivo || '0',
        transferencia: recaudoData.transferencia || '0',
        dondeTransfirieron: recaudoData.dondeTransfirieron || '',
        vendio: recaudoData.vendio ? 'Sí' : 'No',
        generoAcuerdo: recaudoData.generoAcuerdo ? 'Sí' : 'No',
        valorAcuerdo: recaudoData.generoAcuerdo ? (recaudoData.valorAcuerdo || '0') : '0',
        fechaCompromiso: recaudoData.generoAcuerdo ? recaudoData.fechaCompromiso : '',
        observaciones: recaudoData.observaciones,
        timestamp: timestamp
      };
      
      console.log('📤 Enviando datos de recaudo...');
      
      // Obtener el ID de hoja específico para el vendedor o usar el ID por defecto
      const vendedor = recaudoEntry.asesor;
      let SPREADSHEET_ID;
      
      if (vendedorSheetIds[vendedor] && vendedorSheetIds[vendedor].startsWith("ID_HOJA_")) {
        // Si el ID aún tiene el formato placeholder, mostrar un mensaje de error
        setIsSubmitting(false);
        setAuthErrorMessage(`La hoja de cálculo para el vendedor "${vendedor}" aún no ha sido configurada con un ID real. Por favor, contacte al administrador para actualizar el ID.`);
        setShowAuthErrorModal(true);
        return;
      } else if (vendedorSheetIds[vendedor]) {
        SPREADSHEET_ID = vendedorSheetIds[vendedor];
        console.log(`🔄 Usando hoja específica para vendedor ${vendedor}: ${SPREADSHEET_ID}`);
      } else {
        // Si no hay un ID específico para este vendedor, mostrar un mensaje de error
        setIsSubmitting(false);
        setAuthErrorMessage(`No se ha configurado una hoja de cálculo para el vendedor "${vendedor}". Por favor, contacte al administrador.`);
        setShowAuthErrorModal(true);
        return;
      }
      
      // Llamada al endpoint para agregar fila al XLSX
      const response = await fetch(`${API_BASE_URL}/append-to-recaudo-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          spreadsheetId: SPREADSHEET_ID,
          fecha: recaudoEntry.fecha,
          tipoCliente: recaudoEntry.tipoCliente,
          vendedor: recaudoEntry.asesor,
          nombreCliente: recaudoEntry.nombreCliente,
          recaudo: recaudoEntry.recaudo, // NUEVO CAMPO
          efectivo: recaudoEntry.efectivo,
          transferencia: recaudoEntry.transferencia,
          dondeTransfirieron: recaudoEntry.dondeTransfirieron, // NUEVO CAMPO
          generoAcuerdo: recaudoData.generoAcuerdo ? 'Sí' : 'No', // NUEVO CAMPO
          valorAcuerdo: recaudoEntry.valorAcuerdo, // NUEVO CAMPO
          fechaCompromiso: recaudoEntry.fechaCompromiso, // NUEVO CAMPO
          vendio: recaudoData.vendio ? 'Sí' : 'No', // NUEVO CAMPO
          observaciones: recaudoEntry.observaciones,
          spreadsheetId: SPREADSHEET_ID
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        // REEMPLAZAR ALERT CON MODAL
        // Guardar los datos antes de limpiar el formulario
        const savedRecaudoData = { ...recaudoData };
        
        setRecaudoResult({
          ...result,
          recaudoData: savedRecaudoData
        });
        setShowSuccessModalRecaudo(true);
        
        // Limpiar formulario después del envío exitoso
        setRecaudoData({
          fecha: new Date().toISOString().split('T')[0],
          tipoCliente: '',
          asesor: '',
          nombreCliente: '',
          recaudo: '', // NUEVO CAMPO
          efectivo: '',
          transferencia: '',
          dondeTransfirieron: '', // NUEVO CAMPO
          generoAcuerdo: false, // NUEVO CAMPO
          valorAcuerdo: '', // NUEVO CAMPO
          fechaCompromiso: '', // NUEVO CAMPO
          vendio: false, // NUEVO CAMPO
          observaciones: ''
        });
        setFieldValidation({
          fecha: true,
          tipoCliente: true,
          asesor: false,
          nombreCliente: false,
          matematica: true
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar los datos');
      }
      
    } catch (error) {
      console.error('❌ Error enviando recaudo:', error);
      setShowModal({
        show: true,
        title: 'Error al Guardar',
        message: `Error al guardar datos: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar pantalla de autenticación
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Autenticando con Google Drive...</h2>
          <p className="text-gray-600">Por favor complete la autenticación en la ventana emergente</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudo autenticar Y no hay modal activo
  if (!isAuthenticated && !showAuthErrorModal) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">No se pudo conectar con Google Drive</p>
          <button 
            onClick={onReturnToMenu}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      {/* Modal de Error de Autenticación */}
      {showAuthErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Error de Autenticación
              </h3>
              
              <div className="text-sm text-gray-600 mb-6 space-y-2">
                <p className="font-medium text-red-600">
                  Por favor verifique que está usando el correo empresarial que le fue entregado para su zona.
                </p>
                <p>
                  La autenticación con Google Drive es necesaria para acceder al reporte de recaudo.
                </p>
                {authErrorMessage && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error: {authErrorMessage}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReturnToFormRecaudo}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Regresar al Menú
                </button>
                <button
                  onClick={handleRetryAuth}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Verificar de Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto p-4 sm:p-8 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            📊 Reporte de Recaudo
          </h1>
          <button
            onClick={onReturnToMenu}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← Volver al Menú
          </button>
        </div>

        {/* Formulario de Recaudo */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">
            Información del Recaudo
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fecha */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Fecha:
              </label>
              <input
                type="date"
                name="fecha"
                value={recaudoData.fecha}
                readOnly
                className="p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                title="La fecha se establece automáticamente al día actual"
              />
            </div>

            {/* Vendió */}
            <div className="flex items-center self-end mb-1">
              <input
                type="checkbox"
                name="vendio"
                checked={recaudoData.vendio}
                onChange={(e) => setRecaudoData({...recaudoData, vendio: e.target.checked})}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-600">
                Vendió
              </label>
            </div>

            {/* Tipo de Cliente */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Tipo de Cliente: *
              </label>
              <select
                name="tipoCliente"
                value={recaudoData.tipoCliente}
                onChange={handleInputChange}
                className={getFieldClasses('tipoCliente', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
              >
                <option value="">Seleccione tipo de cliente</option>
                <option value="nuevo">Nuevo</option>
                <option value="antiguo">Antiguo</option>
              </select>
            </div>

            {/* Asesor/Vendedor */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Asesor/Vendedor: *
              </label>
              <select
                name="asesor"
                value={recaudoData.asesor}
                onChange={handleInputChange}
                className={getFieldClasses('asesor', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
                required
              >
                <option value="">Seleccione un asesor/vendedor</option>
                <option value="Nohora Triana">Nohora Triana</option>
                <option value="Alejandra Niño">Alejandra Niño</option>
                <option value="Mariela Betancur">Mariela Betancur</option>
                <option value="Jhon Prada">Jhon Prada</option>
                <option value="Dayana Leon">Dayana Leon</option>
                <option value="Johana Salazar">Johana Salazar</option>
                <option value="Ingrid Rojas">Ingrid Rojas</option>
                <option value="Enrique Herrera">Enrique Herrera</option>
                <option value="Sebastian Torres">Sebastian Torres</option>
                <option value="Jenny Gonzalez">Jenny Gonzalez</option>
                <option value="Pilar Castrillo">Pilar Castrillo</option>
              </select>
            </div>

            {/* Nombre del Cliente */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Nombre del Cliente: *
              </label>
              <input
                type="text"
                name="nombreCliente"
                placeholder="Ingrese el nombre completo del cliente"
                value={recaudoData.nombreCliente}
                onChange={handleInputChange}
                className={getFieldClasses('nombreCliente', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
                maxLength="50"
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]+"
                title="Solo se permiten letras, espacios, puntos y guiones"
                required
              />
            </div>



            {/* NUEVO CAMPO: Recaudo */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Recaudo:
              </label>
              <input
                type="text"
                name="recaudo"
                placeholder="$0"
                value={formatCurrency(recaudoData.recaudo)}
                onChange={(e) => handleCurrencyChange('recaudo', e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>



          {/* Sección de Formas de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Efectivo */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Efectivo:
              </label>
              <input
                type="text"
                name="efectivo"
                placeholder="$0"
                value={formatCurrency(recaudoData.efectivo)}
                onChange={(e) => handleCurrencyChange('efectivo', e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Transferencia */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Transferencia:
              </label>
              <input
                type="text"
                name="transferencia"
                placeholder="$0"
                value={formatCurrency(recaudoData.transferencia)}
                onChange={(e) => handleCurrencyChange('transferencia', e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* NUEVO CAMPO: ¿Dónde Transfirieron? - Solo visible si hay transferencia */}
            {parseFloat(parseCurrency(recaudoData.transferencia) || '0') > 0 && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  ¿Dónde Transfirieron?:
                </label>
                <select
                  name="dondeTransfirieron"
                  value={recaudoData.dondeTransfirieron}
                  onChange={handleInputChange}
                  className={`p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${validateField('dondeTransfirieron', recaudoData.dondeTransfirieron, recaudoData) ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="bancolombia comercializadora">Bancolombia Comercializadora</option>
                  <option value="daviplata comercializadora">Daviplata Comercializadora</option>
                </select>
              </div>
            )}
          </div>

          {/* NUEVA SECCIÓN: Acuerdo de Pago */}
          <div className="mt-6 bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                name="generoAcuerdo"
                checked={recaudoData.generoAcuerdo}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                ¿Generó acuerdo de pago?
              </label>
            </div>
            
            {recaudoData.generoAcuerdo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Valor del Acuerdo */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    ¿De cuánto fue el acuerdo de pago?: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="valorAcuerdo"
                    placeholder="$0"
                    value={formatCurrency(recaudoData.valorAcuerdo)}
                    onChange={(e) => handleCurrencyChange('valorAcuerdo', e.target.value)}
                    className={getFieldClasses('valorAcuerdo', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
                  />
                </div>

                {/* Fecha de Compromiso */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    Fecha de compromiso de pago: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaCompromiso"
                    value={recaudoData.fechaCompromiso}
                    onChange={handleInputChange}
                    className={getFieldClasses('fechaCompromiso', 'p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500')}
                  />
                </div>
              </div>
            )}
          </div>



          {/* Observaciones */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Observaciones:
            </label>
            <textarea
              name="observaciones"
              placeholder="Ingrese observaciones adicionales (opcional)"
              value={recaudoData.observaciones}
              onChange={handleInputChange}
              rows={3}
              maxLength="200"
              title="Solo se permiten hasta 200 caracteres. No se permiten caracteres especiales que puedan causar problemas en Excel."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Botón de Guardar */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmitRecaudo}
              disabled={!isSubmitButtonEnabled()}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isSubmitButtonEnabled()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                '💾 Guardar Recaudo'
              )}
            </button>
          </div>
        </div>



        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>📋 Información:</strong> Los datos se guardarán automáticamente en el archivo XLSX de Google Drive. 
            Todos los registros quedan almacenados de forma permanente para generar reportes y análisis.
          </p>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowSheetConfigModal(true)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              ⚙️ Configurar Hojas por Vendedor
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de Configuración de Hojas por Vendedor */}
      {showSheetConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                ⚙️ Configurar Hojas por Vendedor
              </h3>
              
              <div className="mb-4 bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  <strong>Instrucciones:</strong> Selecciona un vendedor de la lista y actualiza su ID de hoja de Google. 
                  Los IDs actuales son placeholders y deben ser reemplazados con los IDs reales.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Vendedor:
                </label>
                <select
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar vendedor...</option>
                  {Object.keys(vendedorSheetIds).map(vendedor => (
                    <option key={vendedor} value={vendedor}>
                      {vendedor}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Hoja de Google:
                </label>
                <input
                  type="text"
                  value={newSheetId}
                  onChange={(e) => setNewSheetId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ej: 1LegnA-Ew5vW44iG66xoyE5pKISkd76hYqDZcJ4WyEeo"
                />
                {newVendorName && vendedorSheetIds[newVendorName] && (
                  <p className="mt-1 text-xs text-gray-500">
                    ID actual: <span className={vendedorSheetIds[newVendorName].startsWith("ID_HOJA_") ? "text-red-500" : "text-green-600"}>
                      {vendedorSheetIds[newVendorName]}
                    </span>
                    {vendedorSheetIds[newVendorName].startsWith("ID_HOJA_") && (
                      <span className="ml-1 text-red-500">(Necesita actualización)</span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Estado de Configuración:</h4>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {Object.entries(vendedorSheetIds).map(([vendedor, sheetId]) => (
                    <div key={vendedor} className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-sm font-medium">{vendedor}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sheetId.startsWith("ID_HOJA_") 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {sheetId.startsWith("ID_HOJA_") ? "Pendiente" : "Configurado"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowSheetConfigModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    if (newVendorName.trim() && newSheetId.trim()) {
                      configureVendorSheet(newVendorName.trim(), newSheetId.trim());
                      setNewSheetId('');
                      // No limpiamos el nombre del vendedor para facilitar configuraciones consecutivas
                    }
                  }}
                  disabled={!newVendorName.trim() || !newSheetId.trim()}
                  className={`px-4 py-2 rounded-md ${
                    newVendorName.trim() && newSheetId.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Actualizar ID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Éxito para RecaudoForm */}
      {showSuccessModalRecaudo && recaudoResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Recaudo Guardado Exitosamente!</h2>
              <p className="text-green-100 text-sm">Los datos han sido guardados en Google Drive</p>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">👤 Cliente:</span>
                  <span className="text-gray-800 font-semibold">{recaudoResult.recaudoData.nombreCliente}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">👨‍💼 Asesor:</span>
                  <span className="text-gray-800">{recaudoResult.recaudoData.asesor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">📅 Fecha:</span>
                  <span className="text-gray-800">{recaudoResult.recaudoData.fecha}</span>
                </div>
                
                {/* Información de Ventas y Abonos */}
                <div className="border-t pt-3 mt-3">
                  <div className="border-t pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">💵 Efectivo:</span>
                      <span className="text-gray-800">
                        {parseInt(recaudoResult.recaudoData.efectivo || 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">🏦 Transferencia:</span>
                      <span className="text-gray-800">
                        {parseInt(recaudoResult.recaudoData.transferencia || 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Observaciones - Solo si hay contenido */}
                  {recaudoResult.recaudoData.observaciones && recaudoResult.recaudoData.observaciones.trim() && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex flex-col">
                        <span className="text-gray-600 font-medium mb-1">📝 Observaciones:</span>
                        <span className="text-gray-800 text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                          {recaudoResult.recaudoData.observaciones}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {recaudoResult.webViewLink && (
                  <div className="pt-2">
                    <a 
                      href={recaudoResult.webViewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                    >
                      🔗 Ver archivo en Google Drive
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              
              {/* Botones de Acción */}
              <div className="flex flex-col gap-3 pt-4">
                {/* Cuando NO vendió: mostrar solo "Llenar Otro Recaudo" */}
                {!recaudoResult.recaudoData.vendio && (
                  <button
                    onClick={handleNewRecaudo}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    ➕ Llenar Otro Recaudo
                  </button>
                )}
                
                {/* Cuando SÍ vendió (en modo integrado): mostrar "Tomar Pedido" y "Guardar para Después" */}
                {recaudoResult.recaudoData.vendio && isIntegratedMode && (
                  <>
                    <button
                      onClick={() => {
                        // Navegar directamente al formulario con cliente pre-llenado
                        if (onSaveForLater) {
                          onSaveForLater(recaudoResult.recaudoData.nombreCliente, 'direct');
                        }
                      }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        📝 Tomar Pedido
                      </button>
                      
                      <button
                        onClick={() => {
                          // Guardar para después y navegar a la tabla de pedidos
                          if (onSaveForLater) {
                            onSaveForLater(recaudoResult.recaudoData.nombreCliente, 'save');
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        💾 Guardar para Después
                      </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}  
    </div>
  );
};

// Componente para la Gestión Diaria del Vendedor
const GestionDiariaVendedor = ({ onReturnToMenu }) => {
  const [currentSubView, setCurrentSubView] = useState("menu");
  const [userEmail, setUserEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [prefilledClientName, setPrefilledClientName] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  // Estados para autenticación Google (igual que RecaudoForm)
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [showAuthErrorModal, setShowAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);

  // Función de autenticación OAuth 2.0 (reutilizada del RecaudoForm)
  const authenticateWithGoogle = async () => {
    try {
      console.log('🔐 Iniciando autenticación OAuth2 para Gestión Diaria...');
      
      const response = await fetch(`${API_BASE_URL}/auth/google`);
      const data = await response.json();
      
      if (data.auth_url) {
        const authWindow = window.open(
          data.auth_url, 
          'google-auth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        return new Promise((resolve, reject) => {
          const messageListener = (event) => {
            if (event.origin !== window.location.origin && 
                !event.origin.includes('optimizations-c6pm.onrender.com')) {
              return;
            }
            
            if (event.data.type === 'OAUTH_SUCCESS' && event.data.access_token) {
              console.log('✅ Token OAuth2 obtenido automáticamente para Gestión Diaria');
              // Guardar token en localStorage para uso posterior
              localStorage.setItem('google_access_token', event.data.access_token);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              resolve(event.data.access_token);
            } else if (event.data.type === 'OAUTH_ERROR') {
              console.error('❌ Error en OAuth2:', event.data.error);
              window.removeEventListener('message', messageListener);
              authWindow.close();
              reject(new Error(event.data.error || 'Error en autenticación'));
            }
          };
          
          window.addEventListener('message', messageListener);
          
          const checkClosed = setInterval(() => {
            if (authWindow.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              reject(new Error('Autenticación cancelada por el usuario'));
            }
          }, 1000);
          
          setTimeout(() => {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            if (!authWindow.closed) {
              authWindow.close();
            }
            reject(new Error('Timeout de autenticación'));
          }, 300000);
        });
      } else {
        throw new Error('No se pudo obtener URL de autenticación');
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      throw error;
    }
  };

  // Función para obtener email del usuario autenticado
  const getUserEmailFromToken = async (token) => {
    try {
      console.log('🔍 Obteniendo información del usuario desde el backend...');
      
      const response = await fetch(`${API_BASE_URL}/get-user-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: token
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Email del usuario obtenido:', data.email);
        return data.email;
      } else {
        throw new Error(data.error || 'No se pudo obtener información del usuario');
      }
    } catch (error) {
      console.error('❌ Error obteniendo email del usuario:', error);
      throw error;
    }
  };

  // Autenticación automática al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      setIsAuthenticating(true);
      try {
        const token = await authenticateWithGoogle();
        setAccessToken(token);
        setIsAuthenticated(true);
        
        // Obtener email del usuario autenticado
        const email = await getUserEmailFromToken(token);
        setUserEmail(email);
        setIsEmailVerified(true);
        await loadPendingOrders(email);
        
        console.log('✅ Autenticación exitosa para Gestión Diaria:', email);
      } catch (error) {
        console.error('❌ Error en autenticación automática:', error);
        setAuthErrorMessage(error.message);
        setShowAuthErrorModal(true);
      } finally {
        setIsAuthenticating(false);
      }
    };

    initAuth();
  }, []);

  // Función para reintentar autenticación
  const handleRetryAuth = async () => {
    setShowAuthErrorModal(false);
    setAuthErrorMessage('');
    setIsAuthenticating(true);
    
    try {
      const token = await authenticateWithGoogle();
      setAccessToken(token);
      setIsAuthenticated(true);
      
      const email = await getUserEmailFromToken(token);
      setUserEmail(email);
      setIsEmailVerified(true);
      await loadPendingOrders(email);
      
      console.log('✅ Reintento de autenticación exitoso para Gestión Diaria:', email);
    } catch (error) {
      console.error('❌ Error en reintento de autenticación:', error);
      setAuthErrorMessage(error.message);
      setShowAuthErrorModal(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Función para navegar al formulario de pedidos con cliente pre-llenado
  const navigateToPedidoWithClient = (clientName) => {
    setPrefilledClientName(clientName);
    setCurrentSubView("pedido");
  };

  // Exponer la función globalmente para acceso desde RecaudoForm
  React.useEffect(() => {
    window.gestionDiariaRef = { navigateToPedidoWithClient };
    return () => {
      delete window.gestionDiariaRef;
    };
  }, []);

  // Función para cargar pedidos pendientes SOLO desde Google Drive
  const loadPendingOrders = async (email) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      
      if (!accessToken) {
        console.log('No hay token de acceso, no se pueden cargar pedidos');
        setPendingOrders([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/get-pending-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          user_email: email
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const driveOrders = data.orders || [];
        setPendingOrders(driveOrders);
        console.log(`📥 Cargados ${driveOrders.length} pedidos desde Google Drive`);
      } else {
        console.log('Error al cargar desde Google Drive');
        setPendingOrders([]);
      }
      
      // Limpiar archivos expirados de Google Drive (ejecutar en segundo plano)
      try {
        fetch(`${API_BASE_URL}/cleanup-expired-orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: accessToken
          })
        }).then(response => {
          if (response.ok) {
            return response.json();
          }
        }).then(data => {
          if (data && data.deleted_count > 0) {
            console.log(`🗑️ Limpieza automática: ${data.deleted_count} archivos expirados eliminados`);
          }
        }).catch(error => {
          console.log('⚠️ Error en limpieza automática:', error);
        });
      } catch (error) {
        console.log('⚠️ Error iniciando limpieza automática:', error);
      }
      
    } catch (error) {
      console.error('Error cargando pedidos pendientes:', error);
      setPendingOrders([]);
    }
  };

  // Función para manejar las acciones desde RecaudoForm
  const handleSaveForLater = async (clientName, action) => {
    if (action === 'direct') {
      // Navegar directamente al PedidoForm con cliente pre-llenado
      setPrefilledClientName(clientName);
      setCurrentSubView("pedido");
    } else if (action === 'take_order') {
      // Registrar pedido en tabla de gestión Y navegar al formulario
      const newOrder = {
        id: getColombiaDateTime().getTime().toString(),
        clientName,
        timestamp: getColombiaTimestamp(),
        uploaded: false,
        driveLink: null
      };
      
      const updatedOrders = [...pendingOrders, newOrder];
      setPendingOrders(updatedOrders);
      setCurrentOrderId(newOrder.id); // Establecer el ID del pedido actual
      
      // Guardar en Google Drive
      const accessToken = localStorage.getItem('google_access_token');
      if (accessToken) {
        try {
          await fetch(`${API_BASE_URL}/sync-pending-orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
              user_email: userEmail,
              orders: updatedOrders
            })
          });
          console.log('✅ Pedido registrado en Google Drive');
        } catch (error) {
          console.log('⚠️ Error guardando en Google Drive:', error);
        }
      }
      
      // Navegar al formulario de pedidos con cliente pre-llenado
      setPrefilledClientName(clientName);
      setCurrentSubView("pedido");
    } else if (action === 'save') {
      // Agregar a la tabla de gestión y navegar a ver pedidos
      const newOrder = {
        id: getColombiaDateTime().getTime().toString(),
        clientName,
        timestamp: getColombiaTimestamp(),
        uploaded: false,
        driveLink: null
      };
      
      console.log(`💾 Guardando pedido para después - Cliente: ${clientName}`);
      
      const updatedOrders = [...pendingOrders, newOrder];
      setPendingOrders(updatedOrders);
      
      // Guardar SOLO en Google Drive
      const accessToken = localStorage.getItem('google_access_token');
      if (accessToken) {
        // Mostrar estado de carga
        const loadingMessage = document.createElement('div');
        loadingMessage.id = 'save-loading';
        loadingMessage.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px;
          border-radius: 10px;
          z-index: 10000;
          text-align: center;
          font-family: Arial, sans-serif;
        `;
        loadingMessage.innerHTML = `
          <div style="margin-bottom: 10px;">💾 Guardando pedido...</div>
          <div style="font-size: 12px; opacity: 0.8;">Sincronizando con Google Drive</div>
        `;
        document.body.appendChild(loadingMessage);

        try {
          console.log('🔄 Sincronizando con Google Drive...');
          const response = await fetch(`${API_BASE_URL}/sync-pending-orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: accessToken,
              user_email: userEmail,
              orders: updatedOrders
            })
          });
          
          // Remover mensaje de carga
          const loadingEl = document.getElementById('save-loading');
          if (loadingEl) loadingEl.remove();
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Pedido guardado exitosamente en Google Drive:', result);
            console.log(`📊 Total de pedidos sincronizados: ${result.total_orders}`);
            
            // Mostrar mensaje de éxito
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 15px 20px;
              border-radius: 5px;
              z-index: 10000;
              font-family: Arial, sans-serif;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            successMessage.innerHTML = '✅ Pedido guardado exitosamente';
            document.body.appendChild(successMessage);
            
            // Remover mensaje después de 3 segundos
            setTimeout(() => {
              if (successMessage.parentNode) {
                successMessage.remove();
              }
            }, 3000);
          } else {
            const errorData = await response.json();
            console.error('❌ Error del servidor al guardar:', errorData);
            // Si falla, remover el pedido del estado
            setPendingOrders(pendingOrders);
            
            // Mostrar mensaje de error
            const errorMessage = document.createElement('div');
            errorMessage.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #f44336;
              color: white;
              padding: 15px 20px;
              border-radius: 5px;
              z-index: 10000;
              font-family: Arial, sans-serif;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              max-width: 300px;
            `;
            errorMessage.innerHTML = `❌ Error: ${errorData.error || 'Error desconocido'}`;
            document.body.appendChild(errorMessage);
            
            // Remover mensaje después de 5 segundos
            setTimeout(() => {
              if (errorMessage.parentNode) {
                errorMessage.remove();
              }
            }, 5000);
          }
        } catch (error) {
          console.error('⚠️ Error de red guardando en Google Drive:', error);
          
          // Remover mensaje de carga si aún existe
          const loadingEl = document.getElementById('save-loading');
          if (loadingEl) loadingEl.remove();
          
          // Si falla, remover el pedido del estado
          setPendingOrders(pendingOrders);
          
          // Mostrar mensaje de error
          const errorMessage = document.createElement('div');
          errorMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 300px;
          `;
          errorMessage.innerHTML = `❌ Error de conexión: ${error.message}`;
          document.body.appendChild(errorMessage);
          
          // Remover mensaje después de 5 segundos
          setTimeout(() => {
            if (errorMessage.parentNode) {
              errorMessage.remove();
            }
          }, 5000);
        }
      } else {
        console.error('⚠️ No hay token de acceso, no se puede guardar');
        // Si no hay token, remover el pedido del estado
        setPendingOrders(pendingOrders);
        
        // Mostrar mensaje de error de autenticación
        const authErrorMessage = document.createElement('div');
        authErrorMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff9800;
          color: white;
          padding: 15px 20px;
          border-radius: 5px;
          z-index: 10000;
          font-family: Arial, sans-serif;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          max-width: 300px;
        `;
        authErrorMessage.innerHTML = '⚠️ Error: Autenticación requerida. Recargue la página.';
        document.body.appendChild(authErrorMessage);
        
        // Remover mensaje después de 5 segundos
        setTimeout(() => {
          if (authErrorMessage.parentNode) {
            authErrorMessage.remove();
          }
        }, 5000);
      }
      
      // Navegar a la vista de gestión de pedidos
      setCurrentSubView("orders");
    }
  };

  // Función addPendingOrder eliminada para prevenir duplicaciones automáticas

  // Función para calcular tiempo restante
  const getTimeRemaining = (timestamp) => {
    const now = getColombiaDateTime().getTime();
    // Convertir el timestamp a la zona horaria de Colombia
    const orderDate = new Date(timestamp);
    const orderTime = orderDate.getTime();
    const elapsed = now - orderTime;
    const remaining = 18 * 60 * 60 * 1000 - elapsed; // 18 horas - tiempo transcurrido
    
    if (remaining <= 0) return "Expirado";
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  // Sistema de recarga automática cada 5 minutos para mantener datos actualizados
  React.useEffect(() => {
    if (!isEmailVerified || !userEmail) return;
    
    // Cargar pedidos inicial
    loadPendingOrders(userEmail);
    
    // Configurar recarga automática cada 5 minutos
    const reloadInterval = setInterval(() => {
      loadPendingOrders(userEmail);
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(reloadInterval);
    };
  }, [isEmailVerified, userEmail]);

  // Renderizar pantalla de autenticación
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Autenticando con Google</h2>
            <p className="text-gray-600">Por favor, completa la autenticación en la ventana emergente...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar modal de error de autenticación
  if (showAuthErrorModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Error de Autenticación</h2>
            <p className="text-gray-600 mb-6">{authErrorMessage}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetryAuth}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                🔄 Reintentar Autenticación
              </button>
              <button
                onClick={onReturnToMenu}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Volver al Menú
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar verificación de email (solo si no está autenticado)
  if (!isEmailVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🏢 Gestión Diaria del Vendedor
            </h1>
            <p className="text-gray-600">Autenticación con Google requerida</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleRetryAuth}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              🔐 Autenticar con Google
            </button>
            
            <button
              onClick={onReturnToMenu}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal de confirmación de eliminación exitosa
  if (showDeleteModal && deleteResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ✅ Pedido Eliminado
            </h3>
            
            <div className="text-sm text-gray-600 mb-6 space-y-2">
              <p className="font-medium text-green-600">
                El pedido ha sido eliminado exitosamente.
              </p>
              {deleteResult.successfully_deleted > 0 && (
                <p>
                  Pedidos eliminados: <span className="font-semibold">{deleteResult.successfully_deleted}</span>
                </p>
              )}
              {deleteResult.expired_orders > 0 && (
                <p>
                  Pedidos expirados limpiados: <span className="font-semibold">{deleteResult.expired_orders}</span>
                </p>
              )}
            </div>
            
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteResult(null);
              }}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar submenú de gestión diaria
  if (currentSubView === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🏢 Gestión Diaria del Vendedor
            </h1>
            <p className="text-gray-600 text-sm">Usuario: {userEmail}</p>
            <p className="text-gray-500 text-xs mt-1">Pedidos pendientes: {pendingOrders.length}</p>
          </div>
          
          <nav className="space-y-4">
            <button
              onClick={() => setCurrentSubView("recaudo")}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              💰 Reporte de Recaudo
            </button>
            
            <button
              onClick={() => setCurrentSubView("orders")}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              📋 Gestión de Pedidos
            </button>
            
            <button
              onClick={onReturnToMenu}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Volver al Menú Principal
            </button>
          </nav>
        </div>
      </div>
    );
  }

  // Renderizar tabla de gestión de pedidos
  if (currentSubView === "orders") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                📋 Gestión de Pedidos
              </h1>
              <button
                onClick={() => setCurrentSubView("menu")}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Volver
              </button>
            </div>
            
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay pedidos pendientes</p>
                <p className="text-gray-400 text-sm mt-2">Los pedidos aparecerán aquí cuando uses "Guardar para Después" en el recaudo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left"># Pedido</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Subido</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Opción</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Tiempo Restante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => {
                      const isExpired = getTimeRemaining(order.timestamp) === "Expirado";
                      return (
                        <tr key={order.id} className={isExpired ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                          <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                            {order.id.slice(-6)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {order.clientName}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {order.uploaded ? (
                              <span className="text-green-600 text-xl">✓</span>
                            ) : (
                              <span className="text-red-600 text-xl">✗</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="flex gap-2 justify-center">
                              {order.uploaded && order.driveLink ? (
                                <a
                                  href={order.driveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  📁 Ver en Drive
                                </a>
                              ) : (
                                <button
                                  onClick={() => {
                                    setCurrentOrderId(order.id);
                                    navigateToPedidoWithClient(order.clientName);
                                  }}
                                  className={isExpired ? 
                                    "bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed" : 
                                    "bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                  }
                                  disabled={isExpired}
                                >
                                  📝 Llenar Pedido
                                </button>
                              )}
                              {order.uploaded && (
                                <button
                                  onClick={async (e) => {
                                    e.target.disabled = true;
                                    e.target.textContent = '⏳ Eliminando...';
                                    
                                    const orderToDelete = order.id;
                                    const updatedOrders = pendingOrders.filter(o => o.id !== orderToDelete);
                                    
                                    console.log(`🗑️ Iniciando eliminación del pedido ${orderToDelete}`);
                                    console.log(`📊 Pedidos antes de eliminar: ${pendingOrders.length}`);
                                    console.log(`📊 Pedidos después de eliminar: ${updatedOrders.length}`);
                                    
                                    // Verificar autenticación
                                    const accessToken = localStorage.getItem('google_access_token');
                                    if (!accessToken) {
                                      alert('❌ No se encontró token de acceso. Por favor, vuelva a autenticarse con Google.');
                                      e.target.disabled = false;
                                      e.target.textContent = '🗑️ Eliminar';
                                      return;
                                    }
                                    
                                    try {
                                      console.log(`🔄 Enviando solicitud de eliminación a Google Drive...`);
                                      const response = await fetch(`${API_BASE_URL}/sync-pending-orders`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          access_token: accessToken,
                                          user_email: userEmail,
                                          orders: updatedOrders
                                        })
                                      });
                                      
                                      console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);
                                      
                                      if (response.ok) {
                                         const result = await response.json();
                                         console.log('✅ Respuesta exitosa del servidor:', result);
                                         
                                         // Verificar detalles de la operación
                                         const operationDetails = result.operation_details || {};
                                         const serverOrders = result.orders || [];
                                         const deletedOrderExists = serverOrders.some(o => o.id === orderToDelete);
                                         
                                         console.log('📊 Detalles de la operación:', operationDetails);
                                         
                                         // Verificar si el pedido fue eliminado exitosamente
                                         const wasSuccessfullyDeleted = operationDetails.successfully_deleted?.includes(orderToDelete);
                                         const failedDeletion = operationDetails.failed_deletions?.includes(orderToDelete);
                                         
                                         if (!deletedOrderExists && (wasSuccessfullyDeleted || !failedDeletion)) {
                                           console.log(`✅ Confirmado: Pedido ${orderToDelete} eliminado correctamente`);
                                           console.log(`📊 Pedidos restantes en servidor: ${serverOrders.length}`);
                                           setPendingOrders(updatedOrders);
                                           
                                           // Mensaje detallado de éxito
                                           const successMessage = `✅ Pedido #${orderToDelete} eliminado exitosamente\n` +
                                             `📊 Pedidos restantes: ${serverOrders.length}\n` +
                                             `🔄 Sincronización completada`;
                                           setDeleteResult({
                                             type: 'success',
                                             title: 'Pedido Eliminado',
                                             message: successMessage,
                                             orderId: orderToDelete,
                                             remainingOrders: serverOrders.length
                                           });
                                           setShowDeleteModal(true);
                                         } else if (failedDeletion) {
                                           console.error(`❌ Error: Fallo confirmado en eliminación del pedido ${orderToDelete}`);
                                           alert(`❌ Error confirmado: El pedido #${orderToDelete} no se pudo eliminar del servidor.\nDetalles: ${JSON.stringify(operationDetails, null, 2)}`);
                                         } else if (deletedOrderExists) {
                                           console.error(`❌ Error: El pedido ${orderToDelete} aún existe en el servidor`);
                                           alert(`❌ Error: El pedido #${orderToDelete} aún existe en Google Drive.\nPor favor, intente nuevamente o contacte soporte técnico.`);
                                         } else {
                                           // Caso ambiguo - actualizar pero advertir
                                           console.warn(`⚠️ Estado ambiguo para pedido ${orderToDelete}`);
                                           setPendingOrders(updatedOrders);
                                           alert(`⚠️ Pedido #${orderToDelete} procesado, pero verifique el estado.\nSi persisten problemas, contacte soporte técnico.`);
                                         }
                                       } else {
                                        let errorMessage = 'Error desconocido del servidor';
                                        try {
                                          const errorData = await response.json();
                                          errorMessage = errorData.error || errorData.message || errorMessage;
                                          console.error('❌ Error del servidor:', errorData);
                                        } catch (parseError) {
                                          console.error('❌ Error parseando respuesta del servidor:', parseError);
                                        }
                                        alert(`❌ Error del servidor (${response.status}): ${errorMessage}`);
                                      }
                                    } catch (networkError) {
                                      console.error('⚠️ Error de red al eliminar:', networkError);
                                      alert(`❌ Error de conexión: ${networkError.message}. Verifique su conexión a internet y vuelva a intentar.`);
                                    } finally {
                                      e.target.disabled = false;
                                      e.target.textContent = '🗑️ Eliminar';
                                    }
                                  }}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                            <span className={isExpired ? "text-red-600 font-bold" : "text-gray-600"}>
                              {getTimeRemaining(order.timestamp)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar RecaudoForm integrado
  if (currentSubView === "recaudo") {
    return (
      <RecaudoForm 
        onReturnToMenu={() => setCurrentSubView("menu")}
        isIntegratedMode={true}
        onSaveForLater={handleSaveForLater}
        userEmail={userEmail}
      />
    );
  }

  // Estado para el ID del pedido actual ya declarado arriba

  // Renderizar PedidoForm integrado con cliente pre-llenado
  if (currentSubView === "pedido") {
    return (
      <PedidoForm 
        onReturnToMenu={() => setCurrentSubView("menu")}
        prefilledClientName={prefilledClientName}
        isIntegratedMode={true}
        onViewOrders={() => setCurrentSubView("orders")}
        currentOrderId={currentOrderId}
        onOrderComplete={async (orderId, driveLink) => {
          // Actualizar la lista de pedidos pendientes cuando se complete un pedido usando ID único
          const updatedOrders = pendingOrders.map(order => 
            order.id === orderId 
              ? { ...order, uploaded: true, driveLink: driveLink || "#" }
              : order
          );
          setPendingOrders(updatedOrders);
          
          // Actualizar en Google Drive
          const accessToken = localStorage.getItem('google_access_token');
          if (accessToken) {
            try {
              await fetch(`${API_BASE_URL}/sync-pending-orders`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  access_token: accessToken,
                  user_email: userEmail,
                  orders: updatedOrders
                })
              });
              console.log('✅ Estado del pedido actualizado en Google Drive');
            } catch (error) {
              console.log('⚠️ Error actualizando en Google Drive:', error);
            }
          }
          
          // NO redirigir automáticamente - dejar que el modal se muestre
          // setCurrentSubView("menu"); // REMOVIDO para permitir que se muestre el modal
        }}
      />
    );
  }

  return null;
};

// Componente principal que maneja el menú y la renderización condicional
const App = () => {
  const [currentView, setCurrentView] = useState("menu");
  const [showVendorAuth, setShowVendorAuth] = useState(false);
  const [authenticatedVendor, setAuthenticatedVendor] = useState(null);

  const handleVendorAuthenticated = (vendorData) => {
    setAuthenticatedVendor(vendorData);
    setShowVendorAuth(false);
    setCurrentView("pedido");
  };

  const handleCancelVendorAuth = () => {
    setShowVendorAuth(false);
    setCurrentView("menu");
  };

  const handlePedidoClick = () => {
    setShowVendorAuth(true);
  };

  const handleReturnToMenu = () => {
    setCurrentView("menu");
    setAuthenticatedVendor(null); // Limpiar autenticación al regresar
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "excel":
        return <ExcelAnalyser onReturnToMenu={() => setCurrentView("menu")} />;
      case "pedido":
        return (
          <PedidoForm 
            onReturnToMenu={handleReturnToMenu}
            prefilledVendor={authenticatedVendor?.vendorName}
            prefilledZone={authenticatedVendor?.vendorZone}
          />
        );
      case "recaudo":
        return <RecaudoForm onReturnToMenu={() => setCurrentView("menu")} />;
      case "gestion":
        return <GestionDiariaVendedor onReturnToMenu={() => setCurrentView("menu")} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Natural Colors
                </h1>
                <p className="text-gray-600">Sistema de Gestión</p>
              </div>
              
              <nav className="space-y-4">
                <button
                  onClick={() => setCurrentView("gestion")}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  🏢 Gestión Diaria del Vendedor
                </button>
                
                <button
                  onClick={handlePedidoClick}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📝 Llenado de Pedido
                </button>
                
                <button
                  onClick={() => setCurrentView("excel")}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📊 Analizar Excel
                </button>
              </nav>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentView()}
      {showVendorAuth && (
        <VendorAuthModal
          onVendorAuthenticated={handleVendorAuthenticated}
          onCancel={handleCancelVendorAuth}
        />
      )}
    </>
  );
};

export default App;
