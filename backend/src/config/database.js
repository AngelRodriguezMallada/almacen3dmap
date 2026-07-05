const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'mssql') {
  sequelize = new Sequelize(
    process.env.MSSQL_DATABASE,
    process.env.MSSQL_USER,
    process.env.MSSQL_PASSWORD,
    {
      host: process.env.MSSQL_HOST,
      port: Number(process.env.MSSQL_PORT || 1433),
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: process.env.MSSQL_ENCRYPT !== 'false',
          trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
        },
      },
      logging: false,
    }
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
