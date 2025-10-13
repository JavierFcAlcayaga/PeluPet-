import React from 'react';

const Blog = () => {
  return (
    <main>
      <div className="container py-5">
        {/* Título */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">Blog PeluPet</h1>
          <p className="lead text-muted">Consejos, tips y novedades sobre el cuidado de tu mascota</p>
        </div>

        <div className="row">
          {/* Contenido principal */}
          <div className="col-lg-8">
            {/* Artículo destacado */}
            <article className="card shadow mb-5">
              <img src="/img/Perrito full.jpeg" className="card-img-top" alt="Cuidado del pelaje canino" />
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-primary">Cuidado</span>
                  <small className="text-muted">15 de Enero, 2025</small>
                </div>
                <h2 className="card-title h4">Cómo Mantener el Pelaje de tu Perro Saludable</h2>
                <p className="card-text">
                  El cuidado regular del pelaje es esencial para la salud y bienestar de tu mascota. Te compartimos consejos para mantener el pelo de tu perro brillante y saludable durante todo el año.
                </p>
                <p className="card-text">
                  <small className="text-muted">Por: Equipo PeluPet | 5 min de lectura</small>
                </p>
                <a href="#" className="btn btn-primary">Leer Más</a>
              </div>
            </article>

            {/* Grid de artículos */}
            <div className="row">
              <div className="col-md-6 mb-4">
                <article className="card h-100 shadow-sm">
                  <img src="/img/Garras.jpeg" className="card-img-top" alt="Corte de uñas" />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-success">Tips</span>
                      <small className="text-muted">10 Ene</small>
                    </div>
                    <h5 className="card-title">La Importancia del Corte de Uñas</h5>
                    <p className="card-text flex-grow-1">Por qué mantener las uñas de tu perro cortas y cómo hacerlo de forma segura.</p>
                    <a href="#" className="btn btn-outline-primary btn-sm">Leer Artículo</a>
                  </div>
                </article>
              </div>

              <div className="col-md-6 mb-4">
                <article className="card h-100 shadow-sm">
                  <img src="/img/CorteBanio.jpeg" className="card-img-top" alt="Baño de perros" />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-info">Guía</span>
                      <small className="text-muted">8 Ene</small>
                    </div>
                    <h5 className="card-title">¿Con Qué Frecuencia Bañar a tu Perro?</h5>
                    <p className="card-text flex-grow-1">Frecuencia ideal de baño según tipo de pelo y actividad.</p>
                    <a href="#" className="btn btn-outline-primary btn-sm">Leer Artículo</a>
                  </div>
                </article>
              </div>

              <div className="col-md-6 mb-4">
                <article className="card h-100 shadow-sm">
                  <img src="/img/Punk.jpeg" className="card-img-top" alt="Cortes estéticos" />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-warning">Tendencias</span>
                      <small className="text-muted">5 Ene</small>
                    </div>
                    <h5 className="card-title">Cortes de Moda para Perros 2025</h5>
                    <p className="card-text flex-grow-1">Últimas tendencias en cortes para que tu perro luzca espectacular.</p>
                    <a href="#" className="btn btn-outline-primary btn-sm">Leer Artículo</a>
                  </div>
                </article>
              </div>

              <div className="col-md-6 mb-4">
                <article className="card h-100 shadow-sm">
                  <img src="/img/AbrazoPerrito.jpeg" className="card-img-top" alt="Perro feliz" />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary">Salud</span>
                      <small className="text-muted">3 Ene</small>
                    </div>
                    <h5 className="card-title">Señales de Problemas en la Piel</h5>
                    <p className="card-text flex-grow-1">Identifica problemas dermatológicos comunes y cuándo consultar al veterinario.</p>
                    <a href="#" className="btn btn-outline-primary btn-sm">Leer Artículo</a>
                  </div>
                </article>
              </div>
            </div>

            {/* Paginación */}
            <nav aria-label="Navegación del blog">
              <ul className="pagination justify-content-center">
                <li className="page-item disabled"><a className="page-link" href="#">&laquo;</a></li>
                <li className="page-item active"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item"><a className="page-link" href="#">&raquo;</a></li>
              </ul>
            </nav>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card shadow mb-4">
              <div className="card-header"><h5 className="mb-0">Categorías</h5></div>
              <div className="card-body">
                <a href="#" className="d-block text-decoration-none mb-2"><i className="bi bi-tag me-2"></i>Cuidado y Higiene <span className="badge bg-light text-dark ms-2">12</span></a>
                <a href="#" className="d-block text-decoration-none mb-2"><i className="bi bi-tag me-2"></i>Tips de Grooming <span className="badge bg-light text-dark ms-2">8</span></a>
                <a href="#" className="d-block text-decoration-none mb-2"><i className="bi bi-tag me-2"></i>Salud Canina <span className="badge bg-light text-dark ms-2">6</span></a>
                <a href="#" className="d-block text-decoration-none mb-2"><i className="bi bi-tag me-2"></i>Tendencias <span className="badge bg-light text-dark ms-2">4</span></a>
                <a href="#" className="d-block text-decoration-none"><i className="bi bi-tag me-2"></i>Productos <span className="badge bg-light text-dark ms-2">3</span></a>
              </div>
            </div>

            <div className="card shadow mb-4">
              <div className="card-header"><h5 className="mb-0">Artículos Populares</h5></div>
              <div className="card-body">
                <div className="d-flex mb-3">
                  <img src="/img/Abrazo.jpeg" alt="Artículo popular" className="rounded me-3" style={{width:'60px',height:'45px',objectFit:'cover'}} />
                  <div>
                    <h6 className="mb-1"><a href="#" className="text-decoration-none">Cómo Calmar a un Perro Nervioso</a></h6>
                    <small className="text-muted">28 Dic 2024</small>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <img src="/img/Productos.jpeg" alt="Artículo popular" className="rounded me-3" style={{width:'60px',height:'45px',objectFit:'cover'}} />
                  <div>
                    <h6 className="mb-1"><a href="#" className="text-decoration-none">Productos Naturales vs Químicos</a></h6>
                    <small className="text-muted">25 Dic 2024</small>
                  </div>
                </div>
                <div className="d-flex">
                  <img src="/img/Grooming.jpeg" alt="Artículo popular" className="rounded me-3" style={{width:'60px',height:'45px',objectFit:'cover'}} />
                  <div>
                    <h6 className="mb-1"><a href="#" className="text-decoration-none">Guía de Grooming para Cachorros</a></h6>
                    <small className="text-muted">20 Dic 2024</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Blog;