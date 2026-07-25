import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTheme, alpha } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import Inventory2Icon from '@mui/icons-material/Inventory2'

const catColors = ['#004ac6', '#10b981', '#f59e0b', '#ef4444', '#2563eb', '#ec4899', '#06b6d4', '#84cc16']

export default function CombosDashboard({ user, onLogout }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const navigate = useNavigate()
    const [combos, setCombos] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const toast = useToast()

    const c = {
        bg: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        border: isDark ? 'rgba(180,197,255,0.10)' : 'rgba(0,0,0,0.06)',
        borderHover: isDark ? 'rgba(180,197,255,0.20)' : 'rgba(0,74,198,0.15)',
        dim: isDark ? '#8d909f' : '#94a3b8',
        accent: isDark ? '#b4c5ff' : '#004ac6',
        accentBg: isDark ? 'rgba(180,197,255,0.10)' : 'rgba(0,74,198,0.06)',
        surfaceHover: isDark ? 'rgba(180,197,255,0.04)' : 'rgba(0,0,0,0.02)',
    }

    const fetchCombos = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/combos', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCombos(data)
            }
        } catch {
            toast.error('Error al cargar combos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCombos() }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/combos/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success(`"${deleteTarget.name}" eliminado`)
                setDeleteTarget(null)
                fetchCombos()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar')
            }
        } catch {
            toast.error('Error de conexión')
        }
    }

    const activeCombos = combos.filter(c => c.is_active)
    const inactiveCombos = combos.filter(c => !c.is_active)

    const renderComboCard = (combo) => {
        const price = combo.promo_price || combo.price
        const hasPromo = !!combo.promo_price
        const savings = combo.savings || 0
        const savingsPercent = combo.savings_percent || 0

        return (
            <Card key={combo.id} sx={{
                borderRadius: '16px',
                border: `1px solid ${c.border}`,
                background: c.bg,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                opacity: combo.is_active ? 1 : 0.6,
                '&:hover': {
                    borderColor: c.borderHover,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
                },
            }}>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={<ShoppingCartIcon sx={{ fontSize: 14 }} />}
                                label="COMBO"
                                size="small"
                                sx={{
                                    fontWeight: 800, fontSize: '0.6rem', height: 22,
                                    bgcolor: combo.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
                                    color: combo.is_active ? '#10b981' : '#6b7280',
                                }}
                            />
                            {!combo.is_active && (
                                <Chip label="Inactivo" size="small"
                                    sx={{ fontWeight: 600, fontSize: '0.6rem', height: 22, bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444' }} />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                            <Tooltip title="Editar combo" arrow>
                                <IconButton size="small" onClick={() => navigate(`/admin/combos/edit/${combo.id}`)}
                                    sx={{ width: 28, height: 28, color: c.accent }}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar combo" arrow>
                                <IconButton size="small" onClick={() => setDeleteTarget(combo)}
                                    sx={{ width: 28, height: 28, color: isDark ? '#f87171' : '#ef4444' }}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                        {combo.name}
                    </Typography>

                    {combo.description && (
                        <Typography sx={{ fontSize: '0.75rem', color: c.dim, mb: 1, lineHeight: 1.4 }}>
                            {combo.description}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.75 }}>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: hasPromo ? '#ef4444' : 'text.primary' }}>
                            ${price?.toLocaleString()}
                        </Typography>
                        {hasPromo && (
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.7rem', textDecoration: 'line-through', color: c.dim }}>
                                ${combo.price?.toLocaleString()}
                            </Typography>
                        )}
                    </Box>

                    {savings > 0 && (
                        <Chip label={`Ahorra $${savings.toLocaleString()} (${savingsPercent}%)`} size="small"
                            sx={{
                                fontWeight: 700, fontSize: '0.6rem', height: 20,
                                bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981',
                            }} />
                    )}

                    <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(combo.items || []).map((item, idx) => (
                            <Chip key={idx}
                                label={`${item.quantity}x ${item.product_name || `ID:${item.product_id}`}`}
                                size="small" variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 20, borderColor: c.border }} />
                        ))}
                    </Box>

                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: catColors[(combo.category_id || 1) % catColors.length], flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.65rem', color: c.dim }}>
                            {combo.category_id ? `Cat ID: ${combo.category_id}` : 'Sin categoría'}
                        </Typography>
                    </Box>
                </Box>
            </Card>
        )
    }

    return (
        <>
            <AdminLayout title="Combos" user={user} onLogout={onLogout}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Combos y Paquetes
                        </Typography>
                        <Typography variant="body2" sx={{ color: c.dim, mt: 0.5 }}>
                            {combos.length} combo{combos.length !== 1 ? 's' : ''} • {activeCombos.length} activo{activeCombos.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <Button
                        component={Link} to="/admin/combos/new"
                        variant="contained" size="small"
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700 }}
                    >
                        Nuevo Combo
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color={c.dim}>Cargando combos...</Typography>
                    </Box>
                ) : combos.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center', py: 10, px: 3,
                        border: `2px dashed ${c.border}`, borderRadius: '14px',
                        background: c.bg,
                    }}>
                        <ShoppingCartIcon sx={{ fontSize: 48, color: c.dim, opacity: 0.3, mb: 2 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                            No hay combos creados
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: c.dim, mb: 3, maxWidth: 360, mx: 'auto' }}>
                            Los combos te permiten agrupar productos con un precio especial, ideal para promociones y paquetes.
                        </Typography>
                        <Button component={Link} to="/admin/combos/new" variant="contained" startIcon={<AddIcon />}
                            sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}>
                            Crear Primer Combo
                        </Button>
                    </Box>
                ) : (
                    <>
                        {activeCombos.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '0.95rem' }}>
                                    Combos activos
                                </Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                                    gap: 2,
                                }}>
                                    {activeCombos.map(renderComboCard)}
                                </Box>
                            </Box>
                        )}
                        {inactiveCombos.length > 0 && (
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '0.95rem', color: c.dim }}>
                                    Combos inactivos
                                </Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                                    gap: 2,
                                }}>
                                    {inactiveCombos.map(renderComboCard)}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Combo"
                message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}