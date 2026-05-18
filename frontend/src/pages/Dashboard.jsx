import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Dashboard({ user, onLogout }) {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [categoriesRes, productsRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers })
            ])

            if (categoriesRes.ok) {
                setCategories(await categoriesRes.json())
            }
            if (productsRes.ok) {
                setProducts(await productsRes.json())
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (productId, productName) => {
        if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                fetchDashboardData()
            } else {
                const data = await res.json()
                alert(data.error || 'Error al eliminar el producto')
            }
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Error de conexión')
        }
    }

    const handleLogout = () => {
        onLogout()
    }

    // Filter products by category and search term
    const filteredProducts = products.filter(product => {
        const matchCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
        const matchSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchCategory && matchSearch
    })

    if (loading) {
        return <div className="dashboard-content"><p>Cargando...</p></div>
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2>E-Shop</h2>
                <nav>
                    <Link to="/admin" className="active">Productos</Link>
                    <Link to="/admin/categories">Categorías</Link>
                    <Link to="/admin/settings">Configuración</Link>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Mi Tienda</h1>
                    <div>
                        <span style={{ marginRight: '16px' }}>{user?.email}</span>
                        <Link to="/admin/products/new" className="btn btn-primary">
                            Nuevo Producto
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                Buscar producto
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div style={{ minWidth: '200px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                Filtrar por categoría
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    background: 'white'
                                }}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setSelectedCategory(''); setSearchTerm('') }}
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 style={{ marginBottom: '16px' }}>
                        Productos ({filteredProducts.length})
                        {selectedCategory && <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            en {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                        </span>}
                    </h2>
                    {filteredProducts.length === 0 ? (
                        <p>{products.length === 0 ? 'No hay productos registrados.' : 'No se encontraron productos con los filtros aplicados.'}</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>Precio</th>
                                    <th style={{ padding: '8px' }}>Stock</th>
                                    <th style={{ padding: '8px' }}>Categoría</th>
                                    <th style={{ padding: '8px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 8px' }}>{product.name}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            ${product.promo_price || product.price}
                                            {product.promo_price && (
                                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                                    ${product.price}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>{product.stock}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <Link
                                                    to={`/admin/products/edit/${product.id}`}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none' }}
                                                >
                                                    ✏️ Editar
                                                </Link>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 10px', fontSize: '12px', background: 'var(--error)', color: 'white' }}
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Dashboard