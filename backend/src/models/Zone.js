const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('Zone', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  colorHex: { type: DataTypes.STRING, allowNull: false, defaultValue: '#4f83cc' },
  warehouseId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'zones',
  timestamps: true,
});

module.exports = Zone;
