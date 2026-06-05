import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import { TableSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'

function Orders({ user, onLogout }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null)
    const toast = useToast()

    useEffect(() => {
        fetchOrders()
    }, [])

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

    // Stats
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

    // Filtered orders
    const filteredOrders = useMemo(() => {
        if (statusFilter === 'ALL') return orders
        return orders.filter(o => o.status === statusFilter)
    }, [orders, statusFilter])

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDIENTE':
                return { background: 'rgba(241, 196, 15, 0.15)', color: '#d35400', label: 'Pendiente' }
            case 'ENTREGADO':
                return { background: 'rgba(46, 204, 113, 0.15)', color: '#27ae60', label: 'Entregado' }
            case 'CANCELADO':
                return { background: 'rgba(231, 76, 60, 0.15)', color: '#c0392b', label: 'Cancelado' }
            default:
                return { background: 'rgba(127, 140, 141, 0.15)', color: '#7f8c8d', label: status }
        }
    }

    return (
        <>
            <AdminLayout title="Seguimiento de Pedidos" user={user} onLogout={onLogout}>
                {/* Stats */}
                {!loading && (
                    <div className="stats-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <StatCard
                            title="Total Pedidos"
                            value={stats.total}
                            icon="📦"
                            color="var(--primary-color)"
                            subtitle="Pedidos recibidos"
                        />
                        <StatCard
                            title="Pendientes"
                            value={stats.pending}
                            icon="⏳"
                            color="#f1c40f"
                            subtitle="Por entregar"
                        />
                        <StatCard
                            title="Entregados"
                            value={stats.delivered}
                            icon="✅"
                            color="#2ecc71"
                            subtitle="Ventas completadas"
                        />
                        <StatCard
                            title="Ventas Totales"
                            value={`$${stats.totalRevenue.toLocaleString()}`}
                            icon="💰"
                            color="#1abc9c"
                            subtitle="De pedidos entregados"
                        />
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {['ALL', 'PENDIENTE', 'ENTREGADO', 'CANCELADO'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ 
                                fontSize: '13px', 
                                padding: '8px 16px',
                                background: statusFilter === status ? 'var(--primary-color)' : 'var(--surface)',
                                border: statusFilter === status ? 'none' : '1px solid var(--border)'
                            }}
                        >
                            {status === 'ALL' ? 'Todos' : getStatusStyles(status).label}
                            <span style={{ 
                                marginLeft: '8px', 
                                background: 'rgba(0,0,0,0.1)', 
                                padding: '2px 6px', 
                                borderRadius: '10px',
                                fontSize: '11px'
                            }}>
                                {status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="card">
                    {loading ? (
                        <TableSkeleton rows={5} cols={6} />
                    ) : filteredOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                            No se encontraron pedidos con este estado.
                        </p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID Pedido</th>
                                        <th>Cliente</th>
                                        <th>Teléfono</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => {
                                        const badge = getStatusStyles(order.status)
                                        const orderDate = new Date(order.created_at).toLocaleString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })

                                        return (
                                            <tr key={order.id}>
                                                <td style={{ fontWeight: 'bold' }}>#{order.id}</td>
                                                <td>{order.customer_name}</td>
                                                <td>{order.customer_phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>{orderDate}</td>
                                                <td style={{ fontWeight: '700' }}>${order.total_price.toLocaleString()}</td>
                                                <td>
                                                    <span style={{
                                                        background: badge.background,
                                                        color: badge.color,
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        display: 'inline-block'
                                                    }}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => setSelectedOrderForDetail(order)}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '6px 12px', fontSize: '12px' }}
                                                        >
                                                            👁️ Ver Detalle
                                                        </button>
                                                        {order.status === 'PENDIENTE' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}
                                                                    className="btn"
                                                                    style={{ 
                                                                        padding: '6px 12px', 
                                                                        fontSize: '12px', 
                                                                        background: '#2ecc71', 
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    ✅ Entregar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                >
                                                                    🚫 Cancelar
                                                                </button>
                                                            </>
                                                        )}
                                                        {order.status === 'ENTREGADO' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'CANCELADO')}
                                                                className="btn btn-danger"
                                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                            >
                                                                🚫 Cancelar y Restaurar Stock
                                                            </button>
                                                        )}
                                                        {order.status === 'CANCELADO' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'ENTREGADO')}
                                                                className="btn"
                                                                style={{ 
                                                                    padding: '6px 12px', 
                                                                    fontSize: '12px', 
                                                                    background: '#2ecc71', 
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                ✅ Entregar y Descontar Stock
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AdminLayout>

            {/* Order Detail Modal */}
            {selectedOrderForDetail && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        backdropFilter: 'blur(4px)',
                        padding: '16px'
                    }}
                >
                    <div
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '600px',
                            padding: '24px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={() => setSelectedOrderForDetail(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            &times;
                        </button>

                        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                            Detalle del Pedido #{selectedOrderForDetail.id}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                            <div>
                                <strong style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cliente:</strong>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{selectedOrderForDetail.customer_name}</span>
                            </div>
                            <div>
                                <strong style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Teléfono:</strong>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{selectedOrderForDetail.customer_phone || '—'}</span>
                            </div>
                            <div>
                                <strong style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha y Hora:</strong>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(selectedOrderForDetail.created_at).toLocaleString()}</span>
                            </div>
                            <div>
                                <strong style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Estado actual:</strong>
                                <span style={{
                                    background: getStatusStyles(selectedOrderForDetail.status).background,
                                    color: getStatusStyles(selectedOrderForDetail.status).color,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'inline-block'
                                }}>
                                    {getStatusStyles(selectedOrderForDetail.status).label}
                                </span>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Artículos del Pedido</h3>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Producto</th>
                                        <th style={{ textAlign: 'center', padding: '10px' }}>Talla</th>
                                        <th style={{ textAlign: 'center', padding: '10px' }}>Cant.</th>
                                        <th style={{ textAlign: 'right', padding: '10px' }}>Precio</th>
                                        <th style={{ textAlign: 'right', padding: '10px' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrderForDetail.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '10px' }}>{item.product_name}</td>
                                            <td style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>{item.selected_size || '—'}</td>
                                            <td style={{ textAlign: 'center', padding: '10px' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right', padding: '10px' }}>${item.price.toLocaleString()}</td>
                                            <td style={{ textAlign: 'right', padding: '10px', fontWeight: '700' }}>${(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontWeight: '700' }}>Total del Pedido:</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                                ${selectedOrderForDetail.total_price.toLocaleString()}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setSelectedOrderForDetail(null)}
                                className="btn btn-secondary"
                                style={{ padding: '10px 20px', fontSize: '13px' }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Orders
