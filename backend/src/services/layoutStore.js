// Persistencia de la disposicion del mapa en un FICHERO local del servidor
// (backend/data/layout.json). Es compartida por todos los usuarios y NO toca
// la BD de produccion. Guarda, por rack fisico (rackId), su posicion en planta.

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', 'data', 'layout.json');

function ensureDir() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readLayout() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8')) || {};
  } catch {
    return {};
  }
}

function writeLayout(obj) {
  ensureDir();
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), 'utf8');
}

function setRack(rackId, pos) {
  const all = readLayout();
  all[rackId] = { ...all[rackId], ...pos };
  writeLayout(all);
  return all[rackId];
}

function clearLayout() {
  writeLayout({});
}

module.exports = { readLayout, writeLayout, setRack, clearLayout };
