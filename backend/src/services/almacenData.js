// Acceso de SOLO LECTURA a los datos reales del almacen (SQL Server).
// Usa exactamente las dos consultas proporcionadas:
//   - Ubicaciones:  ZALM_UBICACIONES
//   - Ocupacion:    ZALM_ALMACEN_OCUPADO + zadm_productos
//
// Con DATA_SOURCE=mock devuelve datos de prueba en memoria (sin tocar ninguna BD),
// util para ver la interfaz antes de conectar SQL Server.

const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

const SOURCE = (process.env.DATA_SOURCE || 'mock').toLowerCase();
const ENTIDAD = process.env.ENTIDAD || '01';
const ALMACEN = process.env.ALMACEN || '01';

// --- Consultas reales (SQL Server) ---

async function queryUbicaciones() {
  return sequelize.query(
    `SELECT Estadistico AS code
       FROM ZALM_UBICACIONES
      WHERE entidad = :entidad AND almacen = :almacen`,
    { replacements: { entidad: ENTIDAD, almacen: ALMACEN }, type: QueryTypes.SELECT }
  );
}

async function queryOcupacion() {
  // entidad y almacen viven en ZALM_ALMACEN_OCUPADO (a), no en zadm_productos (b).
  // El join a productos se hace solo por 'producto'; el filtro entidad/almacen va sobre 'a'.
  return sequelize.query(
    `SELECT a.Estadistico_almacen AS code,
            a.producto            AS producto,
            b.descripcion         AS descripcion,
            a.cantidad_unidad_venta AS cantidad
       FROM ZALM_ALMACEN_OCUPADO a
       LEFT JOIN zadm_productos b ON (a.producto = b.producto)
      WHERE a.almacen = :almacen
        AND a.entidad = :entidad`,
    { replacements: { entidad: ENTIDAD, almacen: ALMACEN }, type: QueryTypes.SELECT }
  );
}

// --- Datos de prueba (mock) ---

// Codigo = zona(3) + pasillo(1) + lado(1) + rack(2) + hueco(2) + altura(1)
function buildCode(zona, pasillo, lado, rack, hueco, altura) {
  return `${zona}${pasillo}${lado}${String(rack).padStart(2, '0')}${String(hueco).padStart(2, '0')}${altura}`;
}

function mockUbicaciones() {
  const codes = [];
  for (const zona of ['PKD', 'KDX', 'PLY']) {
    for (let pasillo = 1; pasillo <= 2; pasillo++) {
      for (let lado = 1; lado <= 2; lado++) {
        for (const rack of [10, 20, 30]) {
          for (const hueco of [10, 20, 30]) {
            for (let altura = 1; altura <= 3; altura++) {
              codes.push({ code: buildCode(zona, pasillo, lado, rack, hueco, altura) });
            }
          }
        }
      }
    }
  }
  return codes;
}

function mockOcupacion() {
  const productos = [
    { producto: '1001', descripcion: 'Tornillo M6 x 40' },
    { producto: '1002', descripcion: 'Tuerca M6 zincada' },
    { producto: '1003', descripcion: 'Arandela plana M6' },
    { producto: '1004', descripcion: 'Cable flexible 2.5mm' },
    { producto: '1005', descripcion: 'Caja carton 40x30' },
    { producto: '1006', descripcion: 'Cinta embalaje 66m' },
  ];
  const rows = [];
  mockUbicaciones().forEach((u, i) => {
    if (i % 2 === 0) return; // ~mitad de huecos vacios
    const p = productos[i % productos.length];
    rows.push({
      code: u.code,
      producto: p.producto,
      descripcion: p.descripcion,
      cantidad: (i * 7) % 40 + 1,
    });
  });
  return rows;
}

// --- API del servicio ---

async function getUbicaciones() {
  if (SOURCE === 'mock') return mockUbicaciones();
  return queryUbicaciones();
}

async function getOcupacion() {
  if (SOURCE === 'mock') return mockOcupacion();
  return queryOcupacion();
}

module.exports = { getUbicaciones, getOcupacion, SOURCE, ENTIDAD, ALMACEN };
