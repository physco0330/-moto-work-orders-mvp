# Sistema de gestion de ordenes de trabajo para taller de motos

MVP full stack con `Node.js + Express + Sequelize + MySQL` en backend y `React + Vite + Axios + React Router` en frontend.

## Requisitos
- Node.js 18+.
- MySQL 8+.
- npm.

## Estructura
- `backend/`
- `frontend/`

## Instalacion
1. Crear la base de datos en MySQL.
2. Copiar `backend/.env.example` a `backend/.env` y completar credenciales.
3. Copiar `frontend/.env.example` a `frontend/.env` si quieres cambiar la URL de la API.
4. Instalar dependencias en cada carpeta.

```bash
cd backend
npm install
npm run migrate
npm run seed

cd ../frontend
npm install
```

## Datos de demostracion
Para cargar usuarios y ejemplos de taller:
```bash
cd backend
npm run seed
```

## Ejecucion
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Ejecucion con Docker
Si tienes Docker Desktop activo:
```bash
docker compose up -d --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- MySQL: `localhost:3307`

## Pruebas
```bash
cd backend
npm test
```

## Credenciales ADMIN
- Email: `admin@taller.com`
- Password: `Admin12345!`

## Notas de arquitectura
- Autenticacion con JWT y `bcrypt`.
- Middleware `auth` y `authorize(roles)`.
- Rate limiting aplicado a `/api/auth/login`.
- Transacciones para crear ordenes e items.
- Historial automatico de cambios de estado.
- Validaciones modeladas en Sequelize.

## Endpoints principales
- `POST /api/auth/login`
- `POST /api/auth/register` (ADMIN)
- `GET /api/auth/me`
- `POST /api/clients`
- `GET /api/clients?search=`
- `GET /api/clients/:id`
- `POST /api/bikes`
- `GET /api/bikes?plate=`
- `GET /api/bikes/:id`
- `POST /api/work-orders`
- `GET /api/work-orders?status=&plate=&page=&pageSize=`
- `GET /api/work-orders/:id`
- `PATCH /api/work-orders/:id/status`
- `POST /api/work-orders/:id/items`
- `DELETE /api/work-orders/items/:itemId`
- `GET /api/work-orders/:id/history?page=&pageSize=&userId=&startDate=&endDate=`
- `GET /api/work-orders/:id/transitions`
- `GET /api/users` (ADMIN)
- `POST /api/users` (ADMIN)
- `PATCH /api/users/:id` (ADMIN)

## Coleccion Postman
- Archivo incluido: `postman_collection.json`
- Variables: `baseUrl`, `token`
- Login guarda automaticamente el token para las demas peticiones.

## Funcionalidades Implementadas
| Módulo | Funcionalidad | Estado | Descripción |
|---|---|---:|---|
| Autenticación | Login JWT | Hecho | Inicio de sesión con token y expiración configurable. |
| Autenticación | Registro admin | Hecho | Alta de usuarios restringida a ADMIN. |
| Seguridad | Hash de contraseñas | Hecho | `bcrypt` con 10 salt rounds. |
| Seguridad | Rate limiting | Hecho | Protege el login contra fuerza bruta. |
| Clientes | CRUD base | Hecho | Alta, búsqueda y detalle. |
| Motos | CRUD base | Hecho | Alta, búsqueda por placa y detalle. |
| Ordenes | Crear y listar | Hecho | Ordenes con filtros y paginacion. |
| Ordenes | Cambio de estado | Hecho | Validacion de flujo y registro en historial. |
| Ordenes | Items | Hecho | Crear y eliminar items con recálculo de total. |
| Ordenes | Historial | Hecho | Linea de tiempo con paginacion y filtros opcionales. |
| Usuarios | Gestion admin | Hecho | Crear, activar/desactivar y cambiar rol. |
| Frontend | Login y proteccion | Hecho | Rutas protegidas y persistencia del token. |
| Frontend | Listado de ordenes | Hecho | Tabla, filtros y paginacion. |
| Frontend | Detalle de orden | Hecho | Tabs, cards, items, total e historial filtrable. |
| Frontend | Creacion rapida | Hecho | Alta de cliente y moto si no existen. |
| Calidad | Validaciones por request | Hecho | Joi con errores consistentes en body, params y query. |
| Calidad | Datos demo | Hecho | Seeder adicional con usuarios, motos, ordenes e items. |
| Calidad | Pruebas | Hecho | Jest y Supertest con cobertura base de dominio. |

## Funcionalidades Pendientes
| Módulo | Funcionalidad | Prioridad | Notas |
|---|---|---:|---|
| Ninguna | No aplica | Baja | MVP completo para el alcance solicitado. |
