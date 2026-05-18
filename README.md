# E-Shop WhatsApp

Plataforma de comercio electrónico para vender a través de WhatsApp, con panel de administración y catálogos personalizados.

## Stack Tecnológico

### Backend
- **Python 3.11** con **Flask 3.0**
- **PostgreSQL 15** como base de datos
- **SQLAlchemy** como ORM
- **Flask-JWT-Extended** para autenticación
- **Flask-Migrate** para migraciones de base de datos
- **Docker** y **Docker Compose** para containerización

### Frontend
- **React 19** con **Vite**
- **React Router DOM** para enrutamiento
- **CSS** moderno con variables CSS

## Estructura del Proyecto

```
e-shop/
├── app/                      # Backend Flask
│   ├── __init__.py          # Factory de aplicación
│   ├── config.py            # Configuración
│   ├── extensions.py        # Extensiones (DB, JWT, etc.)
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── user.py
│   │   ├── store.py
│   │   ├── category.py
│   │   └── product.py
│   ├── routes/              # Rutas API
│   │   ├── auth_routes.py
│   │   ├── store_routes.py
│   │   ├── category_routes.py
│   │   └── product_routes.py
│   ├── schemas/             # Esquemas Marshmallow
│   └── services/            # Lógica de negocio
├── frontend/                # Frontend React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Catalog.jsx
│   │   │   └── SuperAdmin.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── docker-compose.yml       # Orquestación Docker
├── Dockerfile              # Imagen del backend
├── requirements.txt        # Dependencias Python
├── run.py                  # Entry point
└── migrate_data.py        # Script de migración
```

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd e-shop
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Usar Docker (Recomendado)
```bash
# Levantar todos los servicios
docker-compose up -d

# El backend estará en http://localhost:5000
# El frontend en desarrollo en http://localhost:5173
# PostgreSQL en localhost:5432
```

### 4. Instalación manual (sin Docker)

#### Backend
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env

# Ejecutar migraciones
flask db upgrade

# Iniciar servidor
flask run
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Migración de Datos

Si vienes de la versión anterior con SQLite, puedes migrar los datos:

```bash
# Asegurarse de tener PostgreSQL corriendo
# Ejecutar script de migración
python migrate_data.py
```

## Uso

### 1. Registro de Super Admin
Por defecto, el sistema no incluye un super admin. Debes crear uno manualmente en la base de datos o mediante una ruta especial.

### 2. Crear Tiendas
Como super admin, puedes crear nuevas tiendas y vendedores desde el panel `/admin/super`.

### 3. Gestión de Productos
Cada vendedor puede gestionar sus productos, categorías y precios desde `/admin`.

### 4. Catálogo Público
Los clientes pueden ver el catálogo en `/{slug-tienda}` y hacer pedidos directamente por WhatsApp.

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register-seller` - Crear tienda/vendedor (super admin)
- `GET /api/auth/me` - Obtener usuario actual

### Tiendas
- `GET /api/stores` - Listar tiendas (super admin)
- `GET /api/stores/{id}` - Obtener tienda por ID
- `GET /api/stores/public/{slug}` - Obtener catálogo público
- `POST /api/stores` - Crear tienda (super admin)
- `PUT /api/stores/{id}` - Actualizar tienda (super admin)
- `DELETE /api/stores/{id}` - Eliminar tienda (super admin)

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

## Desarrollo

### Backend
```bash
# Ejecutar en modo desarrollo
flask run --debug

# Ejecutar tests (pendiente implementación)
pytest
```

### Frontend
```bash
cd frontend

# Desarrollo con hot reload
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Producción

### Docker Compose para producción
```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

### Variables de entorno importantes
- `DATABASE_URL`: Conexión a PostgreSQL
- `JWT_SECRET_KEY`: Clave secreta para JWT
- `SECRET_KEY`: Clave secreta de Flask
- `FLASK_ENV`: `production` para producción

## Contribución

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.

## Soporte

Para soporte técnico, contacta a OSDOSOFT.