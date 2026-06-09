import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Stepper from '@mui/material/Stepper'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useTheme } from '@mui/material/styles'

const STATUS_STEPS = [
    { key: 'PENDIENTE', label: 'Pedido Recibido', icon: '📋', description: 'Tu pedido ha sido recibido y está esperando confirmación.' },
    { key: 'CONFIRMADO', label: 'Confirmado', icon: '✅', description: 'El negocio ha confirmado tu pedido.' },
    { key: 'EN_PREPARACION', label: 'En Preparación', icon: '👨‍🍳', description: 'Tu pedido está siendo preparado.' },
    { key: 'EN_CAMINO', label: 'En Camino', icon: '🚗', description: 'Tu pedido va en camino a tu dirección.' },
    { key: 'ENTREGADO', label: 'Entregado', icon: '📦', description: 'Tu pedido ha sido entregado. ¡Buen provecho!' },
]

const STATUS_COLORS = {
    'PENDIENTE': '#f59e0b',
    'CONFIRMADO': '#3b82f6',
    'EN_PREPARACION': '#8b5cf6',
    'EN_CAMINO': '#10b981',
    'ENTREGADO': '#22c55e',
    'CANCELADO': '#ef4444',
}

function OrderTracking() {
    const { token } = useParams()
    const theme = useTheme()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchOrder()
        const interval = setInterval(fetchOrder, 15000) // Auto-refresh every 15s
        return () => clearInterval(interval)
    }, [token])

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/public/track/${token}`)
            if (res.ok) {
                const data = await res.json()
                setOrder(data)
                setError(null)
            } else if (res.status === 404) {
                setError('Pedido no encontrado. Verifica el enlace de seguimiento.')
            } else {
                setError('Error al cargar el pedido.')
            }
        } catch (err) {
            setError('Error de conexión.')
        } finally {
            setLoading(false)
        }
    }

    const getActiveStep = () => {
        if (!order) return 0
        if (order.status === 'CANCELADO') return -1
        const idx = STATUS_STEPS.findIndex(s => s.key === order.status)
        return idx >= 0 ? idx : 0
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">Cargando estado del pedido...</Typography>
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: 'background.default' }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🔍</Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>{error}</Typography>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    Si crees que esto es un error, contacta al negocio directamente.
                </Typography>
            </Box>
        )
    }

    const activeStep = getActiveStep()
    const isCancelled = order.status === 'CANCELADO'
    const color = STATUS_COLORS[order.status] || '#6366f1'

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                color: 'white',
                py: 4,
                px: 3,
                textAlign: 'center',
            }}>
                <Box sx={{
                    width: 56, height: 56, borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2,
                }}>
                    <StorefrontIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Seguimiento de Pedido
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Pedido #{order.id}
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 } }}>
                {/* Status Card */}
                <Card sx={{ mb: 2.5, overflow: 'visible' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Estado actual</Typography>
                            <Chip
                                label={isCancelled ? '❌ Cancelado' : `${STATUS_STEPS[activeStep]?.icon} ${STATUS_STEPS[activeStep]?.label}`}
                                sx={{
                                    bgcolor: isCancelled ? '#fef2f2' : `${color}15`,
                                    color: isCancelled ? '#ef4444' : color,
                                    fontWeight: 700,
                                    border: `1px solid ${isCancelled ? '#fca5a5' : `${color}40`}`,
                                }}
                            />
                        </Box>

                        {isCancelled ? (
                            <Alert severity="error" sx={{ mb: 0 }}>
                                Este pedido ha sido cancelado.
                            </Alert>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {STATUS_STEPS[activeStep]?.description}
                            </Typography>
                        )}

                        {/* Progress Stepper */}
                        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
                            {STATUS_STEPS.map((step, index) => (
                                <Step key={step.key} completed={index < activeStep}>
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                bgcolor: index <= activeStep ? color : 'action.disabledBackground',
                                                color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                transition: 'all 0.3s',
                                            }}>
                                                {index < activeStep ? '✓' : step.icon}
                                            </Box>
                                        )}
                                    >
                                        <Typography sx={{ fontWeight: index === activeStep ? 700 : 500, fontSize: '0.875rem' }}>
                                            {step.label}
                                        </Typography>
                                    </StepLabel>
                                    {index < activeStep && (
                                        <StepContent>
                                            <Typography variant="caption" color="text.disabled">Completado</Typography>
                                        </StepContent>
                                    )}
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>

                {/* Estimated Delivery */}
                {order.estimated_delivery && !isCancelled && (
                    <Card sx={{ mb: 2.5 }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccessTimeIcon sx={{ color: color }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Entrega estimada</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{formatDate(order.estimated_delivery)}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Delivery Address */}
                {order.delivery_address && (
                    <Card sx={{ mb: 2.5 }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LocationOnIcon sx={{ color: 'text.secondary' }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Dirección de entrega</Typography>
                                <Typography sx={{ fontWeight: 600 }}>{order.delivery_address}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Order Items */}
                <Card sx={{ mb: 2.5 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Detalle del Pedido</Typography>
                        {order.items?.map((item, idx) => (
                            <Box key={idx}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                            {item.quantity}x {item.product_name}
                                        </Typography>
                                        {item.selected_size && (
                                            <Typography variant="caption" color="text.secondary">
                                                Talla: {item.selected_size}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </Typography>
                                </Box>
                                {idx < order.items.length - 1 && <Divider />}
                            </Box>
                        ))}
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: color }}>
                                ${order.total_price?.toLocaleString()}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Customer Info */}
                <Card sx={{ mb: 2.5 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Datos del Cliente</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Nombre</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                            </Box>
                            {order.customer_phone && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_phone}</Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Fecha del pedido</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(order.created_at)}</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="caption" color="text.disabled">
                        Se actualiza automáticamente cada 15 segundos
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mt: 0.5, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Powered by OSDOSOFT
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default OrderTracking