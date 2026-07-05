const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  width: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 40 },
  depth: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 20 },
  height: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 8 },
}, {
  tableName: 'warehouses',
  timestamps: true,
});

module.exports = Warehouse;
