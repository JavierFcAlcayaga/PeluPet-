import { useState, useEffect } from 'react';
import { userAPI, reservationAPI, handleAPIError } from '../utils/api';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener datos del usuario
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
      
      // Obtener reservas del usuario
      const reservationsResponse = await userAPI.getUserReservations(userResponse.data.id);
      setReservations(reservationsResponse.data);
      
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      
      // Datos de ejemplo mientras no esté conectado a Xano
      setUser({
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@email.com',
        phone: '+1 (555) 123-4567',
        address: 'Calle Principal 123, Ciudad',
        member_since: '2023-01-15'
      });
      
      setReservations([
        {
          id: 1,
          service_name: 'Baño Completo',
          pet_name: 'Max',
          date: '2024-01-15',
          time: '10:00',
          status: 'completed',
          price: 25.00
        },
        {
          id: 2,
          service_name: 'Corte de Pelo',
          pet_name: 'Luna',
          date: '2024-01-20',
          time: '14:30',
          status: 'confirmed',
          price: 35.00
        },
        {
          id: 3,
          service_name: 'Spa Completo',
          pet_name: 'Max',
          date: '2024-01-25',
          time: '09:00',
          status: 'pending',
          price: 80.00
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar mensaje de login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Acceso Requerido
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Debes iniciar sesión para ver tu perfil y historial de reservas.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Mi Perfil
          </h1>
          <p className="text-lg text-gray-600">
            Gestiona tu información personal y revisa tu historial de reservas
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No se pudieron cargar los datos desde el servidor. Mostrando datos de ejemplo.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👤 Información Personal
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'reservations'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📅 Mis Reservas
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Configuración
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Información Personal */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={user.phone || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Miembro desde
                    </label>
                    <input
                      type="text"
                      value={formatDate(user.member_since)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={user.address || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200">
                    Editar Información
                  </button>
                </div>
              </div>
            )}

            {/* Historial de Reservas */}
            {activeTab === 'reservations' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  Historial de Reservas
                </h3>
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-gray-600 mb-4">No tienes reservas aún</p>
                    <button
                      onClick={() => window.location.href = '/reservas'}
                      className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                    >
                      Hacer Primera Reserva
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-800">
                                {reservation.service_name}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  reservation.status
                                )}`}
                              >
                                {getStatusText(reservation.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>🐕 Mascota: {reservation.pet_name}</p>
                              <p>📅 Fecha: {formatDate(reservation.date)} a las {reservation.time}</p>
                              <p>💰 Precio: {formatPrice(reservation.price)}</p>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 md:ml-4">
                            {reservation.status === 'pending' && (
                              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm">
                                Cancelar
                              </button>
                            )}
                            {reservation.status === 'confirmed' && (
                              <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200 text-sm">
                                Reprogramar
                              </button>
                            )}
                            {reservation.status === 'completed' && (
                              <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm">
                                Reservar Nuevamente
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Configuración */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  Configuración de Cuenta
                </h3>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      Notificaciones
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-gray-700">Recordatorios de citas por email</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-gray-700">Promociones y ofertas especiales</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-gray-700">Notificaciones SMS</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      Seguridad
                    </h4>
                    <div className="space-y-3">
                      <button className="text-primary-600 hover:text-primary-700 font-medium">
                        Cambiar contraseña
                      </button>
                      <br />
                      <button className="text-primary-600 hover:text-primary-700 font-medium">
                        Configurar autenticación de dos factores
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      Zona Peligrosa
                    </h4>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
                      Eliminar Cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;