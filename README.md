# Mapa 3D del Almacen

Aplicacion web para visualizar el almacen en 3D. Cada ubicacion se dibuja como
un rack; los que tienen stock se pintan en verde con un **badge de cantidad**
encima (unidades totales y nº de referencias), y al hacer clic se ven sus
productos. Backend Node.js/Express + Sequelize, frontend React + Three.js
(react-three-fiber).

## Modo de funcionamiento (solo lectura)

Los datos se **leen** de SQL Server; la app nunca escribe en la BD:

- **Ubicaciones:** `ZALM_UBICACIONES` (columna `Estadistico`).
- **Stock:** `ZALM_ALMACEN_OCUPADO` unido a `zadm_productos`, uniendo por
  `Estadistico_almacen = Estadistico`.

### Codigo de ubicacion

Cada codigo se interpreta asi (ver `frontend/src/warehouse.js`):

```
 zona(3) pasillo(1) lado(1) rack(2) hueco(2) altura(1)
   PKD      3         1       10      30       3
```

Los 7 primeros caracteres (`zona+pasillo+lado+rack`, p.ej. `PKD3110`) forman un
**rack fisico**; cada codigo completo es una **celda** (hueco x altura) dentro
de ese rack. En el mapa cada rack se dibuja como una rejilla de huecos y
alturas; las celdas con stock se pintan en verde y muestran sus productos al
hacer clic. Encima de cada rack hay un **badge** con las unidades totales.

### Tipos de zona

Segun el prefijo de la zona (funcion `zonaType` en `warehouse.js`, facil de
ampliar) el mapa distingue:

- **Pasillos** (por defecto: `PKD`, `002`, ...): racks en pasillos rectos, con
  racks a ambos lados de cada pasillo. Marco gris.
- **Kardex** (`KDX...`): armarios Kardex. Marco azul.
- **Playa** (`PLY...`): zonas de suelo. Marco naranja.

Las zonas de **pasillos** se colocan en una region; el **kardex y la playa** se
agrupan juntos en otra region aparte. Una leyenda en pantalla explica los
colores.

### Disposicion del mapa (compartida, sin tocar la BD)

La BD de produccion no guarda posiciones 3D, asi que la disposicion se calcula
automaticamente a partir del codigo (zona -> pasillo -> lado -> rack). El
usuario puede **mover los racks (solo visual)**: la posicion se guarda en un
**fichero del servidor** (`backend/data/layout.json`) via `PUT /api/layout/:rackId`,
por lo que **todos los usuarios ven la misma disposicion**. Nunca se escribe en
SQL Server. El boton "Restablecer" vacia ese fichero y vuelve al automatico.

## Estructura

```
almacen-3d/
  backend/     API REST + base de datos (SQLite de prueba / SQL Server real)
  frontend/    App React con el editor 3D
  deploy/      Archivos para instalar en Ubuntu (systemd + Apache)
```

## Desarrollo local

Backend:
```
cd backend
npm install
cp .env.example .env      # por defecto DATA_SOURCE=mock (datos de prueba, sin BD)
npm run dev               # http://localhost:4000
```

Frontend:
```
cd frontend
npm install
npm run dev               # http://localhost:5174 (proxy /api -> localhost:4000)
```

Abre http://localhost:5174. En modo `mock` veras un almacen de ejemplo en 3D.
Haz clic en un rack (o en la lista) para ver sus productos, usa el buscador
para resaltar ubicaciones, y activa "Mover racks" para reubicarlos (solo
visual).

## Conectar la base de datos real (SQL Server)

En `backend/.env`:

```
DATA_SOURCE=mssql
ENTIDAD=01
ALMACEN=01

DB_DIALECT=mssql
MSSQL_HOST=tu-servidor
MSSQL_PORT=1433
MSSQL_DATABASE=Almacen
MSSQL_USER=usuario
MSSQL_PASSWORD=contrasena
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true
```

Con `DATA_SOURCE=mssql` el backend ejecuta las dos consultas de solo lectura
definidas en `backend/src/services/almacenData.js` (parametrizadas por
`ENTIDAD`/`ALMACEN`). No se ejecuta `sequelize.sync()` en este modo, por lo que
la app **no crea ni modifica ninguna tabla** en produccion.

## Despliegue en Ubuntu

Requisitos: Ubuntu con acceso sudo, Apache2.

```
git clone <tu-repo> almacen-3d   # o copia la carpeta al servidor
cd almacen-3d
sudo bash deploy/install.sh "$(pwd)"
```

El script `deploy/install.sh`:
- Instala Node.js 20 si falta.
- Instala Apache y habilita `mod_proxy`/`mod_proxy_http`.
- Copia la app a `/opt/almacen3d` bajo un usuario de servicio `almacen3d`.
- Instala dependencias y compila el frontend (`npm run build`).
- Registra `almacen3d-backend.service` (systemd) para la API.
- Instala el vhost de Apache (`deploy/apache-almacen3d.conf`) que sirve el
  frontend estatico y hace proxy de `/api` al backend (puerto 4000).

Despues de instalar:
```
# datos de prueba (opcional)
cd /opt/almacen3d/backend && sudo -u almacen3d npm run seed

# ver logs del backend
journalctl -u almacen3d-backend -f

# conectar la BD real: edita /opt/almacen3d/backend/.env y reinicia
sudo systemctl restart almacen3d-backend
```

Ajusta `ServerName` en `deploy/apache-almacen3d.conf` con tu dominio o IP
antes de instalar, o edita `/etc/apache2/sites-available/almacen3d.conf`
despues.
