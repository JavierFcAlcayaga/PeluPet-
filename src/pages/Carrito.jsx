import React, { useEffect, useState } from 'react';
import { cart } from '../utils/cart';
import { reservationAPI, reservationServiceAPI, petAPI, handleAPIError } from '../utils/api';

const Carrito = () => {
  const [items, setItems] = useState(cart.getCart());
  const [total, setTotal] = useState(cart.getTotal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const refresh = () => {
      setItems(cart.getCart());
      setTotal(cart.getTotal());
    };
    refresh();
    window.addEventListener('cart:updated', refresh);
    return () => window.removeEventListener('cart:updated', refresh);
  }, []);

  const resolveItemImage = (item) => {
    const imgCandidate = item?.image;
    const url = typeof imgCandidate === 'string' ? imgCandidate : (imgCandidate?.url || imgCandidate?.image_url || imgCandidate?.image);
    return url || '/img/CorteBanio.jpeg';
  };

  const handleQuantity = (id, q) => {
    cart.setQuantity(id, q);
    setSuccess('Cantidad actualizada.');
  };

  const handleRemove = (id) => {
    cart.removeItem(id);
    setSuccess('Servicio eliminado del carrito.');
  };

  const handleClear = () => {
    cart.clearCart();
    setSuccess('Carrito vaciado.');
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } })();
      if (!currentUser?.id) throw new Error('Debes iniciar sesión para confirmar reservas.');
      if (!items.length) throw new Error('Tu carrito está vacío.');

      for (const item of items) {
        try {
          let petId = null;
          if (item.petName) {
            try {
              const petRes = await petAPI.createPet({
                name: item.petName,
                breed: item.petBreed,
                age: item.petAge,
                user_id: currentUser.id,
              });
              petId = petRes?.data?.id || null;
            } catch (e) {}
          }

          const reservationRes = await reservationAPI.createReservation({
            user_id: currentUser.id,
            date: item.appointmentDate,
            time: item.appointmentTime,
            notes: item.appointmentNotes || '',
            pet_id: petId || undefined,
            status: 'aceptada',
            // Datos del cliente para facilitar visualización en admin
            owner_name: currentUser.name || item.ownerName || '',
            owner_email: currentUser.email || item.ownerEmail || '',
            owner_phone: currentUser.phone || item.ownerPhone || '',
            user_name: currentUser.name || '',
            user_email: currentUser.email || '',
            user_phone: currentUser.phone || '',
          });
          const reservation = reservationRes?.data;

          

          if (reservation?.id && item.id) {
            try {
              await reservationServiceAPI.createReservationService({
                reservation_id: reservation.id,
                service_id: item.id,
              });
            } catch {}
          }

          // Guardar pista local de mascota para fallback en Mis Reservas
          try {
            localStorage.setItem(`reservation_pet_hint_${reservation?.id}`, JSON.stringify({
              petId: petId || null,
              petName: item.petName || '',
              petBreed: item.petBreed || '',
              petAge: item.petAge || '',
            }));
          } catch {}
        } catch (itemErr) {
          console.warn('Error procesando item del carrito:', item, itemErr);
        }
      }

      cart.clearCart();
      setSuccess('Compra simulada con éxito');
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message || 'Error al confirmar tus reservas.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main>
        <div className="container py-5">
          <h1 className="mb-4">Carrito</h1>
          <div className="alert alert-info">Tu carrito está vacío.</div>
          <a href="/servicios" className="btn btn-primary">Ver servicios</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Carrito</h1>
          <button className="btn btn-outline-danger" onClick={handleClear}>
            Vaciar carrito
          </button>
        </div>

        {showInfo && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            <i className="bi bi-credit-card me-2"></i>
            Al pagar y confirmar, se simulará la redirección a tu medio de pago. El estado de tu cita estará en Mis Reservas.
            <button type="button" className="btn-close" onClick={() => setShowInfo(false)}></button>
          </div>
        )}

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
            <div className="mt-2">
              <a href="/mis-reservas" className="btn btn-sm btn-primary">Ir a Mis Reservas</a>
            </div>
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        <div className="row">
          <div className="col-md-8">
            <ul className="list-group">
              {items.map((item) => (
                <li key={item.id} className="list-group-item d-flex align-items-center">
                  <img src={resolveItemImage(item)} alt={item.name} width="60" height="60" className="me-3 rounded" />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>{item.name}</strong>
                      <span className="text-primary">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(item.price || 0)}
                      </span>
                    </div>
                    <small className="text-muted">{item.duration || 60} min</small>
                    {item.appointmentDate && item.appointmentTime && (
                      <div className="small text-muted mt-1">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(item.appointmentDate).toLocaleDateString('es-CL')} · {item.appointmentTime}
                      </div>
                    )}
                  </div>
                  <div className="ms-3">
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      style={{ width: '90px' }}
                      value={item.quantity || 1}
                      onChange={(e) => handleQuantity(item.id, e.target.value)}
                    />
                  </div>
                  <button className="btn btn-sm btn-outline-secondary ms-3" onClick={() => handleRemove(item.id)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Resumen</h5>
                <p className="card-text d-flex justify-content-between">
                  <span>Total</span>
                  <strong className="text-primary">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(total)}
                  </strong>
                </p>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
                    {loading ? 'Procesando...' : 'Pagar y confirmar reservas'}
                  </button>
                  <button className="btn btn-outline-primary" onClick={() => window.location.href = '/servicios'}>Agregar más</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Carrito;