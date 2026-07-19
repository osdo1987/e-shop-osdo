# E-Shop - Inventario Completo de Funcionalidades

> Documento de referencia para futuras sesiones de desarrollo.
> Última actualización: 2026-07-19

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Flask 3.0.2 (Python 3.11) |
| ORM | Flask-SQLAlchemy 3.1.1 |
| DB | PostgreSQL 15 |
| Migraciones | Flask-Migrate 4.0.7 (Alembic) |
| Auth | Flask-JWT-Extended 4.6.0 (JWT, 24hr expiry) |
| Schemas | Marshmallow 3.20.2 + marshmallow-sqlalchemy |
| API Docs | Flasgger 0.9.7.1 (Swagger UI en `/apidocs`) |
| Real-time | Flask-SocketIO 5.3.6 + gevent |
| Email | Flask-Mail 0.9.1 |
| Frontend | React 18 + Vite + Material UI |
| Tema | Light/Dark mode (persistido en localStorage) |
| Producción | Docker + Nginx (reverse proxy) + Gunicorn + gevent-websocket |

---

## Base de Datos (10 modelos)

### User (`app/models/user.py`)
- `id`, `email` (unique), `password_hash`, `role` (SUPERADMIN/MANAGER/STAFF), `store_id` (FK nullable), `last_login`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`
- Métodos: `set_password()`, `check_password()`

### Store (`app/models/store.py`)
- `id`, `slug` (unique), `name`, `whatsapp`, `logo_url` (Text), `business_type` (store/restaurant), `address`, `schedule`, `created_at`, `updated_at`
- Cascada: users, categories, products, orders, invoices, cash_sessions

### Category (`app/models/category.py`)
- `id`, `name`, `store_id` (FK), `created_at`, `updated_at`
- Cascada: products

### Product (`app/models/product.py`)
- `id`, `name`, `description`, `price`, `promo_price`, `purchase_price`, `image_url` (Text), `stock`, `sizes` (JSON string), `toppings_config` (JSON string), `category_id` (FK), `store_id` (FK), `created_at`, `updated_at`

### Order (`app/models/order.py`)
- `id`, `store_id` (FK), `customer_name`, `customer_phone`, `total_price`, `status` (PENDIENTE/CONFIRMADO/EN_PREPARACION/EN_CAMINO/ENTREGADO/CANCELADO), `delivery_address`, `customer_notes`, `seller_notes`, `estimated_delivery`, `tracking_token` (unique, indexed), `origin` (WEB/LOCAL), `payment_method` (EFECTIVO/TARJETA/TRANSFERENCIA/OTRO), `cash_register_session_id` (FK nullable), `created_at`, `updated_at`
- Relaciones: items, status_history, store, cash_session

### OrderItem (`app/models/order.py`)
- `id`, `order_id` (FK), `product_id` (FK nullable), `product_name`, `quantity`, `price`, `selected_size`, `selected_toppings` (JSON), `extra_price`

### OrderStatusHistory (`app/models/order.py`)
- `id`, `order_id` (FK), `old_status`, `new_status`, `changed_by`, `notes`, `created_at`

### CashRegisterSession (`app/models/cash_register.py`)
- `id`, `store_id` (FK), `opened_by_id` (FK), `opened_at`, `closed_at`, `opening_balance`, `closing_balance_real`, `closing_balance_expected`, `cash_sales`, `card_sales`, `transfer_sales`, `status` (ABIERTA/CERRADA), `notes`

### Invoice (`app/models/invoice.py`)
- `id`, `store_id` (FK), `order_id` (FK unique), `invoice_number` (unique, formato FAC-{store_id}-{seq:05d}), `customer_name`, `customer_document`, `subtotal`, `tax`, `total`, `payment_method`, `created_at`

---

## Endpoints API (34 endpoints)

### Auth (`/api/auth`) — `app/routes/auth_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/login` | No | Público | Login, retorna JWT con claims (role, storeId, storeSlug) |
| POST | `/register-seller` | JWT | SUPERADMIN | Crear tienda + usuario MANAGER |
| POST | `/register-staff` | JWT | SUPERADMIN/MANAGER | Crear usuario STAFF para la tienda |
| GET | `/staff` | JWT | SUPERADMIN/MANAGER | Listar staff de la tienda |
| DELETE | `/staff/<user_id>` | JWT | SUPERADMIN/MANAGER | Eliminar staff |
| PUT | `/users/<user_id>/email` | JWT | SUPERADMIN | Cambiar email de usuario |
| GET | `/me` | JWT | Cualquiera | Obtener perfil del usuario actual |
| POST | `/forgot-password` | No | Público | Generar token de reset, enviar email |
| POST | `/reset-password` | No | Público | Resetear contraseña con token (60min expiry) |
| POST | `/change-password` | JWT | Cualquiera | Cambiar contraseña (requiere actual) |

### Stores (`/api/stores`) — `app/routes/store_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | JWT | SUPERADMIN | Listar todas las tiendas |
| GET | `/<store_id>` | JWT | Cualquiera | Obtener tienda por ID |
| GET | `/public/<slug>` | No | Público | Catálogo público (tienda + categorías + productos) |
| POST | `/` | JWT | SUPERADMIN | Crear tienda |
| PUT | `/<store_id>` | JWT | SUPERADMIN/MANAGER/STAFF | Actualizar tienda (STAFF solo whatsapp+logo) |
| GET | `/metrics` | JWT | SUPERADMIN/MANAGER | Métricas: pedidos, ingresos, estados, por período |
| DELETE | `/<store_id>` | JWT | SUPERADMIN | Eliminar tienda (cascade) |

### Products (`/api/products`) — `app/routes/product_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | JWT | Cualquiera | Listar productos (filtro opcional category_id) |
| GET | `/<product_id>` | JWT | Cualquiera | Obtener producto por ID |
| POST | `/` | JWT | SUPERADMIN/MANAGER | Crear producto (acepta JSON o multipart con image) |
| PUT | `/<product_id>` | JWT | SUPERADMIN/MANAGER | Actualizar producto (acepta JSON o multipart) |
| DELETE | `/<product_id>` | JWT | SUPERADMIN/MANAGER | Eliminar producto |

### Orders (`/api/orders`) — `app/routes/order_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/public` | No | Público | Crear pedido desde catálogo (reserva stock, genera tracking_token, factura automática si es LOCAL) |
| GET | `/public/track/<token>` | No | Público | Rastrear pedido por token |
| GET | `/` | JWT | Cualquiera | Listar pedidos de la tienda |
| PUT | `/<order_id>/status` | JWT | Cualquiera | Cambiar estado (valida transiciones, ajusta stock) |
| PUT | `/<order_id>/notes` | JWT | Cualquiera | Actualizar notas del vendedor |
| PUT | `/<order_id>/estimated-delivery` | JWT | Cualquiera | Actualizar tiempo estimado |
| GET | `/<order_id>/history` | JWT | Cualquiera | Historial de cambios de estado |

### Categories (`/api/categories`) — `app/routes/category_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | JWT | Cualquiera | Listar categorías de la tienda |
| GET | `/<category_id>` | JWT | Cualquiera | Obtener categoría por ID |
| POST | `/` | JWT | SUPERADMIN/MANAGER | Crear categoría |
| PUT | `/<category_id>` | JWT | SUPERADMIN/MANAGER | Actualizar categoría |
| DELETE | `/<category_id>` | JWT | SUPERADMIN/MANAGER | Eliminar categoría (cascade) |

### Cash Register (`/api/cash-register`) — `app/routes/cash_register_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/session/active` | JWT | Cualquiera | Obtener sesión ABIERTA activa |
| POST | `/session/open` | JWT | SUPERADMIN/MANAGER | Abrir sesión (previene duplicados) |
| POST | `/session/close` | JWT | SUPERADMIN/MANAGER | Cerrar sesión (calcula balance esperado) |
| GET | `/sessions` | JWT | Cualquiera | Historial de sesiones |

### Invoices (`/api/invoices`) — `app/routes/invoice_routes.py`
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | JWT | Cualquiera | Listar facturas de la tienda |
| GET | `/<invoice_id>` | JWT | Cualquiera | Obtener factura por ID |
| POST | `/order/<order_id>` | JWT | SUPERADMIN/MANAGER | Generar factura para un pedido |
| GET | `/order/<order_id>` | JWT | Cualquiera | Obtener factura de un pedido |

---

## Lógica de Negocio Clave

### Roles y Permisos
- **SUPERADMIN**: Acceso total. Gestiona tiendas, usuarios, productos, todo.
- **MANAGER**: Gestiona su tienda. Productos, pedidos, caja, facturas, configuración.
- **STAFF**: Solo POS y pedidos. No puede crear/eliminar productos ni ver caja/facturas.

### Sistema de Pedidos
- Estados: PENDIENTE → CONFIRMADO → EN_PREPARACION → EN_CAMINO → ENTREGADO (o CANCELADO desde cualquiera)
- Transiciones válidas definidas en `STATUS_TRANSITIONS` (`app/models/order.py:60`)
- Reserva de stock al crear pedido (con `SELECT ... FOR UPDATE` para concurrencia)
- Ajuste de stock al cancelar (devuelve stock)
- Tracking público vía token UUID (`/track/<token>`)
- Factura automática al crear pedido con `origin=LOCAL` (POS)

### Sistema de Caja
- Sesiones ABIERTA/CERRADA por tienda
- Solo una sesión ABIERTA por tienda a la vez
- Al cerrar: calcula balance esperado (apertura + ventas efectivo)
- Registra ventas por método de pago (efectivo, tarjeta, transferencia)

### Sistema de Imágenes (actual)
- **Productos**: Archivos subidos a `uploads/`, nombrados con SHA-256, guardados en `products.image_url`
- **Logos**: Base64 data URL guardado directamente en `stores.logo_url`
- Servidos via Flask `send_from_directory` en `/uploads/<filename>`
- Proxy: Vite (`/uploads` → localhost:5002) y Nginx (`/uploads` → api:5000)

### Toppings (Restaurantes)
- `toppings_config` en Product: JSON con grupos de toppings (nombre, requerido, min, max, opciones con nombre y precio)
- `selected_toppings` en OrderItem: JSON con las selecciones del cliente
- `extra_price` en OrderItem: suma de precios de toppings seleccionados

### Tallas (Productos con variantes)
- `sizes` en Product: JSON array con objetos `{name, price, stock}`
- Stock por talla en el campo `sizes` del producto
- `selected_size` en OrderItem

---

## Frontend (18 páginas)

| Ruta | Página | Acceso | Archivo |
|------|--------|--------|---------|
| `/` | Home (landing) | Público | `Home.jsx` |
| `/login` | Login | Público | `Login.jsx` |
| `/forgot-password` | Recuperar contraseña | Público | `ForgotPassword.jsx` |
| `/reset-password` | Resetear contraseña | Público | `ResetPassword.jsx` |
| `/admin/change-password` | Cambiar contraseña | Autenticado | `ChangePassword.jsx` |
| `/admin/dashboard` | Estadísticas | MANAGER+ | `StatsDashboard.jsx` |
| `/admin` | Productos (grid/lista) | MANAGER+ | `Dashboard.jsx` |
| `/admin/products/new` | Nuevo producto | MANAGER+ | `ProductForm.jsx` |
| `/admin/products/edit/:id` | Editar producto | MANAGER+ | `ProductForm.jsx` |
| `/admin/categories` | Categorías | MANAGER+ | `Categories.jsx` |
| `/admin/orders` | Gestión de pedidos | Autenticado | `Orders.jsx` |
| `/admin/pos` | Punto de venta | Autenticado | `POS.jsx` |
| `/admin/cash-register` | Caja | MANAGER+ | `CashRegister.jsx` |
| `/admin/invoices` | Facturas | MANAGER+ | `Invoices.jsx` |
| `/admin/settings` | Configuración tienda | MANAGER+ | `Settings.jsx` |
| `/admin/super` | Gestión de tiendas | SUPERADMIN | `SuperAdmin.jsx` |
| `/track/:token` | Rastreo de pedido | Público | `OrderTracking.jsx` |
| `/:slug` | Catálogo público | Público | `Catalog.jsx` |

### Componentes Reutilizables
| Componente | Archivo | Función |
|------------|---------|---------|
| AdminLayout | `AdminLayout.jsx` | Sidebar + AppBar, adaptable por rol, responsive |
| Toast/ToastProvider/useToast | `Toast.jsx` | Notificaciones globales |
| ConfirmModal | `ConfirmModal.jsx` | Diálogo de confirmación |
| StatCard | `StatCard.jsx` | Tarjeta de estadística animada |
| Skeleton/TableSkeleton/GridSkeleton | `Skeleton.jsx` | Estados de carga |
| Pagination | `Pagination.jsx` | Paginación con primer/último |

### Socket.IO (Real-time)
- Servidor emite: `product_created`, `product_updated`, `product_deleted`, `order_created`, `order_updated`
- Cliente escucha: `order_created`, `order_updated` (en Orders.jsx)
- Conexión: `SocketContext.jsx` con 5 intentos de reconexión

---

## Infraestructura

### Producción (2 VMs en Oracle Cloud)

**VM 1 — Base de datos:**
- Oracle Linux / Ubuntu en Oracle Cloud
- Docker con PostgreSQL 15
- Volumen Docker para persistencia de datos (`/var/lib/postgresql/data`)
- Puerto expuesto para que la VM de la app se conecte

**VM 2 — Aplicación:**
- Clona el repo desde Git
- Ejecuta `docker-compose.prod.yml`
- Servicios Docker: API Flask + Frontend (React build) + Nginx
- Nginx: reverse proxy para `/`, `/api`, `/socket.io/`, `/apidocs`
- Gunicorn con gevent-websocket worker
- Dominio: `eshop.osdosoft.com`

**Flujo de deploy:**
1. `git pull` en la VM de la app
2. `docker-compose -f docker-compose.prod.yml up -d --build`
3. La DB remota ejecuta migraciones via `flask db upgrade` en el entrypoint

### Desarrollo (local)
- `docker-compose.yml`: Postgres 15 (puerto 5435) + API Flask (puerto 5002)
- Vite proxy: `/api` → localhost:5002, `/uploads` → localhost:5002, `/socket.io/` → localhost:5002
- `entrypoint.sh`: `flask db upgrade && python run.py`

### Variables de Entorno (`.env.example`)
`FLASK_APP`, `FLASK_ENV`, `DATABASE_URL`, `JWT_SECRET_KEY`, `SECRET_KEY`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER`, `FRONTEND_URL`

---

## Datos de Prueba (Seed Scripts)

| Script | Crea |
|--------|------|
| `seed.py` | 1 SUPERADMIN, 3 tiendas, 3 MANAGERs, 9 categorías, 47 productos (imágenes Unsplash) |
| `seed_restaurant.py` | 1 restaurante, 1 MANAGER, 5 categorías, 24 productos con toppings_config |
| `seed_campo_burguer.py` | Datos adicionales para hamburguesería |
| `seed_licores.py` | Datos adicionales para licorería |

---

## Migraciones de BD (9)

| Migración | Descripción |
|-----------|-------------|
| `8ff993019ef4` | Agregar reset_token y reset_token_expiry a User |
| `a1b2c3d4e5f6` | Cambiar image_url y logo_url de VARCHAR(500) a TEXT |
| `b05e674416c2` | Crear tablas orders y order_items |
| `b4c5d6e7f8a9` | Agregar business_type, address, schedule a Store |
| `c3d4e5f6a7b8` | Agregar purchase_price a Product |
| `c5d6e7f8a9b0` | Agregar tracking_token, estimated_delivery, notes, origin, payment_method a Order |
| `e6f7a8b9c0d1` | Agregar last_login a User |
| `f1a2b3c4d5e6` | Agregar toppings_config a Product, selected_toppings/selected_size/extra_price a OrderItem |
| `f7bbaa8a7a48` | Agregar sizes a Product, crear cash_register_sessions, unificar sistema de stock |

---

## Archivos del Proyecto

```
e-shop/
├── app/
│   ├── __init__.py          # App factory, blueprints, /uploads route
│   ├── config.py            # Configuración
│   ├── extensions.py        # SQLAlchemy, JWT, Mail, SocketIO, etc.
│   ├── models/              # 7 archivos: user, store, category, product, order, cash_register, invoice
│   ├── routes/              # 7 blueprints: auth, store, product, order, category, cash_register, invoice
│   ├── schemas/             # 6 archivos: user, store, product, order, category, cash_register, invoice
│   └── services/            # 7 servicios: auth, store, product, order, category, cash_register, invoice
├── frontend/
│   └── src/
│       ├── App.jsx          # Rutas y auth
│       ├── main.jsx         # Entry point, theme, socket
│       ├── theme.js         # Tema MUI light/dark
│       ├── fetchInterceptor.js  # Interceptor 401
│       ├── components/      # AdminLayout, Toast, ConfirmModal, StatCard, Skeleton, Pagination
│       ├── context/         # SocketContext
│       ├── hooks/           # useDebounce
│       └── pages/           # 18 páginas
├── migrations/versions/     # 9 migraciones
├── nginx/                   # default.conf, host-proxy.conf
├── uploads/                 # Imágenes de productos (SHA-256 nombradas)
├── seed.py                  # Datos de prueba principal
├── seed_restaurant.py       # Datos restaurante
├── seed_campo_burguer.py    # Datos hamburguesería
├── seed_licores.py          # Datos licorería
├── migrate_data.py          # Migración SQLite → PostgreSQL
├── Dockerfile               # Dev
├── Dockerfile.prod          # Producción
├── docker-compose.yml       # Dev
├── docker-compose.prod.yml  # Producción
├── entrypoint.sh            # Dev entrypoint
├── entrypoint.prod.sh       # Prod entrypoint
└── requirements.txt         # 19 dependencias Python
```
