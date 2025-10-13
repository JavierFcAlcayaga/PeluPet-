import { useState, useEffect } from 'react';
import { userAPI, reservationAPI, handleAPIError } from '../utils/api';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
      const reservationsResponse = await userAPI.getUserReservations(userResponse.data.id);
      setReservations(reservationsResponse.data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      setErrorDetails(errorInfo);
      // Datos de ejemplo
      setUser({
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@email.com',
        phone: '+56 9 5555 5555',
        address: 'Calle Principal 123, Santiago',
        member_since: '2023-01-15'
      });
      setReservations([
        { id: 1, service_name: 'Baño Completo', pet_name: 'Max', date: '2024-01-15', time: '10:00', status: 'completed', price: 25000 },
        { id: 2, service_name: 'Corte de Pelo', pet_name: 'Luna', date: '2024-01-20', time: '14:30', status: 'confirmed', price: 35000 },
        { id: 3, service_name: 'Spa Completo', pet_name: 'Max', date: '2024-01-25', time: '09:00', status: 'pending', price: 80000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMemberSince = (u) => {
    const raw = u?.member_since ?? u?.created_at ?? u?.createdAt;
    if (raw == null) return null;
    const value = typeof raw === 'number' ? (raw > 1e12 ? raw : raw * 1000) : raw;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body text-center p-5">
                <div className="display-6 mb-3">🔒</div>
                <h1 className="h3 fw-bold mb-2">Acceso Requerido</h1>
                <p className="text-muted mb-4">Debes iniciar sesión para ver tu perfil y historial de reservas.</p>
                <button className="btn btn-primary btn-lg" onClick={() => (window.location.href = '/login')}>
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold">Mi Perfil</h1>
        <p className="text-muted">Gestiona tu información personal y revisa tu historial de reservas</p>
      </div>

      {error && (
        <div className="alert alert-info d-flex justify-content-between align-items-center" role="alert">
          <div>
            <i className="bi bi-info-circle me-2"></i>
            No se pudieron cargar los datos desde el servidor. Mostrando datos de ejemplo.
            {errorDetails?.status ? (
              <span className="ms-2 small text-muted">Detalle: {error} (status {errorDetails.status})</span>
            ) : (
              <span className="ms-2 small text-muted">Detalle: {error}</span>
            )}
          </div>
          <button className="btn btn-sm btn-outline-primary" onClick={fetchUserData}>Reintentar</button>
        </div>
      )}

      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <div className="text-center mb-4">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '80px', height: '80px', fontSize: '32px' }}
                >
                  {user.name?.charAt(0) || 'U'}
                </div>
                <h2 className="h5 mb-1">{user.name}</h2>
                <p className="text-muted mb-0">{user.email}</p>
              </div>

              <div className="nav nav-pills flex-column">
                <button
                  className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reservations')}
                >
                  📅 Mis Reservas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-12 col-lg-8">
          {activeTab === 'profile' && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h3 className="h5 fw-bold mb-4">Información Personal</h3>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <small className="text-muted d-block">Nombre</small>
                    <div className="fw-medium">{user.name}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <small className="text-muted d-block">Correo</small>
                    <div className="fw-medium">{user.email}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <small className="text-muted d-block">Teléfono</small>
                    <div className="fw-medium">{user.phone}</div>
                  </div>
                  {/* Dirección removida porque la base de datos no la almacena */}
                  <div className="col-12">
                    <small className="text-muted d-block">Miembro desde</small>
                    <div className="fw-medium">{formatDate(getMemberSince(user))}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0">Mis Reservas</h3>
                  <a href="/reservas" className="btn btn-outline-primary btn-sm">Nueva Reserva</a>
                </div>

                {reservations.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-6 mb-2">🗓️</div>
                    <p className="text-muted mb-3">Todavía no tienes reservas registradas.</p>
                    <a href="/reservas" className="btn btn-primary">Crear nueva reserva</a>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Servicio</th>
                          <th>Mascota</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Estado</th>
                          <th>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res) => (
                          <tr key={res.id}>
                            <td className="fw-medium">{res.service_name}</td>
                            <td>{res.pet_name}</td>
                            <td>{formatDate(res.date)}</td>
                            <td>{res.time}</td>
                            <td>
                              <span className={`badge bg-${getStatusVariant(res.status)}`}>{getStatusText(res.status)}</span>
                            </td>
                            <td>{formatPrice(res.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;