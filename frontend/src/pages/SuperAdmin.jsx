import { useState, useEffect, useMemo } from 'react'
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
import Chip from '@mui/material/Chip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

const MONTHS = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
]

function SuperAdmin({ user, onLogout }) {
    const [stores, setStores] = useState([])
    const [metrics, setMetrics] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('stores')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [editingStore, setEditingStore] = useState(null)
    const [expandedStoreId, setExpandedStoreId] = useState(null)
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
    const [filterYear, setFilterYear] = useState(new Date().getFullYear())
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
        schedule: '',
        email: ''
    })
    const [modalError, setModalError] = useState('')
    const toast = useToast()

    useEffect(() => {
        if (viewMode === 'metrics') {
            fetchMetrics()
        } else {
            fetchStores()
        }
    }, [viewMode, filterMonth, filterYear])

    const fetchStores = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch('/api/stores', { headers })
            if (res.ok) setStores(await res.json())
        } catch (error) {
            toast.error('Error al cargar tiendas')
        } finally {
            setLoading(false)
        }
    }

    const fetchMetrics = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch(`/api/stores/metrics?month=${filterMonth}&year=${filterYear}`, { headers })
            if (res.ok) setMetrics(await res.json())
        } catch (error) {
            toast.error('Error al cargar métricas')
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
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        const sellerEmail = store.users?.find(u => u.role === 'SELLER')?.email || ''
        setEditingStore(store)
        setEditForm({
            name: store.name,
            slug: store.slug,
            whatsapp: store.whatsapp || '',
            logo_url: store.logo_url || '',
            business_type: store.business_type || 'store',
            address: store.address || '',
            schedule: store.schedule || '',
            email: sellerEmail
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
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            const storeRes = await fetch(`/api/stores/${editingStore.id}`, {
                method: 'PUT', headers,
                body: JSON.stringify({
                    name: editForm.name, slug: editForm.slug, whatsapp: editForm.whatsapp,
                    logo_url: editForm.logo_url, business_type: editForm.business_type,
                    address: editForm.address, schedule: editForm.schedule
                })
            })
            const storeData = await storeRes.json()
            if (!storeRes.ok) { setModalError(storeData.error || 'Error al actualizar la tienda'); setLoading(false); return }
            const seller = editingStore.users?.find(u => u.role === 'SELLER')
            if (seller && editForm.email !== seller.email) {
                const emailRes = await fetch(`/api/auth/users/${seller.id}/email`, {
                    method: 'PUT', headers,
                    body: JSON.stringify({ email: editForm.email })
                })
                const emailData = await emailRes.json()
                if (!emailRes.ok) { setModalError(emailData.error || 'Error al actualizar el correo'); setLoading(false); return }
            }
            toast.success('Tienda actualizada exitosamente')
            setShowEditModal(false); setEditingStore(null)
            fetchStores()
        } catch (error) { setModalError('Error de conexión') }
        finally { setLoading(false) }
    }

    const handleDeleteStore = async () => {
        if (!deleteTarget) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                toast.success(`Tienda "${deleteTarget.name}" eliminada exitosamente`)
                setDeleteTarget(null); fetchStores()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar la tienda')
            }
        } catch (error) { toast.error('Error de conexión') }
    }

    const filteredStores = stores.filter(store =>
        !searchTerm || store.name.toLowerCase().includes(searchTerm.toLowerCase()) || store.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: stores.length,
        withWhatsapp: stores.filter(s => s.whatsapp).length,
        totalProducts: stores.reduce((sum, s) => sum + (s.productCount || 0), 0)
    }

    // Metrics calculations
    const metricStats = {
        totalOrders: metrics.reduce((sum, m) => sum + (m.total_orders || 0), 0),
        ordersToday: metrics.reduce((sum, m) => sum + (m.orders_today || 0), 0),
        ordersInPeriod: metrics.reduce((sum, m) => sum + (m.orders_in_period || 0), 0),
        totalRevenue: metrics.reduce((sum, m) => sum + (m.revenue || 0), 0),
        revenueToday: metrics.reduce((sum, m) => sum + (m.revenue_today || 0), 0),
        revenueInPeriod: metrics.reduce((sum, m) => sum + (m.revenue_in_period || 0), 0),
        activeStores: metrics.filter(m => m.last_login || m.total_orders > 0).length,
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        const d = new Date(dateStr)
        const now = new Date()
        const diff = now - d
        const mins = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)
        if (mins < 60) return `Hace ${mins} min`
        if (hours < 24) return `Hace ${hours}h`
        if (days === 1) return 'Ayer'
        if (days < 7) return `Hace ${days} días`
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    }

    const getLastLoginBadge = (lastLogin) => {
        if (!lastLogin) return { color: 'default', label: 'Nunca', dot: '⚪' }
        const d = new Date(lastLogin)
        const now = new Date()
        const diff = now - d
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)
        if (hours < 24) return { color: 'success', label: 'Hoy', dot: '🟢' }
        if (days < 7) return { color: 'warning', label: 'Semana', dot: '🟡' }
        return { color: 'error', label: `Hace ${days}d`, dot: '🔴' }
    }

    const getPeriodLabel = () => {
        const month = MONTHS.find(m => m.value === filterMonth)
        return month ? `${month.label} ${filterYear}` : `${filterYear}`
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
                required fullWidth
            />
            <TextField
                label="URL/Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                required placeholder="mi-tienda" fullWidth
            />
            <TextField
                label="WhatsApp (opcional)"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+1234567890" fullWidth
            />
            {form.business_type === 'restaurant' && (
                <>
                    <TextField label="Dirección" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle 123 #45-67, Ciudad" fullWidth />
                    <TextField label="Horario" value={form.schedule || ''} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Lun-Vie 8am-8pm, Sáb 9am-6pm" fullWidth />
                </>
            )}
            <Box>
                <TextField label="Logo de la Tienda (opcional)" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://ejemplo.com/logo.png" fullWidth size="small" sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>Puedes pegar una URL o subir una imagen desde tu computador</Typography>
                <Box component="label" sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 1, p: 2.5, textAlign: 'center', color: 'text.disabled', fontSize: '0.8125rem', cursor: 'pointer', display: 'block', bgcolor: 'background.default', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                    📸 Arrastra una imagen aquí o haz clic para seleccionar
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => { setForm({ ...form, logo_url: ev.target.result }) }; reader.readAsDataURL(file) } }} />
                </Box>
                {form.logo_url && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="img" src={form.logo_url} alt="Preview logo" sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                        <Button variant="outlined" size="small" onClick={() => setForm({ ...form, logo_url: '' })}>Quitar imagen</Button>
                    </Box>
                )}
            </Box>
            {includePassword && (
                <>
                    <TextField label="Email del Vendedor" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required fullWidth />
                    <TextField label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required inputProps={{ minLength: 6 }} fullWidth />
                </>
            )}
            {!includePassword && (
                <TextField label="Email del Vendedor" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth helperText="Actualizará el correo del vendedor asociado" />
            )}
        </Box>
    )

    return (
        <>
            <AdminLayout title="Gestión de Tiendas" user={user} onLogout={onLogout} superadmin>
                {/* View Mode Toggle */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)} size="small">
                        <ToggleButton value="stores" sx={{ fontWeight: 700, px: 3 }}>🏪 Tiendas</ToggleButton>
                        <ToggleButton value="metrics" sx={{ fontWeight: 700, px: 3 }}>📊 Métricas</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {viewMode === 'stores' ? (
                    <>
                        {!loading && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                                <StatCard title="Negocios" value={stats.total} icon="🏪" color="#6366f1" />
                                <StatCard title="Con WhatsApp" value={stats.withWhatsapp} icon="💬" color="#10b981" />
                                <StatCard title="Productos" value={stats.totalProducts} icon="📦" color="#f59e0b" />
                            </Box>
                        )}
                        <Card sx={{ mb: 3 }}>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    <TextField label="Buscar tienda" placeholder="Buscar por nombre o slug..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" sx={{ flex: 2, minWidth: 200 }} />
                                    <Box sx={{ alignSelf: 'flex-end' }}>
                                        <Button variant="contained" onClick={() => setShowCreateModal(true)} sx={{ whiteSpace: 'nowrap' }}>+ Nuevo Negocio</Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Negocios ({filteredStores.length})</Typography>
                                {loading ? (
                                    <Typography color="text.secondary">Cargando...</Typography>
                                ) : filteredStores.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
                                        {stores.length === 0 ? 'No hay negocios registrados.' : 'No se encontraron negocios con ese filtro.'}
                                    </Typography>
                                ) : (
                                    <>
                                        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.50' } }}>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>Nombre</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>Tipo</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>Slug/URL</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>WhatsApp</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>Vendedor</TableCell>
                                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', py: 2, borderBottom: '2px solid', borderColor: 'divider' }}>Acciones</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredStores.map((store, index) => (
                                                        <TableRow
                                                            key={store.id}
                                                            hover
                                                            sx={{
                                                                bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50',
                                                                transition: 'background-color 0.2s',
                                                                '&:hover': { bgcolor: 'action.hover' },
                                                                '&:last-child td': { borderBottom: 0 }
                                                            }}
                                                        >
                                                            <TableCell sx={{ fontWeight: 700, py: 2.5, color: 'text.primary' }}>{store.name}</TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                <Chip
                                                                    label={store.business_type === 'restaurant' ? 'Restaurante' : 'Tienda'}
                                                                    size="small"
                                                                    icon={<span>{store.business_type === 'restaurant' ? '🍽️' : '🏪'}</span>}
                                                                    sx={{
                                                                        fontWeight: 600, fontSize: '0.75rem',
                                                                        bgcolor: store.business_type === 'restaurant' ? '#fff3e0' : '#e8f5e9',
                                                                        color: store.business_type === 'restaurant' ? '#e65100' : '#2e7d32',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                <Typography
                                                                    component="a"
                                                                    href={`/${store.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        textDecoration: 'none',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.875rem',
                                                                        fontFamily: 'monospace',
                                                                        '&:hover': { textDecoration: 'underline' }
                                                                    }}
                                                                >
                                                                    /{store.slug}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                {store.whatsapp ? (
                                                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{store.whatsapp}</Typography>
                                                                ) : (
                                                                    <Typography component="span" variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>No registrado</Typography>
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                {store.users?.find(u => u.role === 'SELLER')?.email ? (
                                                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{store.users.find(u => u.role === 'SELLER').email}</Typography>
                                                                ) : (
                                                                    <Chip label="Sin vendedor" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.6875rem', color: 'text.disabled' }} />
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        component="a"
                                                                        href={`/${store.slug}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 70, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                                                    >
                                                                        Ver
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => openEditModal(store)}
                                                                        sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 70, textTransform: 'none' }}
                                                                    >
                                                                        Editar
                                                                    </Button>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => setDeleteTarget(store)}
                                                                        sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 80, textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                                                                    >
                                                                        Eliminar
                                                                    </Button>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                                            {filteredStores.map(store => (
                                                <Card key={store.id} variant="outlined" sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{store.name}</Typography>
                                                            <Chip
                                                                label={store.business_type === 'restaurant' ? '🍽️ Restaurante' : '🏪 Tienda'}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 600, fontSize: '0.6875rem',
                                                                    bgcolor: store.business_type === 'restaurant' ? '#fff3e0' : '#e8f5e9',
                                                                    color: store.business_type === 'restaurant' ? '#e65100' : '#2e7d32',
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
                                                            <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>/{store.slug}</Typography>
                                                            <Typography component="span">{store.whatsapp || 'Sin WhatsApp'}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                                                            <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                                                                <Button variant="text" size="small" fullWidth sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'none' }}>Ver</Button>
                                                            </a>
                                                            <Button variant="outlined" size="small" sx={{ flex: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'none' }} onClick={() => openEditModal(store)}>Editar</Button>
                                                            <Button variant="contained" color="error" size="small" sx={{ flex: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', boxShadow: 'none' }} onClick={() => setDeleteTarget(store)}>Eliminar</Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        {/* Metrics - Month/Year Filter */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>Mes</InputLabel>
                                        <Select value={filterMonth} label="Mes" onChange={(e) => setFilterMonth(e.target.value)}>
                                            {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Año"
                                        type="number"
                                        size="small"
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
                                        sx={{ minWidth: 100 }}
                                        inputProps={{ min: 2024, max: 2030 }}
                                    />
                                    <Button variant="contained" size="small" onClick={fetchMetrics} sx={{ height: 40 }}>
                                        Filtrar
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>

                        {!loading && metrics.length > 0 && (
                            <>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
                                    <StatCard title="Pedidos Totales" value={metricStats.totalOrders} icon="📋" color="#6366f1" subtitle="Histórico" />
                                    <StatCard title="Pedidos Hoy" value={metricStats.ordersToday} icon="📊" color="#10b981" subtitle="Este día" />
                                    <StatCard title={`Pedidos ${getPeriodLabel()}`} value={metricStats.ordersInPeriod} icon="📆" color="#8b5cf6" subtitle="Periodo filtrado" />
                                    <StatCard title="Ingresos Totales" value={`$${metricStats.totalRevenue.toLocaleString()}`} icon="💰" color="#f59e0b" subtitle="Sin cancelados" />
                                    <StatCard title={`Ingresos ${getPeriodLabel()}`} value={`$${metricStats.revenueInPeriod.toLocaleString()}`} icon="📈" color="#1abc9c" subtitle="Periodo filtrado" />
                                    <StatCard title="Negocios Activos" value={metricStats.activeStores} icon="✅" color="#3b82f6" subtitle="Con actividad" />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Métricas por Negocio</Typography>

                                {metrics.map(m => {
                                    const badge = getLastLoginBadge(m.last_login)
                                    const isExpanded = expandedStoreId === m.id
                                    return (
                                        <Accordion
                                            key={m.id}
                                            expanded={isExpanded}
                                            onChange={() => setExpandedStoreId(isExpanded ? null : m.id)}
                                            sx={{ mb: 1.5, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: isExpanded ? 3 : 1 }}
                                        >
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 2, '&.Mui-expanded': { borderBottom: 1, borderColor: 'divider' } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: '100%', pr: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{m.business_type === 'restaurant' ? '🍽️' : '🏪'}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', ml: 'auto' }}>
                                                        <Chip icon={<span>{badge.dot}</span>} label={badge.label} size="small"
                                                            color={badge.color === 'default' ? 'default' : badge.color}
                                                            variant={badge.color === 'default' ? 'outlined' : 'filled'}
                                                            sx={{ fontWeight: 600, fontSize: '0.6875rem' }} />
                                                        <Chip label={`${m.orders_today || 0} hoy`} size="small"
                                                            color={m.orders_today > 0 ? 'success' : 'default'}
                                                            variant={m.orders_today > 0 ? 'filled' : 'outlined'} sx={{ fontWeight: 600, fontSize: '0.6875rem' }} />
                                                        <Chip label={`${m.orders_in_period || 0} en ${getPeriodLabel()}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.6875rem' }} />
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}>
                                                            ${(m.revenue_in_period || 0).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ p: 3 }}>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                                                    {/* Orders Section */}
                                                    <Box>
                                                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>📋 Pedidos</Typography>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" color="text.secondary">Hoy</Typography>
                                                                <Chip label={m.orders_today || '0'} size="small" color={m.orders_today > 0 ? 'success' : 'default'} variant={m.orders_today > 0 ? 'filled' : 'outlined'} sx={{ fontWeight: 700 }} />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" color="text.secondary">Esta semana</Typography>
                                                                <Typography sx={{ fontWeight: 700 }}>{m.orders_this_week}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" color="text.secondary">{getPeriodLabel()}</Typography>
                                                                <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{m.orders_in_period}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" color="text.secondary">Total histórico</Typography>
                                                                <Typography sx={{ fontWeight: 700 }}>{m.total_orders}</Typography>
                                                            </Box>
                                                            <Divider sx={{ my: 1 }} />
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body2" color="text.secondary">Último pedido</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(m.last_order_date)}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    {/* Status Breakdown */}
                                                    <Box>
                                                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>📊 Estados</Typography>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {[
                                                                { key: 'PENDIENTE', label: 'Pendientes', color: '#f59e0b' },
                                                                { key: 'CONFIRMADO', label: 'Confirmados', color: '#3b82f6' },
                                                                { key: 'EN_PREPARACION', label: 'En preparación', color: '#8b5cf6' },
                                                                { key: 'EN_CAMINO', label: 'En camino', color: '#10b981' },
                                                                { key: 'ENTREGADO', label: 'Entregados', color: '#22c55e' },
                                                                { key: 'CANCELADO', label: 'Cancelados', color: '#ef4444' },
                                                            ].map(st => (
                                                                <Box key={st.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: st.color, flexShrink: 0 }} />
                                                                        <Typography variant="body2" color="text.secondary">{st.label}</Typography>
                                                                    </Box>
                                                                    <Typography sx={{ fontWeight: 700 }}>{m.status_counts?.[st.key] || 0}</Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>

                                                    {/* Revenue Section */}
                                                    <Box>
                                                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>💰 Ingresos</Typography>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body2" color="text.secondary">Hoy</Typography>
                                                                <Typography sx={{ fontWeight: 700, color: m.revenue_today > 0 ? 'success.main' : 'text.secondary' }}>
                                                                    ${(m.revenue_today || 0).toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body2" color="text.secondary">Esta semana</Typography>
                                                                <Typography sx={{ fontWeight: 700 }}>${(m.revenue_this_week || 0).toLocaleString()}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body2" color="text.secondary">{getPeriodLabel()}</Typography>
                                                                <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
                                                                    ${(m.revenue_in_period || 0).toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                            <Divider sx={{ my: 1 }} />
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body2" color="text.secondary">Total histórico</Typography>
                                                                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                                                    ${(m.revenue || 0).toLocaleString()}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    {/* Seller Activity */}
                                                    <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                                                        <Divider sx={{ mb: 2 }} />
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 Vendedor</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.users?.find(u => u.role === 'SELLER')?.email || 'Sin asignar'}</Typography>
                                                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="caption" color="text.disabled">Último acceso:</Typography>
                                                                <Chip icon={<span>{badge.dot}</span>} label={badge.label} size="small"
                                                                    color={badge.color === 'default' ? 'default' : badge.color}
                                                                    variant={badge.color === 'default' ? 'outlined' : 'filled'}
                                                                    sx={{ fontWeight: 600, fontSize: '0.6875rem' }} />
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    )
                                })}
                            </>
                        )}

                        {!loading && metrics.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography variant="h6" color="text.secondary">No hay métricas para {getPeriodLabel()}</Typography>
                            </Box>
                        )}

                        {loading && <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>Cargando métricas...</Typography>}
                    </>
                )}
            </AdminLayout>

            <Dialog open={showCreateModal} onClose={() => { setShowCreateModal(false); setModalError('') }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Crear Nuevo Negocio</DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{modalError}</Alert>}
                    <Box component="form" onSubmit={handleCreateStore} id="create-store-form" sx={{ mt: 1 }}>
                        {renderStoreForm(newStore, setNewStore, true)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => { setShowCreateModal(false); setModalError('') }} variant="outlined" fullWidth>Cancelar</Button>
                    <Button type="submit" form="create-store-form" variant="contained" fullWidth disabled={loading}>{loading ? 'Creando...' : 'Crear Negocio'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Editar Negocio: {editingStore?.name}</DialogTitle>
                <DialogContent>
                    {modalError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{modalError}</Alert>}
                    <Box component="form" onSubmit={handleEditStore} id="edit-store-form" sx={{ mt: 1 }}>
                        {renderStoreForm(editForm, setEditForm, false)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }} variant="outlined" fullWidth>Cancelar</Button>
                    <Button type="submit" form="edit-store-form" variant="contained" fullWidth disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
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