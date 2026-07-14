# Descripción de Funcionalidades - E-Shop App

## 📋 Índice
1. [Visión General](#visión-general)
2. [Roles de Usuario](#roles-de-usuario)
3. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
   - [Autenticación y Gestión de Usuarios](#autenticación-y-gestión-de-usuarios)
   - [Gestión de Tiendas](#gestión-de-tiendas)
   - [Gestión de Productos](#gestión-de-productos)
   - [Gestión de Categorías](#gestión-de-categorías)
   - [Gestión de Pedidos](#gestión-de-pedidos)
   - [Catálogo Público](#catálogo-público)
   - [Dashboard y Métricas](#dashboard-y-métricas)
4. [Características Técnicas](#características-técnicas)

---

## Visión General

**E-Shop App** es una plataforma de gestión de tiendas y pedidos en línea. La aplicación permite a vendedores administrar sus productos, categorías y pedidos, mientras que los clientes pueden realizar compras a través de un catálogo público. Soporta diferentes tipos de negocio (tiendas generales y restaurantes).

### Stack Tecnológico
- **Backend**: Flask (Python) con SQLAlchemy ORM
- **Frontend**: React con Vite y Material-UI
- **Base de Datos**: PostgreSQL/MySQL (según configuración)
- **Autenticación**: JWT (JSON Web Tokens)
- **Tiempo Real**: Socket.IO para notificaciones en vivo
- **Despliegue**: Docker + Nginx

---

## Roles de Usuario

### 1. SUPERADMIN
- Acceso global a todas las tiendas del sistema
- Gestión completa de tiendas y vendedores
- Visualización de métricas globales
- Control total del sistema

### 2. SELLER (Vendedor)
- Administración de su propia tienda
- Gestión de productos y categorías
- Gestión de pedidos
- Visualización de métricas de su tienda
- Configuración de tienda (WhatsApp, logo)

---

## Módulos y Funcionalidades

### Autenticación y Gestión de Usuarios

#### Funcionalidades:
- **Login/Logout** con JWT
- **Registro de vendedores** (por SUPERADMIN)
  - Creación de usuario vendedor
  - Creación automática de tienda asociada
  - Configuración inicial de tienda
- **Recuperación de contraseña**:
  - Solicitud de reset por email
  - Token de recuperación con expiración
  - Cambio de contraseña con token
- **Cambio de contraseña** (usuario autenticado)
  - Validación de contraseña actual
  - Actualización de contraseña
- **Actualización de email** (SUPERADMIN)
  - Modificación de email de vendedores
  - Validación de unicidad
- **Perfil de usuario**:
  - Consulta de datos del usuario autenticado
  - Último login registrado
  - Información de tienda asociada

#### Endpoints principales:
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register-seller` - Registrar vendedor (SUPERADMIN)
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Resetear contraseña con token
- `POST /api/auth/change-password` - Cambiar contraseña (autenticado)
- `PUT /api/auth/users/<user_id>/email` - Actualizar email de vendedor (SUPERADMIN)

---

### Gestión de Tiendas

#### Funcionalidades:
- **CRUD de tiendas** (SUPERADMIN):
  - Crear tienda
  - Ver detalles de tienda
  - Actualizar información
  - Eliminar tienda
- **Configuración de tienda**:
  - Nombre de la tienda
  - Slug (URL-friendly, único)
  - Número de WhatsApp
  - Logo de la tienda
  - Dirección física
  - Horario de atención
  - Tipo de negocio (tienda o restaurante)
- **Actualización por vendedor** (SELLER):
  - Modificación de WhatsApp
  - Actualización de logo
  - Campos limitados por seguridad
- **Visualización pública** por slug:
  - Acceso sin autenticación
  - Información básica de la tienda
  - Categorías y productos disponibles
- **Métricas de tiendas** (SUPERADMIN):
  - Total de pedidos
  - Pedidos del día/semana/período
  - Ingresos totales y por período
  - Desglose por estado de pedidos
  - Último pedido
  - Último login del vendedor

#### Endpoints principales:
- `GET /api/stores` - Listar todas las tiendas (SUPERADMIN)
- `GET /api/stores/<id>` - Detalles de tienda
- `GET /api/stores/public/<slug>` - Información pública de tienda
- `POST /api/stores` - Crear tienda (SUPERADMIN)
- `PUT /api/stores/<id>` - Actualizar tienda
- `DELETE /api/stores/<id>` - Eliminar tienda (SUPERADMIN)
- `GET /api/stores/metrics` - Métricas de todas las tiendas (SUPERADMIN)

---

### Gestión de Productos

#### Funcionalidades:
- **CRUD de productos**:
  - Crear producto con todos sus datos
  - Ver detalles de producto
  - Actualizar información
  - Eliminar producto
- **Datos del producto**:
  - Nombre
  - Descripción detallada
  - Precio de venta
  - Precio promocional (opcional)
  - Precio de compra/costo (para cálculo de margen)
  - URL de imagen
  - Stock disponible
  - Tallas disponibles (texto)
  - Configuración de toppings/adiciones (JSON)
- **Gestión de stock**:
  - Control de inventario
  - Indicadores visuales de disponibilidad:
    - Sin stock
    - Stock bajo (< 5 unidades)
    - Disponible
- **Cálculo de margen**:
  - Margen de ganancia automático
  - Comparación precio venta vs costo
- **Filtrado y búsqueda**:
  - Por categoría
  - Por nombre/descripción
  - Por tienda
- **Notificaciones en tiempo real** (Socket.IO):
  - Producto creado
  - Producto actualizado
  - Producto eliminado

#### Endpoints principales:
- `GET /api/products` - Listar productos (por tienda)
- `GET /api/products/<id>` - Detalles de producto
- `POST /api/products` - Crear producto
- `PUT /api/products/<id>` - Actualizar producto
- `DELETE /api/products/<id>` - Eliminar producto

---

### Gestión de Categorías

#### Funcionalidades:
- **CRUD de categorías**:
  - Crear categoría
  - Ver categorías
  - Actualizar nombre
  - Eliminar categoría
- **Organización de productos**:
  - Asociación de productos a categorías
  - Filtrado de productos por categoría
  - Categorías por tienda
- **Gestión por tienda**:
  - Cada tienda tiene sus propias categorías
  - Aislamiento de datos por tienda

#### Endpoints principales:
- `GET /api/categories` - Listar categorías (por tienda)
- `GET /api/categories/<id>` - Detalles de categoría
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/<id>` - Actualizar categoría
- `DELETE /api/categories/<id>` - Eliminar categoría

---

### Gestión de Pedidos

#### Funcionalidades:
- **Creación de pedidos** (público):
  - Sin necesidad de autenticación
  - Selección de productos
  - Cantidades y variantes (tallas, toppings)
  - Datos del cliente (nombre, teléfono)
  - Dirección de entrega
  - Notas del cliente
  - Cálculo automático del total
- **Estados de pedido**:
  - PENDIENTE
  - CONFIRMADO
  - EN_PREPARACION
  - EN_CAMINO
  - ENTREGADO
  - CANCELADO
- **Transiciones de estado**:
  - Validación de transiciones permitidas
  - Historial de cambios
  - Registro de quién cambió el estado
- **Gestión de pedidos** (autenticado):
  - Listar todos los pedidos de la tienda
  - Actualizar estado del pedido
  - Agregar notas del vendedor
  - Actualizar tiempo estimado de entrega
  - Ver historial de cambios
- **Seguimiento público**:
  - Token único de seguimiento
  - Consulta sin autenticación
  - Visualización del estado actual
- **Notificaciones en tiempo real** (Socket.IO):
  - Nuevo pedido creado
  - Pedido actualizado
- **Items del pedido**:
  - Múltiples productos por pedido
  - Cantidades
  - Tallas seleccionadas
  - Toppings/adiciones seleccionadas
  - Precios unitarios y extra price

#### Endpoints principales:
- `POST /api/orders/public` - Crear pedido (público)
- `GET /api/orders/public/track/<token>` - Rastrear pedido (público)
- `GET /api/orders` - Listar pedidos (autenticado)
- `PUT /api/orders/<id>/status` - Actualizar estado del pedido
- `PUT /api/orders/<id>/notes` - Actualizar notas del vendedor
- `PUT /api/orders/<id>/estimated-delivery` - Actualizar tiempo estimado
- `GET /api/orders/<id>/history` - Ver historial de cambios

---

### Catálogo Público

#### Funcionalidades:
- **Página de inicio** (pública):
  - Información de la tienda
  - Logo y nombre
  - Productos destacados
  - Diseño responsive
- **Catálogo de productos** (público):
  - Listado de productos por tienda
  - Filtrado por categorías
  - Búsqueda de productos
  - Precios visibles
  - Imágenes de productos
- **Carrito de compras**:
  - Agregar productos
  - Selección de variantes (tallas, toppings)
  - Cálculo de totales
  - Persistencia local
- **Proceso de checkout**:
  - Formulario de datos del cliente
  - Selección de método de pago
  - Notas del pedido
  - Confirmación de pedido
  - Token de seguimiento
- **Seguimiento de pedido**:
  - Página pública de seguimiento
  - Visualización del estado actual
  - Historial de cambios

#### Endpoints principales:
- `GET /api/stores/public/<slug>` - Obtener tienda con productos y categorías

---

### Dashboard y Métricas

#### Dashboard del Vendedor:
- **Resumen de productos**:
  - Total de productos
  - Productos por categoría
  - Productos con stock bajo
- **Resumen de pedidos**:
  - Pedidos pendientes
  - Pedidos del día
  - Pedidos de la semana
- **Métricas financieras**:
  - Ingresos totales
  - Ingresos del día/semana/período
  - Ticket promedio

#### Dashboard del Super Admin:
- **Métricas globales**:
  - Total de tiendas
  - Total de pedidos por tienda
  - Ingresos totales del sistema
  - Pedidos del día/semana/período
- **Desglose por estado**:
  - Cantidad de pedidos por estado
  - Distribución de estados
- **Información de vendedores**:
  - Último login por vendedor
  - Actividad de tiendas
- **Filtros temporales**:
  - Por mes y año específico
  - Período personalizado

#### Características del Dashboard:
- **Filtros avanzados**:
  - Por categoría de producto
  - Por búsqueda de texto
  - Por rango de fechas
- **Indicadores visuales**:
  - Chips de estado de stock
  - Chips de estado de pedidos
  - Cálculo de márgenes
- **Paginación**:
  - Productos paginados
  - Navegación entre páginas
- **Acciones rápidas**:
  - Crear nuevo producto
  - Editar producto
  - Eliminar producto
  - Ver pedidos

#### Endpoints principales:
- `GET /api/stores/metrics` - Métricas de todas las tiendas (SUPERADMIN)

---

## Características Técnicas

### Seguridad
- Autenticación mediante JWT (JSON Web Tokens)
- Contraseñas hasheadas con bcrypt
- Validación de roles por endpoint (SUPERADMIN, SELLER)
- Protección de rutas sensibles
- Validación de permisos por tienda
- Tokens de recuperación de contraseña con expiración

### Base de Datos
- Modelos relacionales con SQLAlchemy
- Relaciones:
  - Tienda → Usuarios, Productos, Categorías, Pedidos (uno a muchos)
  - Categoría → Productos (uno a muchos)
  - Pedido → Items de pedido, Historial de estados (uno a muchos)
  - Producto → Categoría (muchos a uno)
- Cálculo de métricas con agregaciones SQL
- Índices para búsquedas frecuentes

### Tiempo Real
- Socket.IO para notificaciones en vivo
- Eventos:
  - `product_created` - Nuevo producto creado
  - `product_updated` - Producto actualizado
  - `product_deleted` - Producto eliminado
  - `order_created` - Nuevo pedido recibido
  - `order_updated` - Pedido actualizado

### Internacionalización
- Interfaz en español
- Formato de moneda en USD ($)
- Formato de fechas en español
- Nombres de meses en español

### UI/UX
- Diseño responsive (móvil y escritorio)
- Material-UI para componentes
- Tablas en desktop, cards en móvil
- Filtros y búsqueda en tiempo real
- Paginación de resultados
- Modales de confirmación
- Notificaciones toast
- skeletons de carga
- Chips y badges para estados

### Integración
- API RESTful con Flask
- Comunicación frontend-backend mediante servicios API
- WebSockets para tiempo real
- Soporte para Docker y despliegue en producción
- Nginx como proxy inverso

---

## Resumen de Módulos por Rol

| Módulo | SUPERADMIN | SELLER |
|--------|:----------:|:------:|
| Gestión de Tiendas | ✅ | ❌ |
| Gestión de Vendedores | ✅ | ❌ |
| Gestión de Productos | ✅ | ✅ |
| Gestión de Categorías | ✅ | ✅ |
| Gestión de Pedidos | ✅ | ✅ |
| Catálogo Público | 👁️ | 👁️ |
| Dashboard | ✅ | ✅ |
| Métricas Globales | ✅ | ❌ |

**Leyenda**: ✅ Acceso completo | 👁️ Solo consulta | ❌ Sin acceso

---

## Flujo de Trabajo

### Flujo del Vendedor (SELLER):
1. **Login** en el sistema
2. **Configurar tienda** (WhatsApp, logo)
3. **Crear categorías** de productos
4. **Agregar productos** con precios, stock e imágenes
5. **Recibir pedidos** en tiempo real
6. **Gestionar pedidos**:
   - Confirmar pedidos
   - Cambiar estados (preparación, en camino, entregado)
   - Agregar notas internas
   - Establecer tiempos de entrega
7. **Consultar métricas** de ventas

### Flujo del Cliente:
1. **Acceder** al catálogo público de la tienda
2. **Explorar productos** por categorías
3. **Buscar productos** por nombre
4. **Agregar al carrito** con variantes seleccionadas
5. **Realizar pedido** con datos de entrega
6. **Recibir token** de seguimiento
7. **Rastrear pedido** en tiempo real

### Flujo del Super Admin:
1. **Login** en el sistema
2. **Crear tiendas** y vendedores
3. **Monitorear métricas** globales
4. **Gestionar vendedores** (actualizar emails)
5. **Supervisar** todas las operaciones

---

*Documento generado el 30 de junio de 2026*