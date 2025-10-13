import React from 'react';

const Footer = () => {
  return (
    <footer id="pie-pagina" className="bg-light text-center py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="fw-bold text-primary">PeluPet</h5>
            <p className="text-muted small">
              Cuidamos a tu mascota con amor y profesionalismo desde 2020.
            </p>
          </div>
          
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="fw-bold">Contacto</h6>
            <p className="text-muted small mb-1">
              <i className="bi bi-telephone me-2"></i>
              +56 9 1234 5678
            </p>
            <p className="text-muted small mb-1">
              <i className="bi bi-envelope me-2"></i>
              info@pelupet.cl
            </p>
            <p className="text-muted small">
              <i className="bi bi-geo-alt me-2"></i>
              Santiago, Chile
            </p>
          </div>
          
          <div className="col-md-4">
            <h6 className="fw-bold">Síguenos</h6>
            <div className="d-flex justify-content-center gap-3">
              <a href="#" className="text-muted">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-whatsapp fs-5"></i>
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <p className="mb-0 text-muted">
          &copy; 2025 PeluPet. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;