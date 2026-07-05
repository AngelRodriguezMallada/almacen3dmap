import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Mapa 3D (solo lectura): ubicaciones + stock agregado
export const getMapa = () => api.get('/mapa').then((r) => r.data);

// Disposicion del mapa (fichero compartido en el servidor, no toca la BD)
export const getLayout = () => api.get('/layout').then((r) => r.data);
export const saveRackPosition = (rackId, pos) =>
  api.put(`/layout/${encodeURIComponent(rackId)}`, pos).then((r) => r.data);
export const resetLayout = () => api.delete('/layout');

export const getWarehouse = (id) => api.get(`/warehouses/${id}`).then((r) => r.data);
export const listWarehouses = () => api.get('/warehouses').then((r) => r.data);
export const createWarehouse = (data) => api.post('/warehouses', data).then((r) => r.data);

export const listZones = (warehouseId) => api.get('/zones', { params: { warehouseId } }).then((r) => r.data);

export const createLocation = (data) => api.post('/locations', data).then((r) => r.data);
export const updateLocation = (id, data) => api.put(`/locations/${id}`, data).then((r) => r.data);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);

export const getLocationInventory = (id) => api.get(`/locations/${id}/inventory`).then((r) => r.data);
export const addInventoryEntry = (locationId, data) => api.post(`/locations/${locationId}/inventory`, data).then((r) => r.data);
export const updateInventoryEntry = (id, data) => api.put(`/inventory/${id}`, data).then((r) => r.data);
export const deleteInventoryEntry = (id) => api.delete(`/inventory/${id}`);

export const listProducts = () => api.get('/products').then((r) => r.data);
export const createProduct = (data) => api.post('/products', data).then((r) => r.data);

export default api;
