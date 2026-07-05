const express = require('express');
const { Zone } = require('../models');

const router = express.Router();

// GET /api/zones?warehouseId=1
router.get('/', async (req, res) => {
  const where = {};
  if (req.query.warehouseId) where.warehouseId = req.query.warehouseId;
  const zones = await Zone.findAll({ where });
  res.json(zones);
});

// POST /api/zones
router.post('/', async (req, res) => {
  const { name, colorHex, warehouseId } = req.body;
  if (!name || !warehouseId) return res.status(400).json({ error: 'name y warehouseId son requeridos' });
  const zone = await Zone.create({ name, colorHex, warehouseId });
  res.status(201).json(zone);
});

// PUT /api/zones/:id
router.put('/:id', async (req, res) => {
  const zone = await Zone.findByPk(req.params.id);
  if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });
  await zone.update(req.body);
  res.json(zone);
});

// DELETE /api/zones/:id
router.delete('/:id', async (req, res) => {
  const zone = await Zone.findByPk(req.params.id);
  if (!zone) return res.status(404).json({ error: 'Zona no encontrada' });
  await zone.destroy();
  res.status(204).end();
});

module.exports = router;
