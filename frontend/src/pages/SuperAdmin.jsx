import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function SuperAdmin({ user, onLogout }) {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newStore, setNewStore] = useState({
        storeName: '',
        slug: '',
        whatsapp: '',
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchStores()
    }, [])

    const fetchStores = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch('/api/stores', { headers })

            if (res.ok) {
                const data = await res.json()
                setStores(data)
            }
        } catch (error) {
            console.error('Error fetching stores:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStore = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem('token')
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

            const res = await fetch('/api/auth/register-seller', {
                method: 'POST',
                headers,
                body: JSON.stringify(newStore)
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess('Tienda y vendedor creados exitosamente')
                setShowCreateModal(false)
                setNewStore({ storeName: '', slug: '', whatsapp: '', email: '', password: '' })
                fetchStores()
            } else {
                setError(data.error || 'Error al crear la tienda')
            }
        } catch (error) {
            setError('Error de conexión')
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
                <h2>Super Admin</h2>
                <nav>
                    <Link to="/admin/super" className="active">Tiendas</Link>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Gestión de Tiendas</h1>
                    <div>
                        <span style={{ marginRight: '16px' }}>{user?.email}</span>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Nueva Tienda
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="card">
                    <h2 style={{ marginBottom: '16px' }}>Tiendas ({stores.length})</h2>
                    {stores.length === 0 ? (
                        <p>No hay tiendas registradas.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '8px' }}>Nombre</th>
                                    <th style={{ padding: '8px' }}>Slug/URL</th>
                                    <th style={{ padding: '8px' }}>WhatsApp</th>
                                    <th style={{ padding: '8px' }}>Vendedor</th>
                                    <th style={{ padding: '8px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores.map(store => (
                                    <tr key={store.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 8px' }}>{store.name}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                                                /{store.slug}
                                            </a>
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>{store.whatsapp || 'Sin WhatsApp'}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            {store.users?.find(u => u.role === 'SELLER')?.email || 'Sin vendedor'}
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

                {showCreateModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                            <h2 style={{ marginBottom: '24px' }}>Crear Nueva Tienda</h2>
                            <form onSubmit={handleCreateStore}>
                                <div className="input-group">
                                    <label>Nombre de la Tienda</label>
                                    <input
                                        type="text"
                                        value={newStore.storeName}
                                        onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>URL/Slug</label>
                                    <input
                                        type="text"
                                        value={newStore.slug}
                                        onChange={(e) => setNewStore({ ...newStore, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        required
                                        placeholder="mi-tienda"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>WhatsApp (opcional)</label>
                                    <input
                                        type="text"
                                        value={newStore.whatsapp}
                                        onChange={(e) => setNewStore({ ...newStore, whatsapp: e.target.value })}
                                        placeholder="+573001234567"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Email del Vendedor</label>
                                    <input
                                        type="email"
                                        value={newStore.email}
                                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Contraseña</label>
                                    <input
                                        type="password"
                                        value={newStore.password}
                                        onChange={(e) => setNewStore({ ...newStore, password: e.target.value })}
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Crear Tienda
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                        style={{ flex: 1 }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default SuperAdmin