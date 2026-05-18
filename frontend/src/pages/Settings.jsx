import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Settings({ user, onLogout }) {
    const [store, setStore] = useState(null)
    const [whatsapp, setWhatsapp] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchStoreData()
    }, [])

    const fetchStoreData = async () => {
        if (!user?.storeId) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${user.storeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStore(data)
                setWhatsapp(data.whatsapp || '')
            }
        } catch (error) {
            console.error('Error fetching store:', error)
        }
    }

    const handleSaveWhatsApp = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSaving(true)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${user.storeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: store?.name,
                    slug: store?.slug,
                    whatsapp: whatsapp
                })
            })

            if (res.ok) {
                setSuccess('Número de WhatsApp actualizado exitosamente')
                fetchStoreData()
            } else {
                const data = await res.json()
                setError(data.error || 'Error al actualizar WhatsApp')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        onLogout()
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <h2>E-Shop</h2>
                <nav>
                    <Link to="/admin">Productos</Link>
                    <Link to="/admin/categories">Categorías</Link>
                    <Link to="/admin/settings" className="active">Configuración</Link>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{ width: '100%', marginTop: '20px' }}
                    >
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>
            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Configuración</h1>
                </div>

                {store && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>WhatsApp de la Tienda</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Este número recibirá los pedidos que los clientes realicen desde el catálogo público.
                            {store.slug && (
                                <span style={{ display: 'block', marginTop: '4px' }}>
                                    Catálogo: <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                                        /{store.slug}
                                    </a>
                                </span>
                            )}
                        </p>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <form onSubmit={handleSaveWhatsApp} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Número de WhatsApp</label>
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="+573001234567"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                {saving ? 'Guardando...' : 'Guardar WhatsApp'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>Información de la Cuenta</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Rol:</strong> {user?.role === 'SUPERADMIN' ? 'Super Administrador' : 'Vendedor'}</p>
                    <p><strong>ID de Tienda:</strong> {user?.storeId || 'N/A'}</p>
                    {store && (
                        <>
                            <p><strong>Nombre de Tienda:</strong> {store.name}</p>
                            <p><strong>Slug:</strong> /{store.slug}</p>
                            {store.whatsapp && <p><strong>WhatsApp Configurado:</strong> {store.whatsapp}</p>}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Settings