import React, { useEffect, useState } from 'react';
import { userAPI, handleAPIError } from '../utils/api';

const AdminUsuarios = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [rowSubmittingId, setRowSubmittingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      setUser(u);
    } catch {}
    fetchUsers();
  }, []);


  // NUEVO: estados para eliminación y modal de confirmación
  const [rowDeletingId, setRowDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const arrayFromObject = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    // Si el objeto parece ser un diccionario de usuarios {id: {...}, id2: {...}}
    const values = Object.values(obj);
    if (values.length && values.every((v) => v && typeof v === 'object' && (v.id || v.email || v.name))) {
      return values;
    }
    for (const v of values) {
      if (Array.isArray(v)) return v;
    }
    if (Array.isArray(obj?.data)) return obj.data;
    const dataVals = Object.values(obj?.data || {});
    if (dataVals.length && dataVals.every((v) => v && typeof v === 'object' && (v.id || v.email || v.name))) {
      return dataVals;
    }
    for (const v of dataVals) {
      if (Array.isArray(v)) return v;
    }
    return [];
  };

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.records)) return payload.records;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    // Intentar recuperar desde objetos tipo diccionario
    const dictVals = arrayFromObject(payload);
    return Array.isArray(dictVals) ? dictVals : [];
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAllUsers();
      const raw = res?.data;
      const data = normalizeList(raw);
      if (raw === null) {
        setError('El endpoint /user devolvió null. Por favor verifica el backend: debe retornar un arreglo ([], incluso si está vacío).');
      } else {
        setError('');
      }
      setUsers(data);
      console.log('[AdminUsuarios] GET /user status:', res?.status, 'typeof data:', typeof raw, 'keys:', raw && Object.keys(raw));
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      if (!createForm.name || !createForm.email || !createForm.password) {
        setError('Nombre, email y contraseña son obligatorios.');
        return;
      }
      const payload = {
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone,
        password: createForm.password,
        blocked: false,
      };
      const res = await userAPI.createUser(payload);
  
      // Intentar asegurar que el teléfono se persista aunque signup lo ignore
      if (createForm.phone) {
        try {
          const maybeUser = res?.data?.user || res?.data?.data || res?.data;
          const candidateId =
            (maybeUser && typeof maybeUser === 'object' ? maybeUser.id : undefined) ||
            res?.data?.user_id ||
            res?.data?.id ||
            (typeof res?.data === 'number' ? res?.data : undefined);
          console.log('[AdminUsuarios] Respuesta signup:', res?.data, 'candidateId:', candidateId);
          if (candidateId) {
            await userAPI.updateUser(candidateId, { phone: createForm.phone });
          } else {
            const listRes = await userAPI.getAllUsers();
            const list = normalizeList(listRes?.data);
            const match = list.find((u) => (u.email || '').toLowerCase() === createForm.email.toLowerCase());
            if (match?.id) {
              await userAPI.updateUser(match.id, { phone: createForm.phone });
            }
          }
        } catch (patchErr) {
          console.warn('[AdminUsuarios] No se pudo sincronizar teléfono tras signup:', patchErr);
        }
        // Verificar que el teléfono quedó persistido
        try {
          const verifyRes = await userAPI.getAllUsers();
          const verifyList = normalizeList(verifyRes?.data);
          const verifyMatch = verifyList.find((u) => (u.email || '').toLowerCase() === createForm.email.toLowerCase());
          console.log('[AdminUsuarios] Verificación post-signup teléfono:', verifyMatch);
          if (!verifyMatch?.phone) {
            setError('El teléfono no se guardó en el backend. Puedes editarlo manualmente o ajustar el endpoint para permitir actualizar el campo phone.');
          }
        } catch (verifyErr) {
          console.warn('[AdminUsuarios] Error verificando teléfono post-signup:', verifyErr);
        }
      }
  
      setCreateForm({ name: '', email: '', phone: '', password: '' });
      setSuccess('Usuario creado con éxito.');
      setTimeout(() => setSuccess(''), 3000);
      await fetchUsers();
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditStart = (u) => {
    setEditingId(u.id);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setRowSubmittingId(editingId);
    setError('');
    setSuccess('');
    try {
      await userAPI.updateUser(editingId, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      });
      await fetchUsers();
      handleCancelEdit();
      setSuccess('Usuario actualizado.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setRowSubmittingId(null);
    }
  };

  const toggleBlock = async (u) => {
    setRowSubmittingId(u.id);
    setError('');
    setSuccess('');
    try {
      const isActive = (u.status !== undefined ? u.status : (u.blocked !== undefined ? !u.blocked : true));
      const nextActive = !isActive;
      const payload = {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        status: nextActive,
      };
      if (u.role) payload.role = u.role;
      await userAPI.updateUser(u.id, payload);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: nextActive, blocked: !nextActive } : x)));
      setSuccess(nextActive ? 'Usuario desbloqueado.' : 'Usuario bloqueado.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setRowSubmittingId(null);
    }
  };

  const handleDelete = async (u) => {
    if (!u?.id) return;
    const ok = window.confirm(`¿Eliminar usuario "${u.name || u.email || u.id}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      setRowSubmittingId(u.id);
      await userAPI.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setEditingId((prev) => (prev === u.id ? null : prev));
      toast.success('Usuario eliminado');
    } catch (error) {
      const info = handleAPIError(error);
      console.error('Error al eliminar usuario:', info);
      toast.error(info.message || 'No se pudo eliminar el usuario');
    } finally {
      setRowSubmittingId(null);
    }
  };

  // NUEVO: abrir/cerrar modal de confirmación
  const openDeleteConfirm = (u) => {
    const isCurrentAdmin = user && (user.role || '').toLowerCase() === 'admin' && u?.id === user?.id;
    if (isCurrentAdmin) {
      setSuccess('');
      setError('No puedes eliminar tu usuario administrador actual.');
      return;
    }
    setConfirmDelete(u);
  };
  const closeDeleteConfirm = () => setConfirmDelete(null);
  
  // NUEVO: flujo de eliminación confirmado desde modal
  const handleDeleteConfirmed = async () => {
    const u = confirmDelete;
    const isCurrentAdmin = user && (user.role || '').toLowerCase() === 'admin' && u?.id === user?.id;
    if (!u?.id || isCurrentAdmin) return closeDeleteConfirm();
    setError('');
    setSuccess('');
    try {
      setRowDeletingId(u.id);
      await userAPI.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      setEditingId((prev) => (prev === u.id ? null : prev));
      setSuccess('Usuario eliminado.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message || 'No se pudo eliminar el usuario');
    } finally {
      setRowDeletingId(null);
      closeDeleteConfirm();
    }
  };

  if (!user || (user.role || '').toLowerCase() !== 'admin') {
    return (
      <main>
        <div className="container py-5">
          <div className="alert alert-warning">
            Acceso restringido. Debes ser administrador para gestionar usuarios.
          </div>
          <a href="/perfil" className="btn btn-outline-primary">Volver al perfil</a>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container py-5">
        <h1 className="mb-4">Administración de Usuarios</h1>
        {error && <div className="alert alert-warning">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Crear nuevo usuario</h5>
            <form onSubmit={handleCreate} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input name="name" value={createForm.name} onChange={handleCreateChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input name="email" type="email" value={createForm.email} onChange={handleCreateChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input name="phone" value={createForm.phone} onChange={handleCreateChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input name="password" type="password" value={createForm.password} onChange={handleCreateChange} className="form-control" required />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit" disabled={creating}>
                  {creating ? 'Guardando...' : 'Crear usuario'}
                 </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Listado</h5>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Buscar usuarios</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre, email o teléfono"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6 d-flex align-items-end justify-content-md-end mt-3 mt-md-0">
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setSortAsc((v) => !v)}>
                  <i className={`bi ${sortAsc ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'}`}></i> {sortAsc ? 'Ordenar A→Z' : 'Ordenar Z→A'}
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .slice()
                      .filter((u) => {
                        const q = searchTerm.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          (u.name || '').toLowerCase().includes(q) ||
                          (u.email || '').toLowerCase().includes(q) ||
                          (u.phone || '').toLowerCase().includes(q)
                        );
                      })
                      .sort((a, b) => {
                        const ax = (a.name || a.email || a.phone || '').toLowerCase();
                        const bx = (b.name || b.email || b.phone || '').toLowerCase();
                        if (ax < bx) return sortAsc ? -1 : 1;
                        if (ax > bx) return sortAsc ? 1 : -1;
                        return 0;
                      })
                      .map((u) => (
                        <tr key={u.id}>
                          <td>
                            {editingId === u.id ? (
                              <input name="name" value={editForm.name} onChange={handleEditChange} className="form-control form-control-sm" />
                            ) : (
                              u.name || '—'
                            )}
                          </td>
                          <td>
                            {editingId === u.id ? (
                              <input name="email" type="email" value={editForm.email} onChange={handleEditChange} className="form-control form-control-sm" />
                            ) : (
                              u.email || '—'
                            )}
                          </td>
                          <td>
                            {editingId === u.id ? (
                              <input name="phone" value={editForm.phone} onChange={handleEditChange} className="form-control form-control-sm" />
                            ) : (
                              u.phone || '—'
                            )}
                          </td>
                          <td>{(u.role || 'cliente')}</td>
                          <td>
                            {(() => {
                              const isActive = (u.status !== undefined ? u.status : (u.blocked !== undefined ? !u.blocked : true));
                              return isActive ? (
                                <span className="badge bg-success">Activo</span>
                              ) : (
                                <span className="badge bg-secondary">Inactivo</span>
                              );
                            })()}
                          </td>
                          <td className="text-end">
                            {editingId === u.id ? (
                              <div className="btn-group btn-group-sm">
                                 <button className="btn btn-success" onClick={handleUpdate} disabled={rowSubmittingId === u.id}>Guardar</button>
                                 <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={rowSubmittingId === u.id}>Cancelar</button>
                                 {rowSubmittingId === u.id && <span className="ms-2 text-muted">Guardando...</span>}
                               </div>
                            ) : (
                              <div className="btn-group btn-group-sm">
                                  <button className="btn btn-outline-primary" onClick={() => handleEditStart(u)} disabled={rowSubmittingId === u.id || rowDeletingId === u.id}>Editar</button>
                                  <button className="btn btn-outline-warning" onClick={() => toggleBlock(u)} disabled={rowSubmittingId === u.id || rowDeletingId === u.id}>
                                    {((u.status !== undefined ? u.status : (u.blocked !== undefined ? !u.blocked : true))) ? 'Bloquear' : 'Desbloquear'}
                                  </button>
                                  <button className="btn btn-outline-danger" onClick={() => openDeleteConfirm(u)} disabled={rowSubmittingId === u.id || rowDeletingId === u.id || ((user?.role || '').toLowerCase() === 'admin' && user?.id === u.id)}>Eliminar</button>
                                  {rowDeletingId === u.id ? (
                                    <span className="ms-2 text-muted">Eliminando</span>
                                  ) : (
                                    rowSubmittingId === u.id && <span className="ms-2 text-muted">Procesando...</span>
                                  )}
                                </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!users.length && !loading && !error && (
                  <div className="text-muted">No hay usuarios para mostrar.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmDelete && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          <div className="card shadow" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="card-body">
              <h5 className="card-title mb-2">Confirmar eliminación</h5>
              <p className="mb-4">Si estás seguro que deseas eliminar este usuario. Los cambios son permanentes.</p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={closeDeleteConfirm} disabled={rowDeletingId === confirmDelete.id}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleDeleteConfirmed} disabled={rowDeletingId === confirmDelete.id}>
                  {rowDeletingId === confirmDelete.id ? 'Eliminando' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsuarios;