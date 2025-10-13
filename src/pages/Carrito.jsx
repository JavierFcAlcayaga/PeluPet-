import React, { useEffect, useState } from 'react';
import { cart } from '../utils/cart';

const Carrito = () => {
  const [items, setItems] = useState(cart.getCart());
  const [total, setTotal] = useState(cart.getTotal());

  useEffect(() => {
    const refresh = () => {
      setItems(cart.getCart());
      setTotal(cart.getTotal());
    };
    refresh();
    window.addEventListener('cart:updated', refresh);
    return () => window.removeEventListener('cart:updated', refresh);
  }, []);

  const handleQuantity = (id, q) => {
    cart.setQuantity(id, q);
  };

  const handleRemove = (id) => {
    cart.removeItem(id);
  };

  const handleClear = () => {
    cart.clearCart();
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

        <div className="row">
          <div className="col-md-8">
            <ul className="list-group">
              {items.map((item) => (
                <li key={item.id} className="list-group-item d-flex align-items-center">
                  <img src={item.image || '/img/CorteBanio.jpeg'} alt={item.name} width="60" height="60" className="me-3 rounded" />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>{item.name}</strong>
                      <span className="text-primary">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(item.price || 0)}
                      </span>
                    </div>
                    <small className="text-muted">{item.duration || 60} min</small>
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
                  <a href="/reservas" className="btn btn-primary">Reservar servicios</a>
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