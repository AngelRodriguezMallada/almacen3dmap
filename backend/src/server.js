require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;
const DATA_SOURCE = (process.env.DATA_SOURCE || 'mock').toLowerCase();

// Intenta conectar a la BD sin tumbar el proceso. Reintenta en segundo plano.
async function tryConnect(attempt = 1) {
  try {
    await sequelize.authenticate();
    // En modo solo lectura NUNCA hacemos sync() (no crear/modificar tablas en produccion).
    if (DATA_SOURCE !== 'mssql') {
      await sequelize.sync();
    }
    console.log(`Conectado a la BD (${process.env.DB_DIALECT || 'sqlite'}). Fuente: ${DATA_SOURCE}.`);
  } catch (err) {
    console.error(`No se pudo conectar a la BD (intento ${attempt}): ${err.message}`);
    console.error('El servidor sigue en marcha; /api/mapa devolvera error hasta que la BD sea accesible.');
    // Reintento con backoff (max 60s). No hacemos exit para no entrar en bucle de systemd.
    const delay = Math.min(60000, 5000 * attempt);
    setTimeout(() => tryConnect(attempt + 1), delay);
  }
}

function start() {
  app.listen(PORT, () => {
    console.log(`API del almacen 3D escuchando en el puerto ${PORT}`);
  });

  if (DATA_SOURCE === 'mock') {
    console.log('Fuente de datos: MOCK (datos de prueba en memoria, sin BD).');
  } else {
    tryConnect();
  }
}

start();
