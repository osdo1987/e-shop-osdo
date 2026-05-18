import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'

function Categories({ user }) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const toast = useToast()

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
            toast.error('Error al cargar categorías')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
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
                toast.success(`Categoría "${newCategoryName}" creada exitosamente`)
                setNewCategoryName('')
                fetchCategories()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al crear categoría')
            }
        } catch (err) {
            toast.error('Error de conexión')
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/categories/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success(`Categoría "${deleteTarget.name}" eliminada`)
                setDeleteTarget(null)
                fetchCategories()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar categoría')
            }
        } catch (error) {
            toast.error('Error de conexión')
        }
    }

    return (
        <>
            <AdminLayout title="Categorías" user={user}>
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Nueva Categoría</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de la categoría"
                            required
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary">Crear</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>Lista de Categorías ({categories.length})</h3>
                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
                    ) : categories.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No hay categorías. Crea la primera.</p>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <tr key={cat.id}>
                                                <td>{cat.name}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '4px 10px', fontSize: '12px' }}
                                                        onClick={() => setDeleteTarget(cat)}
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="mobile-cards">
                                {categories.map(cat => (
                                    <div key={cat.id} className="mobile-product-card">
                                        <div className="mobile-product-header">
                                            <span className="mobile-product-name">{cat.name}</span>
                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '4px 10px', fontSize: '12px' }}
                                                onClick={() => setDeleteTarget(cat)}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Categoría"
                message={`¿Estás seguro de eliminar la categoría "${deleteTarget?.name}"? Los productos asociados quedarán sin categoría.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Categories