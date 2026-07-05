require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;
const DATA_SOURCE = (process.env.DATA_SOURCE || 'mock').toLowerCase();

async function start() {
  try {
    if (DATA_SOURCE === 'mock') {
      console.log('Fuente de datos: MOCK (datos de prueba en memoria, sin BD).');
    } else {
      await sequelize.authenticate();
      // IMPORTANTE: en modo solo lectura NUNCA ejecutamos sync() para no crear
      // ni modificar tablas en la BD de produccion (SQL Server).
      if (DATA_SOURCE !== 'mssql') {
        await sequelize.sync();
      }
      console.log(`Conectado a la BD (${process.env.DB_DIALECT || 'sqlite'}). Fuente: ${DATA_SOURCE}.`);
    }
    app.listen(PORT, () => {
      console.log(`API del almacen 3D escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
