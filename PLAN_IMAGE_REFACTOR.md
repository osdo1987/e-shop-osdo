# Plan: Refactor del Sistema de Almacenamiento de Imágenes

## Contexto Actual

La app es Flask (Python) + React (Vite), PostgreSQL. Las imágenes se manejan así:
- **Productos**: Archivos subidos a `uploads/` con nombre SHA-256, guardado en `products.image_url` como texto
- **Tiendas (logo)**: Imágenes convertidas a base64 y guardadas directamente en `stores.logo_url` como texto enorme
- **Categorías**: No tienen imagen
- **Servido**: Flask `send_from_directory` via `/uploads/<filename>`
- **Docker**: Sin volumen para uploads (se pierden en reinicios)
- **No hay**: tabla de imágenes, metadatos, validación MIME real, limpieza de huérfanos, ni arquitrura para migrar a S3

---

## Arquitectura Objetivo

```
┌─────────────────────────────────────────────────┐
│  Frontend (React)                               │
│  - FormData con key "image" (productos + logos) │
│  - Imagenes se referencian via /api/images/<hash>│
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  Flask API                                      │
│  ┌────────────────────────────────────────────┐  │
│  │  image_routes.py (nuevo blueprint)         │  │
│  │  POST /api/images        → subir imagen    │  │
│  │  GET  /api/images/<hash> → servir imagen   │  │
│  │  DELETE /api/images/<id> → eliminar imagen │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  image_service.py (nueva lógica)           │  │
│  │  - Validar MIME, extensión, tamaño         │  │
│  │  - Calcular SHA-256 del contenido          │  │
│  │  - Guardar en uploads/XX/YY/XXYY...zz.ext  │  │
│  │  - Insertar registro en tabla images        │  │
│  │  - Deduplicación por hash                  │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  Tabla images (nueva)                      │  │
│  │  id, hash, extension, mime_type, size,     │  │
│  │  original_name, created_at                 │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  products.image_id → FK a images.id        │  │
│  │  stores.logo_id    → FK a images.id        │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
                       │
              uploads/XX/YY/hash.ext
```

---

## Pasos de Implementación

### Paso 1: Modelo Image (nuevo)
**Archivo**: `app/models/image.py` (nuevo)

```python
class Image(db.Model):
    __tablename__ = 'images'
    id            = db.Column(db.Integer, primary_key=True)
    hash          = db.Column(db.String(64), unique=True, nullable=False, index=True)
    extension     = db.Column(db.String(10), nullable=False)
    mime_type     = db.Column(db.String(50), nullable=False)
    size          = db.Column(db.Integer, nullable=False)  # bytes
    original_name = db.Column(db.String(255), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
```

**Archivos afectados**:
- Crear `app/models/image.py`
- Modificar `app/models/__init__.py` para importarlo

### Paso 2: Migración - Agregar FKs y tabla images
**Archivo**: `migrations/versions/..._create_images_table.py` (nuevo, auto-generado con `flask db migrate`)

Acciones:
- Crear tabla `images`
- Agregar columna `image_id` (FK → images.id) a `products`
- Agregar columna `logo_id` (FK → images.id) a `stores`
- Migrar datos existentes: leer `image_url`/`logo_url`, crear registros Image, asignar FKs
- Eliminar columnas `products.image_url` y `stores.logo_url`

### Paso 3: Image Service (nueva lógica)
**Archivo**: `app/services/image_service.py` (nuevo)

Responsabilidades:
- `save_image(file, original_name)` → calcula SHA-256, valida MIME/extensión/tamaño, guarda en disco con estructura `XX/YY/hash.ext`, crea registro Image en DB
- `delete_image(image_id)` → elimina archivo de disco + registro de DB
- `get_image_path(hash)` → resuelve ruta física desde el hash
- `get_image_by_hash(hash)` → busca registro Image por hash

Validaciones:
- MIME types permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`
- Extensiones permitidas: `jpg`, `jpeg`, `png`, `webp`, `gif`, `avif` (sin SVG)
- Tamaño máximo: 5MB
- Verificar que el archivo no esté corrupto (leer cabecera del MIME)
- Cleanup de archivos temporales en caso de error

### Paso 4: Image Routes (nuevo blueprint)
**Archivo**: `app/routes/image_routes.py` (nuevo)

Endpoints:
- `POST /api/images` (autenticado) → sube imagen, retorna `{ id, hash, url: "/api/images/<hash>" }`
- `GET /api/images/<hash>` (público) → sirve la imagen con Content-Type correcto y Cache-Control
- `DELETE /api/images/<id>` (autenticado) → elimina imagen (solo si no está referenciada)

Registrar blueprint en `app/__init__.py` con `url_prefix='/api/images'`.

### Paso 5: Actualizar Product Model y Schema
**Archivos**:
- `app/models/product.py`: reemplazar `image_url = db.Column(db.Text)` por `image_id = db.Column(db.Integer, db.ForeignKey('images.id'), nullable=True)` + relación `image = db.relationship('Image')`
- `app/schemas/product_schema.py`: reemplazar campo `image_url` por `image` (nested) o `image_id`, y agregar campo dump `image_url` que resuelva a `/api/images/<hash>` para mantener compatibilidad con frontend

### Paso 6: Actualizar Store Model y Schema
**Archivos**:
- `app/models/store.py`: reemplazar `logo_url = db.Column(db.Text)` por `logo_id = db.Column(db.Integer, db.ForeignKey('images.id'), nullable=True)` + relación `logo = db.relationship('Image')`
- `app/schemas/store_schema.py`: similar al producto - campo dump `logo_url` que resuelva a `/api/images/<hash>`

### Paso 7: Actualizar Product Routes
**Archivo**: `app/routes/product_routes.py`

Cambios:
- Eliminar `UPLOAD_DIR`, `_allowed_file()`, `_save_upload()` de este archivo
- En `create_product` y `update_product`: cuando llega un `request.files['image']`, llamar a `ImageService.save_image()` en vez de `_save_upload()`
- Asignar `data['image_id']` en vez de `data['image_url']`
- Eliminar lógica de blob URLs (ya no aplica)

### Paso 8: Actualizar Store Routes
**Archivo**: `app/routes/store_routes.py`

Cambios:
- En `update_store`: cuando llega `request.files['logo']`, llamar a `ImageService.save_image()` 
- Asignar `data['logo_id']` en vez de `data['logo_url']`

### Paso 9: Actualizar Product Service
**Archivo**: `app/services/product_service.py`

Cambios:
- `create_product`: usar `image_id` en vez de `image_url`
- `update_product`: usar `image_id`, y si se reemplaza la imagen, eliminar la imagen anterior via `ImageService.delete_image()`

### Paso 10: Actualizar Store Service
**Archivo**: `app/services/store_service.py`

Cambios:
- `create_store` y `update_store`: usar `logo_id` en vez de `logo_url`
- Si se reemplaza el logo, eliminar el anterior

### Paso 11: Actualizar Frontend - Productos
**Archivos**:
- `frontend/src/pages/ProductForm.jsx`: enviar imagen via FormData como "image" (ya lo hace), la respuesta del API ya tendrá `image_url` como `/api/images/<hash>`
- `frontend/src/pages/Dashboard.jsx`: usar `product.image_url` (resuelto por el schema)
- `frontend/src/pages/POS.jsx`: idem
- `frontend/src/pages/Catalog.jsx`: idem

### Paso 12: Actualizar Frontend - Logos de Tienda
**Archivos**:
- `frontend/src/pages/SuperAdmin.jsx`: cambiar de `FileReader.readAsDataURL()` a enviar como FormData con key "logo"
- `frontend/src/pages/Settings.jsx`: mismo cambio

### Paso 13: Configuración y Proxy
**Archivos**:
- `frontend/vite.config.js`: reemplazar proxy `/uploads` por proxy `/api/images`
- `nginx/default.conf`: reemplazar bloque `location /uploads` por `location /api/images`
- `app/config.py`: agregar constantes `MAX_IMAGE_SIZE`, `ALLOWED_MIME_TYPES`

### Paso 14: Seed Data
**Archivos**:
- `seed.py`, `seed_campo_burguer.py`, `seed_licores.py`, `seed_restaurant.py`: las URLs de Unsplash funcionan directamente como URLs externas, no necesitan cambios. Pero si se quieren subir localmente, se puede crear una función helper.

### Paso 15: Limpieza
- Eliminar directorio `public/uploads/` y `uploads/` antiguo después de migrar datos
- Eliminar la ruta `/uploads/<path>` de `app/__init__.py`

---

## Archivos a Crear (4)
1. `app/models/image.py`
2. `app/services/image_service.py`
3. `app/routes/image_routes.py`
4. `migrations/versions/..._create_images_table.py` (auto-generado)

## Archivos a Modificar (14)
1. `app/models/__init__.py` - importar Image
2. `app/models/product.py` - image_url → image_id FK
3. `app/models/store.py` - logo_url → logo_id FK
4. `app/schemas/product_schema.py` - adaptar campos
5. `app/schemas/store_schema.py` - adaptar campos
6. `app/routes/product_routes.py` - usar ImageService
7. `app/routes/store_routes.py` - usar ImageService para logos
8. `app/routes/__init__.py` - registrar image_bp
9. `app/services/product_service.py` - image_id logic
10. `app/services/store_service.py` - logo_id logic
11. `app/__init__.py` - registrar blueprint, quitar /uploads route
12. `app/config.py` - constantes de imagen
13. `frontend/vite.config.js` - proxy /api/images
14. `nginx/default.conf` - location /api/images

## Archivos a Modificar (Frontend, 6)
1. `frontend/src/pages/ProductForm.jsx`
2. `frontend/src/pages/Dashboard.jsx`
3. `frontend/src/pages/SuperAdmin.jsx`
4. `frontend/src/pages/Settings.jsx`
5. `frontend/src/pages/Catalog.jsx`
6. `frontend/src/pages/POS.jsx`

---

## Orden de Ejecución
1. Crear modelo Image + migración
2. Crear ImageService
3. Crear ImageRoutes + registrar blueprint
4. Actualizar modelos Product y Store (FKs)
5. Actualizar schemas
6. Actualizar services (product_service, store_service)
7. Actualizar routes (product_routes, store_routes)
8. Ejecutar migración + script de migración de datos
9. Actualizar frontend (productos primero, luego logos)
10. Actualizar proxy/nginx
11. Probar end-to-end
12. Limpiar archivos antiguos

---

## Riesgos y Mitigaciones
- **Pérdida de datos**: Script de migración crea registros Image desde URLs existentes antes de borrar columnas
- **Imágenes base64 de logos**: El script de migración las decodifica, guarda como archivos, y crea registros Image
- **URLs externas (Unsplash)**: Se mantienen como están en seeds. Solo cambia la lógica de upload local.
- **Compatibilidad**: El schema serializa `image_url` y `logo_url` como campos virtuales, así que el frontend no rompe inmediatamente
