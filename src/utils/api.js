import axios from 'axios';

// Configuración base de las APIs de Xano (general y autenticación) con proxy en desarrollo
const IS_DEV = import.meta.env.DEV;
const API_BASE_URL_GENERAL = IS_DEV
  ? '/xano-general'
  : import.meta.env.VITE_XANO_BASE_URL_GENERAL || import.meta.env.VITE_XANO_BASE_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:YQMhoR_R';
const API_BASE_URL_AUTH = IS_DEV
  ? '/xano-auth'
  : import.meta.env.VITE_XANO_BASE_URL_AUTH || import.meta.env.VITE_XANO_BASE_URL || API_BASE_URL_GENERAL;

// Crear instancias de axios separadas
const apiGeneral = axios.create({
  baseURL: API_BASE_URL_GENERAL,
});

const apiAuth = axios.create({
  baseURL: API_BASE_URL_AUTH,
});

// Interceptor para agregar token de autenticación si existe
const attachToken = (config) => {
  const token = localStorage.getItem('token'); // alineado con LoginRegister.jsx
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiGeneral.interceptors.request.use(attachToken, (error) => Promise.reject(error));
apiAuth.interceptors.request.use(attachToken, (error) => Promise.reject(error));

// Interceptor para manejar respuestas y errores en API general
apiGeneral.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones para autenticación
export const authAPI = {
  // Ajusta las rutas según tu grupo de Auth en Xano
  login: (credentials) => apiAuth.post('/auth/login', credentials),
  register: (userData) => apiAuth.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => apiAuth.get('/auth/me'),
};

// Funciones para usuarios
export const userAPI = {
  // Perfil actual
  getProfile: () => apiAuth.get('/auth/me'),
  updateProfile: (userData) => apiGeneral.put('/user/profile', userData),
  getUserReservations: (userId) => apiGeneral.get('/reservation', { params: { user_id: userId } }),

  // Administración de usuarios (requiere rol admin en backend)
  // CRUD en grupo General y creación en Auth, según tu configuración actual
  getAllUsers: (params = {}) => apiGeneral.get('/user', { params }),
  getUser: (id) => apiGeneral.get(`/user/${id}`),
  // Crear usuario por el flujo de signup del grupo Auth
  createUser: (data) => apiAuth.post('/auth/signup', data),
  updateUser: (id, data) => apiGeneral.put(`/user/${id}`, data),
  deleteUser: (id) => apiGeneral.delete(`/user/${id}`),
  // Ajuste: Xano usa campo 'status' (true=activo, false=inactivo)
  blockUser: (id) => apiGeneral.put(`/user/${id}`, { status: false }),
  unblockUser: (id) => apiGeneral.put(`/user/${id}`, { status: true }),
};

// Funciones para mascotas
export const petAPI = {
  getAllPets: () => apiGeneral.get('/pet'),
  getPet: (petId) => apiGeneral.get(`/pet/${petId}`),
  createPet: (petData) => apiGeneral.post('/pet', petData),
  updatePet: (petId, petData) => apiGeneral.patch(`/pet/${petId}`, petData),
  deletePet: (petId) => apiGeneral.delete(`/pet/${petId}`),
};

// Funciones para servicios
export const serviceAPI = {
  getAllServices: () => apiGeneral.get('/service'),
  getService: (serviceId) => apiGeneral.get(`/service/${serviceId}`),
  createService: (data) => {
    // Permitir envío de archivos (FormData) para la columna 'image'
    if (data instanceof FormData) {
      // No establecemos Content-Type manualmente; el navegador añadirá el boundary correcto
      return apiGeneral.post('/service', data);
    }
    return apiGeneral.post('/service', data);
  },
  updateService: (serviceId, data) => apiGeneral.patch(`/service/${serviceId}`, data),
  deleteService: (serviceId) => apiGeneral.delete(`/service/${serviceId}`),
};

// Funciones para reservas
export const reservationAPI = {
  getAllReservations: () => apiGeneral.get('/reservation'),
  createReservation: (reservationData) => apiGeneral.post('/reservation', reservationData),
  getUserReservations: (userId) => apiGeneral.get('/reservation', { params: { user_id: userId } }),
  updateReservation: (reservationId, reservationData) => 
    apiGeneral.patch(`/reservation/${reservationId}`, reservationData),
  cancelReservation: (reservationId) => apiGeneral.delete(`/reservation/${reservationId}`),
  getReservation: (reservationId) => apiGeneral.get(`/reservation/${reservationId}`),
};

// Funciones para envíos
export const shippingAPI = {
  getAllShipping: () => apiGeneral.get('/shipping'),
  createShipping: (shippingData) => apiGeneral.post('/shipping', shippingData),
  getShipping: (shippingId) => apiGeneral.get(`/shipping/${shippingId}`),
  updateShipping: (shippingId, shippingData) => 
    apiGeneral.patch(`/shipping/${shippingId}`, shippingData),
  deleteShipping: (shippingId) => apiGeneral.delete(`/shipping/${shippingId}`),
};

// Funciones para availability
export const availabilityAPI = {
  getAllAvailability: () => apiGeneral.get('/availability'),
  getAvailability: (id) => apiGeneral.get(`/availability/${id}`),
  createAvailability: (data) => apiGeneral.post('/availability', data),
  updateAvailability: (id, data) => apiGeneral.patch(`/availability/${id}`, data),
  deleteAvailability: (id) => apiGeneral.delete(`/availability/${id}`),
};

// Funciones para offer
export const offerAPI = {
  getAllOffers: () => apiGeneral.get('/offer'),
  getOffer: (id) => apiGeneral.get(`/offer/${id}`),
  createOffer: (data) => apiGeneral.post('/offer', data),
  updateOffer: (id, data) => apiGeneral.patch(`/offer/${id}`, data),
  deleteOffer: (id) => apiGeneral.delete(`/offer/${id}`),
};

// Funciones para payment
export const paymentAPI = {
  getAllPayments: () => apiGeneral.get('/payment'),
  getPayment: (id) => apiGeneral.get(`/payment/${id}`),
  createPayment: (data) => apiGeneral.post('/payment', data),
  updatePayment: (id, data) => apiGeneral.patch(`/payment/${id}`, data),
  deletePayment: (id) => apiGeneral.delete(`/payment/${id}`),
};

// Funciones para reservation_service
export const reservationServiceAPI = {
  getAllReservationServices: () => apiGeneral.get('/reservation_service'),
  getReservationService: (id) => apiGeneral.get(`/reservation_service/${id}`),
  createReservationService: (data) => apiGeneral.post('/reservation_service', data),
  updateReservationService: (id, data) => apiGeneral.patch(`/reservation_service/${id}`, data),
  deleteReservationService: (id) => apiGeneral.delete(`/reservation_service/${id}`),
};

// Funciones para review
export const reviewAPI = {
  getAllReviews: () => apiGeneral.get('/review'),
  getReview: (id) => apiGeneral.get(`/review/${id}`),
  createReview: (data) => apiGeneral.post('/review', data),
  updateReview: (id, data) => apiGeneral.patch(`/review/${id}`, data),
  deleteReview: (id) => apiGeneral.delete(`/review/${id}`),
};

// Funciones para service_offer
export const serviceOfferAPI = {
  getAllServiceOffers: () => apiGeneral.get('/service_offer'),
  getServiceOffer: (id) => apiGeneral.get(`/service_offer/${id}`),
  createServiceOffer: (data) => apiGeneral.post('/service_offer', data),
  updateServiceOffer: (id, data) => apiGeneral.patch(`/service_offer/${id}`, data),
  deleteServiceOffer: (id) => apiGeneral.delete(`/service_offer/${id}`),
};

// Funciones para staff
export const staffAPI = {
  getAllStaff: () => apiGeneral.get('/staff'),
  getStaff: (id) => apiGeneral.get(`/staff/${id}`),
  createStaff: (data) => apiGeneral.post('/staff', data),
  updateStaff: (id, data) => apiGeneral.patch(`/staff/${id}`, data),
  deleteStaff: (id) => apiGeneral.delete(`/staff/${id}`),
};

// NUEVO: subida múltiple de imágenes
export const uploadAPI = {
  // Compatibilidad existente: subir bajo campo 'images'
  uploadImages: (files, extra = {}) => {
    const fd = new FormData();
    Array.from(files || []).forEach((file) => fd.append('images', file));
    Object.entries(extra || {}).forEach(([k, v]) => fd.append(k, String(v)));
    return apiGeneral.post('/upload/image', fd);
  },
  // Alineado al endpoint de Xano: subir bajo campo 'content[]' y sin JSON
  uploadImagesContent: (files) => {
    const fd = new FormData();
    Array.from(files || []).forEach((file) => fd.append('content[]', file));
    return apiGeneral.post('/upload/image', fd);
  },
};

// Función helper para manejar errores
export const handleAPIError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    return {
      message: error.response.data?.message || 'Error del servidor',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Error de red
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      status: 0,
    };
  } else {
    // Error de configuración
    return {
      message: error.message || 'Error desconocido',
      status: -1,
    };
  }
};

export default apiGeneral;