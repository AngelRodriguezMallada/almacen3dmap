#!/usr/bin/env bash
# Script de instalacion para Ubuntu.
# Uso: sudo bash install.sh /ruta/al/repo/almacen-3d
#
# Instala Node.js (si falta), copia la app a /opt/almacen3d, instala
# dependencias, construye el frontend, configura el servicio systemd
# y el vhost de Apache.

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script con sudo." >&2
  exit 1
fi

SRC_DIR="${1:-$(pwd)}"
APP_DIR=/opt/almacen3d
APP_USER=almacen3d

echo "==> Origen: $SRC_DIR"
echo "==> Destino: $APP_DIR"

# 1. Node.js (si no existe)
if ! command -v node >/dev/null 2>&1; then
  echo "==> Instalando Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# 2. Apache + modulos proxy
echo "==> Instalando/asegurando Apache..."
apt-get update
apt-get install -y apache2
a2enmod proxy proxy_http

# 3. Usuario de servicio
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  echo "==> Creando usuario de servicio $APP_USER..."
  useradd --system --no-create-home --shell /usr/sbin/nologin "$APP_USER"
fi

# 4. Copiar archivos
echo "==> Copiando aplicacion a $APP_DIR..."
mkdir -p "$APP_DIR"
rsync -a --exclude 'node_modules' --exclude '.git' "$SRC_DIR"/ "$APP_DIR"/

# 5. Backend: dependencias y .env
echo "==> Instalando dependencias del backend..."
cd "$APP_DIR/backend"
npm install --omit=dev
if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> Se creo backend/.env a partir de .env.example. Editalo con los datos reales del SQL Server cuando quieras conectarlo."
fi
mkdir -p "$APP_DIR/backend/data"

# 6. Frontend: build de produccion
echo "==> Instalando dependencias y compilando el frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# 7. Permisos
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# 8. Servicio systemd
echo "==> Instalando servicio systemd..."
cp "$APP_DIR/deploy/almacen3d-backend.service" /etc/systemd/system/almacen3d-backend.service
systemctl daemon-reload
systemctl enable almacen3d-backend
systemctl restart almacen3d-backend

# 9. Vhost de Apache
echo "==> Instalando vhost de Apache..."
cp "$APP_DIR/deploy/apache-almacen3d.conf" /etc/apache2/sites-available/almacen3d.conf
a2ensite almacen3d
systemctl reload apache2

echo ""
echo "==> Listo. Backend en systemd (almacen3d-backend), frontend servido por Apache."
echo "==> Si es la primera instalacion y quieres datos de prueba, ejecuta:"
echo "    cd $APP_DIR/backend && sudo -u $APP_USER npm run seed"
echo "==> Para conectar la BD real del almacen, edita $APP_DIR/backend/.env (DB_DIALECT=mssql y credenciales) y reinicia:"
echo "    sudo systemctl restart almacen3d-backend"
