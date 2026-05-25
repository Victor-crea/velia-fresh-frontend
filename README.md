# 🥩Carnicería Evelia

> E-commerce de carnes artesanales. Plataforma full-stack con frontend React, backend Node.js/Express y bases de datos relacionales y no relacionales.

---

## Índice

- [Demo y acceso](#demo-y-acceso)
- [Arquitectura general](#arquitectura-general)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Bases de datos](#bases-de-datos)
- [Rutas del frontend](#rutas-del-frontend)
- [API REST — endpoints](#api-rest--endpoints)
- [Autenticación y roles](#autenticación-y-roles)
- [Configuración y variables de entorno](#configuración-y-variables-de-entorno)
- [Levantar el proyecto en local](#levantar-el-proyecto-en-local)
- [Despliegue en producción](#despliegue-en-producción)

---

## Demo y acceso

| Entorno | URL |
|---|---|
| Frontend | `https://<tu-proyecto>.lovable.app` |
| Backend local | `http://localhost:4000` |
| Supabase dashboard | `https://supabase.com/dashboard/project/zicxfphkrcvoxnvkqosv` |

### Usuarios de prueba

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| **Admin** | admin@evelia.com | (la que registraste) | Panel `/admin`, todos los endpoints |
| **Cliente** | cliente@evelia.com | (la que registraste) | Checkout, perfil, historial |
| **Anónimo** | — | — | Catálogo, carrito (localStorage) |

> Para crear un admin: regístrate normalmente y luego en Supabase → SQL Editor ejecuta:
> ```sql
> INSERT INTO user_roles (user_id, role)
> VALUES ('<tu-user-id>', 'admin');
> ```

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│           React 18 + Vite + TypeScript + shadcn/ui              │
│              Lovable preview / Netlify / Vercel                 │
└──────────────┬──────────────────────────────┬───────────────────┘
               │ Supabase JS (auth + datos)   │ fetch() → API REST
               ▼                              ▼
┌──────────────────────┐       ┌──────────────────────────────────┐
│    SUPABASE           │       │       BACKEND (Node.js)          │
│  Auth (JWT)          │       │  Express + TypeScript            │
│  PostgreSQL          │       │  Puerto 4000                     │
│  Row Level Security  │       │  Railway / Render                │
└──────────────────────┘       └──────────┬───────────────────────┘
         │                                │
         │ 9 tablas SQL                   │ Mongoose
         ▼                                ▼
┌──────────────────────┐       ┌──────────────────────────────────┐
│   PostgreSQL          │       │          MongoDB Atlas           │
│   (Supabase Cloud)   │       │   3 colecciones NoSQL            │
└──────────────────────┘       └──────────────────────────────────┘
```

**Flujo de autenticación:**
1. El frontend llama a `supabase.auth.signInWithPassword()` directamente.
2. Supabase devuelve un `access_token` (JWT firmado).
3. El frontend incluye ese token en cada request al backend: `Authorization: Bearer <token>`.
4. El middleware `authenticateToken` del backend verifica el JWT con Supabase y adjunta el usuario al request.

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Tipado estático |
| Vite | 5.4 | Bundler y dev server |
| TailwindCSS | 3.4 | Estilos utilitarios |
| shadcn/ui | latest | Componentes UI (Radix) |
| React Router | 6.30 | Ruteo SPA |
| TanStack Query | 5.83 | Fetching y caché |
| Supabase JS | 2.105 | Auth + acceso directo a BD |
| React Hook Form + Zod | latest | Formularios y validación |

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4.x | Framework HTTP |
| TypeScript | 5.x | Tipado estático |
| Supabase JS | 2.x | Acceso a PostgreSQL (service role) |
| Mongoose | 8.x | ODM para MongoDB |
| Zod | 3.x | Validación de inputs |
| jsonwebtoken | 9.x | Verificación de JWT |
| ts-node-dev | 2.x | Desarrollo con hot reload |

### Bases de datos
| BD | Proveedor | Uso |
|---|---|---|
| PostgreSQL | Supabase Cloud | Datos estructurados del negocio |
| MongoDB | Atlas (free M0) | Logs, analytics, notificaciones |

---

## Estructura del repositorio

```
velia-fresh/
├── src/                          # Frontend React
│   ├── pages/                    # Rutas de la app
│   │   ├── Index.tsx             # Landing / Home
│   │   ├── Catalog.tsx           # Catálogo de productos
│   │   ├── Cart.tsx              # Carrito de compras
│   │   ├── Checkout.tsx          # Proceso de compra
│   │   ├── Profile.tsx           # Perfil y pedidos del usuario
│   │   ├── Admin.tsx             # Panel de administración
│   │   └── Auth.tsx              # Login / Registro
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Estado de sesión global
│   │   └── CartContext.tsx       # Estado del carrito (localStorage)
│   ├── hooks/
│   │   └── useProducts.ts        # Hook para cargar productos de Supabase
│   ├── components/
│   │   ├── layout/               # Navbar, Footer, Layout wrapper
│   │   ├── ProductCard.tsx       # Tarjeta de producto
│   │   ├── ProtectedRoute.tsx    # Guard de rutas privadas
│   │   └── ui/                   # Componentes shadcn/ui
│   └── integrations/supabase/   # Cliente Supabase + tipos generados
│
├── backend/                      # Backend Node.js (independiente)
│   ├── src/
│   │   ├── routes/               # Un archivo por recurso
│   │   ├── controllers/          # Lógica de cada endpoint (con JSDoc)
│   │   ├── middlewares/
│   │   │   ├── authenticateToken.ts
│   │   │   ├── requireAdmin.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/             # Lógica de negocio desacoplada
│   │   ├── models/               # Tipos TS + modelos Mongoose
│   │   └── lib/
│   │       ├── supabaseAdmin.ts  # createClient con service_role_key
│   │       └── mongoClient.ts    # Conexión Mongoose singleton
│   ├── migrations/
│   │   └── 001_new_tables.sql    # 4 tablas nuevas + RLS + seeds
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── public/
├── package.json                  # Dependencias del frontend
├── vite.config.ts
└── .env                          # Variables del frontend
```

---

## Bases de datos

### PostgreSQL — 9 tablas (Supabase)

#### Tablas existentes (creadas por Supabase Auth / frontend)

| # | Tabla | Descripción |
|---|---|---|
| 1 | `products` | Catálogo de carnes: nombre, precio, categoría, stock, imagen |
| 2 | `orders` | Pedidos: usuario, total, estado, dirección de envío |
| 3 | `order_items` | Líneas de pedido: producto, cantidad, precio unitario |
| 4 | `profiles` | Datos del usuario: nombre, teléfono, dirección |
| 5 | `user_roles` | Rol por usuario: `admin` o `cliente` |

#### Tablas nuevas (migrations/001_new_tables.sql)

| # | Tabla | Descripción |
|---|---|---|
| 6 | `categories` | Categorías de productos con emoji y orden de visualización |
| 7 | `shipping_zones` | Zonas de cobertura con costo base y mínimo para envío gratis |
| 8 | `promotions` | Códigos de descuento: porcentaje o monto fijo, vigencia, usos |
| 9 | `product_reviews` | Reseñas verificadas (solo usuarios que compraron el producto) |

**Enums definidos:**
```sql
-- Estado del pedido
order_status: 'pendiente' | 'preparando' | 'entregado' | 'cancelado'

-- Categorías de producto
product_category: 'Res' | 'Cerdo' | 'Pollo' | 'Cordero' | 'Embutidos'

-- Roles de usuario
app_role: 'admin' | 'cliente'
```

**Row Level Security activo:** cada usuario solo puede leer y modificar sus propios registros. Los admins tienen acceso total via `service_role_key` desde el backend.

---

### MongoDB — 3 colecciones (Atlas)

| # | Colección | Descripción |
|---|---|---|
| 10 | `AuditLog` | Registro de acciones: login, CRUD de productos, cambios de estado |
| 11 | `ProductView` | Analytics de visitas por producto (TTL 90 días) |
| 12 | `Notification` | Notificaciones al usuario: nuevo pedido, cambio de estado |

**Índices:**
```js
// AuditLog
{ user_id: 1, timestamp: -1 }
{ entity: 1, entity_id: 1 }
{ action: 1 }

// ProductView
{ product_id: 1, viewed_at: -1 }
{ user_id: 1 }
{ viewed_at: 1 }  // TTL: expireAfterSeconds: 7776000 (90 días)

// Notification
{ user_id: 1, read: 1, created_at: -1 }
```

---

## Rutas del frontend

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/` | `Index.tsx` | Público | Landing con hero, features y productos destacados |
| `/catalogo` | `Catalog.tsx` | Público | Catálogo completo con filtros y búsqueda |
| `/carrito` | `Cart.tsx` | Público | Carrito (persiste en localStorage) |
| `/checkout` | `Checkout.tsx` | 🔒 Auth | Datos de envío y confirmación de pedido |
| `/perfil` | `Profile.tsx` | 🔒 Auth | Datos personales e historial de pedidos |
| `/admin` | `Admin.tsx` | 🔒 Admin | Dashboard, CRUD de productos, pedidos, usuarios |
| `/login` | `Auth.tsx` | Público | Inicio de sesión |
| `/registro` | `Auth.tsx` | Público | Registro de cuenta |
| `*` | `NotFound.tsx` | Público | 404 |

**Guards implementados:**
- `ProtectedRoute` → redirige a `/login` si no hay sesión.
- `ProtectedRoute adminOnly` → redirige a `/perfil` si el usuario no es admin.

---

## API REST — endpoints

Base URL local: `http://localhost:4000`

Formato de respuesta uniforme:
```json
// Éxito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "mensaje legible", "code": "ERROR_CODE" }
```

### Auth — `/api/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | — | Crea usuario en Supabase Auth + perfil |
| POST | `/login` | — | Devuelve access_token JWT |
| POST | `/logout` | 🔒 | Invalida sesión |
| GET | `/me` | 🔒 | Datos del usuario autenticado |

### Productos — `/api/products`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Lista. Filtros: `?category=Res&search=&featured=true` |
| GET | `/:id` | — | Detalle de un producto |
| POST | `/` | 🔒 Admin | Crear producto (guarda AuditLog) |
| PUT | `/:id` | 🔒 Admin | Editar producto (guarda AuditLog) |
| DELETE | `/:id` | 🔒 Admin | Eliminar producto (guarda AuditLog) |

### Pedidos — `/api/orders`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | 🔒 | Crear pedido + order_items (transacción atómica) |
| GET | `/my` | 🔒 | Pedidos del usuario autenticado |
| GET | `/` | 🔒 Admin | Todos los pedidos |
| GET | `/:id` | 🔒 | Detalle (solo el dueño o admin) |
| PATCH | `/:id/status` | 🔒 Admin | Cambiar estado + notificación al cliente |

### Perfiles — `/api/users`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/profile` | 🔒 | Perfil propio |
| PUT | `/profile` | 🔒 | Actualizar nombre, teléfono, dirección |
| GET | `/` | 🔒 Admin | Lista todos los usuarios con su rol |

### Categorías — `/api/categories`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Lista categorías activas |
| POST | `/` | 🔒 Admin | Crear categoría |
| PUT | `/:id` | 🔒 Admin | Editar categoría |
| DELETE | `/:id` | 🔒 Admin | Eliminar categoría |

### Zonas de envío — `/api/shipping`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | — | Lista zonas activas con costos |
| POST | `/` | 🔒 Admin | Crear zona |
| PUT | `/:id` | 🔒 Admin | Editar zona |

### Promociones — `/api/promotions`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/validate/:code` | 🔒 | Valida código y devuelve descuento calculado |
| GET | `/` | 🔒 Admin | Lista todos los códigos |
| POST | `/` | 🔒 Admin | Crear promoción |
| PUT | `/:id` | 🔒 Admin | Editar promoción |
| PATCH | `/:id/toggle` | 🔒 Admin | Activar / desactivar |

### Reseñas — `/api/reviews`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | 🔒 | Crear reseña (verifica compra previa) |
| GET | `/product/:productId` | — | Reseñas aprobadas de un producto |
| GET | `/pending` | 🔒 Admin | Reseñas pendientes de aprobación |
| PATCH | `/:id/approve` | 🔒 Admin | Aprobar reseña |

### Analytics — `/api/analytics`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/view` | — | Registra visita a un producto |
| GET | `/popular` | 🔒 Admin | Top 10 productos más vistos (últimos 30 días) |
| GET | `/audit` | 🔒 Admin | Últimos 100 registros de AuditLog |

### Notificaciones — `/api/notifications`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/my` | 🔒 | Notificaciones del usuario (últimas 50) |
| PATCH | `/:id/read` | 🔒 | Marcar como leída |
| GET | `/unread-count` | 🔒 | Cantidad de no leídas (para badge) |

### Dashboard — `/api/dashboard`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/stats` | 🔒 Admin | Ingresos, pedidos por estado, clientes, top productos |

---

## Autenticación y roles

El sistema usa **Supabase Auth** como proveedor de identidad. Los tokens JWT se generan en Supabase y son verificados por el backend.

### Flujo completo

```
1. Usuario → POST /api/auth/login
2. Backend → supabase.auth.signInWithPassword()
3. Supabase → { access_token, refresh_token, user }
4. Backend → devuelve access_token al cliente
5. Cliente → guarda token (AuthContext / localStorage)
6. Cliente → requests al backend con header:
             Authorization: Bearer <access_token>
7. Backend (middleware) → supabase.auth.getUser(token)
8. Supabase → confirma usuario válido
9. Backend → adjunta req.user = { id, email, role }
10. Controller → ejecuta lógica de negocio
```

### Middleware `authenticateToken`
- Extrae el `Bearer token` del header `Authorization`.
- Verifica con `supabase.auth.getUser(token)`.
- Devuelve `401 Unauthorized` si el token es inválido o expirado.

### Middleware `requireAdmin`
- Consulta la tabla `user_roles` en Supabase.
- Verifica que el usuario tenga el rol `admin`.
- Devuelve `403 Forbidden` si no es admin.

### Roles disponibles

| Rol | Descripción | Acceso |
|---|---|---|
| Anónimo | Sin cuenta | Catálogo, carrito, ver reseñas |
| `cliente` | Usuario registrado | Checkout, perfil, mis pedidos, crear reseñas |
| `admin` | Administrador | Todo lo anterior + panel admin, CRUD productos, gestión de pedidos y usuarios |

---

## Configuración y variables de entorno

### Frontend (`/.env`)
```env
VITE_SUPABASE_URL=https://zicxfphkrcvoxnvkqosv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...   # anon key (pública, es segura)
VITE_API_URL=http://localhost:4000           # URL del backend (si conectas el frontend al backend)
```

### Backend (`/backend/.env`)
```env
PORT=4000
SUPABASE_URL=https://zicxfphkrcvoxnvkqosv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...       # ⚠️ SECRETO — nunca en el frontend
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/velia?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173           # En prod: tu dominio de Vercel/Netlify
```

**¿Dónde consigo cada variable?**

| Variable | Dónde encontrarla |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` secret key |
| `MONGODB_URI` | MongoDB Atlas → tu cluster → Connect → Drivers → copia la URI |

---

## Levantar el proyecto en local

### Requisitos previos
- Node.js 18 o superior
- npm 9+
- Cuenta en [Supabase](https://supabase.com) (proyecto ya creado)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (cluster M0 gratuito)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/velia-fresh.git
cd velia-fresh
```

### 2. Frontend
```bash
npm install
cp .env.example .env      # Rellena VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev               # → http://localhost:5173
```

### 3. Migración SQL
1. Abre [Supabase → SQL Editor](https://supabase.com/dashboard/project/zicxfphkrcvoxnvkqosv/sql)
2. Copia el contenido de `backend/migrations/001_new_tables.sql`
3. Pégalo en el editor y haz clic en **Run**

### 4. Backend
```bash
cd backend
npm install
cp .env.example .env      # Rellena todas las variables
npm run dev               # → http://localhost:4000
```

### 5. Verificar que todo funciona
```bash
# Debe devolver { success: true, data: [...] }
curl http://localhost:4000/api/products

# Salud del servidor
curl http://localhost:4000/health
```

### Scripts disponibles

**Frontend:**
```bash
npm run dev        # Dev server (Vite)
npm run build      # Build de producción
npm run preview    # Preview del build
npm run test       # Tests con Vitest
npm run lint       # ESLint
```

**Backend:**
```bash
npm run dev        # ts-node-dev con hot reload
npm run build      # Compila TypeScript → dist/
npm run start      # Corre el build compilado
```

---

## Despliegue en producción

### Frontend → Vercel o Netlify
1. Conecta tu repo de GitHub a Vercel/Netlify.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Agrega las variables de entorno en el dashboard.

### Backend → Railway o Render
1. Crea un nuevo proyecto en [Railway](https://railway.app) o [Render](https://render.com).
2. Conecta el repo y selecciona la carpeta `/backend` como raíz.
3. Start command: `npm run start`
4. Agrega las variables de entorno.
5. Copia la URL pública generada (ej: `https://velia-backend.up.railway.app`).
6. Actualiza `VITE_API_URL` en el frontend con esa URL.
7. Actualiza `CORS_ORIGIN` en el backend con la URL del frontend.

### MongoDB Atlas
- Ya está en la nube. Solo asegúrate de que en **Network Access** esté configurado `0.0.0.0/0` (permitir todas las IPs) o la IP específica de tu servidor.

---

## Resumen del proyecto

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | React 18 + Vite + Supabase JS | ✅ Funcional en Lovable |
| Backend | Node.js + Express + TypeScript | ✅ Listo para local / Railway |
| BD Relacional | PostgreSQL (Supabase) — 9 tablas | ✅ Con RLS y seeds |
| BD No Relacional | MongoDB Atlas — 3 colecciones | ✅ Con índices y TTL |
| Auth | Supabase Auth (JWT) | ✅ Con roles admin/cliente |
| Admin panel | Integrado en el frontend `/admin` | ✅ Dashboard + CRUD |

---

*Carnicería Evelia © 2024 — Proyecto académico full-stack*