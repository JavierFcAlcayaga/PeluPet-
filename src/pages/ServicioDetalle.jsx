import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceAPI, handleAPIError } from '../utils/api';
import { cart } from '../utils/cart';

const ServicioDetalle = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const base = import.meta.env.DEV
        ? '/xano-general'
        : (import.meta.env.VITE_XANO_BASE_URL_GENERAL || '');
      return `${base}/file/${path}`;
    }
    return '/img/CorteBanio.jpeg';
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await serviceAPI.getService(id);
        const item = res?.data || null;
        if (!item) {
          setError('Servicio no encontrado.');
          setService(null);
        } else {
          const normalized = {
            id: item.id ?? item.service_id ?? id,
            name: item.name ?? item.title ?? 'Servicio',
            description: item.description ?? item.detail ?? 'Sin descripción',
            price: item.price ?? 0,
            duration: item.estimated_duration ?? item.duration ?? 60,
            image: item.image ?? null,
          };
          setService(normalized);
          setError('');
        }
      } catch (err) {
        const info = handleAPIError(err);
        setError(info.message || 'No se pudo cargar el servicio.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <main>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main>
        <div className="container py-5">
          <div className="alert alert-warning">{error || 'Servicio no disponible'}</div>
          <Link to="/servicios" className="btn btn-outline-primary">Volver a servicios</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-6">
            <img src={buildImageSrc(service.image)} alt={service.name} className="img-fluid rounded shadow" />
          </div>
          <div className="col-lg-6">
            <h1 className="h3 fw-bold mb-3">{service.name}</h1>
            <p className="lead">{service.description}</p>
            <p className="fw-bold text-primary fs-4 mb-2">
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(service.price || 0)}
            </p>
            <p className="text-muted mb-4">
              <i className="bi bi-clock me-2"></i>
              {service.duration} min
            </p>
            <div className="d-flex gap-3">
              <button className="btn btn-primary" onClick={() => {
                cart.addItem({
                  id: service.id,
                  name: service.name,
                  price: service.price,
                  duration: service.duration,
                  image: buildImageSrc(service.image),
                }, 1);
              }}>
                Agregar al carrito
              </button>
              <Link to="/servicios" className="btn btn-outline-primary">Volver</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ServicioDetalle;