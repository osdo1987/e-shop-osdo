import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

function ProductForm({ user }) {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(isEditing)
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        promo_price: '',
        stock: '',
        category_id: '',
        image_url: ''
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
                        image_url: product.image_url || ''
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
            <div className="dashboard-layout">
                <aside className="sidebar">
                    <h2>E-Shop</h2>
                    <nav>
                        <Link to="/admin">Productos</Link>
                        <Link to="/admin/categories">Categorías</Link>
                        <Link to="/admin/settings">Configuración</Link>
                    </nav>
                </aside>
                <main className="dashboard-content">
                    <p>Cargando producto...</p>
                </main>
            </div>
        )
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2>E-Shop</h2>
                <nav>
                    <Link to="/admin">Productos</Link>
                    <Link to="/admin/categories">Categorías</Link>
                    <Link to="/admin/settings">Configuración</Link>
                </nav>
            </aside>
            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                    <Link to="/admin" className="btn btn-secondary">Volver</Link>
                </div>

                <div className="card">
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
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ marginTop: '16px' }}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Guardar Producto')}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default ProductForm