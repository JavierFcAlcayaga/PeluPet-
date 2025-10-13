import React from 'react';

const Nosotros = () => {
  return (
    <main>
      <div className="container py-5">
        {/* Título */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">Sobre Nosotros</h1>
          <p className="lead text-muted">Conoce nuestra historia y compromiso con el bienestar de tu mascota</p>
        </div>

        {/* Nuestra historia */}
        <section className="mb-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="h3 fw-bold mb-4">Nuestra Historia</h2>
              <p className="text-muted">
                Fundada en 2015, PeluPet nació del amor incondicional hacia los animales y la pasión por brindar el mejor cuidado estético para nuestros fieles compañeros de cuatro patas.
              </p>
              <p className="text-muted">
                Durante más de 8 años, hemos perfeccionado nuestras técnicas de grooming profesional, convirtiéndonos en el lugar de confianza para cientos de familias que buscan lo mejor para sus mascotas.
              </p>
              <p className="text-muted">
                Nuestro compromiso va más allá del cuidado estético; nos preocupamos por el bienestar integral de cada animal que llega a nuestras instalaciones.
              </p>
            </div>
            <div className="col-lg-6">
              <img src="/img/Perrito nosotro.jpg" alt="Peluquería canina profesional" className="img-fluid rounded shadow" />
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="mb-5">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-heart-fill text-primary display-4 mb-3"></i>
                  <h3 className="h4 fw-bold">Nuestra Misión</h3>
                  <p className="text-muted">
                    Proporcionar servicios de grooming de la más alta calidad, priorizando el bienestar y comodidad de cada mascota, mientras creamos una experiencia excepcional para sus dueños.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <i className="bi bi-star-fill text-primary display-4 mb-3"></i>
                  <h3 className="h4 fw-bold">Nuestra Visión</h3>
                  <p className="text-muted">
                    Ser la peluquería canina líder en la región, reconocida por nuestra excelencia, innovación en técnicas de cuidado animal y nuestro compromiso con la comunidad de amantes de los animales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mb-5">
          <div className="text-center mb-5">
            <h2 className="h3 fw-bold">Nuestros Valores</h2>
            <p className="text-muted">Los principios que guían cada uno de nuestros servicios</p>
          </div>
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="bi bi-shield-check text-primary display-5 mb-3"></i>
                <h5 className="fw-bold">Confianza</h5>
                <p className="text-muted small">Construimos relaciones duraderas basadas en la confianza y transparencia.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="bi bi-heart text-primary display-5 mb-3"></i>
                <h5 className="fw-bold">Amor Animal</h5>
                <p className="text-muted small">Cada mascota es tratada con el amor y cuidado que merece.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="bi bi-gem text-primary display-5 mb-3"></i>
                <h5 className="fw-bold">Calidad</h5>
                <p className="text-muted small">Utilizamos solo productos y técnicas de la más alta calidad.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <i className="bi bi-people text-primary display-5 mb-3"></i>
                <h5 className="fw-bold">Profesionalismo</h5>
                <p className="text-muted small">Nuestro equipo está altamente capacitado y certificado.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="bg-light rounded p-5">
          <div className="text-center mb-4">
            <h2 className="h3 fw-bold">¿Por Qué Elegir PeluPet?</h2>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="d-flex">
                <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                <div>
                  <h6 className="fw-bold">Profesionales Certificados</h6>
                  <p className="text-muted small mb-0">Certificaciones internacionales en grooming.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="d-flex">
                <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                <div>
                  <h6 className="fw-bold">Instalaciones Modernas</h6>
                  <p className="text-muted small mb-0">Equipos de última generación en ambiente seguro.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="d-flex">
                <i className="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                <div>
                  <h6 className="fw-bold">Productos Premium</h6>
                  <p className="text-muted small mb-0">Productos hipoalergénicos de marcas reconocidas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Nosotros;