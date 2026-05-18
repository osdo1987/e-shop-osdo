import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'

function ProductForm({ user }) {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(isEditing)
    const toast = useToast()
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        promo_price: '',
        stock: '',
        category_id: '',
        image_url: '',
        sizes: ''
    })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token')
            try {
                const res = await fetch('/api/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    setCategories(await res.json())
                }
            } catch (err) {
                console.error('Error fetching categories:', err)
            }
        }

        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`/api/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const product = await res.json()
                    setForm({
                        name: product.name || '',
                        description: product.description || '',
                        price: product.price?.toString() || '',
                        promo_price: product.promo_price?.toString() || '',
                        stock: product.stock?.toString() || '',
                        category_id: product.category_id?.toString() || '',
                        image_url: product.image_url || '',
                        sizes: product.sizes || ''
                    })
                } else {
                    setError('Error al cargar el producto')
                }
            } catch (err) {
                setError('Error de conexión')
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
        if (isEditing) {
            fetchProduct()
        }
    }, [id])

    const [hasSizes, setHasSizes] = useState(false)

    useEffect(() => {
        if (form.sizes) {
            setHasSizes(true)
        }
    }, [form.sizes])

    const presetClothing = ['S', 'M', 'L', 'XL', 'XXL']
    const presetShoes = ['36', '37', '38', '39', '40', '41', '42', '43']

    const selectedSizes = form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : []

    const handleToggleSize = (size) => {
        let newSizes
        if (selectedSizes.includes(size)) {
            newSizes = selectedSizes.filter(s => s !== size)
        } else {
            newSizes = [...selectedSizes, size]
        }
        setForm({ ...form, sizes: newSizes.join(',') })
    }

    const handleToggleHasSizes = () => {
        if (hasSizes) {
            setForm({ ...form, sizes: '' })
        }
        setHasSizes(!hasSizes)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const token = localStorage.getItem('token')
        try {
            const url = isEditing ? `/api/products/${id}` : '/api/products'
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
                    stock: parseInt(form.stock),
                    category_id: parseInt(form.category_id),
                    store_id: user.storeId
                })
            })

            if (res.ok) {
                toast.success(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
                navigate('/admin')
            } else {
                const data = await res.json()
                setError(data.error || `Error al ${isEditing ? 'actualizar' : 'crear'} producto`)
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Cargando..." user={user}>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Cargando producto...</p>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} user={user} showBack>
            <div className="card" style={{ maxWidth: '700px' }}>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nombre del Producto</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Camiseta Algodón Premium"
                        />
                    </div>
                    <div className="input-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Descripción del producto..."
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label>Precio</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="45000"
                            />
                        </div>
                        <div className="input-group">
                            <label>Precio Promocional</label>
                            <input
                                type="number"
                                name="promo_price"
                                value={form.promo_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="35000"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label>Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="50"
                            />
                        </div>
                        <div className="input-group">
                            <label>Categoría</label>
                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tallas y Variantes */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }} onClick={handleToggleHasSizes}>
                            <input
                                type="checkbox"
                                checked={hasSizes}
                                onChange={() => {}} // Manejado por click en div
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>¿Este producto tiene tallas o variantes?</strong>
                        </div>
                        
                        {hasSizes && (
                            <div style={{
                                marginTop: '12px',
                                padding: '16px',
                                background: 'var(--background)',
                                borderRadius: '8px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Tallas de Ropa Comunes</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {presetClothing.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`btn ${selectedSizes.includes(size) ? 'btn-primary' : 'btn-secondary'}`}
                                                style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '20px' }}
                                                onClick={() => handleToggleSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Tallas de Calzado Comunes</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {presetShoes.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`btn ${selectedSizes.includes(size) ? 'btn-primary' : 'btn-secondary'}`}
                                                style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '20px' }}
                                                onClick={() => handleToggleSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Tallas seleccionadas (puedes escribir variantes personalizadas separadas por comas)</label>
                                    <input
                                        type="text"
                                        name="sizes"
                                        value={form.sizes}
                                        onChange={handleChange}
                                        placeholder="Ej: S,M,L o 38,39,40 (separadas por comas)"
                                        style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="input-group">
                        <label>URL de Imagen (opcional)</label>
                        <input
                            type="url"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="input-group">
                        <label>O subir imagen</label>
                        <div className="image-upload-zone" style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '8px',
                            padding: '24px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: 'var(--background)'
                        }}>
                            📸 Arrastra una imagen aquí o haz clic para seleccionar
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onload = (ev) => {
                                            setForm({ ...form, image_url: ev.target.result })
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                        </div>
                        {form.image_url && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={form.image_url} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                    onClick={() => setForm({ ...form, image_url: '' })}
                                >
                                    Quitar imagen
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Guardar Producto')}
                        </button>
                        <Link to="/admin" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}

export default ProductForm