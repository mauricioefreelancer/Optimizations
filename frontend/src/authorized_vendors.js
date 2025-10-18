// Configuración de Vendedores Autorizados
// Este archivo controla quién puede acceder al sistema de pedidos

export const VENDOR_CONFIG = {
  // Clave única para todos los vendedores autorizados
  // CAMBIAR ESTA CLAVE CUANDO SEA NECESARIO
  masterPassword: "naturalcolors2024",
  
  // Vendedores autorizados y sus zonas asignadas
  // Para agregar un vendedor: añadir línea con "NOMBRE": "ZONA"
  // Para quitar un vendedor: eliminar la línea
  // Para cambiar zona: modificar la zona asignada
  authorizedVendors: {
    "Ingrid Rojas": "Costa Atlantica",
    "Enrique Herrera": "Oficina",
    "Sebastian Torres": "Oficina",
    "Jenny Gonzalez": "Oficina",
  },

  // Todos los vendedores del sistema con sus zonas asignadas
  allVendors: {
    "Ingrid Rojas": "Costa Atlantica",
    "Enrique Herrera": "Oficina",
    "Sebastian Torres": "Oficina",
    "Jenny Gonzalez": "Oficina",
    "Nohora Triana": "Soacha",
    "Alejandra Niño": "Suba", 
    "Mariela Betancur Eng": "Engativa",
    "Mariela Betancur Fon": "Fontivon",
    "Jhon Prada": "Usme",
    "Dayana Leon CB": "Ciudad Bolivar",
    "Dayana Leon Per": "Periferia",
    "Johana Salazar": "Kennedy",
    "Pilar Castrillo": "Centro"
  }
};

// Función utilitaria para verificar si un vendedor está autorizado
export const isVendorAuthorized = (vendorName) => {
  return vendorName in VENDOR_CONFIG.authorizedVendors;
};

// Función utilitaria para obtener la zona de un vendedor (de cualquier lista)
export const getVendorZone = (vendorName) => {
  return VENDOR_CONFIG.allVendors[vendorName] || null;
};

// Función utilitaria para verificar la clave maestra
export const verifyMasterPassword = (inputPassword) => {
  return inputPassword === VENDOR_CONFIG.masterPassword;
};

// Función utilitaria para obtener lista de vendedores autorizados
export const getAuthorizedVendorsList = () => {
  return Object.keys(VENDOR_CONFIG.authorizedVendors);
};

// Función utilitaria para obtener lista de TODOS los vendedores
export const getAllVendorsList = () => {
  return Object.keys(VENDOR_CONFIG.allVendors);
};

// Función utilitaria para verificar si un vendedor está en el sistema
export const isVendorInSystem = (vendorName) => {
  return vendorName in VENDOR_CONFIG.allVendors;
};