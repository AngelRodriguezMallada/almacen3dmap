import React from 'react';
import { rackLabel } from '../warehouse';

// Panel de SOLO LECTURA: rack seleccionado con sus huecos/alturas y productos.
export default function UbicacionPanel({ rack, selectedCode, onSelectCell }) {
  if (!rack) return null;

  // Ordena las celdas por altura (desc) y hueco (asc) para leerlas como el rack real.
  const cells = [...rack.cells].sort((a, b) => {
    if (a.altura !== b.altura) return b.altura.localeCompare(a.altura);
    return a.hueco.localeCompare(b.hueco);
  });

  return (
    <div>
      <div className="section-title">Rack {rackLabel(rack)}</div>

      <div className="ubic-summary">
        <div className="ubic-metric">
          <span className="ubic-metric-value">{rack.totalCantidad}</span>
          <span className="ubic-metric-label">unidades</span>
        </div>
        <div className="ubic-metric">
          <span className="ubic-metric-value">{rack.occupied}/{rack.cells.length}</span>
          <span className="ubic-metric-label">huecos con stock</span>
        </div>
      </div>

      {cells.map((c) => {
        const hasStock = (c.totalCantidad || 0) > 0;
        return (
          <div
            key={c.code}
            className={`cell-row ${c.code === selectedCode ? 'selected' : ''} ${hasStock ? '' : 'empty'}`}
            onClick={() => onSelectCell(c)}
          >
            <div className="cell-head">
              <span className="cell-code">{c.code}</span>
              <span className="cell-tag">hueco {c.hueco} · altura {c.altura}</span>
              <span className={`qty-badge ${hasStock ? '' : 'zero'}`}>{c.totalCantidad || 0}</span>
            </div>
            {c.productos && c.productos.length > 0 && (
              <div className="cell-products">
                {c.productos.map((p, i) => (
                  <div className="cell-product" key={`${p.producto}-${i}`}>
                    <span>{p.descripcion || '(sin descripcion)'} <small>{p.producto}</small></span>
                    <span>{p.cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
