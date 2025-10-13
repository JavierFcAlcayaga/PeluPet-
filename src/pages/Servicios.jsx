import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI, handleAPIError } from '../utils/api';

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
      image: '/img/CorteBanio.jpeg'
    },
    {
      id: 2,
      name: 'Corte de Uñas',
      description: 'Servicio profesional de corte de uñas para mantener la salud de las patas.',
      price: 8000,
      duration: 30,
      image: '/img/Garras.jpeg'
    },
    {
      id: 3,
      name: 'Spa Relajante',
      description: 'Tratamiento premium con masajes, aromaterapia e hidratación del pelaje.',
      price: 45000,
      duration: 120,
      image: '/img/Spa.jpeg'
    },
    {
      id: 4,
      name: 'Limpieza Dental',
      description: 'Limpieza profesional de dientes para mantener la salud bucal de tu mascota.',
      price: 15000,
      duration: 45,
      image: '/img/Limpieza dental.jpeg'
    },
    {
      id: 5,
      name: 'Desenredado Especial',
      description: 'Tratamiento especializado para perros con pelo enredado o muy largo.',
      price: 20000,
      duration: 60,
      image: '/img/Enrredado.jpeg'
    },
    {
      id: 6,
      name: 'Tratamiento Antipulgas',
      description: 'Tratamiento completo para eliminar y prevenir pulgas y otros parásitos.',
      price: 18000,
      duration: 45,
      image: '/img/Antipulgas.jpeg'
    },
    {
      id: 7,
      name: 'Corte Estético',
      description: 'Corte personalizado según la raza y preferencias del dueño.',
      price: 30000,
      duration: 75,
      image: '/img/Punk.jpeg'
    },
    {
      id: 8,
      name: 'Paquete Completo',
      description: 'Todos nuestros servicios incluidos: baño, corte, uñas, limpieza dental y más.',
      price: 65000,
      duration: 180,
      image: '/img/Perrito full.jpeg',
      isSpecial: true
    }
  ];

  // Construye la URL de imagen desde recurso de Xano o cadena
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const truncateText = (text, max = 90) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max).trim() + '…';
  };

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
              <div className={`card h-100 shadow-sm ${service.isSpecial ? 'border-warning' : ''}`}>
                {service.isSpecial && (
                  <div className="card-header bg-warning text-white text-center">
                    <small className="fw-bold">¡OFERTA ESPECIAL!</small>
                  </div>
                )}
                <img 
                  src={buildImageSrc(service.image)} 
                  className={`card-img-top ${service.isSpecial ? 'rounded-0' : ''}`}
                  alt={service.name}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{service.name}</h5>
                  <div className="mt-auto">
                    <p className="fw-bold text-primary fs-5 mb-3">
                      {formatPrice(service.price)}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {service.duration} min
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
                  <i className="bi bi-info-circle text-primary me-2"></i>
                  Políticas de Servicio
                </h5>
                <ul className="list-unstyled mb-0">
                  <li>• Reserva con 24 horas de anticipación</li>
                  <li>• Vacunas al día requeridas</li>
                  <li>• Cancelación gratuita hasta 2 horas antes</li>
                  <li>• Productos premium incluidos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <div className="bg-primary text-white rounded p-5">
            <h3 className="mb-3">¿Necesitas más información?</h3>
            <p className="lead mb-4">
              Nuestro equipo está listo para ayudarte a elegir el mejor servicio para tu mascota
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button className="btn btn-light btn-lg">
                <i className="bi bi-telephone me-2"></i>Llamar Ahora
              </button>
              <button className="btn btn-outline-light btn-lg">
                <i className="bi bi-whatsapp me-2"></i>WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Servicios;