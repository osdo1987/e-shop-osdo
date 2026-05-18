import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Dashboard({ user, onLogout }) {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

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

    const handleLogout = () => {
        onLogout()
    }

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

                <div className="card">
                    <h2 style={{ marginBottom: '16px' }}>Productos ({products.length})</h2>
                    {products.length === 0 ? (
                        <p>No hay productos registrados.</p>
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
                                {products.map(product => (
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
                                            <button className="btn btn-secondary" style={{ padding: '4px 8px', marginRight: '8px' }}>
                                                Editar
                                            </button>
                                            <button className="btn btn-secondary" style={{ padding: '4px 8px', background: 'var(--error)', color: 'white' }}>
                                                Eliminar
                                            </button>
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