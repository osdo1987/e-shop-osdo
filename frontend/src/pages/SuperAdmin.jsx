import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

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
        business_type: 'store',
        address: '',
        schedule: '',
        email: '',
        password: ''
    })
    const [editForm, setEditForm] = useState({
        name: '',
        slug: '',
        whatsapp: '',
        logo_url: '',
        business_type: 'store',
        address: '',
        schedule: ''
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
                toast.success('Negocio y vendedor creados exitosamente')
                setShowCreateModal(false)
                setNewStore({ storeName: '', slug: '', whatsapp: '', logo_url: '', business_type: 'store', address: '', schedule: '', email: '', password: '' })
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
            logo_url: store.logo_url || '',
            business_type: store.business_type || 'store',
            address: store.address || '',
            schedule: store.schedule || ''
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

    const renderStoreForm = (form, setForm, includePassword = false) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
                <InputLabel id="business-type-label">Tipo de Negocio</InputLabel>
                <Select
                    labelId="business-type-label"
                    value={form.business_type || 'store'}
                    label="Tipo de Negocio"
                    onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                >
                    <MenuItem value="store">🏪 Tienda</MenuItem>
                    <MenuItem value="restaurant">🍽️ Restaurante / Negocio de Comida</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label={form.business_type === 'restaurant' ? 'Nombre del Restaurante' : 'Nombre de la Tienda'}
                value={form.storeName || form.name}
                onChange={(e) => setForm({ ...form, [includePassword ? 'storeName' : 'name']: e.target.value })}
                required
                fullWidth
            />
            <TextField
                label="URL/Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                required
                placeholder="mi-tienda"
                fullWidth
            />
            <TextField
                label="WhatsApp (opcional)"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+1234567890"
                fullWidth
            />
            {form.business_type === 'restaurant' && (
                <>
                    <TextField
                        label="Dirección"
                        value={form.address || ''}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Calle 123 #45-67, Ciudad"
                        fullWidth
                    />
                    <TextField
                        label="Horario"
                        value={form.schedule || ''}
                        onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                        placeholder="Lun-Vie 8am-8pm, Sáb 9am-6pm"
                        fullWidth
                    />
                </>
            )}
            <Box>
                <TextField
                    label="Logo de la Tienda (opcional)"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://ejemplo.com/logo.png"
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                    Puedes pegar una URL o subir una imagen desde tu computador
                </Typography>
                <Box
                    component="label"
                    sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2.5,
                        textAlign: 'center',
                        color: 'text.disabled',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'block',
                        bgcolor: 'background.default',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main' },
                    }}
                >
                    📸 Arrastra una imagen aquí o haz clic para seleccionar
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                                const reader = new FileReader()
                                reader.onload = (ev) => {
                                    setForm({ ...form, logo_url: ev.target.result })
                                }
                                reader.readAsDataURL(file)
                            }
                        }}
                    />
                </Box>
                {form.logo_url && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="img" src={form.logo_url} alt="Preview logo" sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                        <Button variant="outlined" size="small" onClick={() => setForm({ ...form, logo_url: '' })}>
                            Quitar imagen
                        </Button>
                    </Box>
                )}
            </Box>
            {includePassword && (
                <>
                    <TextField
                        label="Email del Vendedor"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        inputProps={{ minLength: 6 }}
                        fullWidth
                    />
                </>
            )}
        </Box>
    )

    return (
        <>
            <AdminLayout title="Gestión de Tiendas" user={user} onLogout={onLogout} superadmin>
                {!loading && (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 2,
                        mb: 3
                    }}>
                        <StatCard title="Negocios" value={stats.total} icon="🏪" color="#6366f1" />
                        <StatCard title="Con WhatsApp" value={stats.withWhatsapp} icon="💬" color="#10b981" />
                        <StatCard title="Productos" value={stats.totalProducts} icon="📦" color="#f59e0b" />
                    </Box>
                )}

                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <TextField
                                label="Buscar tienda"
                                placeholder="Buscar por nombre o slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                sx={{ flex: 2, minWidth: 200 }}
                            />
                            <Box sx={{ alignSelf: 'flex-end' }}>
                                <Button variant="contained" onClick={() => setShowCreateModal(true)} sx={{ whiteSpace: 'nowrap' }}>
                                    + Nuevo Negocio
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Negocios ({filteredStores.length})
                        </Typography>
                        {loading ? (
                            <Typography color="text.secondary">Cargando...</Typography>
                        ) : filteredStores.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" sx={{ py: 5 }}>
                                {stores.length === 0 ? 'No hay negocios registrados.' : 'No se encontraron negocios con ese filtro.'}
                            </Typography>
                        ) : (
                            <>
                                <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nombre</TableCell>
                                                <TableCell>Tipo</TableCell>
                                                <TableCell>Slug/URL</TableCell>
                                                <TableCell>WhatsApp</TableCell>
                                                <TableCell>Vendedor</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredStores.map(store => (
                                                <TableRow key={store.id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{store.name}</TableCell>
                                                    <TableCell>
                                                        {store.business_type === 'restaurant' ? '🍽️ Restaurante' : '🏪 Tienda'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                                                            /{store.slug}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>{store.whatsapp || <Typography component="span" color="text.disabled">—</Typography>}</TableCell>
                                                    <TableCell>
                                                        {store.users?.find(u => u.role === 'SELLER')?.email || (
                                                            <Typography component="span" color="text.disabled">Sin vendedor</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                                                            <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="outlined" size="small" title="Ver catálogo público">👁️ Ver</Button>
                                                            </a>
                                                            <Button variant="outlined" size="small" onClick={() => openEditModal(store)}>✏️ Editar</Button>
                                                            <Button variant="contained" color="error" size="small" onClick={() => setDeleteTarget(store)}>🗑️ Eliminar</Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>

                                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                                    {filteredStores.map(store => (
                                        <Card key={store.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography sx={{ fontWeight: 600 }}>{store.name}</Typography>
                                                    <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outlined" size="small" sx={{ fontSize: '0.6875rem', px: 1 }}>👁️ Ver</Button>
                                                    </a>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1.5, mb: 1, fontSize: '0.8125rem', color: 'text.secondary' }}>
                                                    <span>/{store.slug}</span>
                                                    <span>{store.whatsapp || 'Sin WhatsApp'}</span>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.75 }}>
                                                    <Button variant="outlined" size="small" sx={{ flex: 1 }} onClick={() => openEditModal(store)}>✏️ Editar</Button>
                                                    <Button variant="contained" color="error" size="small" sx={{ flex: 1 }} onClick={() => setDeleteTarget(store)}>🗑️ Eliminar</Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            {/* Create Store Modal */}
            <Dialog
                open={showCreateModal}
                onClose={() => { setShowCreateModal(false); setModalError('') }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Crear Nuevo Negocio</DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{modalError}</Alert>}
                    <Box component="form" onSubmit={handleCreateStore} id="create-store-form" sx={{ mt: 1 }}>
                        {renderStoreForm(newStore, setNewStore, true)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => { setShowCreateModal(false); setModalError('') }} variant="outlined" fullWidth>
                        Cancelar
                    </Button>
                    <Button type="submit" form="create-store-form" variant="contained" fullWidth disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Negocio'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Store Modal */}
            <Dialog
                open={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                    Editar Negocio: {editingStore?.name}
                </DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{modalError}</Alert>}
                    <Box component="form" onSubmit={handleEditStore} id="edit-store-form" sx={{ mt: 1 }}>
                        {renderStoreForm(editForm, setEditForm, false)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }} variant="outlined" fullWidth>
                        Cancelar
                    </Button>
                    <Button type="submit" form="edit-store-form" variant="contained" fullWidth disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Negocio"
                message={`¿Estás seguro de eliminar el negocio "${deleteTarget?.name}"? Esta acción eliminará todos los productos, categorías y el vendedor asociado.`}
                confirmText="Eliminar Negocio"
                cancelText="Cancelar"
                danger
                onConfirm={handleDeleteStore}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default SuperAdmin