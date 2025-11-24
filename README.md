# PeluPet

Proyecto frontend React + Vite para agendamiento de servicios de grooming de mascotas. Incluye catálogo de servicios, detalle, carrito y flujo de reservas con estado, perfil de usuario y paneles administrativos básicos.

## Descripción General
- Catálogo de servicios con imágenes, precio y duración.
- Detalle de servicio con galería y botón para reservar.
- Carrito con confirmación de compra simulada y creación de reservas.
- Mis Reservas: lista de reservas del usuario con estado (Aceptada/Rechazada) y opción de cancelar.
- Administración: gestión de servicios, usuarios y agenda/pagos.
- Integración con backend Xano mediante proxy en desarrollo.

## Instalación y Ejecución
1. Requisitos:
   - Node.js 18+ y npm.
2. Instalación:
   - `npm install`
3. Entorno (opcional para producción):
   - Crear `.env.local` con:
     - `VITE_XANO_BASE_URL_GENERAL=<URL del grupo General de Xano>`
     - `VITE_XANO_BASE_URL_AUTH=<URL del grupo Auth de Xano>`
   - En desarrollo, el proyecto usa proxy automático a Xano definido en `vite.config.js`:
     - `/xano-general` → `VITE_XANO_BASE_URL_GENERAL` (o fallback incluido)
     - `/xano-auth` → `VITE_XANO_BASE_URL_AUTH` (o fallback incluido)
4. Ejecutar en desarrollo:
   - `npm run dev`
   - Abrir `http://localhost:5175/` (o el puerto que indique Vite)
5. Construir para producción:
   - `npm run build`
   - `npm run preview` (opcional)

## Backend Utilizado
- Backend: Xano.
- Se consumen endpoints del grupo General y Auth.
- Autenticación por token Bearer almacenado en `localStorage`.
- Manejo de errores y 401 con redirección a login (interceptor Axios).

## Usuarios de Prueba
- Admin (dummy):
  - Email: `admin@example.com`
  - Password: `Admin123!`
- Cliente (dummy):
  - Email: `cliente@example.com`
  - Password: `Cliente123!`

Notas:
- Si no existen en tu instancia de Xano, créalos manualmente o usa el flujo de registro y luego promueve el rol en backend.

## Rutas / Endpoints Utilizados (Xano)
- Servicios (`serviceAPI`):
  - `GET /service` — listar servicios
  - `GET /service/:id` — obtener servicio
  - `POST /service` — crear servicio (acepta `FormData` para imagen)
  - `PATCH /service/:id` — actualizar servicio
  - `DELETE /service/:id` — eliminar servicio
- Reservas (`reservationAPI`):
  - `GET /reservation` — listar reservas
  - `GET /reservation?user_id=:id` — listar reservas por usuario
  - `POST /reservation` — crear reserva
  - `PATCH /reservation/:id` — actualizar estado (ej. `aceptada`/`rechazada`)
  - `DELETE /reservation/:id` — cancelar reserva
- Relación reserva-servicio (`reservationServiceAPI`):
  - `GET /reservation_service` — listar vínculos
  - `POST /reservation_service` — vincular servicio a reserva
  - `PATCH /reservation_service/:id` — actualizar vínculo
  - `DELETE /reservation_service/:id` — eliminar vínculo
- Mascotas (`petAPI`):
  - `GET /pet` — listar mascotas
  - `GET /pet/:id` — obtener mascota
  - `POST /pet` — crear mascota
  - `PATCH /pet/:id` — actualizar mascota
  - `DELETE /pet/:id` — eliminar mascota
- Upload de imágenes (`uploadAPI`):
  - `POST /upload/image` — subir imágenes (`images` o `content[]`)
- Autenticación (`authAPI`):
  - `POST /auth/login` — iniciar sesión
  - `POST /auth/signup` — registro
  - `GET /auth/me` — perfil actual

## Rutas del Frontend
- `/` — Home
- `/servicios` — Catálogo de servicios
- `/servicios/:id` — Detalle de servicio
- `/reservas` — Selección y agendamiento
- `/carrito` — Carrito de compra y confirmación
- `/mis-reservas` — Reservas del usuario
- `/login` — Login/Registro
- `/admin/*` — Paneles administrativos

## Notas Técnicas
- Stack: React + Vite, Axios, Bootstrap/Tailwind según páginas.
- Proxy Vite habilitado para desarrollo (ver `vite.config.js`).
- Manejo de sesión y token en `localStorage` (`utils/api.js`).
