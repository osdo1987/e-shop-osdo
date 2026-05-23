import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'

function SuperAdmin({ user, onLogout }) {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [editingStore, setEditingStore] = useState(null)
    const [newStore, setNewStore] = useState({
        storeName: '',
        slug: '',
        whatsapp: '',
        logo_url: '',
        email: '',
        password: ''
    })
    const [editForm, setEditForm] = useState({
        name: '',
        slug: '',
        whatsapp: '',
        logo_url: ''
    })
    const [modalError, setModalError] = useState('')
    const toast = useToast()

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
            toast.error('Error al cargar tiendas')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStore = async (e) => {
        e.preventDefault()
        setModalError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/register-seller', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newStore)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Tienda y vendedor creados exitosamente')
                setShowCreateModal(false)
                setNewStore({ storeName: '', slug: '', whatsapp: '', logo_url: '', email: '', password: '' })
                fetchStores()
            } else {
                setModalError(data.error || 'Error al crear la tienda')
            }
        } catch (error) {
            setModalError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const openEditModal = (store) => {
        setEditingStore(store)
        setEditForm({
            name: store.name,
            slug: store.slug,
            whatsapp: store.whatsapp || '',
            logo_url: store.logo_url || ''
        })
        setModalError('')
        setShowEditModal(true)
    }

    const handleEditStore = async (e) => {
        e.preventDefault()
        setModalError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${editingStore.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Tienda actualizada exitosamente')
                setShowEditModal(false)
                setEditingStore(null)
                fetchStores()
            } else {
                setModalError(data.error || 'Error al actualizar la tienda')
            }
        } catch (error) {
            setModalError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteStore = async () => {
        if (!deleteTarget) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                toast.success(`Tienda "${deleteTarget.name}" eliminada exitosamente`)
                setDeleteTarget(null)
                fetchStores()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar la tienda')
            }
        } catch (error) {
            toast.error('Error de conexión')
        }
    }

    const filteredStores = stores.filter(store =>
        !searchTerm ||
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: stores.length,
        withWhatsapp: stores.filter(s => s.whatsapp).length,
        totalProducts: stores.reduce((sum, s) => sum + (s.productCount || 0), 0)
    }

    return (
        <>
            <AdminLayout title="Gestión de Tiendas" user={user} onLogout={onLogout} superadmin>
                {/* Stats */}
                {!loading && (
                    <div className="stats-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <StatCard title="Tiendas" value={stats.total} icon="🏪" color="var(--primary-color)" />
                        <StatCard title="Con WhatsApp" value={stats.withWhatsapp} icon="💬" color="var(--success)" />
                        <StatCard title="Productos" value={stats.totalProducts} icon="📦" color="var(--warning)" />
                    </div>
                )}

                {/* Search & Actions */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ flex: 2, minWidth: '200px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                Buscar tienda
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                + Nueva Tienda
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stores Table */}
                <div className="card">
                    <h2 style={{ marginBottom: '16px' }}>Tiendas ({filteredStores.length})</h2>
                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
                    ) : filteredStores.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                            {stores.length === 0
                                ? 'No hay tiendas registradas.'
                                : 'No se encontraron tiendas con ese filtro.'}
                        </p>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Slug/URL</th>
                                            <th>WhatsApp</th>
                                            <th>Vendedor</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStores.map(store => (
                                            <tr key={store.id}>
                                                <td className="cell-name">{store.name}</td>
                                                <td>
                                                    <a
                                                        href={`/${store.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'var(--primary-color)' }}
                                                    >
                                                        /{store.slug}
                                                    </a>
                                                </td>
                                                <td>{store.whatsapp || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>
                                                    {store.users?.find(u => u.role === 'SELLER')?.email || (
                                                        <span style={{ color: 'var(--text-muted)' }}>Sin vendedor</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <a
                                                            href={`/${store.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-secondary"
                                                            title="Ver catálogo público"
                                                        >
                                                            👁️ Ver
                                                        </a>
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => openEditModal(store)}
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => setDeleteTarget(store)}
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="mobile-cards">
                                {filteredStores.map(store => (
                                    <div key={store.id} className="mobile-product-card">
                                        <div className="mobile-product-header">
                                            <span className="mobile-product-name">{store.name}</span>
                                            <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                                👁️ Ver
                                            </a>
                                        </div>
                                        <div className="mobile-product-meta">
                                            <span>/{store.slug}</span>
                                            <span>{store.whatsapp || 'Sin WhatsApp'}</span>
                                        </div>
                                        <div className="mobile-product-actions">
                                            <button className="btn btn-secondary" onClick={() => openEditModal(store)}>✏️ Editar</button>
                                            <button className="btn btn-danger" onClick={() => setDeleteTarget(store)}>🗑️ Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </AdminLayout>

            {/* Create Store Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setModalError('') }}>
                    <div className="modal-card card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
                        <h2 style={{ marginBottom: '24px' }}>Crear Nueva Tienda</h2>
                        {modalError && <div className="error-message">{modalError}</div>}
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
                                    placeholder="+1234567890"
                                />
                            </div>
                            <div className="form-group">
                                <label>URL del Logo (opcional)</label>
                                <input
                                    type="url"
                                    value={newStore.logo_url}
                                    onChange={(e) => setNewStore({ ...newStore, logo_url: e.target.value })}
                                    placeholder="https://ejemplo.com/logo.png"
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
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear Tienda'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowCreateModal(false); setModalError('') }}
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Store Modal */}
            {showEditModal && editingStore && (
                <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }}>
                    <div className="modal-card card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
                        <h2 style={{ marginBottom: '24px' }}>Editar Tienda: {editingStore.name}</h2>
                        {modalError && <div className="error-message">{modalError}</div>}
                        <form onSubmit={handleEditStore}>
                            <div className="input-group">
                                <label>Nombre de la Tienda</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>URL/Slug</label>
                                <input
                                    type="text"
                                    value={editForm.slug}
                                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    required
                                    placeholder="mi-tienda"
                                />
                            </div>
                            <div className="input-group">
                                <label>WhatsApp</label>
                                <input
                                    type="text"
                                    value={editForm.whatsapp}
                                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                                    placeholder="+1234567890"
                                />
                            </div>
                            <div className="form-group">
                                <label>URL del Logo</label>
                                <input
                                    type="url"
                                    value={editForm.logo_url}
                                    onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
                                    placeholder="https://ejemplo.com/logo.png"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }}
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Tienda"
                message={`¿Estás seguro de eliminar la tienda "${deleteTarget?.name}"? Esta acción eliminará todos los productos, categorías y el vendedor asociado.`}
                confirmText="Eliminar Tienda"
                cancelText="Cancelar"
                danger
                onConfirm={handleDeleteStore}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default SuperAdmin