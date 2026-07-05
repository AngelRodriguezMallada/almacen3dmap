const sequelize = require('../config/database');
const Warehouse = require('./Warehouse');
const Zone = require('./Zone');
const Location = require('./Location');
const Product = require('./Product');
const Inventory = require('./Inventory');

Warehouse.hasMany(Zone, { foreignKey: 'warehouseId', as: 'zones', onDelete: 'CASCADE' });
Zone.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Warehouse.hasMany(Location, { foreignKey: 'warehouseId', as: 'locations', onDelete: 'CASCADE' });
Location.belongsTo(Warehouse, { foreignKey: 'warehouseId' });

Zone.hasMany(Location, { foreignKey: 'zoneId', as: 'locations' });
Location.belongsTo(Zone, { foreignKey: 'zoneId', as: 'zone' });

Location.hasMany(Inventory, { foreignKey: 'locationId', as: 'inventory', onDelete: 'CASCADE' });
Inventory.belongsTo(Location, { foreignKey: 'locationId' });

Product.hasMany(Inventory, { foreignKey: 'productId', as: 'inventoryEntries', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  Warehouse,
  Zone,
  Location,
  Product,
  Inventory,
};
