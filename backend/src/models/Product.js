const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  unit: { type: DataTypes.STRING, allowNull: false, defaultValue: 'unidad' },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
