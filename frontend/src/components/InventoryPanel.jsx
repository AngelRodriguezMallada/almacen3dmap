import React, { useEffect, useState } from 'react';
import {
  getLocationInventory,
  addInventoryEntry,
  updateInventoryEntry,
  deleteInventoryEntry,
  listProducts,
  createProduct,
} from '../api/client';

export default function InventoryPanel({ location }) {
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProductId, setNewProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');

  const reload = async () => {
    setLoading(true);
    const [inv, prods] = await Promise.all([
      getLocationInventory(location.id),
      listProducts(),
    ]);
    setEntries(inv);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    if (location) reload();
  }, [location?.id]);

  const handleAdd = async () => {
    if (!newProductId) return;
    await addInventoryEntry(location.id, { productId: Number(newProductId), quantity: Number(newQuantity) || 0 });
    setNewQuantity(1);
    reload();
  };

  const handleQtyChange = async (entry, value) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, quantity: value } : e)));
  };

  const handleQtyCommit = async (entry) => {
    await updateInventoryEntry(entry.id, { quantity: Number(entry.quantity) || 0 });
  };

  const handleDelete = async (entry) => {
    await deleteInventoryEntry(entry.id);
    reload();
  };

  const handleCreateProduct = async () => {
    if (!newSku || !newName) return;
    const product = await createProduct({ sku: newSku, name: newName, unit: 'unidad' });
    setNewSku('');
    setNewName('');
    setShowNewProduct(false);
    await reload();
    setNewProductId(String(product.id));
  };

  if (!location) return null;

  return (
    <div>
      <div className="section-title">Inventario en {location.code}</div>

      {loading ? (
        <div className="empty-hint">Cargando...</div>
      ) : entries.length === 0 ? (
        <div className="empty-hint">Sin productos en esta ubicacion.</div>
      ) : (
        entries.map((entry) => (
          <div className="inventory-row" key={entry.id}>
            <span>{entry.product?.name} ({entry.product?.sku})</span>
            <input
              type="number"
              value={entry.quantity}
              onChange={(e) => handleQtyChange(entry, e.target.value)}
              onBlur={() => handleQtyCommit(entry)}
            />
            <button className="btn danger" onClick={() => handleDelete(entry)}>x</button>
          </div>
        ))
      )}

      <div style={{ marginTop: 12 }}>
        <div className="row">
          <div className="field">
            <label>Producto</label>
            <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)}>
              <option value="">Selecciona un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ maxWidth: 80 }}>
            <label>Cant.</label>
            <input type="number" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
          </div>
        </div>
        <button className="btn" onClick={handleAdd} style={{ width: '100%' }}>Agregar al inventario</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {!showNewProduct ? (
          <button className="btn secondary" style={{ width: '100%' }} onClick={() => setShowNewProduct(true)}>
            + Nuevo producto
          </button>
        ) : (
          <div>
            <div className="field">
              <label>SKU</label>
              <input value={newSku} onChange={(e) => setNewSku(e.target.value)} placeholder="SKU-0009" />
            </div>
            <div className="field">
              <label>Nombre</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del producto" />
            </div>
            <div className="row">
              <button className="btn" onClick={handleCreateProduct}>Guardar producto</button>
              <button className="btn secondary" onClick={() => setShowNewProduct(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
