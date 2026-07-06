const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'mssql') {
  // El host puede venir como "192.168.66.37" o como "192.168.66.37\SQLSERVER22".
  // Separamos la instancia si viene con backslash.
  let host = process.env.MSSQL_HOST || 'localhost';
  let instanceName = process.env.MSSQL_INSTANCE || null;
  if (host.includes('\\')) {
    const [h, inst] = host.split('\\');
    host = h;
    if (!instanceName) instanceName = inst;
  }

  // Dos modos de conexion a una instancia con nombre:
  //   - MSSQL_USE_INSTANCE=true  -> resuelve el puerto via SQL Browser (UDP 1434).
  //                                 Requiere el servicio "SQL Server Browser" y el UDP 1434 abierto.
  //   - por defecto (false)      -> conecta por host + puerto TCP fijo (MSSQL_PORT, 1433).
  //                                 Requiere que la instancia escuche en ese puerto estatico.
  const useInstance = process.env.MSSQL_USE_INSTANCE === 'true' && !!instanceName;

  const options = {
    encrypt: process.env.MSSQL_ENCRYPT !== 'false',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
    connectTimeout: Number(process.env.MSSQL_CONNECT_TIMEOUT || 15000),
    requestTimeout: Number(process.env.MSSQL_REQUEST_TIMEOUT || 30000),
  };
  // Puerto e instanceName son mutuamente excluyentes en tedious.
  if (useInstance) options.instanceName = instanceName;

  const config = {
    host,
    dialect: 'mssql',
    dialectOptions: { options },
    logging: false,
  };
  if (!useInstance) config.port = Number(process.env.MSSQL_PORT || 1433);

  sequelize = new Sequelize(
    process.env.MSSQL_DATABASE,
    process.env.MSSQL_USER,
    process.env.MSSQL_PASSWORD,
    config
  );
} else {
  const storage = process.env.SQLITE_STORAGE || './data/almacen3d.sqlite';
  const dir = path.dirname(storage);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
  });
}

module.exports = sequelize;
