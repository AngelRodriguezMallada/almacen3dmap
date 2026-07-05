const express = require('express');
const { Inventory, Product, Location } = require('../models');

const router = express.Router();

// GET /api/inventory  (todo el inventario, con producto y ubicacion)
router.get('/', async (req, res) => {
  const entries = await Inventory.findAll({
    include: [
      { model: Product, as: 'product' },
      { model: Location },
    ],
  });
  res.json(entries);
});

// PUT /api/inventory/:id  { quantity }
router.put('/:id', async (req, res) => {
  const entry = await Inventory.findByPk(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Registro de inventario no encontrado' });
  await entry.update(req.body);
  const withProduct = await Inventory.findByPk(entry.id, { include: [{ model: Product, as: 'product' }] });
  res.json(withProduct);
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  const entry = await Inventory.findByPk(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Registro de inventario no encontrado' });
  await entry.destroy();
  res.status(204).end();
});

module.exports = router;
