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
import StoreIcon from '@mui/icons-material/Store'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import { useTheme, alpha } from '@mui/material/styles'

const keyframes = `
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes icon-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
`

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

const sectionBoxSx = (isDark) => ({
    background: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
    border: isDark ? '1px solid rgba(180,197,255,0.10)' : '1px solid rgba(0,74,198,0.08)',
    borderRadius: '14px',
})

const accentCardSx = (isDark) => ({
    position: 'relative',
    overflow: 'visible',
    borderRadius: '16px',
    boxShadow: isDark
        ? '0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(180,197,255,0.08)'
        : '0 4px 24px rgba(0,74,198,0.06), 0 0 0 1px rgba(0,74,198,0.05)',
    background: isDark ? 'rgba(20,20,42,0.95)' : '#ffffff',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #004ac6, #2563eb, #5092f7)',
        borderRadius: '16px 16px 0 0',
    },
})

const inputSx = (isDark) => ({
    borderRadius: '14px',
    '& .MuiOutlinedInput-root': {
        borderRadius: '14px',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? 'rgba(180,197,255,0.4)' : 'rgba(0,74,198,0.4)',
        },
        '&.Mui-focused': {
            boxShadow: isDark
                ? '0 0 0 3px rgba(0,74,198,0.15)'
                : '0 0 0 3px rgba(0,74,198,0.1)',
        },
    },
})

function SuperAdmin({ user, onLogout }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

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
    const [staffDialogOpen, setStaffDialogOpen] = useState(false)
    const [staffStore, setStaffStore] = useState(null)
    const [staffList, setStaffList] = useState([])
    const [staffLoading, setStaffLoading] = useState(false)
    const [newStaffEmail, setNewStaffEmail] = useState('')
    const [newStaffPassword, setNewStaffPassword] = useState('')
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
    const [newStoreLogoFile, setNewStoreLogoFile] = useState(null)
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
    const [editLogoFile, setEditLogoFile] = useState(null)
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
            const body = new FormData()
            body.append('storeName', newStore.storeName)
            body.append('slug', newStore.slug)
            body.append('whatsapp', newStore.whatsapp)
            body.append('business_type', newStore.business_type)
            body.append('address', newStore.address)
            body.append('schedule', newStore.schedule)
            body.append('email', newStore.email)
            body.append('password', newStore.password)
            if (newStoreLogoFile) body.append('logo', newStoreLogoFile)

            const res = await fetch('/api/auth/register-seller', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Negocio y gerente creados exitosamente')
                setShowCreateModal(false)
                setNewStore({ storeName: '', slug: '', whatsapp: '', logo_url: '', business_type: 'store', address: '', schedule: '', email: '', password: '' })
                setNewStoreLogoFile(null)
                fetchStores()
            } else {
                toast.error(data.error || 'Error al crear la tienda')
            }
        } catch (error) {
            toast.error('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const openEditModal = (store) => {
        const sellerEmail = store.users?.find(u => u.role === 'MANAGER')?.email || ''
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
        setEditLogoFile(null)
        setModalError('')
        setShowEditModal(true)
    }

    const handleEditStore = async (e) => {
        e.preventDefault()
        setModalError('')
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const body = new FormData()
            body.append('name', editForm.name)
            body.append('slug', editForm.slug)
            body.append('whatsapp', editForm.whatsapp)
            body.append('business_type', editForm.business_type)
            body.append('address', editForm.address)
            body.append('schedule', editForm.schedule)
            if (editLogoFile) body.append('logo', editLogoFile)

            const storeRes = await fetch(`/api/stores/${editingStore.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body
            })
            const storeData = await storeRes.json()
            if (!storeRes.ok) { toast.error(storeData.error || 'Error al actualizar la tienda'); setLoading(false); return }
            const seller = editingStore.users?.find(u => u.role === 'MANAGER')
            if (seller && editForm.email !== seller.email) {
                const emailRes = await fetch(`/api/auth/users/${seller.id}/email`, {
                    method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: editForm.email })
                })
                const emailData = await emailRes.json()
                if (!emailRes.ok) { toast.error(emailData.error || 'Error al actualizar el correo'); setLoading(false); return }
            }
            toast.success('Tienda actualizada exitosamente')
            setShowEditModal(false); setEditingStore(null); setEditLogoFile(null)
            fetchStores()
        } catch (error) { toast.error('Error de conexión') }
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

    const openStaffDialog = async (store) => {
        setStaffStore(store)
        setStaffDialogOpen(true)
        setStaffLoading(true)
        setNewStaffEmail('')
        setNewStaffPassword('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/auth/staff?store_id=${store.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            if (res.ok) setStaffList(await res.json())
            else setStaffList([])
        } catch { setStaffList([]) }
        finally { setStaffLoading(false) }
    }

    const handleCreateStaff = async (e) => {
        e.preventDefault()
        if (!newStaffEmail || !newStaffPassword) { toast.error('Email y contraseña son obligatorios'); return }
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/register-staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: newStaffEmail, password: newStaffPassword, store_id: staffStore.id })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Empleado creado exitosamente')
                setNewStaffEmail(''); setNewStaffPassword('')
                openStaffDialog(staffStore)
            } else {
                toast.error(data.error || 'Error al crear empleado')
            }
        } catch { toast.error('Error de conexión') }
    }

    const handleDeleteStaff = async (staffId) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/auth/staff/${staffId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Empleado eliminado')
                openStaffDialog(staffStore)
            } else {
                toast.error(data.error || 'Error al eliminar empleado')
            }
        } catch { toast.error('Error de conexión') }
    }

    const filteredStores = stores.filter(store =>
        !searchTerm || store.name.toLowerCase().includes(searchTerm.toLowerCase()) || store.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: stores.length,
        withWhatsapp: stores.filter(s => s.whatsapp).length,
        totalProducts: stores.reduce((sum, s) => sum + (s.productCount || 0), 0)
    }

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

    const renderStoreForm = (form, setForm, includePassword = false, setLogoFile = null) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
                <InputLabel id="business-type-label">Tipo de Negocio</InputLabel>
                <Select
                    labelId="business-type-label"
                    value={form.business_type || 'store'}
                    label="Tipo de Negocio"
                    onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                    sx={{ borderRadius: '14px' }}
                >
                    <MenuItem value="store">🏪 Tienda</MenuItem>
                    <MenuItem value="restaurant">🍽️ Restaurante / Negocio de Comida</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label={form.business_type === 'restaurant' ? 'Nombre del Restaurante' : 'Nombre de la Tienda'}
                value={form.storeName || form.name}
                onChange={(e) => setForm({ ...form, [includePassword ? 'storeName' : 'name']: e.target.value })}
                required fullWidth sx={inputSx(isDark)}
            />
            <TextField
                label="URL/Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                required placeholder="mi-tienda" fullWidth sx={inputSx(isDark)}
            />
            <TextField
                label="WhatsApp (opcional)"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+1234567890" fullWidth sx={inputSx(isDark)}
            />
            {form.business_type === 'restaurant' && (
                <>
                    <TextField label="Dirección" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle 123 #45-67, Ciudad" fullWidth sx={inputSx(isDark)} />
                    <TextField label="Horario" value={form.schedule || ''} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Lun-Vie 8am-8pm, Sáb 9am-6pm" fullWidth sx={inputSx(isDark)} />
                </>
            )}
            <Box>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>Sube una imagen desde tu computador</Typography>
                <Box
                    component="label"
                    sx={{
                        border: '2px dashed',
                        borderColor: isDark ? 'rgba(180,197,255,0.2)' : 'rgba(0,74,198,0.2)',
                        borderRadius: '14px',
                        p: 2.5,
                        textAlign: 'center',
                        color: 'text.disabled',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'block',
                        background: isDark ? 'rgba(0,74,198,0.03)' : 'rgba(0,74,198,0.02)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            borderColor: 'primary.main',
                            background: isDark ? 'rgba(0,74,198,0.06)' : 'rgba(0,74,198,0.04)',
                        }
                    }}
                >
                    📸 Arrastra una imagen aquí o haz clic para seleccionar
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (file) { if (setLogoFile) setLogoFile(file); const preview = URL.createObjectURL(file); setForm({ ...form, logo_url: preview }) } }} />
                </Box>
                {form.logo_url && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="img" src={form.logo_url} alt="Preview logo" sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '10px' }} />
                        <Button variant="outlined" size="small" onClick={() => setForm({ ...form, logo_url: '' })} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Quitar imagen</Button>
                    </Box>
                )}
            </Box>
            {includePassword && (
                <>
                    <TextField label="Email del Gerente" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required fullWidth sx={inputSx(isDark)} />
                    <TextField label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required slotProps={{ htmlInput: { minLength: 6 } }} fullWidth sx={inputSx(isDark)} />
                </>
            )}
            {!includePassword && (
                <TextField label="Email del Gerente" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth helperText="Actualizará el correo del gerente asociado" sx={inputSx(isDark)} />
            )}
        </Box>
    )

    const tableHeaderCellSx = {
        fontWeight: 700,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'text.secondary',
        py: 2,
        borderBottom: '2px solid',
        borderColor: 'divider',
        background: 'transparent',
    }

    const businessTypeChipSx = (type) => ({
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: '8px',
        bgcolor: type === 'restaurant'
            ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)')
            : (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)'),
        color: type === 'restaurant'
            ? (isDark ? '#fbbf24' : '#d97706')
            : (isDark ? '#34d399' : '#059669'),
        border: type === 'restaurant'
            ? (isDark ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(245,158,11,0.15)')
            : (isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.15)'),
    })

    return (
        <>
            <style>{keyframes}</style>
            <AdminLayout title="Gestión de Tiendas" user={user} onLogout={onLogout} superadmin>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                borderRadius: '12px !important',
                                border: isDark
                                    ? '1px solid rgba(180,197,255,0.2) !important'
                                    : '1px solid rgba(0,74,198,0.15) !important',
                                textTransform: 'none',
                                transition: 'all 0.25s ease',
                                '&.Mui-selected': {
                                    background: isDark
                                        ? 'linear-gradient(135deg, rgba(0,74,198,0.25), rgba(37,99,235,0.25))'
                                        : 'linear-gradient(135deg, rgba(0,74,198,0.1), rgba(37,99,235,0.1))',
                                    color: 'primary.main',
                                    fontWeight: 800,
                                    boxShadow: isDark
                                        ? '0 2px 12px rgba(0,74,198,0.2)'
                                        : '0 2px 12px rgba(0,74,198,0.1)',
                                    '&:hover': {
                                        background: isDark
                                            ? 'linear-gradient(135deg, rgba(0,74,198,0.3), rgba(37,99,235,0.3))'
                                            : 'linear-gradient(135deg, rgba(0,74,198,0.15), rgba(37,99,235,0.15))',
                                    },
                                },
                                '&:hover': {
                                    background: isDark ? 'rgba(0,74,198,0.08)' : 'rgba(0,74,198,0.04)',
                                },
                            },
                            mx: 'auto',
                        }}
                    >
                        <ToggleButton value="stores">🏪 Tiendas</ToggleButton>
                        <ToggleButton value="metrics">📊 Métricas</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {viewMode === 'stores' ? (
                    <>
                        {!loading && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                                <StatCard title="Negocios" value={stats.total} icon="🏪" color="#004ac6" />
                                <StatCard title="Con WhatsApp" value={stats.withWhatsapp} icon="💬" color="#10b981" />
                                <StatCard title="Productos" value={stats.totalProducts} icon="📦" color="#f59e0b" />
                            </Box>
                        )}

                        <Card sx={{ ...accentCardSx(isDark), mb: 3 }}>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    <TextField
                                        label="Buscar tienda"
                                        placeholder="Buscar por nombre o slug..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{ flex: 2, minWidth: 200, ...inputSx(isDark) }}
                                        InputProps={{
                                            startAdornment: (
                                                <SearchIcon sx={{ mr: 1, color: 'text.disabled', fontSize: '1.1rem' }} />
                                            ),
                                        }}
                                    />
                                    <Box sx={{ alignSelf: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => setShowCreateModal(true)}
                                            startIcon={<AddIcon />}
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                px: 2.5,
                                                py: 1,
                                                background: 'linear-gradient(135deg, #004ac6, #2563eb)',
                                                boxShadow: isDark
                                                    ? '0 4px 16px rgba(0,74,198,0.3)'
                                                    : '0 4px 16px rgba(0,74,198,0.2)',
                                                transition: 'all 0.25s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5558e6, #7c4fe0)',
                                                    boxShadow: isDark
                                                        ? '0 6px 24px rgba(0,74,198,0.4)'
                                                        : '0 6px 24px rgba(0,74,198,0.25)',
                                                    transform: 'translateY(-1px)',
                                                },
                                            }}
                                        >
                                            Nuevo Negocio
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={accentCardSx(isDark)}>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                    Negocios ({filteredStores.length})
                                </Typography>
                                {loading ? (
                                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>Cargando...</Typography>
                                ) : filteredStores.length === 0 ? (
                                    <Box sx={{ ...sectionBoxSx(isDark), py: 6, textAlign: 'center' }}>
                                        <StoreIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                                            {stores.length === 0 ? 'No hay negocios registrados.' : 'No se encontraron negocios con ese filtro.'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <Paper
                                            sx={{
                                                width: '100%',
                                                overflow: 'hidden',
                                                borderRadius: '14px',
                                                border: isDark
                                                    ? '1px solid rgba(180,197,255,0.1)'
                                                    : '1px solid rgba(0,74,198,0.08)',
                                                display: { xs: 'none', md: 'block' },
                                                background: 'transparent',
                                                boxShadow: 'none',
                                            }}
                                        >
                                            <Table>
                                                <TableHead>
                                                    <TableRow sx={{
                                                        '&:hover': { bgcolor: 'transparent' },
                                                        '& th:first-of-type': { borderRadius: '12px 0 0 0' },
                                                        '& th:last-of-type': { borderRadius: '0 12px 0 0' },
                                                    }}>
                                                        <TableCell sx={tableHeaderCellSx}>Nombre</TableCell>
                                                        <TableCell sx={tableHeaderCellSx}>Tipo</TableCell>
                                                        <TableCell sx={tableHeaderCellSx}>Slug/URL</TableCell>
                                                        <TableCell sx={tableHeaderCellSx}>WhatsApp</TableCell>
                                                        <TableCell sx={tableHeaderCellSx}>Gerente</TableCell>
                                                        <TableCell sx={tableHeaderCellSx}>Acciones</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredStores.map((store, index) => (
                                                        <TableRow
                                                            key={store.id}
                                                            hover
                                                            sx={{
                                                                animation: 'fade-in-up 0.3s ease',
                                                                animationDelay: `${index * 0.03}s`,
                                                                animationFillMode: 'backwards',
                                                                transition: 'all 0.2s ease',
                                                                cursor: 'default',
                                                                '&:hover': {
                                                                    background: isDark
                                                                        ? 'rgba(0,74,198,0.06)'
                                                                        : 'rgba(0,74,198,0.03)',
                                                                    '& td': { color: 'text.primary' },
                                                                },
                                                                '&:last-child td': {
                                                                    borderBottom: 0,
                                                                    '&:first-of-type': { borderRadius: '0 0 0 12px' },
                                                                    '&:last-of-type': { borderRadius: '0 0 12px 0' },
                                                                },
                                                            }}
                                                        >
                                                            <TableCell sx={{ fontWeight: 700, py: 2.5, color: 'text.primary', fontSize: '0.9rem' }}>
                                                                {store.name}
                                                            </TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                <Chip
                                                                    label={store.business_type === 'restaurant' ? 'Restaurante' : 'Tienda'}
                                                                    size="small"
                                                                    icon={<span>{store.business_type === 'restaurant' ? '🍽️' : '🏪'}</span>}
                                                                    sx={businessTypeChipSx(store.business_type)}
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
                                                                        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                                                                        px: 1,
                                                                        py: 0.3,
                                                                        borderRadius: '6px',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            textDecoration: 'underline',
                                                                            background: isDark
                                                                                ? 'rgba(0,74,198,0.1)'
                                                                                : 'rgba(0,74,198,0.06)',
                                                                        },
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
                                                                {store.users?.find(u => u.role === 'MANAGER')?.email ? (
                                                                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{store.users.find(u => u.role === 'MANAGER').email}</Typography>
                                                                ) : (
                                                                    <Chip label="Sin gerente" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.6875rem', color: 'text.disabled', borderRadius: '8px' }} />
                                                                )}
                                                            </TableCell>
                                                            <TableCell sx={{ py: 2.5 }}>
                                                                <Box sx={{ display: 'flex', gap: 0.75 }}>
                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        onClick={() => openStaffDialog(store)}
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            minWidth: 60,
                                                                            color: 'info.main',
                                                                            borderRadius: '10px',
                                                                            textTransform: 'none',
                                                                            transition: 'all 0.2s ease',
                                                                            '&:hover': { color: 'primary.main', background: isDark ? 'rgba(0,74,198,0.1)' : 'rgba(0,74,198,0.06)' },
                                                                        }}
                                                                    >
                                                                        Empleados
                                                                    </Button>
                                                                    <Button
                                                                        variant="text"
                                                                        size="small"
                                                                        component="a"
                                                                        href={`/${store.slug}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            minWidth: 60,
                                                                            color: 'text.secondary',
                                                                            borderRadius: '10px',
                                                                            textTransform: 'none',
                                                                            transition: 'all 0.2s ease',
                                                                            '&:hover': { color: 'primary.main', background: isDark ? 'rgba(0,74,198,0.1)' : 'rgba(0,74,198,0.06)' },
                                                                        }}
                                                                    >
                                                                        Ver
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => openEditModal(store)}
                                                                        startIcon={<EditIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            minWidth: 70,
                                                                            textTransform: 'none',
                                                                            borderRadius: '10px',
                                                                            transition: 'all 0.2s ease',
                                                                            '&:hover': { transform: 'translateY(-1px)' },
                                                                        }}
                                                                    >
                                                                        Editar
                                                                    </Button>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => setDeleteTarget(store)}
                                                                        startIcon={<DeleteIcon sx={{ fontSize: '0.9rem !important' }} />}
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            minWidth: 80,
                                                                            textTransform: 'none',
                                                                            borderRadius: '10px',
                                                                            boxShadow: 'none',
                                                                            transition: 'all 0.2s ease',
                                                                            '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
                                                                        }}
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
                                            {filteredStores.map((store, index) => (
                                                <Card
                                                    key={store.id}
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: '14px',
                                                        border: isDark ? '1px solid rgba(180,197,255,0.1)' : '1px solid rgba(0,74,198,0.08)',
                                                        animation: 'fade-in-up 0.3s ease',
                                                        animationDelay: `${index * 0.05}s`,
                                                        animationFillMode: 'backwards',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            borderColor: 'primary.main',
                                                            boxShadow: isDark
                                                                ? '0 4px 16px rgba(0,74,198,0.15)'
                                                                : '0 4px 16px rgba(0,74,198,0.08)',
                                                        },
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{store.name}</Typography>
                                                            <Chip
                                                                label={store.business_type === 'restaurant' ? '🍽️ Restaurante' : '🏪 Tienda'}
                                                                size="small"
                                                                sx={businessTypeChipSx(store.business_type)}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
                                                            <Typography component="span" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600, color: 'primary.main' }}>/{store.slug}</Typography>
                                                            <Typography component="span">{store.whatsapp || 'Sin WhatsApp'}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                                                            <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                                                                <Button variant="text" size="small" fullWidth sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', borderRadius: '10px' }}>Ver</Button>
                                                            </a>
                                                            <Button variant="outlined" size="small" sx={{ flex: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', borderRadius: '10px' }} onClick={() => openStaffDialog(store)}>Empleados</Button>
                                                            <Button variant="outlined" size="small" sx={{ flex: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', borderRadius: '10px' }} onClick={() => openEditModal(store)}>Editar</Button>
                                                            <Button variant="contained" color="error" size="small" sx={{ flex: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'none', boxShadow: 'none', borderRadius: '10px' }} onClick={() => setDeleteTarget(store)}>Eliminar</Button>
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
                        <Card sx={{ ...accentCardSx(isDark), mb: 3 }}>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>Mes</InputLabel>
                                        <Select
                                            value={filterMonth}
                                            label="Mes"
                                            onChange={(e) => setFilterMonth(e.target.value)}
                                            sx={{ borderRadius: '14px' }}
                                        >
                                            {MONTHS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Año"
                                        type="number"
                                        size="small"
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(parseInt(e.target.value) || new Date().getFullYear())}
                                        sx={{ minWidth: 100, ...inputSx(isDark) }}
                                        slotProps={{ htmlInput: { min: 2024, max: 2030 } }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={fetchMetrics}
                                        sx={{
                                            height: 40,
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            background: 'linear-gradient(135deg, #004ac6, #2563eb)',
                                            boxShadow: isDark ? '0 4px 16px rgba(0,74,198,0.3)' : '0 4px 16px rgba(0,74,198,0.2)',
                                            transition: 'all 0.25s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5558e6, #7c4fe0)',
                                                transform: 'translateY(-1px)',
                                            },
                                        }}
                                    >
                                        Filtrar
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>

                        {!loading && metrics.length > 0 && (
                            <>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 3 }}>
                                    <StatCard title="Pedidos Totales" value={metricStats.totalOrders} icon="📋" color="#004ac6" subtitle="Histórico" />
                                    <StatCard title="Pedidos Hoy" value={metricStats.ordersToday} icon="📊" color="#10b981" subtitle="Este día" />
                                    <StatCard title={`Pedidos ${getPeriodLabel()}`} value={metricStats.ordersInPeriod} icon="📆" color="#2563eb" subtitle="Periodo filtrado" />
                                    <StatCard title="Ingresos Totales" value={`$${metricStats.totalRevenue.toLocaleString()}`} icon="💰" color="#f59e0b" subtitle="Sin cancelados" />
                                    <StatCard title={`Ingresos ${getPeriodLabel()}`} value={`$${metricStats.revenueInPeriod.toLocaleString()}`} icon="📈" color="#1abc9c" subtitle="Periodo filtrado" />
                                    <StatCard title="Negocios Activos" value={metricStats.activeStores} icon="✅" color="#3b82f6" subtitle="Con actividad" />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUpIcon sx={{ color: 'primary.main' }} />
                                    Métricas por Negocio
                                </Typography>

                                {metrics.map((m, index) => {
                                    const badge = getLastLoginBadge(m.last_login)
                                    const isExpanded = expandedStoreId === m.id
                                    return (
                                        <Accordion
                                            key={m.id}
                                            expanded={isExpanded}
                                            onChange={() => setExpandedStoreId(isExpanded ? null : m.id)}
                                            sx={{
                                                mb: 1.5,
                                                borderRadius: '14px !important',
                                                overflow: 'hidden',
                                                animation: 'fade-in-up 0.3s ease',
                                                animationDelay: `${index * 0.05}s`,
                                                animationFillMode: 'backwards',
                                                border: isDark
                                                    ? '1px solid rgba(180,197,255,0.1)'
                                                    : '1px solid rgba(0,74,198,0.08)',
                                                boxShadow: isExpanded
                                                    ? (isDark ? '0 4px 24px rgba(0,74,198,0.15)' : '0 4px 24px rgba(0,74,198,0.08)')
                                                    : (isDark ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'),
                                                transition: 'all 0.25s ease',
                                                '&::before': { display: 'none' },
                                                background: isDark ? 'rgba(20,20,42,0.95)' : 'rgba(255,255,255,0.95)',
                                                '&.Mui-expanded': {
                                                    boxShadow: isDark ? '0 4px 24px rgba(0,74,198,0.15)' : '0 4px 24px rgba(0,74,198,0.08)',
                                                },
                                                '&:hover': {
                                                    border: isDark ? '1px solid rgba(180,197,255,0.2)' : '1px solid rgba(0,74,198,0.15)',
                                                },
                                                '& .MuiAccordionSummary-root': {
                                                    borderLeft: '3px solid',
                                                    borderColor: isExpanded ? 'primary.main' : 'transparent',
                                                    transition: 'border-color 0.25s ease',
                                                },
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                                                sx={{
                                                    borderRadius: 2,
                                                    '&.Mui-expanded': { borderBottom: 1, borderColor: 'divider' },
                                                    minHeight: 64,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: '100%', pr: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                                                        <Box sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: isDark ? 'rgba(0,74,198,0.12)' : 'rgba(0,74,198,0.08)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.1rem',
                                                        }}>
                                                            {m.business_type === 'restaurant' ? '🍽️' : '🏪'}
                                                        </Box>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.name}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', ml: 'auto' }}>
                                                        <Chip
                                                            icon={<span>{badge.dot}</span>}
                                                            label={badge.label}
                                                            size="small"
                                                            color={badge.color === 'default' ? 'default' : badge.color}
                                                            variant={badge.color === 'default' ? 'outlined' : 'filled'}
                                                            sx={{ fontWeight: 600, fontSize: '0.6875rem', borderRadius: '8px' }}
                                                        />
                                                        <Chip
                                                            label={`${m.orders_today || 0} hoy`}
                                                            size="small"
                                                            color={m.orders_today > 0 ? 'success' : 'default'}
                                                            variant={m.orders_today > 0 ? 'filled' : 'outlined'}
                                                            sx={{ fontWeight: 600, fontSize: '0.6875rem', borderRadius: '8px' }}
                                                        />
                                                        <Chip
                                                            label={`${m.orders_in_period || 0} en ${getPeriodLabel()}`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ fontWeight: 600, fontSize: '0.6875rem', borderRadius: '8px' }}
                                                        />
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}>
                                                            ${(m.revenue_in_period || 0).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ p: 3 }}>
                                                <Box sx={{ ...sectionBoxSx(isDark), p: 2.5, mb: 2 }}>
                                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                                                        <Box>
                                                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>📋 Pedidos</Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Typography variant="body2" color="text.secondary">Hoy</Typography>
                                                                    <Chip label={m.orders_today || '0'} size="small" color={m.orders_today > 0 ? 'success' : 'default'} variant={m.orders_today > 0 ? 'filled' : 'outlined'} sx={{ fontWeight: 700, borderRadius: '8px' }} />
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

                                                        <Box>
                                                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>📊 Estados</Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                {[
                                                                    { key: 'PENDIENTE', label: 'Pendientes', color: '#f59e0b' },
                                                                    { key: 'CONFIRMADO', label: 'Confirmados', color: '#3b82f6' },
                                                                    { key: 'EN_PREPARACION', label: 'En preparación', color: '#2563eb' },
                                                                    { key: 'EN_CAMINO', label: 'En camino', color: '#10b981' },
                                                                    { key: 'ENTREGADO', label: 'Entregados', color: '#22c55e' },
                                                                    { key: 'CANCELADO', label: 'Cancelados', color: '#ef4444' },
                                                                ].map(st => (
                                                                    <Box key={st.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Box sx={{
                                                                                width: 8,
                                                                                height: 8,
                                                                                borderRadius: '50%',
                                                                                bgcolor: st.color,
                                                                                flexShrink: 0,
                                                                                boxShadow: `0 0 6px ${alpha(st.color, 0.4)}`,
                                                                            }} />
                                                                            <Typography variant="body2" color="text.secondary">{st.label}</Typography>
                                                                        </Box>
                                                                        <Typography sx={{ fontWeight: 700 }}>{m.status_counts?.[st.key] || 0}</Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>

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

                                                        <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                                                            <Divider sx={{ mb: 2 }} />
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                                 <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 Gerente</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.users?.find(u => u.role === 'MANAGER')?.email || 'Sin asignar'}</Typography>
                                                                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="caption" color="text.disabled">Último acceso:</Typography>
                                                                    <Chip
                                                                        icon={<span>{badge.dot}</span>}
                                                                        label={badge.label}
                                                                        size="small"
                                                                        color={badge.color === 'default' ? 'default' : badge.color}
                                                                        variant={badge.color === 'default' ? 'outlined' : 'filled'}
                                                                        sx={{ fontWeight: 600, fontSize: '0.6875rem', borderRadius: '8px' }}
                                                                    />
                                                                </Box>
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
                            <Box sx={{ ...sectionBoxSx(isDark), textAlign: 'center', py: 5 }}>
                                <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>No hay métricas para {getPeriodLabel()}</Typography>
                            </Box>
                        )}

                        {loading && (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5, fontWeight: 500 }}>
                                Cargando métricas...
                            </Typography>
                        )}
                    </>
                )}
            </AdminLayout>

            <Dialog
                open={showCreateModal}
                onClose={() => { setShowCreateModal(false); setModalError('') }}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '20px',
                            background: isDark ? 'rgba(10, 10, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(40px) saturate(200%)',
                            border: isDark ? '1px solid rgba(180, 197, 255, 0.15)' : '1px solid rgba(0, 74, 198, 0.12)',
                            boxShadow: isDark
                                ? '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(180,197,255,0.08)'
                                : '0 24px 80px rgba(0,74,198,0.12), 0 0 0 1px rgba(0,74,198,0.05)',
                        },
                    },
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                    pt: 3,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: isDark ? 'rgba(0,74,198,0.15)' : 'rgba(0,74,198,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <AddIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                    </Box>
                    Crear Nuevo Negocio
                </DialogTitle>
                <DialogContent sx={{ pt: 2, px: 3 }}>
                    {modalError && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: '12px' }}>{modalError}</Alert>}
                    <Box component="form" onSubmit={handleCreateStore} id="create-store-form" sx={{ mt: 1 }}>
                        {renderStoreForm(newStore, setNewStore, true, setNewStoreLogoFile)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
                    <Button
                        onClick={() => { setShowCreateModal(false); setModalError('') }}
                        variant="outlined"
                        fullWidth
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.1 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="create-store-form"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.1,
                            background: 'linear-gradient(135deg, #004ac6, #2563eb)',
                            boxShadow: isDark ? '0 4px 16px rgba(0,74,198,0.3)' : '0 4px 16px rgba(0,74,198,0.2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5558e6, #7c4fe0)',
                            },
                        }}
                    >
                        {loading ? 'Creando...' : 'Crear Negocio'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '20px',
                            background: isDark ? 'rgba(10, 10, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(40px) saturate(200%)',
                            border: isDark ? '1px solid rgba(180, 197, 255, 0.15)' : '1px solid rgba(0, 74, 198, 0.12)',
                            boxShadow: isDark
                                ? '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(180,197,255,0.08)'
                                : '0 24px 80px rgba(0,74,198,0.12), 0 0 0 1px rgba(0,74,198,0.05)',
                        },
                    },
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                    pt: 3,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: isDark ? 'rgba(0,74,198,0.15)' : 'rgba(0,74,198,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <EditIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                    </Box>
                    Editar Negocio: {editingStore?.name}
                </DialogTitle>
                <DialogContent sx={{ pt: 2, px: 3 }}>
                    {modalError && <Alert severity="error" sx={{ mb: 2, mt: 1, borderRadius: '12px' }}>{modalError}</Alert>}
                    <Box component="form" onSubmit={handleEditStore} id="edit-store-form" sx={{ mt: 1 }}>
                        {renderStoreForm(editForm, setEditForm, false, setEditLogoFile)}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
                    <Button
                        onClick={() => { setShowEditModal(false); setEditingStore(null); setModalError('') }}
                        variant="outlined"
                        fullWidth
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.1 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="edit-store-form"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.1,
                            background: 'linear-gradient(135deg, #004ac6, #2563eb)',
                            boxShadow: isDark ? '0 4px 16px rgba(0,74,198,0.3)' : '0 4px 16px rgba(0,74,198,0.2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5558e6, #7c4fe0)',
                            },
                        }}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={staffDialogOpen}
                onClose={() => setStaffDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '20px',
                            border: isDark ? '1px solid rgba(180,197,255,0.1)' : '1px solid rgba(0,74,198,0.08)',
                            background: isDark ? 'rgba(20,20,42,0.98)' : '#ffffff',
                        }
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', borderBottom: `1px solid ${isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)'}` }}>
                    Empleados — {staffStore?.name}
                </DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box component="form" onSubmit={handleCreateStaff} sx={{ display: 'flex', gap: 1.5, mb: 3, mt: 1 }}>
                        <TextField
                            label="Email del empleado"
                            type="email"
                            value={newStaffEmail}
                            onChange={(e) => setNewStaffEmail(e.target.value)}
                            size="small"
                            fullWidth
                            required
                            sx={inputSx(isDark)}
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            size="small"
                            fullWidth
                            required
                            sx={inputSx(isDark)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            sx={{ minWidth: 100, borderRadius: '10px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                            Crear
                        </Button>
                    </Box>

                    {staffLoading ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>Cargando...</Typography>
                    ) : staffList.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No hay empleados registrados</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {staffList.map((staff) => (
                                <Box
                                    key={staff.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1.5,
                                        borderRadius: '10px',
                                        border: `1px solid ${isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)'}`,
                                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,74,198,0.02)',
                                    }}
                                >
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{staff.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">Empleado</Typography>
                                    </Box>
                                    <Button
                                        variant="text"
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon sx={{ fontSize: '1rem !important' }} />}
                                        onClick={() => handleDeleteStaff(staff.id)}
                                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                                    >
                                        Eliminar
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)'}` }}>
                    <Button
                        onClick={() => setStaffDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Negocio"
                message={`¿Estás seguro de eliminar el negocio "${deleteTarget?.name}"? Esta acción eliminará todos los productos, categorías y el gerente asociado.`}
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
