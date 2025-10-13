import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationAPI, reservationServiceAPI, serviceAPI, petAPI, handleAPIError } from '../utils/api';

const MisReservas = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr, timeStr) => {
    try {
      const date = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
      return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: timeStr ? 'short' : undefined,
      }).format(date);
    } catch {
      return `${dateStr || ''} ${timeStr || ''}`.trim();
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        if (!user?.id) {
          setError('Debes iniciar sesión para ver tus reservas.');
          setReservations([]);
          return;
        }
        const res = await reservationAPI.getUserReservations(user.id);
        const data = res?.data;
        const base = Array.isArray(data) ? data.map((item) => ({
          id: item.id ?? item.reservation_id ?? Math.random(),
          date: item.date ?? item.reservation_date ?? null,
          time: item.time ?? item.reservation_time ?? null,
          status: item.status ?? 'pendiente',
          notes: item.notes ?? '',
          serviceId: item.service?.id || item.service_id || null,
          serviceName: item.service?.name || item.service_name || null,
          // Asociación de mascota si existe en la reserva
          petId: item.pet?.id || item.pet_id || null,
          // Campos opcionales si el backend los tiene
          ownerName: item.owner_name || item.user_name || user.name || '',
          ownerEmail: item.owner_email || item.user_email || user.email || '',
          ownerPhone: item.owner_phone || item.user_phone || '',
          petName: (item.pet?.name) || item.pet_name || '',
          petBreed: (item.pet?.breed) || item.pet_breed || '',
          petAge: (item.pet?.age) || item.pet_age || '',
        })) : [];

        // Enlazar servicios a reservas
        let enriched = base;
        try {
          const linkRes = await reservationServiceAPI.getAllReservationServices();
          const links = Array.isArray(linkRes?.data) ? linkRes.data : [];
          const byReservation = new Map();
          links.forEach((ln) => {
            const rid = ln.reservation_id || ln.reservation?.id;
            const sid = ln.service_id || ln.service?.id;
            const key = (rid !== undefined && rid !== null) ? String(rid) : null;
            if (key && sid && !byReservation.has(key)) {
              byReservation.set(key, {
                id: sid,
                name: ln.service?.name || null,
                image: ln.service?.image || null,
                price: ln.service?.price,
                duration: ln.service?.estimated_duration ?? ln.service?.duration,
              });
            }
          });
          const uniqueServiceIds = Array.from(new Set(
            enriched
              .map(r => r.serviceId || byReservation.get(String(r.id))?.id)
              .filter(Boolean)
          ));
          const serviceMap = new Map();
          await Promise.all(uniqueServiceIds.map(async (sid) => {
            try {
              const sRes = await serviceAPI.getService(sid);
              const s = sRes?.data || null;
              if (s) serviceMap.set(sid, s);
            } catch {}
          }));
          enriched = enriched.map((r) => {
            const linkInfo = byReservation.get(String(r.id)) || null;
            const sid = r.serviceId || linkInfo?.id || null;
            const s = sid ? serviceMap.get(sid) : null;
            const image = s?.image ?? linkInfo?.image ?? null;
            const price = (s?.price ?? linkInfo?.price ?? r.price);
            const duration = (s?.estimated_duration ?? s?.duration ?? linkInfo?.duration ?? r.duration);
            return {
              ...r,
              serviceId: sid || r.serviceId,
              serviceName: r.serviceName || s?.name || linkInfo?.name || 'Servicio',
              serviceImage: image || null,
              servicePrice: price || 0,
              serviceDuration: duration || 60,
            };
          });
        } catch {}

        // Fallback local: si falta serviceId o serviceName, leer pista guardada
        try {
          enriched = enriched.map((r) => {
            if (r.serviceId && r.serviceName) return r;
            const hintRaw = localStorage.getItem(`reservation_hint_${r.id}`);
            if (!hintRaw) return r;
            try {
              const hint = JSON.parse(hintRaw);
              return {
                ...r,
                serviceId: r.serviceId || hint.serviceId || null,
                serviceName: r.serviceName || hint.serviceName || r.serviceName,
              };
            } catch {
              return r;
            }
          });
        } catch {}

        // Enlazar mascotas a reservas
        try {
          const uniquePetIds = Array.from(new Set(enriched.map(r => r.petId).filter(Boolean)));
          const petMap = new Map();
          await Promise.all(uniquePetIds.map(async (pid) => {
            try {
              const pRes = await petAPI.getPet(pid);
              const p = pRes?.data || null;
              if (p) petMap.set(pid, p);
            } catch {}
          }));
          enriched = enriched.map((r) => {
            const p = r.petId ? petMap.get(r.petId) : null;
            return {
              ...r,
              petName: r.petName || p?.name || '',
              petBreed: r.petBreed || p?.breed || '',
              petAge: r.petAge || p?.age || '',
            };
          });
        } catch {}

        setReservations(enriched);
        setError('');
      } catch (err) {
        const info = handleAPIError(err);
        setError(info.message || 'No se pudieron cargar tus reservas.');
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const buildImageSrc = (image) => {
    if (!image) return '/img/CorteBanio.jpeg';
    if (typeof image === 'string') return image;
    const directUrl = image?.url || image?.full_url || image?.download_url || image?.link || null;
    if (directUrl) return directUrl;
    const path = image?.path
      || image?.file?.path
      || image?.data?.path
      || image?.file_path
      || null;
    if (path) {
      const base = import.meta.env.DEV ? '/xano-general' : (import.meta.env.VITE_XANO_BASE_URL_GENERAL || '');
      return `${base}/file/${path}`;
    }
    return '/img/CorteBanio.jpeg';
  };

  const handleCancel = async (reservationId) => {
    const ok = window.confirm('¿Cancelar esta reserva? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await reservationAPI.cancelReservation(reservationId);
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message || 'No se pudo cancelar la reserva.');
    }
  };

  return (
    <main>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Mis Reservas</h1>
            <p className="text-muted mb-0">Visualiza tus reservas realizadas</p>
          </div>
          <Link to="/reservas" className="btn btn-outline-primary">
            <i className="bi bi-calendar-plus me-2"></i>
            Nueva reserva
          </Link>
        </div>

        {error && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-5">
            <p className="lead">Aún no tienes reservas.</p>
            <Link to="/reservas" className="btn btn-primary">Crear una reserva</Link>
          </div>
        ) : (
          <div className="row">
            {reservations.map((r) => (
              <div key={r.id} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <img src={buildImageSrc(r.serviceImage)} alt={r.serviceName || 'Servicio'} className="card-img-top" />
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary text-capitalize">{r.status}</span>
                    </div>
                    <h5 className="card-title mb-2">{r.serviceName || 'Reserva de servicio'}</h5>
                    <p className="card-text mb-2">
                      <i className="bi bi-calendar3 me-2"></i>
                      {formatDate(r.date, r.time)}
                    </p>
                    <div className="row g-2 mb-2">
                      <div className="col-12">
                        <small className="text-muted">Cliente</small>
                        <div>{r.ownerName || '—'}{r.ownerEmail ? ` · ${r.ownerEmail}` : ''}{r.ownerPhone ? ` · ${r.ownerPhone}` : ''}</div>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Mascota</small>
                        <div>
                          {r.petName || '—'}
                          {r.petBreed ? ` · ${r.petBreed}` : ''}
                          {r.petAge ? ` · ${r.petAge}` : ''}
                        </div>
                      </div>
                    </div>
                    {r.notes && (
                      <p className="text-muted">{r.notes}</p>
                    )}
                    <div className="mt-auto d-flex gap-2">
                      {r.serviceId && (
                        <Link to={`/servicios/${r.serviceId}`} className="btn btn-outline-primary btn-sm">Ver servicio</Link>
                      )}
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(r.id)}>
                        Cancelar reserva
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MisReservas;