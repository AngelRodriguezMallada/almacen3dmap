import React, { useEffect, useState } from 'react';
import { updateLocation, deleteLocation } from '../api/client';

const TYPE_OPTIONS = ['rack', 'shelf', 'bin', 'zone-marker'];

export default function EditorPanel({ location, zones, onChanged, onDeleted }) {
  const [form, setForm] = useState(location);

  useEffect(() => {
    setForm(location);
  }, [location?.id]);

  if (!location || !form) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    const payload = {
      code: form.code,
      type: form.type,
      zoneId: form.zoneId ? Number(form.zoneId) : null,
      posX: Number(form.posX),
      posY: Number(form.posY),
      posZ: Number(form.posZ),
      width: Number(form.width),
      height: Number(form.height),
      depth: Number(form.depth),
      rotationY: Number(form.rotationY),
      levels: Number(form.levels),
    };
    const updated = await updateLocation(location.id, payload);
    onChanged(updated);
  };

  const handleDelete = async () => {
    await deleteLocation(location.id);
    onDeleted(location.id);
  };

  return (
    <div>
      <div className="section-title">Editar ubicacion</div>

      <div className="field">
        <label>Codigo</label>
        <input value={form.code} onChange={(e) => set('code', e.target.value)} />
      </div>

      <div className="row">
        <div className="field">
          <label>Tipo</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Zona</label>
          <select value={form.zoneId || ''} onChange={(e) => set('zoneId', e.target.value)}>
            <option value="">Sin zona</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Pos X</label>
          <input type="number" step="0.1" value={form.posX} onChange={(e) => set('posX', e.target.value)} />
        </div>
        <div className="field">
          <label>Pos Y</label>
          <input type="number" step="0.1" value={form.posY} onChange={(e) => set('posY', e.target.value)} />
        </div>
        <div className="field">
          <label>Pos Z</label>
          <input type="number" step="0.1" value={form.posZ} onChange={(e) => set('posZ', e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Ancho</label>
          <input type="number" step="0.1" value={form.width} onChange={(e) => set('width', e.target.value)} />
        </div>
        <div className="field">
          <label>Alto</label>
          <input type="number" step="0.1" value={form.height} onChange={(e) => set('height', e.target.value)} />
        </div>
        <div className="field">
          <label>Profundidad</label>
          <input type="number" step="0.1" value={form.depth} onChange={(e) => set('depth', e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Rotacion Y (rad)</label>
          <input type="number" step="0.1" value={form.rotationY} onChange={(e) => set('rotationY', e.target.value)} />
        </div>
        <div className="field">
          <label>Niveles</label>
          <input type="number" step="1" min="1" value={form.levels} onChange={(e) => set('levels', e.target.value)} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn" onClick={handleSave}>Guardar cambios</button>
        <button className="btn danger" onClick={handleDelete}>Eliminar</button>
      </div>
    </div>
  );
}
