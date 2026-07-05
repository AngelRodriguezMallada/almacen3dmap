const express = require('express');
const { Warehouse, Zone, Location } = require('../models');

const router = express.Router();

// GET /api/warehouses
router.get('/', async (req, res) => {
  const warehouses = await Warehouse.findAll();
  res.json(warehouses);
});

// GET /api/warehouses/:id  (incluye zonas y ubicaciones para pintar la escena 3D)
router.get('/:id', async (req, res) => {
  const warehouse = await Warehouse.findByPk(req.params.id, {
    include: [
      { model: Zone, as: 'zones' },
      { model: Location, as: 'locations' },
    ],
  });
  if (!warehouse) return res.status(404).json({ error: 'Almacen no encontrado' });
  res.json(warehouse);
});

// POST /api/warehouses
router.post('/', async (req, res) => {
  const { name, width, depth, height } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });
  const warehouse = await Warehouse.create({ name, width, depth, height });
  res.status(201).json(warehouse);
});

// PUT /api/warehouses/:id
router.put('/:id', async (req, res) => {
  const warehouse = await Warehouse.findByPk(req.params.id);
  if (!warehouse) return res.status(404).json({ error: 'Almacen no encontrado' });
  await warehouse.update(req.body);
  res.json(warehouse);
});

// DELETE /api/warehouses/:id
router.delete('/:id', async (req, res) => {
  const warehouse = await Warehouse.findByPk(req.params.id);
  if (!warehouse) return res.status(404).json({ error: 'Almacen no encontrado' });
  await warehouse.destroy();
  res.status(204).end();
});

module.exports = router;
