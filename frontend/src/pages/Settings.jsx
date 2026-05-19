import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'

function Settings({ user, onLogout, darkMode, setDarkMode }) {
    const [store, setStore] = useState(null)
    const [whatsapp, setWhatsapp] = useState('')
    const [saving, setSaving] = useState(false)
    const toast = useToast()

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
                    whatsapp: whatsapp
                })
            })

            if (res.ok) {
                toast.success('Número de WhatsApp actualizado exitosamente')
                fetchStoreData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al actualizar WhatsApp')
            }
        } catch (err) {
            toast.error('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout title="Configuración" user={user} onLogout={onLogout}>
            {store && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>WhatsApp de la Tienda</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Este número recibirá los pedidos que los clientes realicen desde el catálogo público.
                        {store.slug && (
                            <span style={{ display: 'block', marginTop: '4px' }}>
                                Catálogo: <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                                    /{store.slug}
                                </a>
                            </span>
                        )}
                    </p>
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

            {/* Dark Mode Toggle */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Apariencia</h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0'
                }}>
                    <div>
                        <p style={{ fontWeight: '500' }}>Modo Oscuro</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Activa el modo oscuro para reducir la fatiga visual
                        </p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>
            </div>

            {/* Change Password */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Seguridad</h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0'
                }}>
                    <div>
                        <p style={{ fontWeight: '500' }}>Contraseña</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Cambia tu contraseña de acceso al panel
                        </p>
                    </div>
                    <Link to="/admin/change-password" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        Cambiar Contraseña
                    </Link>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Información de la Cuenta</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
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
            </div>
        </AdminLayout>
    )
}

export default Settings