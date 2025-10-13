import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI, handleAPIError } from '../utils/api';

const Home = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [usingExamplePopular, setUsingExamplePopular] = useState(false);
  const [errorPopular, setErrorPopular] = useState('');

  const examplePopular = [
    {
      id: 'ex-1',
      name: 'Corte y Baño Completo',
      description: 'Servicio completo que incluye baño, secado y corte de pelo.',
      price: 25000,
      image: '/img/CorteBanio.jpeg'
    },
    {
      id: 'ex-2',
      name: 'Corte de Uñas',
      description: 'Corte profesional de uñas para máximo confort.',
      price: 8000,
      image: '/img/Garras.jpeg'
    },
    {
      id: 'ex-3',
      name: 'Spa Relajante',
      description: 'Masajes, aromaterapia e hidratación del pelaje.',
      price: 35000,
      image: '/img/Spa.jpeg'
    },
  ];

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

  const formatPrice = (price) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price);
  const truncateText = (text, max = 90) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max).trim() + '…';
  };

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoadingPopular(true);
        const res = await serviceAPI.getAllServices();
        const data = res?.data;
        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id ?? item.service_id ?? Math.random(),
              name: item.name ?? item.title ?? 'Servicio',
              description: item.description ?? item.detail ?? 'Sin descripción',
              price: item.price ?? 0,
              image: item.image ?? null,
            }))
          : [];
        if (normalized.length === 0) {
          setPopularServices(examplePopular);
          setUsingExamplePopular(true);
          setErrorPopular('No hay servicios en el backend. Mostrando ejemplos.');
        } else {
          // Tomar los 3 primeros como "populares" por ahora
          setPopularServices(normalized.slice(0, 3));
          setUsingExamplePopular(false);
          setErrorPopular('');
        }
      } catch (err) {
        const info = handleAPIError(err);
        setPopularServices(examplePopular);
        setUsingExamplePopular(true);
        setErrorPopular(info.message || 'No se pudieron cargar los servicios. Mostrando ejemplos.');
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopular();
  }, []);
  return (
    <main>
      {/* Sección Hero */}
      <section className="hero-section bg-primary text-white py-5">
        {/* Overlay animado de nieve/puntos blancos */}
        <div className="hero-snow-overlay" aria-hidden="true"></div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">El mejor cuidado para tu mejor amigo</h1>
              <p className="lead mb-4">
                En nuestra peluquería canina ofrecemos servicios profesionales de grooming y cuidado 
                para que tu mascota siempre se vea y se sienta increíble.
              </p>
              <Link to="/servicios" className="btn btn-light btn-lg mb-4 mb-lg-0">
                Ver Nuestros Servicios
              </Link>
            </div>
            <div className="col-lg-6">
              <img 
                src="/img/Abrazo.jpeg" 
                alt="Perro feliz y bien cuidado" 
                className="img-fluid rounded shadow mt-3 mt-lg-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Servicios Populares */}
      <section className="servicios-populares py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Nuestros Servicios Populares</h2>
            <p className="lead text-muted">Los servicios más solicitados por nuestros clientes</p>
          </div>
          {usingExamplePopular && (
            <div className="alert alert-info alert-dismissible fade show" role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>
              Mostrando servicios de ejemplo mientras conectamos el servidor.
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          {loadingPopular ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {popularServices.map((service) => (
                <div key={service.id} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <img 
                      src={buildImageSrc(service.image)}
                      className="card-img-top" 
                      alt={service.name}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{service.name}</h5>
                      <p className="card-text flex-grow-1">{truncateText(service.description, 90)}</p>
                      <div className="mt-auto">
                        <p className="fw-bold text-primary fs-4">{formatPrice(service.price)}</p>
                        {usingExamplePopular ? (
                          <Link to="/servicios" className="btn btn-primary w-100">Ver Servicios</Link>
                        ) : (
                          <Link to={`/servicios/${service.id}`} className="btn btn-primary w-100">Ver Detalle</Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección Por Qué Elegirnos */}
      <section className="por-que-elegirnos bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">¿Por Qué Elegir PeluPet?</h2>
            <p className="lead text-muted">Conoce las razones por las que somos la mejor opción para tu mascota</p>
          </div>
          
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-heart-fill fs-2"></i>
                </div>
                <h4>Amor por los Animales</h4>
                <p className="text-muted">
                  Nuestro equipo está formado por verdaderos amantes de los animales que tratan 
                  a cada mascota con el cariño que se merece.
                </p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-award-fill fs-2"></i>
                </div>
                <h4>Profesionales Certificados</h4>
                <p className="text-muted">
                  Contamos con grooming profesionales certificados con años de experiencia 
                  en el cuidado y embellecimiento de mascotas.
                </p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-shield-check-fill fs-2"></i>
                </div>
                <h4>Productos de Calidad</h4>
                <p className="text-muted">
                  Utilizamos únicamente productos de la más alta calidad, seguros y 
                  especialmente formulados para el cuidado de la piel y pelaje de tu mascota.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="testimonios py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Lo Que Dicen Nuestros Clientes</h2>
            <p className="lead text-muted">Testimonios reales de dueños satisfechos</p>
          </div>
          
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="card-text">
                    "Excelente servicio! Mi Golden Retriever Max siempre sale como nuevo. 
                    El personal es muy cariñoso y profesional."
                  </p>
                  <footer className="blockquote-footer">
                    <cite title="Source Title">María González</cite>
                  </footer>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="card-text">
                    "La mejor peluquería canina de la ciudad. Mi French Poodle Luna ama venir aquí. 
                    Siempre queda perfecta!"
                  </p>
                  <footer className="blockquote-footer">
                    <cite title="Source Title">Carlos Rodríguez</cite>
                  </footer>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="card-text">
                    "Profesionales de primera. Mi Husky Siberiano Rocky siempre está nervioso, 
                    pero aquí lo tranquilizan y lo cuidan increíble."
                  </p>
                  <footer className="blockquote-footer">
                    <cite title="Source Title">Ana Martínez</cite>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Call to Action */}
      <section className="cta bg-primary text-white py-5">
        {/* Overlay de nieve en CTA */}
        <div className="hero-snow-overlay" aria-hidden="true"></div>
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">¿Listo para Consentir a tu Mascota?</h2>
          <p className="lead mb-4">
            Agenda una cita hoy mismo y dale a tu mejor amigo el cuidado que se merece
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Link to="/reservas" className="btn btn-light btn-lg btn-glow shine-btn btn-ripple">
              <i className="bi bi-calendar-check me-2"></i>Agendar Cita
            </Link>
            <Link to="/servicios" className="btn btn-outline-light btn-lg btn-glow shine-btn btn-ripple">
              <i className="bi bi-list-ul me-2"></i>Ver Servicios
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;