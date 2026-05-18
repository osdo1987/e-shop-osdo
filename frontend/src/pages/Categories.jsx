import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Categories({ user }) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [error, setError] = useState('')

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setCategories(await res.json())
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        setError('')
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    store_id: user.storeId
                })
            })
            if (res.ok) {
                setNewCategoryName('')
                fetchCategories()
            } else {
                const data = await res.json()
                setError(data.error || 'Error al crear categoría')
            }
        } catch (err) {
            setError('Error de conexión')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta categoría?')) return
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                fetchCategories()
            }
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    if (loading) return <div className="dashboard-content"><p>Cargando...</p></div>

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2>E-Shop</h2>
                <nav>
                    <Link to="/admin">Productos</Link>
                    <Link to="/admin/categories" className="active">Categorías</Link>
                    <Link to="/admin/settings">Configuración</Link>
                </nav>
            </aside>
            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Categorías</h1>
                </div>

                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3>Nueva Categoría</h3>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de la categoría"
                            required
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                        />
                        <button type="submit" className="btn btn-primary">Crear</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>Lista de Categorías ({categories.length})</h3>
                    {categories.length === 0 ? (
                        <p>No hay categorías.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 8px' }}>{cat.name}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 8px', background: 'var(--error)', color: 'white' }}
                                                onClick={() => handleDelete(cat.id)}
                                            >
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

export default Categories