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

function Orders({ user, onLogout }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null)
    const toast = useToast()
    const socket = useSocket()

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        if (!socket) return;

        const handleSocketEvent = () => {
            fetchOrders();
        };

        socket.on('order_created', handleSocketEvent);
        socket.on('order_updated', handleSocketEvent);

        return () => {
            socket.off('order_created', handleSocketEvent);
            socket.off('order_updated', handleSocketEvent);
        };
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token')
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                toast.success(`Pedido actualizado a ${newStatus}`)
                fetchOrders()
                if (selectedOrderForDetail && selectedOrderForDetail.id === orderId) {
                    const updated = await res.json()
                    setSelectedOrderForDetail(updated)
                }
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || 'Error al actualizar el estado')
            }
        } catch (error) {
            toast.error('Error de conexión')
        }
    }

    const stats = useMemo(() => {
        const total = orders.length
        const pending = orders.filter(o => o.status === 'PENDIENTE').length
        const delivered = orders.filter(o => o.status === 'ENTREGADO').length
        const cancelled = orders.filter(o => o.status === 'CANCELADO').length
        const totalRevenue = orders
            .filter(o => o.status === 'ENTREGADO')
            .reduce((sum, o) => sum + o.total_price, 0)

        return { total, pending, delivered, cancelled, totalRevenue }
    }, [orders])

    const filteredOrders = useMemo(() => {
        if (statusFilter === 'ALL') return orders
        return orders.filter(o => o.status === statusFilter)
    }, [orders, statusFilter])

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDIENTE':
                return { color: 'warning', label: 'Pendiente' }
            case 'ENTREGADO':
                return { color: 'success', label: 'Entregado' }
            case 'CANCELADO':
                return { color: 'error', label: 'Cancelado' }
            default:
                return { color: 'default', label: status }
        }
    }

    return (
        <>
            <AdminLayout title="Seguimiento de Pedidos" user={user} onLogout={onLogout}>
                {!loading && (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 1.5,
                        mb: 2
                    }}>
                        <StatCard title="Total Pedidos" value={stats.total} icon="📦" color="#6366f1" subtitle="Pedidos recibidos" />
                        <StatCard title="Pendientes" value={stats.pending} icon="⏳" color="#f1c40f" subtitle="Por entregar" />
                        <StatCard title="Entregados" value={stats.delivered} icon="✅" color="#2ecc71" subtitle="Ventas completadas" />
                        <StatCard title="Ventas Totales" value={`$${stats.totalRevenue.toLocaleString()}`} icon="💰" color="#1abc9c" subtitle="De pedidos entregados" />
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                    {['ALL', 'PENDIENTE', 'ENTREGADO', 'CANCELADO'].map(status => (
                        <Button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            variant={statusFilter === status ? 'contained' : 'outlined'}
                            size="small"
                            sx={{ borderRadius: 2 }}
                        >
                            {status === 'ALL' ? 'Todos' : getStatusStyles(status).label}
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{ ml: 0.75, opacity: 0.7, fontWeight: 700 }}
                            >
                                {status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length}
                            </Typography>
                        </Button>
                    ))}
                </Box>

                <Card>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        {loading ? (
                            <TableSkeleton rows={5} cols={6} />
                        ) : filteredOrders.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" sx={{ py: 5 }}>
                                No se encontraron pedidos con este estado.
                            </Typography>
                        ) : (
                            <>
                                <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID Pedido</TableCell>
                                                <TableCell>Cliente</TableCell>
                                                <TableCell>Teléfono</TableCell>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Total</TableCell>
                                                <TableCell>Estado</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredOrders.map(order => {
                                                const badge = getStatusStyles(order.status)
                                                const orderDate = new Date(order.created_at).toLocaleString('es-ES', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })

                                                return (
                                                    <TableRow key={order.id} hover>
                                                        <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                                                        <TableCell>{order.customer_name}</TableCell>
                                                        <TableCell>{order.customer_phone || <Typography component="span" color="text.disabled">—</Typography>}</TableCell>
                                                        <TableCell>{orderDate}</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>${order.total_price.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Chip label={badge.label} size="small" color={badge.color} variant="filled" sx={{ fontWeight: 700 }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                <Button variant="outlined" size="small" onClick={() => setSelectedOrderForDetail(order)}>
                                                                    👁️ Ver Detalle
                                                                </Button>
                                                                {order.status === 'PENDIENTE' && (
                                                                    <>
                                                                        <Button variant="contained" color="success" size="small" onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}>
                                                                            ✅ Marcar Entregado
                                                                        </Button>
                                                                        <Button variant="contained" color="error" size="small" onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}>
                                                                            🚫 Cancelar
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {order.status === 'ENTREGADO' && (
                                                                    <Button variant="contained" color="error" size="small" onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}>
                                                                        🚫 Cancelar
                                                                    </Button>
                                                                )}
                                                                {order.status === 'CANCELADO' && (
                                                                    <Button variant="contained" size="small" sx={{ bgcolor: '#f39c12', '&:hover': { bgcolor: '#e67e22' } }} onClick={() => handleUpdateStatus(order.id, 'PENDIENTE')}>
                                                                        ↩️ Reactivar Pedido
                                                                    </Button>
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
                                        const orderDate = new Date(order.created_at).toLocaleString('es-ES', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })

                                        return (
                                            <Card key={order.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                                                        <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.9375rem' }}>#{order.id}</Typography>
                                                        <Chip label={badge.label} size="small" color={badge.color} variant="filled" sx={{ fontWeight: 700 }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="text.secondary">Cliente:</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="text.secondary">Teléfono:</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{order.customer_phone || '—'}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{orderDate}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="text.secondary">Total:</Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark', fontSize: '0.9375rem' }}>${order.total_price.toLocaleString()}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                                        <Button variant="outlined" size="small" sx={{ flex: 1, fontSize: '0.6875rem' }} onClick={() => setSelectedOrderForDetail(order)}>
                                                            👁️ Ver Detalle
                                                        </Button>
                                                        {order.status === 'PENDIENTE' && (
                                                            <>
                                                                <Button variant="contained" color="success" size="small" sx={{ flex: 1, fontSize: '0.6875rem' }} onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}>
                                                                    ✅ Entregado
                                                                </Button>
                                                                <Button variant="contained" color="error" size="small" sx={{ flex: 1, fontSize: '0.6875rem' }} onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}>
                                                                    🚫 Cancelar
                                                                </Button>
                                                            </>
                                                        )}
                                                        {order.status === 'ENTREGADO' && (
                                                            <Button variant="contained" color="error" size="small" sx={{ flex: 1, fontSize: '0.6875rem' }} onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}>
                                                                🚫 Cancelar
                                                            </Button>
                                                        )}
                                                        {order.status === 'CANCELADO' && (
                                                            <Button variant="contained" size="small" sx={{ flex: 1, fontSize: '0.6875rem', bgcolor: '#f39c12', '&:hover': { bgcolor: '#e67e22' } }} onClick={() => handleUpdateStatus(order.id, 'PENDIENTE')}>
                                                                ↩️ Reactivar
                                                            </Button>
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
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        backdropFilter: 'blur(4px)',
                        p: 2,
                    }}
                >
                    <Card sx={{ width: '100%', maxWidth: 600, position: 'relative' }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Button
                                onClick={() => setSelectedOrderForDetail(null)}
                                sx={{ position: 'absolute', top: 1, right: 1, minWidth: 0, fontSize: '1.5rem', color: 'text.secondary' }}
                            >
                                &times;
                            </Button>

                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Detalle del Pedido #{selectedOrderForDetail.id}
                            </Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2.5 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>Cliente:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrderForDetail.customer_name}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>Teléfono:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedOrderForDetail.customer_phone || '—'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>Fecha y Hora:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedOrderForDetail.created_at).toLocaleString()}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>Estado actual:</Typography>
                                    <Chip
                                        label={getStatusStyles(selectedOrderForDetail.status).label}
                                        size="small"
                                        color={getStatusStyles(selectedOrderForDetail.status).color}
                                        variant="filled"
                                        sx={{ fontWeight: 700 }}
                                    />
                                </Box>
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.25 }}>Artículos del Pedido</Typography>
                            <Box sx={{ maxHeight: 200, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, mb: 2.5 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="center">Talla</TableCell>
                                            <TableCell align="center">Cant.</TableCell>
                                            <TableCell align="right">Precio</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedOrderForDetail.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.product_name}</TableCell>
                                                <TableCell align="center" sx={{ color: 'text.secondary' }}>{item.selected_size || '—'}</TableCell>
                                                <TableCell align="center">{item.quantity}</TableCell>
                                                <TableCell align="right">${item.price.toLocaleString()}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography sx={{ fontWeight: 700 }}>Total del Pedido:</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                                    ${selectedOrderForDetail.total_price.toLocaleString()}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="outlined" onClick={() => setSelectedOrderForDetail(null)}>
                                    Cerrar
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </>
    )
}

export default Orders