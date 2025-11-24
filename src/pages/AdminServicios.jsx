import React, { useEffect, useState } from 'react';
import { serviceAPI, handleAPIError, uploadAPI } from '../utils/api';

const AdminServicios = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', estimated_duration: '' });
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  // Estado de edición
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', duration: '' });
  const [editImageFiles, setEditImageFiles] = useState([]);
  // Búsqueda en listado
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  // Helper: normaliza duración desde distintos nombres de campo
  const normalizeService = (item) => ({
    ...item,
    estimated_duration: item?.estimated_duration ?? item?.duration ?? item?.durationMinutes ?? item?.duration_minutes ?? 60,
    duration: item?.duration ?? item?.estimated_duration ?? item?.durationMinutes ?? item?.duration_minutes ?? 60,
  });

  const buildImageSrc = (image) => {
    // Soporta arreglo de imágenes: toma la primera para miniatura
    if (Array.isArray(image)) image = image[0];
    if (!image) return '/img/CorteBanio.jpeg';
    if (typeof image === 'string') return image;
    const directUrl = image.url || image.full_url || image.download_url || image.link || null;
    if (directUrl) return directUrl;
    const path = image.path
      || image?.file?.path
      || image?.data?.path
      || image?.file_path
      || null;
    if (path) {
      const base = import.meta.env.DEV ? '/xano-general' : (import.meta.env.VITE_XANO_BASE_URL_GENERAL || '');
      return `${base}/file/${path}`;
    }
    return '/img/CorteBanio.jpeg';
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await serviceAPI.getAllServices();
      const data = Array.isArray(res?.data) ? res.data : [];
      setServices(data.map(normalizeService));
      setError('');
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      setUser(u);
    } catch {}
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  // Handlers de edición
  const handleEditStart = (service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration: service.estimated_duration || service.duration || 60,
    });
    setEditImageFiles([]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleEditImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEditImageFiles(files);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditImageFiles([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    setError('');
    try {
      // Actualizar campos básicos (incluye duration y estimated_duration)
      const durationVal = Number(editForm.duration) || 60;
      await serviceAPI.updateService(editingId, {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price) || 0,
        duration: durationVal,
        estimated_duration: durationVal,
        durationMinutes: durationVal,
      });

      // Si hay nuevas imágenes, subir y combinar con existentes
      if (editImageFiles && editImageFiles.length > 0) {
        const uploadRes = await uploadAPI.uploadImagesContent(editImageFiles);
        const uploadedArr = uploadRes?.data?.images || uploadRes?.data || [];
        if (Array.isArray(uploadedArr) && uploadedArr.length > 0) {
          const current = services.find((s) => s.id === editingId);
          const currentImages = Array.isArray(current?.images)
            ? current.images
            : (current?.image ? [current.image] : []);
          const combined = [...currentImages, ...uploadedArr];
          await serviceAPI.updateService(editingId, { images: combined, image: combined[0] });
        }
      }

      await fetchServices();
      handleCancelEdit();
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!imageFiles || imageFiles.length === 0) {
        setError('Debes subir al menos una imagen.');
        return;
      }

      // 1) Crear servicio sin imagen (activo por defecto)
      const durationVal = Number(form.estimated_duration) || 60;
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        // Guardar ambos campos para máxima compatibilidad
        duration: durationVal,
        estimated_duration: durationVal,
        durationMinutes: durationVal,
        active: true,
      };
      const createRes = await serviceAPI.createService(payload);
      const newServiceId = createRes?.data?.id;

      // 2) Subir múltiples imágenes al bucket (multipart: content[])
      const uploadRes = await uploadAPI.uploadImagesContent(imageFiles);
      const imagesArr = uploadRes?.data?.images || uploadRes?.data || [];

      // 3) Actualizar el servicio con imágenes: guarda arreglo y primera imagen como fallback
      if (newServiceId && Array.isArray(imagesArr) && imagesArr.length > 0) {
        await serviceAPI.updateService(newServiceId, { images: imagesArr, image: imagesArr[0] });
      }

      setForm({ name: '', description: '', price: '', estimated_duration: '' });
      setImageFiles([]);
      await fetchServices();
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    try {
      await serviceAPI.deleteService(id);
      await fetchServices();
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    }
  };

  if (!user || (user.role || '').toLowerCase() !== 'admin') {
    return (
      <main>
        <div className="container py-5">
          <div className="alert alert-warning">
            Acceso restringido. Debes ser administrador para gestionar servicios.
          </div>
          <a href="/perfil" className="btn btn-outline-primary">Volver al perfil</a>
        </div>
      </main>
    );
  }

  // Lista filtrada y ordenada para render
  const filteredServices = services
    .slice()
    .filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const ax = (a.name || a.description || '').toLowerCase();
      const bx = (b.name || b.description || '').toLowerCase();
      if (ax < bx) return sortAsc ? -1 : 1;
      if (ax > bx) return sortAsc ? 1 : -1;
      return 0;
    });

  // Vista mínima temporal para aislar el error de JSX
  return (
    <main>
      <div className="container py-5">
        <h1 className="mb-4">Administración de Servicios</h1>
        {error && <div className="alert alert-warning">{error}</div>}
        
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Crear nuevo servicio</h5>
            <form onSubmit={handleCreate} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Precio (CLP)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-12">
                <label className="form-label">Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows="3" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Duración estimada (min)</label>
                <input name="estimated_duration" type="number" value={form.estimated_duration} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Subir imágenes (múltiple)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageFileChange} className="form-control" />
                <div className="form-text">Puedes seleccionar varias imágenes para el servicio.</div>
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Listado</h5>
            {/* Buscador */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Buscar servicios</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre o descripción"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6 d-flex align-items-end justify-content-md-end mt-3 mt-md-0">
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setSortAsc((v) => !v)}>
                  <i className={`bi ${sortAsc ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'}`}></i> {sortAsc ? 'Ordenar A→Z' : 'Ordenar Z→A'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Duración</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((s) => (
                      <React.Fragment key={`frag-${s.id}`}>
                        <tr>
                          <td>
                            <img src={buildImageSrc(s.images || s.image)} alt={s.name} width="60" height="60" className="rounded" />
                          </td>
                          <td>{s.name}</td>
                          <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(s.price || 0)}</td>
                          <td>{s.estimated_duration || s.duration || 60} min</td>
                          <td className="text-end">
                            <div className="btn-group">
                              <button className="btn btn-outline-secondary btn-sm" onClick={() => handleEditStart(s)}>Editar</button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(s.id)}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                        {editingId === s.id ? (
                          <tr>
                            <td colSpan="5">
                              <form onSubmit={handleUpdate} className="row g-3 mt-2">
                                <div className="col-md-6">
                                  <label className="form-label">Nombre</label>
                                  <input name="name" value={editForm.name} onChange={handleEditChange} className="form-control" required />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Precio (CLP)</label>
                                  <input name="price" type="number" value={editForm.price} onChange={handleEditChange} className="form-control" required />
                                </div>
                                <div className="col-md-12">
                                  <label className="form-label">Descripción</label>
                                  <textarea name="description" value={editForm.description} onChange={handleEditChange} className="form-control" rows="3" required />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Duración (min)</label>
                                  <input name="duration" type="number" value={editForm.duration} onChange={handleEditChange} className="form-control" required />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Agregar imágenes</label>
                                  <input type="file" accept="image/*" multiple onChange={handleEditImageFileChange} className="form-control" />
                                  <div className="form-text">Las nuevas imágenes se anexarán a las existentes.</div>
                                </div>
                                <div className="col-12">
                                  <button className="btn btn-primary me-2" type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar cambios'}</button>
                                  <button className="btn btn-outline-secondary" type="button" onClick={handleCancelEdit}>Cancelar</button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    ))}
                    {filteredServices.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">No hay servicios coincidentes.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminServicios;