#!/bin/bash
# Script para instalar dependencias de WeasyPrint en Render

echo "🔄 Instalando dependencias del sistema para WeasyPrint..."

# Actualizar lista de paquetes
apt-get update

# Instalar dependencias necesarias para WeasyPrint
apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libharfbuzz-subset0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info

echo "✅ Dependencias instaladas exitosamente"