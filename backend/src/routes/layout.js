const express = require('express');
const store = require('../services/layoutStore');

const router = express.Router();

// GET /api/layout  -> { [rackId]: { posX, posZ, rotationY } }
router.get('/', (req, res) => {
  res.json(store.readLayout());
});

// PUT /api/layout/:rackId  { posX, posZ, rotationY }  (mover un rack, solo visual)
router.put('/:rackId', (req, res) => {
  const pos = {};
  ['posX', 'posZ', 'rotationY'].forEach((k) => {
    if (req.body && req.body[k] !== undefined) pos[k] = Number(req.body[k]);
  });
  const saved = store.setRack(req.params.rackId, pos);
  res.json({ rackId: req.params.rackId, ...saved });
});

// DELETE /api/layout  -> restablece la disposicion automatica
router.delete('/', (req, res) => {
  store.clearLayout();
  res.status(204).end();
});

module.exports = router;
