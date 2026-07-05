const express = require('express');
const { getUbicaciones, getOcupacion, SOURCE, ENTIDAD, ALMACEN } = require('../services/almacenData');

const router = express.Router();

// GET /api/mapa
// Devuelve todas las ubicaciones del almacen con su stock agregado (solo lectura).
// {
//   entidad, almacen, source,
//   ubicaciones: [
//     { code, productos: [{ producto, descripcion, cantidad }], totalCantidad, lineas }
//   ]
// }
router.get('/', async (req, res, next) => {
  try {
    const [ubicaciones, ocupacion] = await Promise.all([getUbicaciones(), getOcupacion()]);

    const byCode = new Map();
    const keyOf = (raw) => String(raw == null ? '' : raw).trim();

    for (const u of ubicaciones) {
      const code = keyOf(u.code);
      if (!code) continue;
      byCode.set(code, { code, productos: [], totalCantidad: 0, lineas: 0 });
    }

    for (const row of ocupacion) {
      const code = keyOf(row.code);
      if (!code) continue;
      let entry = byCode.get(code);
      if (!entry) {
        // Stock en una ubicacion que no vino en el listado: la incluimos igualmente.
        entry = { code, productos: [], totalCantidad: 0, lineas: 0 };
        byCode.set(code, entry);
      }
      const cantidad = Number(row.cantidad) || 0;
      entry.productos.push({
        producto: keyOf(row.producto),
        descripcion: row.descripcion || '',
        cantidad,
      });
      entry.totalCantidad += cantidad;
      entry.lineas += 1;
    }

    res.json({
      entidad: ENTIDAD,
      almacen: ALMACEN,
      source: SOURCE,
      ubicaciones: Array.from(byCode.values()),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
