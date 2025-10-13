import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI, reservationAPI, reservationServiceAPI, petAPI, handleAPIError } from '../utils/api';

const Reservas = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    petName: '',
    petBreed: '',
    petAge: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });

  // Lista de servicios gestionada únicamente desde el backend (sin ejemplos)

  // Horarios disponibles
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    fetchServices();
    // Prefill datos del usuario autenticado si existen
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          userName: user.name || prev.userName,
          userEmail: user.email || prev.userEmail,
          userPhone: user.phone || prev.userPhone,
        }));
      } catch {}
    }
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      const arr = Array.isArray(response.data) ? response.data : [];
      setServices(arr);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('No se pudieron cargar los servicios. Intenta nuevamente.');
      setServices([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensajes al cambiar campos
    if (error) setError('');
    if (success) setSuccess('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validaciones
      if (!formData.userName.trim()) throw new Error('El nombre es obligatorio');
      if (!formData.userEmail.trim()) throw new Error('El email es obligatorio');
      if (!formData.petName.trim()) throw new Error('El nombre de la mascota es obligatorio');
      if (!formData.serviceId) throw new Error('Debe seleccionar un servicio');
      if (!formData.date) throw new Error('Debe seleccionar una fecha');
      if (!formData.time) throw new Error('Debe seleccionar una hora');

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.userEmail)) {
        throw new Error('Por favor ingrese un email válido');
      }

      // Crear/obtener mascota, luego crear la reserva en Xano
      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user')) || null;
        } catch { return null; }
      })();

      let petId = null;
      try {
        const petPayload = {
          name: formData.petName,
          breed: formData.petBreed,
          age: formData.petAge,
          user_id: currentUser?.id,
        };
        const petRes = await petAPI.createPet(petPayload);
        petId = petRes?.data?.id || null;
      } catch (e) {
        // Si falla la creación de la mascota, continuamos la reserva sin pet_id
        console.warn('No se pudo crear la mascota:', e);
      }

      const reservationPayload = {
        user_id: currentUser?.id,
        date: formData.date,
        time: formData.time,
        notes: formData.notes || '',
        pet_id: petId || undefined,
      };

      const reservationRes = await reservationAPI.createReservation(reservationPayload);
      const createdReservation = reservationRes.data;

      // Si se creó mascota y reserva, asegurar la relación pet_id en la reserva
      if (createdReservation?.id && petId) {
        try {
          await reservationAPI.updateReservation(createdReservation.id, { pet_id: petId });
        } catch (e) {
          console.warn('No se pudo actualizar la reserva con pet_id:', e);
        }
      }

      // Enlazar servicio seleccionado a la reserva
      const linkPayload = {
        reservation_id: createdReservation?.id,
        service_id: parseInt(formData.serviceId, 10),
      };
      await reservationServiceAPI.createReservationService(linkPayload);

      // Guardar pista local para MisReservas (nombre e id del servicio)
      try {
        const hintKey = `reservation_hint_${createdReservation?.id}`;
        const sel = services.find(s => s.id === parseInt(formData.serviceId, 10));
        if (createdReservation?.id && sel) {
          localStorage.setItem(hintKey, JSON.stringify({
            serviceId: sel.id,
            serviceName: sel.name,
          }));
        }
      } catch {}

      setSuccess('¡Reserva creada exitosamente! Te contactaremos pronto para confirmar.');
      
      // Limpiar formulario
      setFormData({
        userName: '',
        userEmail: '',
        userPhone: '',
        petName: '',
        petBreed: '',
        petAge: '',
        serviceId: '',
        date: '',
        time: '',
        notes: ''
      });

    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message || 'Error al crear la reserva. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));

  return (
    <main>
      <div className="container py-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="text-start">
            <h1 className="h2 fw-bold mb-1">Reservar Cita</h1>
            <p className="lead text-muted mb-0">
              Reserva el mejor cuidado para tu mascota con nuestros profesionales
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* Formulario */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Información de la Reserva
                </h5>
              </div>
              <div className="card-body">
                {/* Mensajes */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Información del dueño */}
                  <div className="mb-4">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-person-fill me-2"></i>
                      Información del Dueño
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="userName" className="form-label">
                          Nombre Completo <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="userName"
                          name="userName"
                          value={formData.userName}
                          onChange={handleInputChange}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="userEmail" className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="userEmail"
                          name="userEmail"
                          value={formData.userEmail}
                          onChange={handleInputChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="userPhone" className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="userPhone"
                        name="userPhone"
                        value={formData.userPhone}
                        onChange={handleInputChange}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  {/* Información de la mascota */}
                  <div className="mb-4">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-heart-fill me-2"></i>
                      Información de la Mascota
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="petName" className="form-label">
                          Nombre de la Mascota <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="petName"
                          name="petName"
                          value={formData.petName}
                          onChange={handleInputChange}
                          placeholder="Nombre de tu mascota"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="petBreed" className="form-label">Raza</label>
                        <input
                          type="text"
                          className="form-control"
                          id="petBreed"
                          name="petBreed"
                          value={formData.petBreed}
                          onChange={handleInputChange}
                          placeholder="Ej: Golden Retriever, Mestizo"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="petAge" className="form-label">Edad</label>
                      <select
                        className="form-select"
                        id="petAge"
                        name="petAge"
                        value={formData.petAge}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecciona la edad</option>
                        <option value="cachorro">Cachorro (0-1 año)</option>
                        <option value="joven">Joven (1-3 años)</option>
                        <option value="adulto">Adulto (3-7 años)</option>
                        <option value="senior">Senior (7+ años)</option>
                      </select>
                    </div>
                  </div>

                  {/* Servicio y fecha */}
                  <div className="mb-4">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-scissors me-2"></i>
                      Servicio y Fecha
                    </h6>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="serviceId" className="form-label">
                          Servicio <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="serviceId"
                          name="serviceId"
                          value={formData.serviceId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Selecciona un servicio</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {formatPrice(service.price)} ({service.duration} min)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="date" className="form-label">
                          Fecha <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={getMinDate()}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="time" className="form-label">
                          Hora <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Selecciona una hora</option>
                          {availableTimes.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notas adicionales */}
                  <div className="mb-4">
                    <label htmlFor="notes" className="form-label">Notas Adicionales</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Información adicional sobre tu mascota o preferencias especiales..."
                    ></textarea>
                  </div>

                  {/* Botón de envío */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-calendar-check me-2"></i>
                          Agendar Cita
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar con información */}
          <div className="col-lg-4">
            {/* Resumen de la reserva */}
            {selectedService && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Resumen de la Reserva
                  </h6>
                </div>
                <div className="card-body">
                  <h6 className="card-title">{selectedService.name}</h6>
                  <p className="card-text text-muted mb-2">
                    <i className="bi bi-currency-dollar me-1"></i>
                    Precio: {formatPrice(selectedService.price)}
                  </p>
                  <p className="card-text text-muted mb-2">
                    <i className="bi bi-clock me-1"></i>
                    Duración: {selectedService.duration} minutos
                  </p>
                  {formData.date && (
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-calendar me-1"></i>
                      Fecha: {new Date(formData.date).toLocaleDateString('es-CL')}
                    </p>
                  )}
                  {formData.time && (
                    <p className="card-text text-muted mb-0">
                      <i className="bi bi-clock me-1"></i>
                      Hora: {formData.time}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Información de contacto */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Información Importante
                </h6>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Confirmación por email en 24 horas
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Vacunas al día requeridas
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Cancelación gratuita hasta 2 horas antes
                  </li>
                  <li className="mb-0">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Productos premium incluidos
                  </li>
                </ul>
              </div>
            </div>

            {/* Contacto */}
            <div className="card shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="bi bi-telephone me-2"></i>
                  ¿Necesitas Ayuda?
                </h6>
              </div>
              <div className="card-body">
                <p className="card-text mb-3">
                  Si tienes dudas o necesitas ayuda, contáctanos:
                </p>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-telephone me-2"></i>
                    +56 9 1234 5678
                  </button>
                  <button className="btn btn-outline-success btn-sm">
                    <i className="bi bi-whatsapp me-2"></i>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Botón Ver mis reservas debajo de la tarjeta de ayuda */}
            <div className="mt-3 d-grid">
              <Link to="/mis-reservas" className="btn btn-outline-primary">
                <i className="bi bi-list-check me-2"></i>
                Ver mis reservas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reservas;