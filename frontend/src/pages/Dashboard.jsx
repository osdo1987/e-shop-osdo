import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { TableSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

function Dashboard({ user, onLogout }) {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const toast = useToast()

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
            toast.error('Error al cargar datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const res = await fetch(`/api/products/${deleteTarget.id}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                toast.success(`Producto "${deleteTarget.name}" eliminado exitosamente`)
                setDeleteTarget(null)
                fetchDashboardData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar el producto')
            }
        } catch (error) {
            toast.error('Error de conexión')
        }
    }

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
            const matchSearch = !searchTerm ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchCategory && matchSearch
        })
    }, [products, selectedCategory, searchTerm])

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredProducts.slice(start, start + itemsPerPage)
    }, [filteredProducts, currentPage])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCategory, searchTerm])

    const getStockBadge = (stock) => {
        if (stock <= 0) return { color: 'var(--error)', label: 'Agotado' }
        if (stock < 5) return { color: 'var(--warning)', label: 'Stock bajo' }
        return { color: 'var(--success)', label: 'Disponible' }
    }

    return (
        <>
            <AdminLayout title="Mi Tienda" user={user} onLogout={onLogout}>
                {/* Filters */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex-row" style={{ flexWrap: 'wrap' }}>
                        <div className="input-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                            <label>Buscar producto</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="input-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
                            <label>Filtrar por categoría</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ alignSelf: 'flex-end', marginBottom: '4px' }}>
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

                {/* Products Table */}
                <div className="card">
                    <div className="flex-row" style={{
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <h2>
                            Productos ({filteredProducts.length})
                            {selectedCategory && (
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    color: 'var(--text-muted)',
                                    marginLeft: '8px'
                                }}>
                                    en {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                                </span>
                            )}
                        </h2>
                        <Link to="/admin/products/new" className="btn btn-primary" style={{ fontSize: '13px' }}>
                            + Nuevo Producto
                        </Link>
                    </div>

                    {loading ? (
                        <TableSkeleton rows={5} cols={5} />
                    ) : filteredProducts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                            {products.length === 0
                                ? 'No hay productos registrados. Crea tu primer producto.'
                                : 'No se encontraron productos con los filtros aplicados.'}
                        </p>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Precio Venta</th>
                                            <th>Costo</th>
                                            <th>Margen</th>
                                            <th>Stock</th>
                                            <th>Categoría</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map(product => {
                                            const badge = getStockBadge(product.stock)
                                            const activePrice = product.promo_price || product.price
                                            const margin = product.purchase_price
                                                ? ((activePrice - product.purchase_price) / activePrice) * 100
                                                : null

                                            return (
                                                <tr key={product.id}>
                                                    <td className="cell-name">{product.name}</td>
                                                    <td>
                                                        ${activePrice.toLocaleString()}
                                                        {product.promo_price && (
                                                            <span className="old-price-inline">${product.price.toLocaleString()}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {product.purchase_price ? `$${product.purchase_price.toLocaleString()}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                    </td>
                                                    <td>
                                                        {margin !== null ? (
                                                            <span style={{
                                                                background: margin >= 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                                                                color: margin >= 0 ? '#27ae60' : '#c0392b',
                                                                padding: '3px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                display: 'inline-block'
                                                            }}>
                                                                {margin >= 0 ? '+' : ''}{margin.toFixed(0)}%
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="stock-badge" style={{ background: badge.color + '20', color: badge.color }}>
                                                            <span className="stock-dot" style={{ background: badge.color }} />
                                                            {badge.label} {product.stock > 0 && `(${product.stock})`}
                                                        </span>
                                                    </td>
                                                    <td>{categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <Link
                                                                to={`/admin/products/edit/${product.id}`}
                                                                className="btn btn-secondary"
                                                            >
                                                                ✏️ Editar
                                                            </Link>
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => setDeleteTarget(product)}
                                                            >
                                                                🗑️ Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="mobile-cards">
                                {paginatedProducts.map(product => {
                                    const badge = getStockBadge(product.stock)
                                    return (
                                        <div key={product.id} className="mobile-product-card">
                                            <div className="mobile-product-header">
                                                <span className="mobile-product-name">{product.name}</span>
                                                <span className="mobile-product-price">${product.promo_price || product.price}</span>
                                            </div>
                                            <div className="mobile-product-meta">
                                                <span className="stock-badge" style={{ background: badge.color + '20', color: badge.color }}>
                                                    <span className="stock-dot" style={{ background: badge.color }} />
                                                    {badge.label}
                                                </span>
                                                <span>Categoría: {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}</span>
                                            </div>
                                            <div className="mobile-product-actions">
                                                <Link to={`/admin/products/edit/${product.id}`} className="btn btn-secondary">✏️ Editar</Link>
                                                <button className="btn btn-danger" onClick={() => setDeleteTarget(product)}>🗑️ Eliminar</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Producto"
                message={`¿Estás seguro de eliminar el producto "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Dashboard