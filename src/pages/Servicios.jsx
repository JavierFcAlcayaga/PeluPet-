import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI, handleAPIError } from '../utils/api';

// Componente de tarjeta con carrusel simple controlado por estado
const ServiceCard = ({ service, buildImageSrc, usingExample }) => {
  // Normaliza arreglo de imágenes incluso si viene como string JSON o URL simple
  let images = [];
  if (Array.isArray(service.images) && service.images.length > 0) {
    images = service.images;
  } else if (typeof service.images === 'string' && service.images.trim()) {
    try {
      const parsed = JSON.parse(service.images);
      if (Array.isArray(parsed) && parsed.length > 0) images = parsed;
      else images = [service.images];
    } catch {
      images = [service.images];
    }
  } else if (service.image) {
    images = [service.image];
  } else {
    images = ['/img/CorteBanio.jpeg'];
  }
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <div className={`card h-100 shadow-sm ${service.isSpecial ? 'border-warning' : ''}`}>
      {service.isSpecial && (
        <div className="card-header bg-warning text-white text-center">
          <small className="fw-bold">¡OFERTA ESPECIAL!</small>
        </div>
      )}
      <div className="position-relative">
        <img
          src={buildImageSrc(images[idx])}
          className={`card-img-top ${service.isSpecial ? 'rounded-0' : ''}`}
          alt={service.name}
          style={{ objectFit: 'cover', height: 180 }}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
              onClick={prev}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={next}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  role="button"
                  onClick={() => setIdx(i)}
                  className={`badge rounded-pill ${i === idx ? 'bg-primary' : 'bg-light text-dark'}`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{service.name}</h5>
        <div className="mt-auto">
          <p className="fw-bold text-primary fs-5 mb-3">
            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(service.price || 0)}
          </p>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {service.estimated_duration || service.duration || 60} min
            </small>
          </div>
          {!usingExample && (
            <div className="d-grid">
              <Link to={`/servicios/${service.id}`} className="btn btn-outline-primary">
                Ver Detalle
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Servicios = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingExample, setUsingExample] = useState(false);

  // Datos de ejemplo basados en la maqueta
  const exampleServices = [
    {
      id: 1,
      name: 'Corte y Baño Completo',
      description: 'Servicio integral que incluye baño, secado, corte de pelo y limpieza de oídos.',
      price: 25000,
      duration: 90,
      images: ['/img/CorteBanio.jpeg']
    },
    {
      id: 2,
      name: 'Corte de Uñas',
      description: 'Servicio profesional de corte de uñas para mantener la salud de las patas.',
      price: 8000,
      duration: 30,
      images: ['/img/Garras.jpeg']
    },
    {
      id: 3,
      name: 'Spa Relajante',
      description: 'Tratamiento premium con masajes, aromaterapia e hidratación del pelaje.',
      price: 45000,
      duration: 120,
      images: ['/img/Spa.jpeg']
    },
    {
      id: 4,
      name: 'Limpieza Dental',
      description: 'Limpieza profesional de dientes para mantener la salud bucal de tu mascota.',
      price: 15000,
      duration: 45,
      images: ['/img/Limpieza dental.jpeg']
    },
    {
      id: 5,
      name: 'Desenredado Especial',
      description: 'Tratamiento especializado para perros con pelo enredado o muy largo.',
      price: 20000,
      duration: 60,
      images: ['/img/Enrredado.jpeg']
    },
    {
      id: 6,
      name: 'Tratamiento Antipulgas',
      description: 'Tratamiento completo para eliminar y prevenir pulgas y otros parásitos.',
      price: 18000,
      duration: 45,
      images: ['/img/Antipulgas.jpeg']
    },
    {
      id: 7,
      name: 'Corte Estético',
      description: 'Corte personalizado según la raza y preferencias del dueño.',
      price: 30000,
      duration: 75,
      images: ['/img/Punk.jpeg']
    },
    {
      id: 8,
      name: 'Paquete Completo',
      description: 'Todos nuestros servicios incluidos: baño, corte, uñas, limpieza dental y más.',
      price: 65000,
      duration: 180,
      images: ['/img/Perrito full.jpeg'],
      isSpecial: true
    }
  ];

  // Construye la URL de imagen desde recurso de Xano o cadena; soporta arreglo
  const buildImageSrc = (image) => {
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
      const base = import.meta.env.DEV
        ? '/xano-general'
        : (import.meta.env.VITE_XANO_BASE_URL_GENERAL || '');
      return `${base}/file/${path}`;
    }
    return '/img/CorteBanio.jpeg';
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceAPI.getAllServices();
        const data = response?.data;

        // Normalizar y validar estructura desde Xano
        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id ?? item.service_id ?? Math.random(),
              name: item.name ?? item.title ?? 'Servicio',
              description: item.description ?? item.detail ?? 'Sin descripción',
              price: item.price ?? 0,
              duration: item.estimated_duration ?? item.duration ?? 60,
              image: item.image ?? null,
              // Conservar 'images' aunque sea string JSON o URL simple
              images: item.images ?? (item.image ? [item.image] : []),
            }))
          : [];

        if (normalized.length === 0) {
          setError('No hay servicios en el backend. Mostrando catálogo de ejemplo.');
          setServices(exampleServices);
          setUsingExample(true);
        } else {
          setServices(normalized);
          setUsingExample(false);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('No se pudieron cargar los servicios desde el servidor. Mostrando servicios de ejemplo.');
        // Usar datos de ejemplo si falla la API
        setServices(exampleServices);
        setUsingExample(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <main>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando servicios...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container py-5">
        {/* Título de la página */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">Todos Nuestros Servicios</h1>
          <p className="lead text-muted">
            Descubre la gama completa de servicios profesionales para el cuidado de tu mascota
          </p>
        </div>

        {/* Mensaje informativo si se usa catálogo de ejemplo */}
        {error && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            Mostrando catálogo de ejemplo mientras conectamos el servidor.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}

        {/* Grilla de servicios */}
        <div className="row">
          {services.map((service) => (
            <div key={service.id} className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4">
              <ServiceCard service={service} buildImageSrc={buildImageSrc} usingExample={usingExample} />
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="row mt-5">
          <div className="col-md-6 mb-4">
            <div className="card border-0 bg-light h-100">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-clock text-primary me-2"></i>
                  Horarios de Atención
                </h5>
                <ul className="list-unstyled mb-0">
                  <li><strong>Lunes a Viernes:</strong> 9:00 AM - 7:00 PM</li>
                  <li><strong>Sábados:</strong> 9:00 AM - 6:00 PM</li>
                  <li><strong>Domingos:</strong> 10:00 AM - 4:00 PM</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card border-0 bg-light h-100">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-shield-check text-primary me-2"></i>
                  Compromiso de Calidad
                </h5>
                <p className="mb-0">
                  Nuestro equipo está compuesto por profesionales con amplia experiencia y formación continua para garantizar el mejor cuidado para tu mascota.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Servicios;