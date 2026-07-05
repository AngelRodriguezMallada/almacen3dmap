// Construccion del mapa 3D a partir de los codigos de ubicacion.
//
// Formato del codigo:  zona(3) pasillo(1) lado(1) rack(2) hueco(2) altura(1)
//   Ej. PKD3110303 -> zona PKD, pasillo 3, lado 1, rack 10, hueco 30, altura 3
//
// Un "rack fisico" son los 7 primeros caracteres (zona+pasillo+lado+rack).
// Cada codigo completo es una celda (hueco x altura) dentro de ese rack.

export const CELL = { w: 1.0, h: 0.6, d: 1.2 };

const WALKWAY = 3.0;   // pasillo de paso entre los dos lados
const RACK_GAP = 1.4;  // separacion entre racks a lo largo del pasillo
const AISLE_GAP = 2.0; // separacion extra entre pasillos
const ZONE_GAP = 7.0;  // separacion entre zonas

export function parseCode(code) {
  const c = String(code == null ? '' : code).trim();
  if (c.length < 9) return null;
  return {
    zona: c.slice(0, 3),
    pasillo: c.slice(3, 4),
    lado: c.slice(4, 5),
    rack: c.slice(5, 7),
    hueco: c.slice(7, 9),
    altura: c.slice(9) || '0',
    rackId: c.slice(0, 7),
  };
}

// Etiqueta legible de un rack fisico.
export function rackLabel(r) {
  return `${r.zona} · P${Number(r.pasillo)} · L${r.lado} · R${r.rack}`;
}

// Tipo de zona (facil de ampliar con nuevos prefijos):
//   kardex -> armarios Kardex (KDX...)
//   playa  -> zonas de suelo / playa (PLY...)
//   rack   -> pasillos rectos con racks (PKD, 002, ...)  [por defecto]
export function zonaType(zona) {
  const z = String(zona || '').toUpperCase();
  if (z.startsWith('KDX') || z.startsWith('KAR')) return 'kardex';
  if (z.startsWith('PLY') || z.startsWith('PLA')) return 'playa';
  return 'rack';
}

// Devuelve { racks, meta, unparsed }
export function buildRacks(ubicaciones, overrides = {}) {
  const rackMap = new Map();
  const unparsed = [];

  for (const u of ubicaciones) {
    const p = parseCode(u.code);
    if (!p) {
      unparsed.push(u);
      continue;
    }
    let r = rackMap.get(p.rackId);
    if (!r) {
      r = { rackId: p.rackId, zona: p.zona, pasillo: p.pasillo, lado: p.lado, rack: p.rack, cells: [] };
      rackMap.set(p.rackId, r);
    }
    r.cells.push({ ...u, ...p });
  }

  const racks = Array.from(rackMap.values());

  // Dimensiones de cada rack segun sus huecos (ancho) y alturas (alto).
  for (const r of racks) {
    const huecos = [...new Set(r.cells.map((c) => c.hueco))].sort();
    const alturas = [...new Set(r.cells.map((c) => c.altura))].sort();
    r.huecos = huecos;
    r.alturas = alturas;
    r.width = Math.max(CELL.w, huecos.length * CELL.w);
    r.height = Math.max(CELL.h, alturas.length * CELL.h);
    r.depth = CELL.d;
    r.zonaType = zonaType(r.zona);
    for (const c of r.cells) {
      c.huecoIndex = huecos.indexOf(c.hueco);
      c.alturaIndex = alturas.indexOf(c.altura);
    }
    r.totalCantidad = r.cells.reduce((s, c) => s + (c.totalCantidad || 0), 0);
    r.lineas = r.cells.reduce((s, c) => s + (c.lineas || 0), 0);
    r.occupied = r.cells.filter((c) => (c.totalCantidad || 0) > 0).length;
  }

  const maxWidth = Math.max(1, ...racks.map((r) => r.width));
  const maxDepth = Math.max(1, ...racks.map((r) => r.depth));
  const rackPitchX = maxWidth + RACK_GAP;
  const aislePitchZ = 2 * maxDepth + WALKWAY + AISLE_GAP;

  // Posicion local dentro de cada zona + bounding box de la zona.
  const byZona = new Map();
  for (const r of racks) {
    if (!byZona.has(r.zona)) byZona.set(r.zona, []);
    byZona.get(r.zona).push(r);
  }

  const zonaBlocks = [];
  for (const [zona, zracks] of byZona) {
    const pasillos = [...new Set(zracks.map((r) => r.pasillo))].sort();
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

    for (const r of zracks) {
      const pIdx = pasillos.indexOf(r.pasillo);
      const rackNums = [...new Set(zracks.filter((x) => x.pasillo === r.pasillo).map((x) => x.rack))].sort();
      const rIdx = rackNums.indexOf(r.rack);
      const ladoSign = r.lado === '2' ? 1 : -1;

      r._localX = rIdx * rackPitchX;
      r._localZ = pIdx * aislePitchZ + ladoSign * (WALKWAY / 2 + maxDepth / 2);

      minX = Math.min(minX, r._localX - r.width / 2);
      maxX = Math.max(maxX, r._localX + r.width / 2);
      minZ = Math.min(minZ, r._localZ - r.depth / 2);
      maxZ = Math.max(maxZ, r._localZ + r.depth / 2);
    }
    zonaBlocks.push({
      zona, type: zonaType(zona), zracks,
      minX, maxX, minZ, maxZ, w: maxX - minX, d: maxZ - minZ,
    });
  }

  // Dos regiones: (1) zonas de racks en pasillos rectos (arriba),
  // (2) kardex + playa, todas juntas (debajo).
  const rackBlocks = zonaBlocks.filter((b) => b.type === 'rack');
  const specialBlocks = zonaBlocks.filter((b) => b.type !== 'rack');

  const placeRow = (blocks, originZ) => {
    let cursorX = 0;
    let maxD = 0;
    for (const b of blocks) {
      b.originX = cursorX;
      b.originZ = originZ;
      cursorX += b.w + ZONE_GAP;
      maxD = Math.max(maxD, b.d);
    }
    return maxD;
  };

  const rackRegionDepth = placeRow(rackBlocks, 0);
  placeRow(specialBlocks, rackBlocks.length ? rackRegionDepth + ZONE_GAP * 1.6 : 0);

  for (const b of zonaBlocks) {
    for (const r of b.zracks) {
      const baseX = r._localX - b.minX + b.originX;
      const baseZ = r._localZ - b.minZ + b.originZ;
      const ov = overrides[r.rackId] || {};
      r.posX = ov.posX !== undefined ? ov.posX : baseX;
      r.posZ = ov.posZ !== undefined ? ov.posZ : baseZ;
      r.posY = r.height / 2;
      r.rotationY = ov.rotationY !== undefined ? ov.rotationY : 0;
    }
  }

  return { racks, meta: computeMeta(racks), unparsed };
}

export function computeMeta(racks) {
  if (!racks.length) return { cx: 0, cz: 0, width: 40, depth: 24 };
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const r of racks) {
    minX = Math.min(minX, r.posX - r.width / 2);
    maxX = Math.max(maxX, r.posX + r.width / 2);
    minZ = Math.min(minZ, r.posZ - r.depth / 2);
    maxZ = Math.max(maxZ, r.posZ + r.depth / 2);
  }
  const margin = 5;
  return {
    cx: (minX + maxX) / 2,
    cz: (minZ + maxZ) / 2,
    width: (maxX - minX) + margin * 2,
    depth: (maxZ - minZ) + margin * 2,
  };
}
