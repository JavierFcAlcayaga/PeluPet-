import React, { useEffect, useState } from 'react';
import { serviceAPI, handleAPIError } from '../utils/api';

const AdminServicios = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', estimated_duration: '' });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const buildImageSrc = (image) => {
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
      setServices(data);
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
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  // URL de imagen deshabilitada temporalmente

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Solo permitimos crear servicios con archivo de imagen
      if (!imageFile) {
        setError('Debes subir un archivo de imagen.');
        return;
      }

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', String(Number(form.price) || 0));
      fd.append('duration', String(Number(form.estimated_duration) || 60));
      fd.append('estimated_duration', String(Number(form.estimated_duration) || 60));
      fd.append('image', imageFile);
      await serviceAPI.createService(fd);

      setForm({ name: '', description: '', price: '', estimated_duration: '' });
      setImageFile(null);
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
                <label className="form-label">Subir imagen (archivo)</label>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="form-control" />
                <div className="form-text">Sube un archivo de imagen para el servicio.</div>
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
                    {services.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <img src={buildImageSrc(s.image)} alt={s.name} width="60" height="60" className="rounded" />
                        </td>
                        <td>{s.name}</td>
                        <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(s.price || 0)}</td>
                        <td>{s.duration || 60} min</td>
                        <td className="text-end">
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(s.id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
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