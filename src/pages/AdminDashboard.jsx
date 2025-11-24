import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user || (user.role && user.role.toLowerCase() !== 'admin')) {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  }, [navigate]);

  return (
    <main className="container py-4">
      <header className="mb-4">
        <h1 className="h3">Panel de Administración</h1>
        <p className="text-muted">Selecciona una sección para gestionar.</p>
      </header>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm admin-tile">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Gestionar Servicios</h5>
              <p className="card-text flex-grow-1">Crea, edita y administra los servicios disponibles.</p>
              <Link to="/admin/servicios" className="btn btn-morado align-self-start">
                Ir a Servicios
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm admin-tile">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Gestionar Usuarios</h5>
              <p className="card-text flex-grow-1">Administra cuentas de usuarios.</p>
              <Link to="/admin/usuarios" className="btn btn-morado align-self-start">
                Ir a Usuarios
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm admin-tile">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">Pagos / Agenda</h5>
              <p className="card-text flex-grow-1">Ver, aceptar o rechazar pagos pendientes.</p>
              <Link to="/admin/pagos-agenda" className="btn btn-morado align-self-start">
                Ir a Pagos/Agenda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;