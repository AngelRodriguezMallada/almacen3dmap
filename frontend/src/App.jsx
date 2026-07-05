import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Scene3D from './components/Scene3D';
import UbicacionPanel from './components/UbicacionPanel';
import { getMapa, getLayout, saveRackPosition, resetLayout } from './api/client';
import { buildRacks, parseCode, rackLabel } from './warehouse';

export default function App() {
  const [racks, setRacks] = useState([]);
  const [meta, setMeta] = useState({ cx: 0, cz: 0, width: 60, depth: 40 });
  const [info, setInfo] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedRackId, setSelectedRackId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, overrides] = await Promise.all([getMapa(), getLayout()]);
      const { racks: built, meta: m, unparsed } = buildRacks(data.ubicaciones || [], overrides || {});
      setInfo({ entidad: data.entidad, almacen: data.almacen, source: data.source, unparsed: unparsed.length });
      setRacks(built);
      setMeta(m);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar el mapa. Verifica que el backend este corriendo y la conexion a la BD.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedRack = racks.find((r) => r.rackId === selectedRackId) || null;

  const selectCell = (cell) => {
    setSelectedCode(cell.code);
    setSelectedRackId(cell.rackId || parseCode(cell.code)?.rackId || null);
  };

  const selectRack = (rack) => {
    setSelectedRackId(rack.rackId);
    setSelectedCode(null);
  };

  const deselect = () => {
    setSelectedRackId(null);
    setSelectedCode(null);
  };

  // Mover un rack: solo visual. Se guarda en el fichero del servidor (no en la BD).
  const handleMoveRack = async (rackId, pos) => {
    setRacks((prev) => prev.map((r) => (r.rackId === rackId ? { ...r, ...pos } : r)));
    try {
      await saveRackPosition(rackId, pos);
    } catch {
      /* si falla el guardado, el movimiento sigue siendo visible en esta sesion */
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Restablecer la disposicion automatica para todos los usuarios?')) return;
    try {
      await resetLayout();
    } catch { /* noop */ }
    deselect();
    load();
  };

  const q = query.trim().toLowerCase();
  const matchRackIds = useMemo(() => {
    if (!q) return null;
    const set = new Set();
    for (const r of racks) {
      if (r.rackId.toLowerCase().includes(q) || rackLabel(r).toLowerCase().includes(q) ||
          r.cells.some((c) => c.code.toLowerCase().includes(q))) {
        set.add(r.rackId);
      }
    }
    return set;
  }, [q, racks]);

  const totals = useMemo(() => {
    const conStock = racks.filter((r) => r.totalCantidad > 0).length;
    const unidades = racks.reduce((s, r) => s + (r.totalCantidad || 0), 0);
    const huecos = racks.reduce((s, r) => s + r.cells.length, 0);
    return { conStock, vacios: racks.length - conStock, unidades, huecos };
  }, [racks]);

  const listedRacks = matchRackIds ? racks.filter((r) => matchRackIds.has(r.rackId)) : racks;

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, textAlign: 'center' }}>
        <div>
          <h2>Mapa 3D del Almacen</h2>
          <p style={{ color: '#c53030' }}>{error}</p>
          <button className="btn" onClick={load}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="scene-container">
        <div className="topbar">
          <h1>
            Almacen {info ? `${info.almacen} · entidad ${info.entidad}` : ''}
            {info?.source === 'mock' && <span className="badge-mock">datos de prueba</span>}
          </h1>
          <div className="row">
            <input
              className="search"
              placeholder="Buscar zona / rack / ubicacion..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn secondary" onClick={() => setEditMode((v) => !v)}>
              {editMode ? 'Mover racks: ON' : 'Mover racks: OFF'}
            </button>
            <button className="btn secondary" onClick={handleReset}>Restablecer</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-hint" style={{ padding: 40 }}>Cargando mapa...</div>
        ) : (
          <Scene3D
            racks={racks}
            meta={meta}
            selectedRackId={selectedRackId}
            selectedCode={selectedCode}
            dimmedRackIds={matchRackIds}
            onSelectCell={selectCell}
            onSelectRack={selectRack}
            onDeselect={deselect}
            onMoveRack={handleMoveRack}
            editMode={editMode}
          />
        )}

        <div className="legend">
          <span><i className="sw" style={{ background: '#2f855a' }} />con stock</span>
          <span><i className="sw" style={{ background: '#2a3340' }} />vacio</span>
          <span><i className="ln" style={{ borderColor: '#4a5568' }} />pasillos</span>
          <span><i className="ln" style={{ borderColor: '#3182ce' }} />kardex</span>
          <span><i className="ln" style={{ borderColor: '#dd6b20' }} />playa</span>
        </div>

        <div className="status-bar">
          {racks.length} racks · {totals.huecos} huecos · {totals.conStock} racks con stock · {totals.unidades} uds totales
          {editMode ? ' · arrastra la flecha para reubicar un rack (solo visual, compartido)' : ' · click en un hueco para ver su contenido'}
        </div>
      </div>

      <div className="sidebar">
        <div>
          <div className="section-title">Racks ({listedRacks.length})</div>
          <div className="location-list">
            {listedRacks.map((rack) => (
              <div
                key={rack.rackId}
                className={`location-item ${rack.rackId === selectedRackId ? 'selected' : ''}`}
                onClick={() => selectRack(rack)}
              >
                <span>{rackLabel(rack)}</span>
                <span style={{ color: rack.totalCantidad > 0 ? '#68d391' : '#6b7280' }}>
                  {rack.totalCantidad > 0 ? `${rack.totalCantidad} uds` : 'vacio'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {selectedRack ? (
          <UbicacionPanel rack={selectedRack} selectedCode={selectedCode} onSelectCell={selectCell} />
        ) : (
          <div className="empty-hint">Selecciona un rack o un hueco en la escena 3D o en la lista para ver sus productos.</div>
        )}
      </div>
    </div>
  );
}
