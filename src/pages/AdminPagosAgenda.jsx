import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationAPI, reservationServiceAPI, serviceAPI, userAPI, petAPI, handleAPIError } from '../utils/api';

const AdminPagosAgenda = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(true);

  const [reservations, setReservations] = useState([]);
  const [links, setLinks] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);

  // Protección básica: solo admin
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

  // Cargar datos reales desde Xano
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [resResv, resLinks, resServ, resUsers, resPets] = await Promise.all([
          reservationAPI.getAllReservations(),
          reservationServiceAPI.getAllReservationServices(),
          serviceAPI.getAllServices(),
          userAPI.getAllUsers({ limit: 200 }),
          petAPI.getAllPets(),
        ]);
        setReservations(Array.isArray(resResv.data) ? resResv.data : []);
        setLinks(Array.isArray(resLinks.data) ? resLinks.data : []);
        setServices(Array.isArray(resServ.data) ? resServ.data : []);
        setUsers(Array.isArray(resUsers.data) ? resUsers.data : []);
        setPets(Array.isArray(resPets.data) ? resPets.data : []);
      } catch (err) {
        const info = handleAPIError(err);
        setError(info.message || 'No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Índices rápidos
  const servicesMap = useMemo(() => {
    const m = new Map();
    services.forEach(s => m.set(s.id, s));
    return m;
  }, [services]);

  const usersMap = useMemo(() => {
    const m = new Map();
    users.forEach(u => m.set(u.id, u));
    return m;
  }, [users]);

  const petsMap = useMemo(() => {
    const m = new Map();
    pets.forEach(p => m.set(p.id, p));
    return m;
  }, [pets]);

  // Construir filas visibles
  const rows = useMemo(() => {
    return reservations.map(r => {
      const rLinks = links.filter(l => l.reservation_id === r.id);
      const names = rLinks.map(l => servicesMap.get(l.service_id)?.name || `Servicio #${l.service_id}`);
      const total = rLinks.reduce((sum, l) => sum + (Number(servicesMap.get(l.service_id)?.price) || 0), 0);
      const cliente = usersMap.get(r.user_id)?.name || `Usuario #${r.user_id}`;
      const mascota = r.pet_id ? (petsMap.get(r.pet_id)?.name || `Mascota #${r.pet_id}`) : '—';
      return {
        id: r.id,
        cliente,
        mascota,
        servicios: names,
        monto: total,
        creado: r.created_at || r.date || new Date().toISOString(),
        estado: r.status || 'agendado',
        raw: r,
      };
    });
  }, [reservations, links, servicesMap, usersMap, petsMap]);

  const visibles = useMemo(() => {
    return soloPendientes ? rows.filter(it => (it.estado || '').toLowerCase() === 'agendado') : rows;
  }, [rows, soloPendientes]);

  // Acciones admin
  const actualizarEstado = async (reservationId, nuevoEstado) => {
    setError('');
    try {
      await reservationAPI.updateReservation(reservationId, { status: nuevoEstado });
      setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: nuevoEstado } : r));
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message || 'No se pudo actualizar el estado.');
    }
  };

  const aceptarReserva = (id) => actualizarEstado(id, 'aceptado');
  const rechazarReserva = (id) => actualizarEstado(id, 'rechazado');

  const badgeFor = (estado) => {
    const e = (estado || '').toLowerCase();
    switch (e) {
      case 'agendado': return <span className="badge bg-warning text-dark">Agendado</span>;
      case 'aceptado': return <span className="badge bg-success">Aceptado</span>;
      case 'rechazado': return <span className="badge bg-danger">Rechazado</span>;
      default: return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  return (
    <main className="container py-4">
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 mb-1">Pagos / Agenda</h1>
          <p className="text-muted mb-0">Reservas reales desde Xano. Acepta o rechaza citas.</p>
        </div>
        <div className="form-check form-switch">
          <input
            id="soloPendientes"
            className="form-check-input"
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="soloPendientes">
            Ver solo agendadas
          </label>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="card shadow-sm admin-tile">
        <div className="card-body">
          {loading ? (
            <div className="py-4 text-center text-muted">
              <span className="spinner-border me-2" role="status" aria-hidden="true"></span>
              Cargando reservas...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Mascota</th>
                    <th>Servicios</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No hay reservas para mostrar.
                      </td>
                    </tr>
                  )}
                  {visibles.map((it) => (
                    <tr key={it.id}>
                      <td className="text-nowrap">{it.id}</td>
                      <td>{it.cliente}</td>
                      <td>{it.mascota}</td>
                      <td>
                        {it.servicios.length ? (
                          <ul className="mb-0 small">
                            {it.servicios.map((name, idx) => (
                              <li key={idx}>{name}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-nowrap">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(it.monto || 0)}
                      </td>
                      <td className="text-nowrap">
                        {it.raw?.date ? new Date(it.raw.date).toLocaleDateString('es-CL') : new Date(it.creado).toLocaleDateString('es-CL')}
                        {it.raw?.time ? ` ${it.raw.time}` : ''}
                      </td>
                      <td>{badgeFor(it.estado)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => aceptarReserva(it.id)}
                            disabled={(it.estado || '').toLowerCase() !== 'agendado'}
                            title="Aceptar y confirmar"
                          >
                            Aceptar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => rechazarReserva(it.id)}
                            disabled={(it.estado || '').toLowerCase() !== 'agendado'}
                            title="Rechazar cita"
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminPagosAgenda;