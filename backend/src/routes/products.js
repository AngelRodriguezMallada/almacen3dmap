const express = require('express');
const { Product } = require('../models');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// POST /api/products
router.post('/', async (req, res) => {
  const { sku, name, description, unit } = req.body;
  if (!sku || !name) return res.status(400).json({ error: 'sku y name son requeridos' });
  try {
    const product = await Product.create({ sku, name, description, unit });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  await product.update(req.body);
  res.json(product);
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  await product.destroy();
  res.status(204).end();
});

module.exports = router;
