# Carnicería Evelia — Backend API

REST API en **Node.js + Express + TypeScript** para la tienda online "Carnicería Evelia / Velia Fresh".

Persistencia híbrida:
- **PostgreSQL** (Supabase) → productos, pedidos, perfiles, categorías, zonas de envío, promociones, reseñas.
- **MongoDB** → audit logs, vistas de productos, notificaciones.

---

## Requisitos

- Node.js 18+
- Proyecto en [Supabase](https://supabase.com) con las 5 tablas base (`products`, `orders`, `order_items`, `profiles`, `user_roles`) ya creadas por el frontend.
- Cluster en [MongoDB Atlas](https://www.mongodb.com/atlas) (o MongoDB local).

---

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales reales
```

### Ejecutar migraciones SQL nuevas

Copia el contenido de `migrations/001_new_tables.sql` y ejecútalo en el **SQL Editor de Supabase** (o con `psql`). Crea las 4 tablas nuevas: `categories`, `shipping_zones`, `promotions`, `product_reviews` con sus RLS y seeds.

### Levantar en desarrollo

```bash
npm run dev
# → http://localhost:4000
```

### Build para producción

```bash
npm run build
npm start
```

---

## Conectar el frontend

En el frontend de Lovable, agrega a `.env`:

```
VITE_API_URL=http://localhost:4000/api
```

Y crea un cliente HTTP que envíe el `access_token` de Supabase en el header `Authorization: Bearer <token>`.

---

## Endpoints

Formato de respuesta:
- Éxito: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "...", "code": "..." }`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| **Auth** | | | |
| POST | `/api/auth/register` | — | Registra usuario + perfil |
| POST | `/api/auth/login` | — | Login (devuelve access_token) |
| POST | `/api/auth/logout` | auth | Cierra sesión |
| GET | `/api/auth/me` | auth | Datos del usuario actual |
| **Productos** | | | |
| GET | `/api/products` | — | Lista (`?category=&search=&featured=`) |
| GET | `/api/products/:id` | — | Detalle |
| POST | `/api/products` | admin | Crear |
| PUT | `/api/products/:id` | admin | Editar |
| DELETE | `/api/products/:id` | admin | Eliminar |
| **Pedidos** | | | |
| POST | `/api/orders` | auth | Crear pedido (transacción) |
| GET | `/api/orders/my` | auth | Mis pedidos |
| GET | `/api/orders` | admin | Todos los pedidos |
| GET | `/api/orders/:id` | auth | Detalle (propio o admin) |
| PATCH | `/api/orders/:id/status` | admin | Cambia estado |
| **Usuarios** | | | |
| GET | `/api/users/profile` | auth | Perfil propio |
| PUT | `/api/users/profile` | auth | Actualiza perfil |
| GET | `/api/users` | admin | Lista usuarios + rol |
| **Categorías** | | | |
| GET | `/api/categories` | — | Lista activas |
| POST | `/api/categories` | admin | Crear |
| PUT | `/api/categories/:id` | admin | Editar |
| DELETE | `/api/categories/:id` | admin | Eliminar |
| **Envíos** | | | |
| GET | `/api/shipping` | — | Zonas activas |
| POST | `/api/shipping` | admin | Crear |
| PUT | `/api/shipping/:id` | admin | Editar |
| **Promociones** | | | |
| GET | `/api/promotions/validate/:code` | auth | Valida y calcula descuento |
| GET | `/api/promotions` | admin | Lista |
| POST | `/api/promotions` | admin | Crear |
| PUT | `/api/promotions/:id` | admin | Editar |
| PATCH | `/api/promotions/:id/toggle` | admin | Activa/desactiva |
| **Reseñas** | | | |
| POST | `/api/reviews` | auth | Crear (debe haber comprado) |
| GET | `/api/reviews/product/:productId` | — | Reseñas aprobadas |
| GET | `/api/reviews/pending` | admin | Pendientes |
| PATCH | `/api/reviews/:id/approve` | admin | Aprobar |
| **Analytics (Mongo)** | | | |
| POST | `/api/analytics/view` | — | Registra vista |
| GET | `/api/analytics/popular` | admin | Top 10 (30 días) |
| GET | `/api/analytics/audit` | admin | Últimos 100 audit logs |
| **Notificaciones (Mongo)** | | | |
| GET | `/api/notifications/my` | auth | Últimas 50 |
| PATCH | `/api/notifications/:id/read` | auth | Marcar leída |
| GET | `/api/notifications/unread-count` | auth | Badge |
| **Dashboard** | | | |
| GET | `/api/dashboard/stats` | admin | Métricas globales |

---

## Estructura

```
backend/
├── src/
│   ├── routes/         Rutas por recurso
│   ├── controllers/    Handlers HTTP (con JSDoc)
│   ├── services/       Lógica de negocio
│   ├── middlewares/    auth, admin, errores
│   ├── models/         Tipos TS + modelos Mongoose
│   ├── lib/            supabaseAdmin, mongoClient
│   └── index.ts        Bootstrap Express
├── migrations/         SQL para Supabase
├── .env.example
├── package.json
└── tsconfig.json
```
