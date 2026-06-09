import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import { TableSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { useSocket } from '../context/SocketContext'
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

const STATUS_TRANSITIONS = {
    'PENDIENTE': { next: 'CONFIRMADO', cancel: true, nextLabel: 'Confirmar' },
    'CONFIRMADO': { next: 'EN_PREPARACION', cancel: true, nextLabel: 'En Preparación' },
    'EN_PREPARACION': { next: 'EN_CAMINO', cancel: true, nextLabel: 'En Camino', skipTo: 'ENTREGADO', skipLabel: 'Entregado' },
    'EN_CAMINO': { next: 'ENTREGADO', cancel: true, nextLabel: 'Entregado' },
    'ENTREGADO': { cancel: true },
    'CANCELADO': { reactivate: true },
}

function Orders({ user, onLogout }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [dateFilter, setDateFilter] = useState('')
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null)
    const [orderHistory, setOrderHistory] = useState([])
    const [sellerNotes, setSellerNotes] = useState('')
    const [estimatedDelivery, setEstimatedDelivery] = useState('')
    const toast = useToast()
    const socket = useSocket()

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        if (!socket) return
        const handleSocketEvent = () => fetchOrders()
        socket.on('order_created', handleSocketEvent)
        socket.on('order_updated', handleSocketEvent)
        return () => {
            socket.off('order_created', handleSocketEvent)
            socket.off('order_updated', handleSocketEvent)
        }
    }, [socket])

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch('/api/orders', { headers })
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            } else {
                toast.error('Error al obtener los pedidos')
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId, newStatus, notes = '') => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            const body = { status: newStatus }
            if (notes) body.notes = notes

            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT', headers, body: JSON.stringify(body)
            })
            if (res.ok) {
                const data = await res.json()
                toast.success(`Pedido actualizado a ${getStatusLabel(newStatus)}`)
                fetchOrders()
                if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
                    setSelectedOrderForDetail(data)
                    fetchOrderHistory(orderId)
                }
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || 'Error al actualizar el estado')
            }
        } catch (error) {
            toast.error('Error de conexión')
        }
    }

    const handleUpdateNotes = async (orderId) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            const res = await fetch(`/api/orders/${orderId}/notes`, {
                method: 'PUT', headers, body: JSON.stringify({ seller_notes: sellerNotes })
            })
            if (res.ok) {
                toast.success('Notas guardadas')
                fetchOrders()
            }
        } catch (error) {
            toast.error('Error al guardar notas')
        }
    }

    const handleUpdateEstimatedDelivery = async (orderId) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            const res = await fetch(`/api/orders/${orderId}/estimated-delivery`, {
                method: 'PUT', headers, body: JSON.stringify({ estimated_delivery: estimatedDelivery || null })
            })
            if (res.ok) {
                toast.success('Hora estimada actualizada')
                fetchOrders()
            }
        } catch (error) {
            toast.error('Error al actualizar hora estimada')
        }
    }

    const fetchOrderHistory = async (orderId) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const res = await fetch(`/api/orders/${orderId}/history`, { headers })
            if (res.ok) {
                const data = await res.json()
                setOrderHistory(data)
            }
        } catch (error) {
            console.error('Error fetching history')
        }
    }

    const openOrderDetail = async (order) => {
        setSelectedOrderForDetail(order)
        setSellerNotes(order.seller_notes || '')
        setEstimatedDelivery(order.estimated_delivery ? order.estimated_delivery.slice(0, 16) : '')
        await fetchOrderHistory(order.id)
    }

    const stats = useMemo(() => {
        const total = orders.length
        const pending = orders.filter(o => o.status === 'PENDIENTE').length
        const confirmed = orders.filter(o => o.status === 'CONFIRMADO').length
        const preparing = orders.filter(o => o.status === 'EN_PREPARACION').length
        const shipping = orders.filter(o => o.status === 'EN_CAMINO').length
        const delivered = orders.filter(o => o.status === 'ENTREGADO').length
        const cancelled = orders.filter(o => o.status === 'CANCELADO').length
        const totalRevenue = orders.filter(o => o.status === 'ENTREGADO').reduce((sum, o) => sum + o.total_price, 0)
        return { total, pending, confirmed, preparing, shipping, delivered, cancelled, totalRevenue }
    }, [orders])

    const filteredOrders = useMemo(() => {
        let result = orders
        if (statusFilter !== 'ALL') {
            result = result.filter(o => o.status === statusFilter)
        }
        if (dateFilter) {
            const day = new Date(dateFilter)
            day.setHours(0, 0, 0, 0)
            const nextDay = new Date(day)
            nextDay.setDate(nextDay.getDate() + 1)
            result = result.filter(o => {
                const d = new Date(o.created_at)
                return d >= day && d < nextDay
            })
        }
        return result
    }, [orders, statusFilter, dateFilter])

    const getStatusStyles = (status) => {
        const map = {
            'PENDIENTE': { color: 'warning', label: 'Pendiente', icon: '⏳' },
            'CONFIRMADO': { color: 'info', label: 'Confirmado', icon: '✅' },
            'EN_PREPARACION': { color: 'secondary', label: 'En Preparación', icon: '👨‍🍳' },
            'EN_CAMINO': { color: 'primary', label: 'En Camino', icon: '🚗' },
            'ENTREGADO': { color: 'success', label: 'Entregado', icon: '📦' },
            'CANCELADO': { color: 'error', label: 'Cancelado', icon: '❌' },
        }
        return map[status] || { color: 'default', label: status, icon: '❓' }
    }

    const getStatusLabel = (status) => getStatusStyles(status).label

    const filterButtons = ['ALL', 'PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']

    return (
        <>
            <AdminLayout title="Seguimiento de Pedidos" user={user} onLogout={onLogout}>
                {!loading && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, mb: 1.5 }}>
                        <StatCard title="Total" value={stats.total} icon="📦" color="#6366f1" />
                        <StatCard title="Pendientes" value={stats.pending} icon="⏳" color="#f59e0b" />
                        <StatCard title="En Proceso" value={stats.confirmed + stats.preparing + stats.shipping} icon="🔄" color="#3b82f6" />
                        <StatCard title="Entregados" value={stats.delivered} icon="✅" color="#22c55e" />
                        <StatCard title="Ventas" value={`$${stats.totalRevenue.toLocaleString()}`} icon="💰" color="#10b981" />
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {filterButtons.map(status => (
                        <Chip
                            key={status}
                            label={`${status === 'ALL' ? 'Todos' : `${getStatusStyles(status).icon} ${getStatusStyles(status).label}`} (${status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length})`}
                            onClick={() => setStatusFilter(status)}
                            color={statusFilter === status ? getStatusStyles(status === 'ALL' ? 'PENDIENTE' : status).color : 'default'}
                            variant={statusFilter === status ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.6875rem', height: 26, cursor: 'pointer' }}
                        />
                    ))}
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75, alignItems: 'center' }}>
                        <Chip
                            icon={<span style={{ fontSize: '0.7rem' }}>📅</span>}
                            label={dateFilter ? new Date(dateFilter + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Filtrar por día'}
                            size="small"
                            variant={dateFilter ? 'filled' : 'outlined'}
                            color={dateFilter ? 'primary' : 'default'}
                            onClick={() => {
                                const input = document.getElementById('date-filter-input')
                                if (input) input.showPicker()
                            }}
                            sx={{ cursor: 'pointer', height: 28, fontSize: '0.6875rem', fontWeight: 600, px: 0.5 }}
                        />
                        <input
                            id="date-filter-input"
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                        />
                        {dateFilter && (
                            <Chip label="✕" size="small" variant="outlined" onClick={() => setDateFilter('')} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', minWidth: 0, px: 0.5 }} />
                        )}
                    </Box>
                </Box>

                <Card>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        {loading ? (
                            <TableSkeleton rows={5} cols={6} />
                        ) : filteredOrders.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
                                No se encontraron pedidos con este estado.
                            </Typography>
                        ) : (
                            <>
                                <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Cliente</TableCell>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Total</TableCell>
                                                <TableCell>Estado</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredOrders.map(order => {
                                                const badge = getStatusStyles(order.status)
                                                const orderDate = new Date(order.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                const trans = STATUS_TRANSITIONS[order.status] || {}

                                                return (
                                                    <TableRow key={order.id} hover>
                                                        <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                                                        <TableCell>{order.customer_name}</TableCell>
                                                        <TableCell>{orderDate}</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>${order.total_price.toLocaleString()}</TableCell>
                                                        <TableCell><Chip label={badge.label} size="small" color={badge.color} sx={{ fontWeight: 700 }} /></TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                                <Chip icon={<span style={{ fontSize: '0.7rem' }}>👁️</span>} label="Ver" size="small" variant="outlined" onClick={() => openOrderDetail(order)} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem' }} />
                                                                {trans.next && (
                                                                    <Chip label={trans.nextLabel} size="small" color="success" onClick={() => handleUpdateStatus(order.id, trans.next)} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', fontWeight: 600 }} />
                                                                )}
                                                                {trans.skipTo && (
                                                                    <Chip label={trans.skipLabel} size="small" onClick={() => handleUpdateStatus(order.id, trans.skipTo)} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: '#22c55e', color: 'white', '&:hover': { bgcolor: '#16a34a' } }} />
                                                                )}
                                                                {trans.cancel && (
                                                                    <Chip label="✕" size="small" color="error" onClick={() => handleUpdateStatus(order.id, 'CANCELADO')} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', minWidth: 0, px: 0.5 }} />
                                                                )}
                                                                {trans.reactivate && (
                                                                    <Chip label="Reactivar" size="small" onClick={() => handleUpdateStatus(order.id, 'PENDIENTE')} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: '#f59e0b', color: 'white', '&:hover': { bgcolor: '#d97706' } }} />
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>

                                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                                    {filteredOrders.map(order => {
                                        const badge = getStatusStyles(order.status)
                                        const orderDate = new Date(order.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        const trans = STATUS_TRANSITIONS[order.status] || {}

                                        return (
                                            <Card key={order.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                                                        <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>#{order.id}</Typography>
                                                        <Chip label={`${badge.icon} ${badge.label}`} size="small" color={badge.color} sx={{ fontWeight: 700 }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5, fontSize: '0.8125rem' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="text.secondary">Cliente:</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="text.secondary">Total:</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark' }}>${order.total_price.toLocaleString()}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        <Chip icon={<span style={{ fontSize: '0.65rem' }}>👁️</span>} label="Ver" size="small" variant="outlined" onClick={() => openOrderDetail(order)} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem' }} />
                                                        {trans.next && (
                                                            <Chip label={trans.nextLabel} size="small" color="success" onClick={() => handleUpdateStatus(order.id, trans.next)} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', fontWeight: 600 }} />
                                                        )}
                                                        {trans.skipTo && (
                                                            <Chip label={trans.skipLabel} size="small" onClick={() => handleUpdateStatus(order.id, trans.skipTo)} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: '#22c55e', color: 'white', '&:hover': { bgcolor: '#16a34a' } }} />
                                                        )}
                                                        {trans.cancel && (
                                                            <Chip label="✕" size="small" color="error" onClick={() => handleUpdateStatus(order.id, 'CANCELADO')} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', minWidth: 0, px: 0.5 }} />
                                                        )}
                                                        {trans.reactivate && (
                                                            <Chip label="Reactivar" size="small" onClick={() => handleUpdateStatus(order.id, 'PENDIENTE')} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', fontWeight: 600, bgcolor: '#f59e0b', color: 'white', '&:hover': { bgcolor: '#d97706' } }} />
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            {/* Order Detail Modal */}
            {selectedOrderForDetail && (
                <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)', p: 2, overflowY: 'auto' }}>
                    <Card sx={{ width: '100%', maxWidth: 650, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Button onClick={() => setSelectedOrderForDetail(null)} sx={{ position: 'absolute', top: 8, right: 8, minWidth: 0, fontSize: '1.5rem', color: 'text.secondary' }}>&times;</Button>

                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pedido #{selectedOrderForDetail.id}</Typography>

                            {/* Client Info */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Cliente:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrderForDetail.customer_name}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Teléfono:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrderForDetail.customer_phone || '—'}</Typography>
                                </Box>
                                {selectedOrderForDetail.delivery_address && (
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Dirección:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrderForDetail.delivery_address}</Typography>
                                    </Box>
                                )}
                                {selectedOrderForDetail.customer_notes && (
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Notas del cliente:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, fontStyle: 'italic' }}>{selectedOrderForDetail.customer_notes}</Typography>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Estado:</Typography>
                                    <Box><Chip label={`${getStatusStyles(selectedOrderForDetail.status).icon} ${getStatusStyles(selectedOrderForDetail.status).label}`} size="small" color={getStatusStyles(selectedOrderForDetail.status).color} sx={{ fontWeight: 700 }} /></Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Fecha:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedOrderForDetail.created_at).toLocaleString('es-ES')}</Typography>
                                </Box>
                            </Box>

                            {/* Items */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Artículos</Typography>
                            <Box sx={{ maxHeight: 180, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="center">Cant.</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedOrderForDetail.items?.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.product_name}{item.selected_size ? ` (${item.selected_size})` : ''}</TableCell>
                                                <TableCell align="center">{item.quantity}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                                <Typography sx={{ fontWeight: 700 }}>Total:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>${selectedOrderForDetail.total_price.toLocaleString()}</Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Estimated Delivery */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>⏰ Hora Estimada de Entrega</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                                <Chip
                                    icon={<span style={{ fontSize: '0.75rem' }}>🕐</span>}
                                    label={estimatedDelivery
                                        ? new Date(estimatedDelivery).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                        : 'Seleccionar fecha y hora'
                                    }
                                    size="small"
                                    variant={estimatedDelivery ? 'filled' : 'outlined'}
                                    color={estimatedDelivery ? 'primary' : 'default'}
                                    onClick={() => {
                                        const input = document.getElementById('estimated-delivery-input')
                                        if (input) input.showPicker()
                                    }}
                                    sx={{ cursor: 'pointer', height: 32, fontSize: '0.75rem', fontWeight: 600, px: 1, flex: 1, justifyContent: 'flex-start' }}
                                />
                                <input
                                    id="estimated-delivery-input"
                                    type="datetime-local"
                                    value={estimatedDelivery}
                                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                />
                                {estimatedDelivery && (
                                    <Chip label="✕" size="small" variant="outlined" onClick={() => setEstimatedDelivery('')} sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', minWidth: 0, px: 0.5 }} />
                                )}
                                <Button variant="contained" size="small" onClick={() => handleUpdateEstimatedDelivery(selectedOrderForDetail.id)} sx={{ minWidth: 0, px: 1.5, fontSize: '0.6875rem' }}>
                                    Guardar
                                </Button>
                            </Box>

                            {/* Seller Notes */}
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📝 Notas Internas</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField size="small" value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} fullWidth placeholder="Notas privadas sobre el pedido..." multiline minRows={2} />
                                <Button variant="contained" size="small" onClick={() => handleUpdateNotes(selectedOrderForDetail.id)} sx={{ alignSelf: 'flex-end' }}>Guardar</Button>
                            </Box>

                            {/* Status History */}
                            {orderHistory.length > 0 && (
                                <>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📋 Historial de Cambios</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                        {orderHistory.map((h, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.75, flexShrink: 0 }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                                        {h.old_status ? `${getStatusLabel(h.old_status)} → ` : ''}{getStatusLabel(h.new_status)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {h.changed_by} • {new Date(h.created_at).toLocaleString('es-ES')}
                                                        {h.notes && ` • "${h.notes}"`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            )}

                            {/* Tracking Link */}
                            {selectedOrderForDetail.tracking_token && (
                                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>🔗 Link de seguimiento para el cliente:</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Box sx={{
                                            flex: 1,
                                            p: 1,
                                            bgcolor: 'background.paper',
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                        }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                                                {window.location.origin}/track/{selectedOrderForDetail.tracking_token}
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => {
                                                const url = `${window.location.origin}/track/${selectedOrderForDetail.tracking_token}`
                                                navigator.clipboard.writeText(url).then(() => {
                                                    toast.success('Link copiado al portapapeles')
                                                }).catch(() => {
                                                    const ta = document.createElement('textarea')
                                                    ta.value = url
                                                    document.body.appendChild(ta)
                                                    ta.select()
                                                    document.execCommand('copy')
                                                    document.body.removeChild(ta)
                                                    toast.success('Link copiado')
                                                })
                                            }}
                                            sx={{ minWidth: 0, px: 1.5, py: 0.75, fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                                        >
                                            📋 Copiar
                                        </Button>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            const url = `${window.location.origin}/track/${selectedOrderForDetail.tracking_token}`
                                            const msg = `📦 Seguimiento de tu pedido #${selectedOrderForDetail.id}:\n${url}`
                                            const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`
                                            window.open(waUrl, '_blank')
                                        }}
                                        sx={{ mt: 1, fontSize: '0.6875rem', py: 0.5, borderColor: '#25D366', color: '#25D366', '&:hover': { borderColor: '#128C7E', bgcolor: 'rgba(37, 211, 102, 0.08)' } }}
                                    >
                                        💬 Enviar por WhatsApp
                                    </Button>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="outlined" onClick={() => setSelectedOrderForDetail(null)}>Cerrar</Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </>
    )
}

export default Orders