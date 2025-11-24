import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { serviceAPI } from '../utils/api';
import { cart } from '../utils/cart';

const Reservas = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    petName: '',
    petBreed: '',
    petAge: '',
    serviceIds: [],
    date: '',
    time: '',
    notes: ''
  });

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  // Prefill datos del usuario logueado, manteniendo editabilidad
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      if (u) {
        setFormData((prev) => ({
          ...prev,
          userName: u.name || prev.userName || '',
          userEmail: u.email || prev.userEmail || '',
          userPhone: u.phone || prev.userPhone || '',
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromCart = params.get('fromCart');
    const serviceIdParam = params.get('serviceId');
    if (fromCart) {
      try {
        const items = cart.getCart();
        const ids = Array.from(new Set(items.map(i => i.id))).filter(Boolean);
        setFormData(prev => ({ ...prev, serviceIds: ids }));
      } catch {}
    } else if (serviceIdParam) {
      const idNum = parseInt(serviceIdParam, 10);
      if (idNum) setFormData(prev => ({ ...prev, serviceIds: [idNum] }));
    }
  }, [location.search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await serviceAPI.getAllServices();
      const data = Array.isArray(res?.data) ? res.data : [];
      setServices(data);
    } catch (err) {
      setError('No se pudo cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const resolveImage = (svc) => {
    const imgCandidate = Array.isArray(svc.images) ? svc.images[0] : undefined;
    const fromArray = typeof imgCandidate === 'string' 
      ? imgCandidate 
      : (imgCandidate?.url || imgCandidate?.image_url || imgCandidate?.image);
    return fromArray || svc.image_url || svc.image || '/img/CorteBanio.jpeg';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (e) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, serviceIds: value ? [value] : [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!formData.serviceIds.length) throw new Error('Debe seleccionar un servicio');
      if (!formData.date) throw new Error('Debe seleccionar una fecha');
      if (!formData.time) throw new Error('Debe seleccionar una hora');

      const selectedId = formData.serviceIds[0];
      const svc = services.find(s => s.id === selectedId);
      if (!svc) throw new Error('Servicio no encontrado');

      cart.addItem({
        id: svc.id,
        name: svc.name,
        price: svc.price,
        duration: svc.estimated_duration || svc.duration || 60,
        image: resolveImage(svc),
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        appointmentNotes: formData.notes,
        ownerName: formData.userName,
        ownerEmail: formData.userEmail,
        ownerPhone: formData.userPhone,
        petName: formData.petName,
        petBreed: formData.petBreed,
        petAge: formData.petAge,
      }, 1);

      setSuccess('Servicio agregado al carro.');
      setTimeout(() => { window.location.href = '/carrito'; }, 1000);
    } catch (err) {
      setError(err?.message || 'No se pudo agregar al carro.');
    } finally {
      setLoading(false);
    }
  };

  const selectedServices = services.filter(s => formData.serviceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  return (
    <main>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div className="text-start">
            <h1 className="h2 fw-bold mb-1">Reservar Cita</h1>
            <p className="lead text-muted mb-0">Reserva el mejor cuidado para tu mascota</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Información de la Reserva
                </h5>
              </div>
              <div className="card-body">
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
                  {/* Información del Cliente */}
                  <div className="mb-4">
                    <h6 className="fw-bold">Información del Cliente</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="userName" className="form-label">Nombre</label>
                        <input type="text" className="form-control" id="userName" name="userName" value={formData.userName} onChange={handleInputChange} placeholder="Tu nombre" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="userEmail" className="form-label">Correo</label>
                        <input type="email" className="form-control" id="userEmail" name="userEmail" value={formData.userEmail} onChange={handleInputChange} placeholder="tu@correo.com" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="userPhone" className="form-label">Teléfono</label>
                        <input type="text" className="form-control" id="userPhone" name="userPhone" value={formData.userPhone} onChange={handleInputChange} placeholder="+56 9 xxxx xxxx" />
                      </div>
                    </div>
                  </div>

                  {/* Información de la Mascota */}
                  <div className="mb-4">
                    <h6 className="fw-bold">Información de la Mascota</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="petName" className="form-label">Nombre de la mascota</label>
                        <input type="text" className="form-control" id="petName" name="petName" value={formData.petName} onChange={handleInputChange} placeholder="Ej. Max" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="petBreed" className="form-label">Raza</label>
                        <input type="text" className="form-control" id="petBreed" name="petBreed" value={formData.petBreed} onChange={handleInputChange} placeholder="Ej. Labrador" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="petAge" className="form-label">Edad</label>
                        <select className="form-select" id="petAge" name="petAge" value={formData.petAge} onChange={handleInputChange}>
                          <option value="">Seleccione un rango</option>
                          <option value="Cachorro">Cachorro (0–1 año)</option>
                          <option value="Joven">Joven (1–7 años)</option>
                          <option value="Adulto">Adulto (7+ años)</option>
                        </select>
                        <div className="form-text">Cachorro 0–1, Joven 1–7, Adulto 7+ años.</div>
                      </div>
                    </div>
                  </div>

                  {/* Servicios */}
                  <div className="mb-3">
                    <label htmlFor="serviceIds" className="form-label">Servicios</label>
                    <select id="serviceIds" className="form-select" value={formData.serviceIds[0] || ''} onChange={handleServiceSelect}>
                      <option value="">Selecciona un servicio</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - ${Number(s.price || 0).toLocaleString('es-CL')} ({s.estimated_duration || s.duration || 60} min)</option>
                      ))}
                    </select>
                    <div className="form-text">Puedes seleccionar un sólo servicio.</div>
                  </div>

                  {/* Fecha y hora */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="date" className="form-label">Fecha</label>
                      <input type="date" className="form-control" id="date" name="date" value={formData.date} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="time" className="form-label">Hora</label>
                      <select className="form-select" id="time" name="time" value={formData.time} onChange={handleInputChange}>
                        <option value="">Selecciona una hora</option>
                        {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Notas */}
                  <div className="mb-4">
                    <label htmlFor="notes" className="form-label">Notas Adicionales</label>
                    <textarea className="form-control" id="notes" name="notes" rows="3" value={formData.notes} onChange={handleInputChange} placeholder="Información adicional sobre tu mascota o preferencias especiales..."></textarea>
                  </div>

                  {/* Botón de envío */}
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Procesando...
                        </>
                      ) : (
                        <>Agregar al carro</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Resumen lateral */}
          <div className="col-lg-4">
            {selectedServices.length > 0 ? (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Resumen de la Reserva
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-3">
                    {selectedServices.map(s => (
                      <li key={s.id} className="d-flex align-items-center mb-3">
                        <img src={resolveImage(s)} alt={s.name} width="56" height="56" className="me-3 rounded" />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">{s.name}</span>
                            <strong className="text-primary">${Number(s.price || 0).toLocaleString('es-CL')}</strong>
                          </div>
                          <small className="text-muted">{s.estimated_duration || s.duration || 60} min</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span>Total</span>
                    <strong className="text-primary">${Number(totalPrice || 0).toLocaleString('es-CL')}</strong>
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <a href="/servicios" className="btn btn-outline-primary">Volver a servicios</a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Resumen</h6>
                  <p className="text-muted mb-3">Selecciona un servicio para ver el resumen aquí.</p>
                  <div className="d-flex justify-content-between">
                    <span>Total</span>
                    <strong className="text-primary">
                      {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(totalPrice)}
                    </strong>
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <a href="/servicios" className="btn btn-outline-primary">Volver a servicios</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Reservas;