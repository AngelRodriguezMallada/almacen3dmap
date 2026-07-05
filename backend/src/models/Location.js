const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'rack',
    validate: { isIn: [['rack', 'shelf', 'bin', 'zone-marker']] },
  },
  warehouseId: { type: DataTypes.INTEGER, allowNull: false },
  zoneId: { type: DataTypes.INTEGER, allowNull: true },
  posX: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  posY: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  posZ: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  width: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
  height: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 2 },
  depth: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
  rotationY: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  levels: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'locations',
  timestamps: true,
});

module.exports = Location;
