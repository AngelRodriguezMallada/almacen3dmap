const express = require('express');
const cors = require('cors');

const mapaRoutes = require('./routes/mapa');
const layoutRoutes = require('./routes/layout');
const warehouseRoutes = require('./routes/warehouses');
const zoneRoutes = require('./routes/zones');
const locationRoutes = require('./routes/locations');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Mapa 3D (solo lectura, datos reales del almacen)
app.use('/api/mapa', mapaRoutes);
// Disposicion del mapa (fichero local compartido, no toca la BD)
app.use('/api/layout', layoutRoutes);

// Rutas del prototipo con modelos propios (no se usan en modo solo-lectura)
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
