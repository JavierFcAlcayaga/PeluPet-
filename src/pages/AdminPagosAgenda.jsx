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
  const [resolvedUserNames, setResolvedUserNames] = useState(new Map());
  const [resolvedPetNames, setResolvedPetNames] = useState(new Map());

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
    users.forEach(u => {
      m.set(u.id, u);
      m.set(String(u.id), u);
    });
    return m;
  }, [users]);

  const petsMap = useMemo(() => {
    const m = new Map();
    pets.forEach(p => m.set(p.id, p));
    return m;
  }, [pets]);

  // Fallback: resolver nombres puntualmente por ID cuando no vienen en listas
  useEffect(() => {
    const pendingUserIds = new Set();
    const pendingPetIds = new Set();

    reservations.forEach((r) => {
      const uidRaw = r.user_id ?? r.user ?? r.owner_id ?? r.customer_id ?? r.userId ?? r.userID ?? null;
      const uid = (uidRaw && typeof uidRaw === 'object' ? uidRaw.id : uidRaw);
      if (uid != null && !usersMap.get(uid) && !usersMap.get(String(uid)) && !resolvedUserNames.has(String(uid))) {
        pendingUserIds.add(uid);
      }

      const pidRaw = r.pet_id ?? r.pet ?? null;
      const pid = (pidRaw && typeof pidRaw === 'object' ? pidRaw.id : pidRaw);
      if (pid != null && !petsMap.get(pid) && !resolvedPetNames.has(String(pid))) {
        pendingPetIds.add(pid);
      }
    });

    if (pendingUserIds.size === 0 && pendingPetIds.size === 0) return;

    (async () => {
      try {
        await Promise.all(Array.from(pendingUserIds).map(async (id) => {
          try {
            const res = await userAPI.getUser(id);
            const u = res?.data || {};
            const name = u.name || u.full_name || u.email || `Usuario #${id}`;
            setResolvedUserNames((prev) => {
              const next = new Map(prev);
              next.set(String(id), name);
              return next;
            });
          } catch {
            setResolvedUserNames((prev) => {
              const next = new Map(prev);
              next.set(String(id), `Usuario #${id}`);
              return next;
            });
          }
        }));

        await Promise.all(Array.from(pendingPetIds).map(async (id) => {
          try {
            const res = await petAPI.getPet(id);
            const p = res?.data || {};
            const name = p.name || `Mascota #${id}`;
            setResolvedPetNames((prev) => {
              const next = new Map(prev);
              next.set(String(id), name);
              return next;
            });
          } catch {
            setResolvedPetNames((prev) => {
              const next = new Map(prev);
              next.set(String(id), `Mascota #${id}`);
              return next;
            });
          }
        }));
      } catch (e) {
        // silencioso: cualquier error aquí no bloquea la UI
      }
    })();
  }, [reservations, usersMap, petsMap, resolvedUserNames, resolvedPetNames]);

  // Construir filas visibles
  const rows = useMemo(() => {
    return reservations.map(r => {
      const rLinks = links.filter(l => l.reservation_id === r.id);
      const names = rLinks.map(l => servicesMap.get(l.service_id)?.name || `Servicio #${l.service_id}`);
      const total = rLinks.reduce((sum, l) => sum + (Number(servicesMap.get(l.service_id)?.price) || 0), 0);

      // Detectar id de usuario desde múltiples variantes, incluyendo campo relación numérico 'user'
      const uidRaw = r.user_id ?? r.user ?? r.owner_id ?? r.customer_id ?? r.userId ?? r.userID ?? null;
      const uid = (uidRaw && typeof uidRaw === 'object' ? uidRaw.id : uidRaw);
      const userObj = (uid != null ? (usersMap.get(uid) || usersMap.get(String(uid))) : null) || r.user || r.owner || r.customer || null;
      const clienteOverride = uid ? (resolvedUserNames.get(String(uid)) || null) : null;
      const cliente = (
        clienteOverride ||
        (userObj && typeof userObj === 'object' ? (userObj.name || userObj.full_name || userObj.email) : null) ||
        r.owner_name || r.user_name || r.client_name || r.customer_name || r.name ||
        r.user_email || r.owner_email || r.email ||
        (uid ? `Usuario #${uid}` : '—')
      );

      // Detectar id de mascota desde múltiples variantes, incluyendo relación numérica 'pet'
      const pidRaw = r.pet_id ?? r.pet ?? null;
      const pid = (pidRaw && typeof pidRaw === 'object' ? pidRaw.id : pidRaw);
      const mascotaOverride = pid ? (resolvedPetNames.get(String(pid)) || null) : null;
      const mascota = mascotaOverride || r.pet_name || (pid ? (petsMap.get(pid)?.name || '—') : '—');

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
  }, [reservations, links, servicesMap, usersMap, petsMap, resolvedUserNames, resolvedPetNames]);

  const visibles = useMemo(() => {
     return soloPendientes
       ? rows.filter(it => ['aceptada','aceptado'].includes((it.estado || '').toLowerCase()))
       : rows;
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

  const aceptarReserva = (id) => actualizarEstado(id, 'aceptada');
  const rechazarReserva = (id) => actualizarEstado(id, 'rechazada');

  const badgeFor = (estado) => {
    const e = (estado || '').toLowerCase();
    switch (e) {
      case 'agendado':
      case 'pendiente':
        return <span className="badge bg-warning text-dark">Agendado</span>;
      case 'aceptado':
      case 'aceptada':
        return <span className="badge bg-success">Aceptada</span>;
      case 'rechazado':
      case 'rechazada':
        return <span className="badge bg-danger">Rechazada</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
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
            Ver solo confirmadas
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
                            className="btn btn-warning btn-sm"
                            onClick={() => aceptarReserva(it.id)}
                            title="Confirmar reserva"
                          >
                            Confirmar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => rechazarReserva(it.id)}
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