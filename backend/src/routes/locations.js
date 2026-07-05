const express = require('express');
const { Location, Inventory, Product } = require('../models');

const router = express.Router();

// GET /api/locations?warehouseId=1
router.get('/', async (req, res) => {
  const where = {};
  if (req.query.warehouseId) where.warehouseId = req.query.warehouseId;
  const locations = await Location.findAll({ where });
  res.json(locations);
});

// GET /api/locations/:id
router.get('/:id', async (req, res) => {
  const location = await Location.findByPk(req.params.id);
  if (!location) return res.status(404).json({ error: 'Ubicacion no encontrada' });
  res.json(location);
});

// POST /api/locations
router.post('/', async (req, res) => {
  const { code, type, warehouseId, zoneId, posX, posY, posZ, width, height, depth, rotationY, levels } = req.body;
  if (!code || !warehouseId) return res.status(400).json({ error: 'code y warehouseId son requeridos' });
  try {
    const location = await Location.create({
      code, type, warehouseId, zoneId, posX, posY, posZ, width, height, depth, rotationY, levels,
    });
    res.status(201).json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/locations/:id  (usado para mover/redimensionar/renombrar desde el editor 3D)
router.put('/:id', async (req, res) => {
  const location = await Location.findByPk(req.params.id);
  if (!location) return res.status(404).json({ error: 'Ubicacion no encontrada' });
  try {
    await location.update(req.body);
    res.json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/locations/:id
router.delete('/:id', async (req, res) => {
  const location = await Location.findByPk(req.params.id);
  if (!location) return res.status(404).json({ error: 'Ubicacion no encontrada' });
  await location.destroy();
  res.status(204).end();
});

// GET /api/locations/:id/inventory
router.get('/:id/inventory', async (req, res) => {
  const entries = await Inventory.findAll({
    where: { locationId: req.params.id },
    include: [{ model: Product, as: 'product' }],
  });
  res.json(entries);
});

// POST /api/locations/:id/inventory  { productId, quantity }
router.post('/:id/inventory', async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId es requerido' });
  const entry = await Inventory.create({
    locationId: req.params.id,
    productId,
    quantity: quantity || 0,
  });
  const withProduct = await Inventory.findByPk(entry.id, { include: [{ model: Product, as: 'product' }] });
  res.status(201).json(withProduct);
});

module.exports = router;
