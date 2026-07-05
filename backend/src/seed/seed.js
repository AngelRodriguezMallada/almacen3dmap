require('dotenv').config();
const { sequelize, Warehouse, Zone, Location, Product, Inventory } = require('../models');

async function seed() {
  await sequelize.sync({ alter: true });

  // Limpieza en orden por dependencias (funciona en sqlite y mssql)
  await Inventory.destroy({ where: {}, force: true });
  await Location.destroy({ where: {}, force: true });
  await Zone.destroy({ where: {}, force: true });
  await Product.destroy({ where: {}, force: true });
  await Warehouse.destroy({ where: {}, force: true });

  const warehouse = await Warehouse.create({
    name: 'Almacen Principal (prueba)',
    width: 40,
    depth: 24,
    height: 8,
  });

  const zones = await Zone.bulkCreate([
    { name: 'Recepcion', colorHex: '#5cb85c', warehouseId: warehouse.id },
    { name: 'Almacenamiento', colorHex: '#4f83cc', warehouseId: warehouse.id },
    { name: 'Expedicion', colorHex: '#e0a03c', warehouseId: warehouse.id },
  ]);

  const [zRecepcion, zAlmacen, zExpedicion] = zones;

  const locationsToCreate = [];

  // Racks de recepcion (fila cercana a la entrada, Z pequeno)
  for (let i = 0; i < 3; i++) {
    locationsToCreate.push({
      code: `REC-0${i + 1}`,
      type: 'rack',
      warehouseId: warehouse.id,
      zoneId: zRecepcion.id,
      posX: -14 + i * 5,
      posY: 1.25,
      posZ: -9,
      width: 3,
      height: 2.5,
      depth: 1.2,
      rotationY: 0,
      levels: 3,
    });
  }

  // Racks de almacenamiento en 4 pasillos x 4 columnas
  const aisleGapZ = 5;
  const rackWidth = 3;
  const rackSpacingX = 4;
  let rackCounter = 1;
  for (let aisle = 0; aisle < 3; aisle++) {
    for (let col = 0; col < 5; col++) {
      locationsToCreate.push({
        code: `A${aisle + 1}-${String(col + 1).padStart(2, '0')}`,
        type: 'rack',
        warehouseId: warehouse.id,
        zoneId: zAlmacen.id,
        posX: -16 + col * rackSpacingX,
        posY: 1.75,
        posZ: -1 + aisle * aisleGapZ,
        width: rackWidth,
        height: 3.5,
        depth: 1.2,
        rotationY: 0,
        levels: 4,
      });
      rackCounter++;
    }
  }

  // Racks de expedicion (fila cercana a la salida, Z grande)
  for (let i = 0; i < 3; i++) {
    locationsToCreate.push({
      code: `EXP-0${i + 1}`,
      type: 'rack',
      warehouseId: warehouse.id,
      zoneId: zExpedicion.id,
      posX: -14 + i * 5,
      posY: 1.25,
      posZ: 10,
      width: 3,
      height: 2.5,
      depth: 1.2,
      rotationY: 0,
      levels: 3,
    });
  }

  const locations = await Location.bulkCreate(locationsToCreate);

  const products = await Product.bulkCreate([
    { sku: 'SKU-0001', name: 'Caja de tornillos M6', unit: 'caja' },
    { sku: 'SKU-0002', name: 'Tarima de botellas PET', unit: 'tarima' },
    { sku: 'SKU-0003', name: 'Rollo de cable electrico', unit: 'rollo' },
    { sku: 'SKU-0004', name: 'Paquete de guantes industriales', unit: 'paquete' },
    { sku: 'SKU-0005', name: 'Bidon de aceite hidraulico', unit: 'bidon' },
    { sku: 'SKU-0006', name: 'Caja de filtros de aire', unit: 'caja' },
    { sku: 'SKU-0007', name: 'Pallet de sacos de cemento', unit: 'pallet' },
    { sku: 'SKU-0008', name: 'Lote de placas metalicas', unit: 'lote' },
  ]);

  const inventoryEntries = [];
  locations.forEach((loc, idx) => {
    // A cada rack le asignamos 1 o 2 productos con cantidades de ejemplo
    const p1 = products[idx % products.length];
    inventoryEntries.push({ locationId: loc.id, productId: p1.id, quantity: 10 + (idx % 5) * 7 });
    if (idx % 2 === 0) {
      const p2 = products[(idx + 3) % products.length];
      inventoryEntries.push({ locationId: loc.id, productId: p2.id, quantity: 5 + (idx % 4) * 3 });
    }
  });

  await Inventory.bulkCreate(inventoryEntries);

  console.log(`Seed completado: 1 almacen, ${zones.length} zonas, ${locations.length} ubicaciones, ${products.length} productos, ${inventoryEntries.length} registros de inventario.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
