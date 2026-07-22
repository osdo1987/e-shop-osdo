import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { useTheme, alpha } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import PaymentsIcon from '@mui/icons-material/Payments'

const PRESET_COLORS = [
  '#22c55e', '#3b82f6', '#2563eb', '#06b6d4', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
]

function PaymentMethodSettings({ user, onLogout }) {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', icon: '', color: '#3b82f6', is_cash: false, sort_order: 0 })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const toast = useToast()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const fetchMethods = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/payment-methods?active=false', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setMethods(await res.json())
    } catch { toast.error('Error al cargar métodos de pago') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMethods() }, [])

  const handleOpenCreate = () => {
    setEditing(null)
    setForm({ name: '', code: '', icon: '', color: '#3b82f6', is_cash: false, sort_order: methods.length })
    setDialogOpen(true)
  }

  const handleOpenEdit = (pm) => {
    setEditing(pm)
    setForm({ name: pm.name, code: pm.code, icon: pm.icon || '', color: pm.color || '#3b82f6', is_cash: pm.is_cash, sort_order: pm.sort_order })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Nombre y código son requeridos'); return }
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      const url = editing ? `/api/payment-methods/${editing.id}` : '/api/payment-methods'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editing ? 'Método de pago actualizado' : 'Método de pago creado')
        setDialogOpen(false)
        fetchMethods()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al guardar')
      }
    } catch { toast.error('Error de red') }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        toast.success('Método de pago eliminado')
        setDeleteConfirm(null)
        fetchMethods()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al eliminar')
      }
    } catch { toast.error('Error de red') }
  }

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
    },
  }

  return (
    <AdminLayout title="Métodos de Pago" user={user} onLogout={onLogout}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PaymentsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Métodos de Pago</Typography>
            <Typography variant="body2" color="text.secondary">Gestiona los métodos de pago disponibles en tu tienda</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
          sx={{ borderRadius: '10px', fontWeight: 600, textTransform: 'none' }}>
          Nuevo Método
        </Button>
      </Box>

      <Card sx={{
        position: 'relative', overflow: 'visible',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px', borderRadius: '16px 16px 0 0',
          background: 'linear-gradient(90deg, #004ac6, #2563eb, #10b981)',
        },
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {methods.map((pm) => (
            <Box key={pm.id} sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              p: 2, borderRadius: '12px', mb: 1,
              bgcolor: isDark ? 'rgba(0,74,198,0.03)' : 'rgba(0,74,198,0.02)',
              border: '1px solid', borderColor: pm.is_active ? alpha(pm.color || '#3b82f6', 0.2) : 'divider',
              opacity: pm.is_active ? 1 : 0.5,
              transition: 'all 0.2s',
              '&:hover': { borderColor: alpha(pm.color || '#3b82f6', 0.4) },
            }}>
              <DragIndicatorIcon sx={{ color: 'text.disabled', fontSize: 20, cursor: 'grab' }} />

              <Box sx={{
                width: 40, height: 40, borderRadius: '10px',
                bgcolor: alpha(pm.color || '#3b82f6', 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: pm.color || '#3b82f6' }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{pm.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {pm.code}
                </Typography>
              </Box>

              <Chip
                label={pm.is_cash ? 'Efectivo' : 'Digital'}
                size="small"
                color={pm.is_cash ? 'success' : 'primary'}
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
              />

              <Chip
                label={pm.is_active ? 'Activo' : 'Inactivo'}
                size="small"
                color={pm.is_active ? 'success' : 'default'}
                sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }}
              />

              <Tooltip title="Editar" arrow>
                <IconButton size="small" onClick={() => handleOpenEdit(pm)} sx={{ color: 'primary.main' }}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar" arrow>
                <IconButton size="small" onClick={() => setDeleteConfirm(pm)} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

          {methods.length === 0 && !loading && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <PaymentsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">No hay métodos de pago configurados</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1.5 }}>
            <TextField label="Nombre" fullWidth required size="small" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Efectivo, Nequi, Crypto" sx={inputSx} />
            <TextField label="Código" fullWidth required size="small" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
              placeholder="Ej: EFECTIVO, NEQUI, CRYPTO"
              helperText="Identificador interno (solo mayúsculas, números y _)" sx={inputSx} />
            <TextField label="Nombre del Icono (MUI)" fullWidth size="small" value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="Ej: AttachMoneyIcon, CreditCardIcon, SmartphoneIcon" sx={inputSx} />

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(c => (
                  <Box key={c} onClick={() => setForm({ ...form, color: c })} sx={{
                    width: 32, height: 32, borderRadius: '8px', bgcolor: c, cursor: 'pointer',
                    border: form.color === c ? '3px solid' : '2px solid transparent',
                    borderColor: form.color === c ? 'text.primary' : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }} />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={<Switch checked={form.is_cash} onChange={(e) => setForm({ ...form, is_cash: e.target.checked })} />}
              label="Es efectivo (cuenta como dinero físico en caja)"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem', fontWeight: 500 } }}
            />

            <FormControlLabel
              control={<Switch checked={form.is_active !== false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />}
              label="Activo"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem', fontWeight: 500 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
            {editing ? 'Guardar Cambios' : 'Crear Método'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar método de pago?</DialogTitle>
        <DialogContent>
          <Typography>Se eliminará <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.code}). Los pedidos existentes con este método no se verán afectados.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={() => handleDelete(deleteConfirm.id)} variant="contained" color="error"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}

export default PaymentMethodSettings
