import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { TableSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { useSocket } from '../context/SocketContext'
import { fetchPaymentMethods } from '../paymentMethodIcons'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import LinearProgress from '@mui/material/LinearProgress'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import { useTheme, alpha } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
import InventoryIcon from '@mui/icons-material/Inventory'
import TimelineIcon from '@mui/icons-material/Timeline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StorefrontIcon from '@mui/icons-material/Storefront'
import WebIcon from '@mui/icons-material/Language'
import PaymentsIcon from '@mui/icons-material/Payments'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

const STATUS_FLOW = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO']

const STATUS_META = {
    PENDIENTE:      { label: 'Pendiente',      color: '#f59e0b', bg: '#FEF3C7', darkBg: 'rgba(245,158,11,0.12)',  icon: '⏳', progress: 0 },
    CONFIRMADO:     { label: 'Confirmado',     color: '#3b82f6', bg: '#DBEAFE', darkBg: 'rgba(59,130,246,0.12)',  icon: '✓',  progress: 25 },
    EN_PREPARACION: { label: 'En Preparación',  color: '#2563eb', bg: '#dbe1ff', darkBg: 'rgba(37,99,235,0.12)',  icon: '🔥', progress: 50 },
    EN_CAMINO:      { label: 'En Camino',      color: '#06b6d4', bg: '#CFFAFE', darkBg: 'rgba(6,182,212,0.12)',   icon: '🚗', progress: 75 },
    ENTREGADO:      { label: 'Entregado',      color: '#22c55e', bg: '#DCFCE7', darkBg: 'rgba(34,197,94,0.12)',   icon: '📦', progress: 100 },
    CANCELADO:      { label: 'Cancelado',      color: '#ef4444', bg: '#FEE2E2', darkBg: 'rgba(239,68,68,0.12)',   icon: '✕',  progress: 0 },
}

const STATUS_TRANSITIONS = {
    PENDIENTE:      { next: 'CONFIRMADO',     canCancel: true, nextLabel: 'Confirmar' },
    CONFIRMADO:     { next: 'EN_PREPARACION',  canCancel: true, nextLabel: 'Preparar' },
    EN_PREPARACION: { next: 'EN_CAMINO',       canCancel: true, nextLabel: 'Enviar', skipTo: 'ENTREGADO', skipLabel: 'Entregar directo' },
    EN_CAMINO:      { next: 'ENTREGADO',       canCancel: true, nextLabel: 'Entregar' },
    ENTREGADO:      {},
    CANCELADO:      { canReactivate: true },
}

function timeAgo(dateStr) {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'ahora'
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h ${diffMin % 60}m`
    const diffD = Math.floor(diffH / 24)
    return `${diffD}d ${diffH % 24}h`
}

function timeAgoColor(dateStr, status) {
    if (status === 'ENTREGADO' || status === 'CANCELADO') return 'text.secondary'
    const diffMs = new Date() - new Date(dateStr)
    const diffMin = diffMs / 60000
    if (status === 'PENDIENTE' && diffMin > 30) return 'error.main'
    if (status === 'PENDIENTE' && diffMin > 15) return 'warning.main'
    if (status === 'EN_CAMINO' && diffMin > 60) return 'warning.main'
    return 'text.secondary'
}

function OrderProgressStepper({ status, compact = false }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const currentIdx = STATUS_FLOW.indexOf(status)
    const isCancelled = status === 'CANCELADO'

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.3 : 0.5, my: compact ? 0.5 : 1 }}>
            {STATUS_FLOW.map((s, i) => {
                const meta = STATUS_META[s]
                const isActive = i <= currentIdx && !isCancelled
                const isCurrent = i === currentIdx && !isCancelled
                return (
                    <Tooltip key={s} title={meta.label} arrow placement="top">
                        <Box sx={{
                            height: compact ? 4 : 6,
                            flex: 1,
                            borderRadius: 3,
                            backgroundColor: isActive
                                ? meta.color
                                : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                            transition: 'all 0.4s',
                            ...(isCurrent && !compact && {
                                boxShadow: `0 0 8px ${alpha(meta.color, 0.5)}`,
                            }),
                        }} />
                    </Tooltip>
                )
            })}
            {isCancelled && (
                <Tooltip title="Cancelado" arrow>
                    <Box sx={{
                        position: 'absolute', left: 0, right: 0, height: 2, top: '50%',
                        bgcolor: 'error.main', transform: 'rotate(-3deg)',
                    }} />
                </Tooltip>
            )}
        </Box>
    )
}

function OrderCard({ order, onView, onStatusChange, isDark, paymentMethods }) {
    const meta = STATUS_META[order.status] || STATUS_META.PENDIENTE
    const trans = STATUS_TRANSITIONS[order.status] || {}
    const pm = paymentMethods?.find(p => p.code === order.payment_method)
    const orderPayment = pm ? { label: pm.name, color: pm.color || '#888', icon: pm.is_cash ? '💵' : '💳' }
        : order.payment_method ? { label: order.payment_method, color: '#888', icon: '💳' } : null
    const itemCount = order.items?.length || 0
    const elapsed = timeAgo(order.created_at)
    const elapsedColor = timeAgoColor(order.created_at, order.status)

    return (
        <Card variant="outlined" sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: isDark ? alpha(meta.color, 0.2) : alpha(meta.color, 0.15),
            transition: 'all 0.25s ease',
            '&:hover': {
                borderColor: alpha(meta.color, 0.4),
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(meta.color, 0.12)}`,
            },
        }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <OrderProgressStepper status={order.status} compact />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, mb: 1 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'text.primary' }}>
                            #{order.id}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.25 }}>
                            {order.customer_name}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'primary.dark' }}>
                            ${order.total_price.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: elapsedColor, fontWeight: 600 }}>
                            {elapsed}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                    <Chip
                        label={`${meta.icon} ${meta.label}`}
                        size="small"
                        sx={{
                            fontWeight: 700, fontSize: '0.65rem', height: 22,
                            backgroundColor: isDark ? meta.darkBg : meta.bg,
                            color: meta.color,
                            border: `1px solid ${alpha(meta.color, 0.3)}`,
                        }}
                    />
                    {order.origin && (
                        <Chip
                            icon={order.origin === 'LOCAL' ? <StorefrontIcon sx={{ fontSize: '0.75rem !important' }} /> : <WebIcon sx={{ fontSize: '0.75rem !important' }} />}
                            label={order.origin === 'LOCAL' ? 'Local' : 'Web'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 20, fontWeight: 600 }}
                        />
                    )}
                    {orderPayment && (
                        <Chip
                            label={`${orderPayment.icon} ${orderPayment.label}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 20, fontWeight: 600, borderColor: alpha(orderPayment.color, 0.3), color: orderPayment.color }}
                        />
                    )}
                    <Chip
                        label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 20, fontWeight: 600 }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Tooltip title="Ver detalles" arrow>
                        <Chip
                            icon={<ReceiptLongIcon sx={{ fontSize: '0.75rem !important' }} />}
                            label="Ver"
                            size="small"
                            variant="outlined"
                            onClick={() => onView(order)}
                            sx={{ cursor: 'pointer', height: 26, fontSize: '0.65rem', fontWeight: 600 }}
                        />
                    </Tooltip>
                    {trans.next && (
                        <Tooltip title={`Avanzar a ${STATUS_META[trans.next]?.label}`} arrow>
                            <Chip
                                icon={<PlayArrowIcon sx={{ fontSize: '0.75rem !important' }} />}
                                label={trans.nextLabel}
                                size="small"
                                onClick={() => onStatusChange(order.id, trans.next)}
                                sx={{
                                    cursor: 'pointer', height: 26, fontSize: '0.65rem', fontWeight: 700,
                                    bgcolor: alpha(STATUS_META[trans.next]?.color || '#22c55e', 0.12),
                                    color: STATUS_META[trans.next]?.color || '#22c55e',
                                    border: `1px solid ${alpha(STATUS_META[trans.next]?.color || '#22c55e', 0.3)}`,
                                    '&:hover': { bgcolor: alpha(STATUS_META[trans.next]?.color || '#22c55e', 0.2) },
                                }}
                            />
                        </Tooltip>
                    )}
                    {trans.skipTo && (
                        <Tooltip title={trans.skipLabel} arrow>
                            <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '0.75rem !important' }} />}
                                label={trans.skipLabel}
                                size="small"
                                onClick={() => onStatusChange(order.id, trans.skipTo)}
                                sx={{
                                    cursor: 'pointer', height: 26, fontSize: '0.65rem', fontWeight: 700,
                                    bgcolor: alpha('#22c55e', 0.12), color: '#22c55e',
                                    border: '1px solid', borderColor: alpha('#22c55e', 0.3),
                                    '&:hover': { bgcolor: alpha('#22c55e', 0.2) },
                                }}
                            />
                        </Tooltip>
                    )}
                    {trans.canCancel && (
                        <Tooltip title="Cancelar pedido" arrow>
                            <Chip
                                icon={<CancelIcon sx={{ fontSize: '0.7rem !important' }} />}
                                label="Cancelar"
                                size="small"
                                onClick={() => onStatusChange(order.id, 'CANCELADO')}
                                sx={{
                                    cursor: 'pointer', height: 26, fontSize: '0.65rem', fontWeight: 600,
                                    bgcolor: alpha('#ef4444', 0.08), color: 'error.main',
                                    border: '1px solid', borderColor: alpha('#ef4444', 0.2),
                                    '&:hover': { bgcolor: alpha('#ef4444', 0.15) },
                                }}
                            />
                        </Tooltip>
                    )}
                    {trans.canReactivate && (
                        <Tooltip title="Reactivar como pendiente" arrow>
                            <Chip
                                icon={<PlayArrowIcon sx={{ fontSize: '0.75rem !important' }} />}
                                label="Reactivar"
                                size="small"
                                onClick={() => onStatusChange(order.id, 'PENDIENTE')}
                                sx={{
                                    cursor: 'pointer', height: 26, fontSize: '0.65rem', fontWeight: 700,
                                    bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b',
                                    border: '1px solid', borderColor: alpha('#f59e0b', 0.3),
                                    '&:hover': { bgcolor: alpha('#f59e0b', 0.2) },
                                }}
                            />
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

function OrderDetailModal({ order, onClose, onStatusChange, onUpdateNotes, onCopyLink, history, isDark, user, paymentMethods }) {
    const isStaff = user?.role === 'STAFF'
    const [sellerNotes, setSellerNotes] = useState(order.seller_notes || '')
    const [estimatedDelivery, setEstimatedDelivery] = useState(
        order.estimated_delivery ? order.estimated_delivery.slice(0, 16) : ''
    )
    const [expandedItems, setExpandedItems] = useState(true)
    const meta = STATUS_META[order.status] || STATUS_META.PENDIENTE
    const trans = STATUS_TRANSITIONS[order.status] || {}
    const orderPayment = useMemo(() => {
        if (!order.payment_method) return null
        const pm = paymentMethods.find(p => p.code === order.payment_method)
        if (!pm) return { label: order.payment_method, color: '#888', icon: '💳' }
        return { label: pm.name, color: pm.color || '#3b82f6', icon: pm.is_cash ? '💵' : '💳' }
    }, [order.payment_method, paymentMethods])

    useEffect(() => {
        setSellerNotes(order.seller_notes || '')
        setEstimatedDelivery(order.estimated_delivery ? order.estimated_delivery.slice(0, 16) : '')
    }, [order])

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        },
    }

    return (
        <Dialog
            open={!!order} onClose={onClose} maxWidth="sm" fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '20px',
                        maxHeight: '90vh',
                        background: isDark ? 'rgba(10,10,28,0.98)' : '#fff',
                    },
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem' }}>
                            Pedido #{order.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date(order.created_at).toLocaleString('es-ES', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                            {order.origin && ` • ${order.origin === 'LOCAL' ? 'Venta local' : 'Pedido web'}`}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <OrderProgressStepper status={order.status} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                    <Chip
                        label={`${meta.icon} ${meta.label}`}
                        size="small"
                        sx={{
                            fontWeight: 700, height: 24,
                            bgcolor: isDark ? meta.darkBg : meta.bg,
                            color: meta.color,
                            border: `1px solid ${alpha(meta.color, 0.3)}`,
                        }}
                    />
                    {orderPayment && (
                        <Chip
                            label={`${orderPayment.icon} ${orderPayment.label}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, height: 24, borderColor: alpha(orderPayment.color, 0.3), color: orderPayment.color }}
                        />
                    )}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 1, pb: 2 }}>
                {/* Customer Info */}
                <Box sx={{
                    p: 1.5, borderRadius: '12px', mb: 2,
                    bgcolor: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
                    border: '1px solid', borderColor: 'divider',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.customer_name}</Typography>
                    </Box>
                    {order.customer_phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.customer_phone}</Typography>
                            <Tooltip title="Llamar" arrow>
                                <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }} component="a" href={`tel:${order.customer_phone}`}>
                                    <PhoneIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    {order.delivery_address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.25 }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{order.delivery_address}</Typography>
                        </Box>
                    )}
                    {order.customer_notes && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 0.75, p: 1, borderRadius: '8px', bgcolor: alpha('#f59e0b', 0.06), border: `1px solid ${alpha('#f59e0b', 0.15)}` }}>
                            <StickyNote2Icon sx={{ fontSize: 14, color: '#f59e0b', mt: 0.25 }} />
                            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{order.customer_notes}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Items */}
                <Box sx={{ mb: 2 }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: 1 }}
                        onClick={() => setExpandedItems(!expandedItems)}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <InventoryIcon sx={{ fontSize: 16 }} />
                            Artículos ({order.items?.length || 0})
                        </Typography>
                        {expandedItems ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
                    </Box>
                    <Collapse in={expandedItems}>
                        <Box sx={{
                            border: '1px solid', borderColor: 'divider',
                            borderRadius: '12px', overflow: 'hidden',
                        }}>
                            {order.items?.map((item, idx) => (
                                <Box key={idx} sx={{
                                    p: 1.5,
                                    borderBottom: idx < (order.items?.length || 0) - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {item.quantity}x {item.product_name}
                                            </Typography>
                                            {item.selected_size && (
                                                <Chip label={item.selected_size} size="small" variant="outlined" sx={{ mt: 0.5, fontSize: '0.6rem', height: 18, fontWeight: 600 }} />
                                            )}
                                            {item.selected_toppings && (() => {
                                                try {
                                                    const toppings = typeof item.selected_toppings === 'string'
                                                        ? JSON.parse(item.selected_toppings)
                                                        : item.selected_toppings
                                                    const toppingList = Array.isArray(toppings) ? toppings
                                                        : typeof toppings === 'object' ? Object.values(toppings).flat()
                                                        : []
                                                    if (toppingList.length === 0) return null
                                                    return (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, mt: 0.5 }}>
                                                            {toppingList.map((t, ti) => (
                                                                <Chip key={ti} label={`+${typeof t === 'string' ? t : t.name || t}`} size="small"
                                                                    sx={{ fontSize: '0.58rem', height: 17, bgcolor: alpha('#2563eb', 0.08), color: '#2563eb', fontWeight: 500 }} />
                                                            ))}
                                                        </Box>
                                                    )
                                                } catch { return null }
                                            })()}
                                            {item.extra_price > 0 && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                                                    +${item.extra_price.toLocaleString()} extras
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, ml: 1, whiteSpace: 'nowrap' }}>
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.dark', fontSize: '1.1rem' }}>
                                ${order.total_price.toLocaleString()}
                            </Typography>
                        </Box>
                    </Collapse>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Estimated Delivery */}
                {!isStaff && (
                <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 16 }} />
                    Hora Estimada de Entrega
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                    <TextField
                        type="datetime-local"
                        size="small"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        sx={{ flex: 1, ...inputSx }}
                    />
                    <Button
                        variant="contained" size="small"
                        onClick={() => onUpdateNotes(order.id, null, estimatedDelivery)}
                        sx={{ minWidth: 0, px: 1.5, fontWeight: 600, borderRadius: '8px' }}
                    >
                        Guardar
                    </Button>
                </Box>
                </>
                )}

                {/* Seller Notes */}
                {!isStaff && (
                <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StickyNote2Icon sx={{ fontSize: 16 }} />
                    Notas Internas
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        size="small" value={sellerNotes}
                        onChange={(e) => setSellerNotes(e.target.value)}
                        fullWidth placeholder="Notas privadas sobre el pedido..."
                        multiline minRows={2}
                        sx={inputSx}
                    />
                    <Button
                        variant="contained" size="small"
                        onClick={() => onUpdateNotes(order.id, sellerNotes)}
                        sx={{ alignSelf: 'flex-end', minWidth: 0, px: 1.5, fontWeight: 600, borderRadius: '8px' }}
                    >
                        Guardar
                    </Button>
                </Box>
                </>
                )}

                {/* Status History */}
                {history.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimelineIcon sx={{ fontSize: 16 }} />
                            Historial
                        </Typography>
                        <Box sx={{
                            p: 1.5, borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(0,74,198,0.03)' : 'rgba(0,74,198,0.02)',
                            border: '1px solid', borderColor: 'divider',
                        }}>
                            {history.map((h, idx) => {
                                const hMeta = STATUS_META[h.new_status] || {}
                                return (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.75, borderBottom: idx < history.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                        <Box sx={{
                                            width: 6, height: 6, borderRadius: '50%', mt: 0.75, flexShrink: 0,
                                            bgcolor: hMeta.color || 'text.secondary',
                                        }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                {h.old_status ? `${STATUS_META[h.old_status]?.label || h.old_status} → ` : ''}{hMeta.label || h.new_status}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {h.changed_by} • {new Date(h.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                {h.notes && ` • "${h.notes}"`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                )}

                {/* Tracking Link */}
                {order.tracking_token && (
                    <Box sx={{
                        p: 1.5, borderRadius: '12px', mb: 1,
                        bgcolor: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
                        border: '1px solid', borderColor: 'divider',
                    }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.75 }}>
                            Link de seguimiento para el cliente
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                            <Box sx={{
                                flex: 1, p: 0.75, borderRadius: '8px',
                                bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                                overflow: 'hidden',
                            }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', wordBreak: 'break-all', fontSize: '0.7rem' }}>
                                    {window.location.origin}/track/{order.tracking_token}
                                </Typography>
                            </Box>
                            <Tooltip title="Copiar link" arrow>
                                <IconButton size="small" onClick={() => onCopyLink(order.tracking_token)}
                                    sx={{ color: 'primary.main' }}>
                                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Enviar por WhatsApp" arrow>
                                <IconButton size="small" onClick={() => {
                                    const url = `${window.location.origin}/track/${order.tracking_token}`
                                    const msg = `📦 Seguimiento de tu pedido #${order.id}:\n${url}`
                                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                                }} sx={{ color: '#25D366' }}>
                                    <WhatsAppIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                {/* Quick Actions */}
                {(!isStaff || trans.next) && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {trans.next && (
                                <Button
                                    variant="contained" fullWidth
                                    onClick={() => onStatusChange(order.id, trans.next)}
                                    sx={{
                                        fontWeight: 700, borderRadius: '12px', py: 1.2, textTransform: 'none',
                                        bgcolor: STATUS_META[trans.next]?.color || 'primary.main',
                                        '&:hover': { bgcolor: alpha(STATUS_META[trans.next]?.color || 'primary.main', 0.85) },
                                    }}
                                >
                                    {STATUS_META[trans.next]?.icon} {trans.nextLabel}
                                </Button>
                            )}
                            {!isStaff && trans.skipTo && (
                                <Button
                                    variant="outlined" fullWidth
                                    onClick={() => onStatusChange(order.id, trans.skipTo)}
                                    sx={{ fontWeight: 600, borderRadius: '12px', py: 1, textTransform: 'none', borderColor: '#22c55e', color: '#22c55e', '&:hover': { borderColor: '#16a34a', bgcolor: alpha('#22c55e', 0.06) } }}
                                >
                                    {trans.skipLabel}
                                </Button>
                            )}
                            {!isStaff && trans.canCancel && (
                                <Button
                                    variant="outlined" fullWidth
                                    onClick={() => onStatusChange(order.id, 'CANCELADO')}
                                    sx={{ fontWeight: 600, borderRadius: '12px', py: 1, textTransform: 'none', borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: alpha('#ef4444', 0.06) } }}
                                >
                                    Cancelar pedido
                                </Button>
                            )}
                            {!isStaff && trans.canReactivate && (
                                <Button
                                    variant="contained" fullWidth
                                    onClick={() => onStatusChange(order.id, 'PENDIENTE')}
                                    sx={{ fontWeight: 600, borderRadius: '12px', py: 1, textTransform: 'none', bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
                                >
                                    Reactivar como pendiente
                                </Button>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

function Orders({ user, onLogout }) {
    const isStaff = user?.role === 'STAFF'
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [dateFilter, setDateFilter] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderHistory, setOrderHistory] = useState([])
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, orderId: null, status: null })
    const toast = useToast()
    const socket = useSocket()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const getPaymentLabel = useCallback((code) => {
        if (!code) return null
        const pm = paymentMethods.find(p => p.code === code)
        if (!pm) return { label: code, color: '#888', icon: '💳' }
        return { label: pm.name, color: pm.color || '#3b82f6', icon: pm.is_cash ? '💵' : '💳' }
    }, [paymentMethods])

    useEffect(() => {
        fetchPaymentMethods().then(setPaymentMethods).catch(() => {})
    }, [])

    useEffect(() => { fetchOrders() }, [])

    useEffect(() => {
        if (!socket) return
        const handler = () => fetchOrders()
        socket.on('order_created', handler)
        socket.on('order_updated', handler)
        return () => {
            socket.off('order_created', handler)
            socket.off('order_updated', handler)
        }
    }, [socket])

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
            if (res.ok) setOrders(await res.json())
            else toast.error('Error al obtener los pedidos')
        } catch { toast.error('Error de conexión') }
        finally { setLoading(false) }
    }

    const handleUpdateStatus = useCallback(async (orderId, newStatus, notes = '') => {
        if (newStatus === 'CANCELADO') {
            setCancelConfirm({ open: true, orderId, status: newStatus })
            return
        }
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, notes }),
            })
            if (res.ok) {
                const data = await res.json()
                toast.success(`Pedido → ${STATUS_META[newStatus]?.label || newStatus}`)
                fetchOrders()
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(data)
                    fetchOrderHistory(orderId)
                }
            } else {
                const err = await res.json()
                toast.error(err.error || 'Error al actualizar')
            }
        } catch { toast.error('Error de conexión') }
    }, [selectedOrder])

    const confirmCancel = async () => {
        const { orderId, status } = cancelConfirm
        setCancelConfirm({ open: false, orderId: null, status: null })
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (res.ok) {
                const data = await res.json()
                toast.success('Pedido cancelado')
                fetchOrders()
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(data)
                    fetchOrderHistory(orderId)
                }
            } else {
                const err = await res.json()
                toast.error(err.error || 'Error al cancelar')
            }
        } catch { toast.error('Error de conexión') }
    }

    const handleUpdateNotes = useCallback(async (orderId, notes, estimatedDelivery) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            if (notes !== null && notes !== undefined) {
                await fetch(`/api/orders/${orderId}/notes`, {
                    method: 'PUT', headers, body: JSON.stringify({ seller_notes: notes }),
                })
            }
            if (estimatedDelivery !== null && estimatedDelivery !== undefined) {
                await fetch(`/api/orders/${orderId}/estimated-delivery`, {
                    method: 'PUT', headers, body: JSON.stringify({ estimated_delivery: estimatedDelivery || null }),
                })
            }
            toast.success('Guardado')
            fetchOrders()
        } catch { toast.error('Error al guardar') }
    }, [])

    const fetchOrderHistory = async (orderId) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/orders/${orderId}/history`, { headers: { Authorization: `Bearer ${token}` } })
            if (res.ok) setOrderHistory(await res.json())
        } catch {}
    }

    const openDetail = async (order) => {
        setSelectedOrder(order)
        await fetchOrderHistory(order.id)
    }

    const copyTrackingLink = useCallback((token) => {
        const url = `${window.location.origin}/track/${token}`
        navigator.clipboard.writeText(url)
            .then(() => toast.success('Link copiado'))
            .catch(() => {
                const ta = document.createElement('textarea')
                ta.value = url
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
                toast.success('Link copiado')
            })
    }, [])

    const stats = useMemo(() => {
        const total = orders.length
        const pending = orders.filter(o => o.status === 'PENDIENTE').length
        const confirmed = orders.filter(o => o.status === 'CONFIRMADO').length
        const preparing = orders.filter(o => o.status === 'EN_PREPARACION').length
        const shipping = orders.filter(o => o.status === 'EN_CAMINO').length
        const delivered = orders.filter(o => o.status === 'ENTREGADO').length
        const cancelled = orders.filter(o => o.status === 'CANCELADO').length
        const totalRevenue = orders.filter(o => o.status === 'ENTREGADO').reduce((sum, o) => sum + o.total_price, 0)
        const active = pending + confirmed + preparing + shipping
        return { total, pending, confirmed, preparing, shipping, delivered, cancelled, totalRevenue, active }
    }, [orders])

    const filteredOrders = useMemo(() => {
        let result = orders
        if (statusFilter !== 'ALL') result = result.filter(o => o.status === statusFilter)
        if (dateFilter) {
            const day = new Date(dateFilter)
            day.setHours(0, 0, 0, 0)
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1)
            result = result.filter(o => { const d = new Date(o.created_at); return d >= day && d < nextDay })
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim()
            result = result.filter(o => o.customer_name?.toLowerCase().includes(term) || String(o.id).includes(term))
        }
        return result
    }, [orders, statusFilter, dateFilter, searchTerm])

    const filterChips = [
        { key: 'ALL', label: 'Todos', count: orders.length, color: 'default' },
        { key: 'PENDIENTE', label: 'Pendientes', count: stats.pending },
        { key: 'CONFIRMADO', label: 'Confirmados', count: stats.confirmed },
        { key: 'EN_PREPARACION', label: 'Preparación', count: stats.preparing },
        { key: 'EN_CAMINO', label: 'En Camino', count: stats.shipping },
        { key: 'ENTREGADO', label: 'Entregados', count: stats.delivered },
        { key: 'CANCELADO', label: 'Cancelados', count: stats.cancelled },
    ]

    return (
        <AdminLayout title="Seguimiento de Pedidos" user={user} onLogout={onLogout}>
            {/* Stats */}
            {!loading && (
                <Box sx={{
                    display: 'flex', gap: 0.5, mb: 2, p: 1, borderRadius: '12px', flexWrap: 'wrap',
                    bgcolor: isDark ? 'rgba(180,197,255,0.04)' : 'rgba(0,74,198,0.03)',
                    border: `1px solid ${isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)'}`,
                }}>
                    {[
                        { label: 'Activos', value: stats.active, color: '#f59e0b', icon: '🔥' },
                        { label: 'Pendientes', value: stats.pending, color: '#ef4444', icon: '⏳' },
                        { label: 'Proceso', value: stats.confirmed + stats.preparing, color: '#3b82f6', icon: '🔄' },
                        { label: 'Camino', value: stats.shipping, color: '#06b6d4', icon: '🚗' },
                        { label: 'Entregados', value: stats.delivered, color: '#22c55e', icon: '✅' },
                        { label: 'Ventas', value: `$${stats.totalRevenue.toLocaleString()}`, color: '#10b981', icon: '💰' },
                    ].map(s => (
                        <Box key={s.label} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75,
                            px: 1.25, py: 0.6, borderRadius: '8px', flex: '1 1 auto', minWidth: 100,
                            bgcolor: isDark ? `${s.color}08` : `${s.color}06`,
                            border: `1px solid ${isDark ? `${s.color}15` : `${s.color}12`}`,
                        }}>
                            <Typography sx={{ fontSize: '0.85rem' }}>{s.icon}</Typography>
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' }}>
                                    {s.value}
                                </Typography>
                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary' }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Filters */}
            <Box sx={{
                p: 1.5, borderRadius: '16px', mb: 2,
                bgcolor: isDark ? 'rgba(180,197,255,0.04)' : 'rgba(0,74,198,0.03)',
                border: '1px solid', borderColor: isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)',
            }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
                    <TextField
                        size="small" placeholder="Buscar por cliente o #pedido..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', fontSize: '0.85rem',
                                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />,
                                endAdornment: searchTerm && (
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <ClearIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                ),
                            },
                        }}
                    />
                    <Tooltip title="Filtrar por fecha" arrow>
                        <Chip
                            label={dateFilter
                                ? new Date(dateFilter + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                                : 'Fecha'
                            }
                            size="small"
                            variant={dateFilter ? 'filled' : 'outlined'}
                            color={dateFilter ? 'primary' : 'default'}
                            onClick={() => document.getElementById('date-order-filter')?.showPicker()}
                            sx={{ cursor: 'pointer', fontWeight: 600, height: 32, fontSize: '0.75rem' }}
                        />
                    </Tooltip>
                    <input id="date-order-filter" type="date" value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    />
                    {dateFilter && (
                        <IconButton size="small" onClick={() => setDateFilter('')} sx={{ color: 'text.secondary' }}>
                            <ClearIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {filterChips.map(chip => {
                        const isActive = statusFilter === chip.key
                        const meta = STATUS_META[chip.key]
                        return (
                            <Chip
                                key={chip.key}
                                label={`${chip.label} (${chip.count})`}
                                size="small"
                                onClick={() => setStatusFilter(chip.key)}
                                sx={{
                                    fontWeight: 600, fontSize: '0.68rem', height: 28,
                                    cursor: 'pointer',
                                    bgcolor: isActive
                                        ? chip.key === 'ALL' ? 'primary.main' : alpha(meta?.color || '#004ac6', 0.15)
                                        : 'background.paper',
                                    color: isActive
                                        ? chip.key === 'ALL' ? '#fff' : meta?.color || 'text.primary'
                                        : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: isActive
                                        ? chip.key === 'ALL' ? 'primary.main' : alpha(meta?.color || '#004ac6', 0.3)
                                        : 'divider',
                                    '&:hover': {
                                        bgcolor: chip.key === 'ALL' ? alpha('#004ac6', 0.12) : alpha(meta?.color || '#004ac6', 0.08),
                                    },
                                }}
                            />
                        )
                    })}
                </Box>
            </Box>

            {/* Orders List */}
            <Card sx={{
                position: 'relative', overflow: 'visible',
                '&::before': {
                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                    height: '3px', borderRadius: '16px 16px 0 0',
                    background: 'linear-gradient(90deg, #004ac6, #2563eb, #10b981)',
                },
            }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    {loading ? (
                        <TableSkeleton rows={5} cols={6} />
                    ) : filteredOrders.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                                No se encontraron pedidos
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay pedidos con este filtro'}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiempo</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progreso</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredOrders.map(order => {
                                            const meta = STATUS_META[order.status] || STATUS_META.PENDIENTE
                                            const trans = STATUS_TRANSITIONS[order.status] || {}
                                            const payment = getPaymentLabel(order.payment_method)
                                            const elapsed = timeAgo(order.created_at)
                                            const elapsedColor = timeAgoColor(order.created_at, order.status)
                                            const itemCount = order.items?.length || 0

                                            return (
                                                <TableRow key={order.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(order)}>
                                                    <TableCell>
                                                        <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>#{order.id}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                            {order.origin && (
                                                                <Chip
                                                                    icon={order.origin === 'LOCAL' ? <StorefrontIcon sx={{ fontSize: '0.7rem !important' }} /> : <WebIcon sx={{ fontSize: '0.7rem !important' }} />}
                                                                    label={order.origin === 'LOCAL' ? 'Local' : 'Web'}
                                                                    size="small" variant="outlined"
                                                                    sx={{ fontSize: '0.55rem', height: 18, fontWeight: 600 }}
                                                                />
                                                            )}
                                                            {payment && (
                                                                <Chip
                                                                    label={`${payment.icon} ${payment.label}`}
                                                                    size="small" variant="outlined"
                                                                    sx={{ fontSize: '0.55rem', height: 18, fontWeight: 600, borderColor: alpha(payment.color, 0.3), color: payment.color }}
                                                                />
                                                            )}
                                                            <Chip label={`${itemCount} items`} size="small" variant="outlined"
                                                                sx={{ fontSize: '0.55rem', height: 18, fontWeight: 600 }} />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: elapsedColor }}>
                                                            {elapsed}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontWeight: 800 }}>${order.total_price.toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${meta.icon} ${meta.label}`}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700, fontSize: '0.65rem',
                                                                bgcolor: isDark ? meta.darkBg : meta.bg,
                                                                color: meta.color,
                                                                border: `1px solid ${alpha(meta.color, 0.3)}`,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ minWidth: 120 }}>
                                                        <OrderProgressStepper status={order.status} compact />
                                                    </TableCell>
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                            {trans.next && (
                                                                <Tooltip title={`→ ${STATUS_META[trans.next]?.label}`} arrow>
                                                                    <Chip
                                                                        icon={<PlayArrowIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                                        label={trans.nextLabel}
                                                                        size="small"
                                                                        onClick={() => handleUpdateStatus(order.id, trans.next)}
                                                                        sx={{
                                                                            cursor: 'pointer', height: 24, fontSize: '0.6rem', fontWeight: 700,
                                                                            bgcolor: alpha(STATUS_META[trans.next]?.color || '#22c55e', 0.12),
                                                                            color: STATUS_META[trans.next]?.color || '#22c55e',
                                                                            border: `1px solid ${alpha(STATUS_META[trans.next]?.color || '#22c55e', 0.3)}`,
                                                                            '&:hover': { bgcolor: alpha(STATUS_META[trans.next]?.color || '#22c55e', 0.2) },
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                            {trans.skipTo && (
                                                                <Tooltip title={trans.skipLabel} arrow>
                                                                    <Chip
                                                                        icon={<CheckCircleIcon sx={{ fontSize: '0.7rem !important' }} />}
                                                                        label={trans.skipLabel}
                                                                        size="small"
                                                                        onClick={() => handleUpdateStatus(order.id, trans.skipTo)}
                                                                        sx={{
                                                                            cursor: 'pointer', height: 24, fontSize: '0.6rem', fontWeight: 700,
                                                                            bgcolor: alpha('#22c55e', 0.12), color: '#22c55e',
                                                                            border: '1px solid', borderColor: alpha('#22c55e', 0.3),
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                            {!isStaff && trans.canCancel && (
                                                                <Tooltip title="Cancelar" arrow>
                                                                    <Chip
                                                                        icon={<CancelIcon sx={{ fontSize: '0.7rem !important' }} />}
                                                                        size="small"
                                                                        onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}
                                                                        sx={{
                                                                            cursor: 'pointer', height: 24, minWidth: 0, px: 0.5,
                                                                            bgcolor: alpha('#ef4444', 0.08), color: 'error.main',
                                                                            border: '1px solid', borderColor: alpha('#ef4444', 0.2),
                                                                            '&:hover': { bgcolor: alpha('#ef4444', 0.15) },
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                            {!isStaff && trans.canReactivate && (
                                                                <Tooltip title="Reactivar" arrow>
                                                                    <Chip
                                                                        icon={<PlayArrowIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                                        size="small"
                                                                        onClick={() => handleUpdateStatus(order.id, 'PENDIENTE')}
                                                                        sx={{
                                                                            cursor: 'pointer', height: 24, fontSize: '0.6rem', fontWeight: 700,
                                                                            bgcolor: alpha('#f59e0b', 0.12), color: '#f59e0b',
                                                                            border: '1px solid', borderColor: alpha('#f59e0b', 0.3),
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* Mobile Cards */}
                            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                                {filteredOrders.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onView={openDetail}
                                        onStatusChange={handleUpdateStatus}
                                        isDark={isDark}
                                        paymentMethods={paymentMethods}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleUpdateStatus}
                    onUpdateNotes={handleUpdateNotes}
                    onCopyLink={copyTrackingLink}
                    history={orderHistory}
                    isDark={isDark}
                    user={user}
                    paymentMethods={paymentMethods}
                />
            )}

            {/* Cancel Confirm */}
            <ConfirmModal
                open={cancelConfirm.open}
                onClose={() => setCancelConfirm({ open: false, orderId: null, status: null })}
                onConfirm={confirmCancel}
                title="¿Cancelar pedido?"
                message="Esta acción no se puede deshacer. El stock se restaurará automáticamente."
                confirmText="Sí, cancelar"
                cancelText="No, dejar"
                type="error"
            />
        </AdminLayout>
    )
}

export default Orders