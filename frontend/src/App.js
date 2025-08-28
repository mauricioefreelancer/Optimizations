import React, { useState } from "react";

// Define la URL base de tu backend
const API_BASE_URL = "https://optimizations-c6pm.onrender.com";

const ZONES = [
  "Soacha",
  "Suba",
  "Engativa",
  "Usme",
  "Ciudad Bolivar",
  "Kennedy",
  "Fontibon",
  "Costa Atlantica",
  "Oficina"
];

const SELLERS = [
  "Nohora Triana",
  "Alejandra Niño",
  "Pilar Molano",
  "Jhon Prada",
  "Dayana Leon",
  "Johana Salazar",
  "Ingrid Rojas",
  "Enrique Herrera",
  "Sebastian Torres"
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
        unitPrice: 7200,
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
        description: 'FIJAOR FLUIDO DISP 14 X 40ml "LLEVE 50ml"',
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
  const SELLERS = [
    "Nohora Triana",
    "Alejandra Niño",
    "Pilar Molano",
    "Jhon Prada",
    "Dayana Leon",
    "Johana Salazar",
    "Ingrid Rojas",
    "Enrique Herrera",
    "Sebastian Torres"
  ];

  const [clientInfo, setClientInfo] = useState({
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

  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [htmlContent, setHtmlContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
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
    if (!clientInfo.nit || clientInfo.nit.trim() === "") {
      errors.push("NIT");
    }
    if (!clientInfo.direccion || clientInfo.direccion.trim() === "") {
      errors.push("Dirección");
    }
    if (!clientInfo.barrio || clientInfo.barrio.trim() === "") {
      errors.push("Barrio");
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

    // Generar serial único si no se proporciona
    const serial = serialNumber || `Pedido__${clientInfo.fecha}_${Date.now()}`;

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
              <div class="info-value">${clientInfo.ordenSalida === "facturado" ? "FACTURADO" : "SALIDA DE BODEGA"}</div>
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
          </div>
          <div class="total">Total: $${totalGlobal.toLocaleString("es-CO")}</div>
        </div>
        
        <div class="signatures">
          <div class="signature">Alistó</div>
          <div class="signature">Verificó</div>
          <div class="signature">Empacó</div>
        </div>
        
        <div class="observations">
          <div>Observaciones:</div>
          <div class="observations-box">${clientInfo.observaciones}</div>
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

  // Función para subir a Google Drive
  const handleUploadToDrive = async () => {
    const validationErrors = validateForDrive();
    
    if (validationErrors.length > 0) {
      alert(`Por favor complete los siguientes campos obligatorios para subir a Drive:\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    if (orderItems.length === 0) {
      alert("No hay productos en el pedido para subir.");
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
      
      // Crear nombre del archivo con fecha y cliente
      const timestamp = Date.now();
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
        },
        orderSummary: {
          totalItems: orderItems.length,
          subtotal: orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0),
          total: (() => {
            const subtotal = orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
            const descuento = subtotal * (parseInt(clientInfo.descuento || 0) / 100);
            const ivaRate = clientInfo.ordenSalida === 'facturado' ? 0.19 : 0;
            const iva = subtotal * ivaRate;
            return subtotal + iva - descuento;
          })()
        }
      };
      
      console.log('📤 Enviando archivo con OAuth2...');
      
      // Llamada al nuevo endpoint OAuth2
      const response = await fetch(`${API_BASE_URL}/upload-to-drive-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`¡Pedido subido exitosamente a Google Drive con OAuth2!\n\nCarpeta: ${clientInfo.zone}\nArchivo: ${fileName}\nID: ${result.fileId || 'N/A'}\nMétodo: ${result.method || 'OAuth2'}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir el archivo');
      }
      
    } catch (error) {
      console.error('❌ Error uploading to Drive:', error);
      alert(`Error al subir a Google Drive: ${error.message}`);
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
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
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
              <select
                name="vendedor"
                value={clientInfo.vendedor}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un vendedor</option>
                {SELLERS.map((seller, index) => (
                  <option key={index} value={seller}>
                    {seller}
                  </option>
                ))}
              </select>
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
                placeholder="Teléfono"
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
                placeholder="Dirección"
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
                Zona:
              </label>
              <select
                name="zone"
                value={clientInfo.zone}
                onChange={handleClientInfoChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione una zona</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
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
                    setSelectedSubCategory(e.target.value);
                    setSelectedProduct("");
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
                disabled={!selectedCategory || (selectedCategory === "LINEA UÑAS" && !selectedSubCategory)}
              >
                <option value="">Selecciona un producto</option>
                {selectedCategory && (
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
                          Bonif: {item.bonus} | V.Unit: ${item.unitPrice?.toLocaleString("es-CO")}
                        </div>
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm">
                        {item.quantity}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-center text-xs sm:text-sm hidden sm:table-cell">
                        {item.bonus}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right text-xs sm:text-sm hidden sm:table-cell">
                        ${item.unitPrice?.toLocaleString("es-CO")}
                      </td>
                      <td className="py-1 px-1 sm:py-2 sm:px-2 border-b text-right text-xs sm:text-sm font-semibold">
                        ${item.subtotal?.toLocaleString("es-CO")}
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

            return (
              <>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Resumen del Pedido
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base">
                  <div className="space-y-1">
                    <p>Subtotal: ${subtotalGlobal.toLocaleString("es-CO")}</p>
                    <p>
                      Descuento ({clientInfo.descuento || 0}%): $
                      {descuentoGlobal.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>IVA ({ivaRate === 0.19 ? '19' : '0'}%): ${ivaGlobal.toLocaleString("es-CO")}</p>
                    <p className="font-bold text-lg">
                      Total: ${totalGlobal.toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Botones de descarga y subir a Drive - VERSIÓN OPTIMIZADA PARA MÓVIL */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-2">
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white font-bold text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Generar Orden de Pedido
          </button>
          
          <button
            onClick={handleUploadToDrive}
            disabled={isUploading}
            className={`font-bold text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 w-full sm:w-auto ${
              isUploading 
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Subiendo...' : 'Subir a Drive'}
          </button>
          
          <button
            onClick={onReturnToMenu}
            className="bg-gray-500 text-white font-bold text-sm sm:text-lg py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
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
