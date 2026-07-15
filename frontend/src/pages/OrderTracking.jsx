import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
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
    'EN_PREPARACION': '#2563eb',
    'EN_CAMINO': '#10b981',
    'ENTREGADO': '#22c55e',
    'CANCELADO': '#ef4444',
}

const STATUS_CHIP_VARIANT = {
    'PENDIENTE': 'filledWarning',
    'CONFIRMADO': 'filledInfo',
    'EN_PREPARACION': 'filledInfo',
    'EN_CAMINO': 'filledSuccess',
    'ENTREGADO': 'filledSuccess',
    'CANCELADO': 'filledError',
}

const sectionBox = (isDark) => ({
    background: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
    border: isDark ? '1px solid rgba(180,197,255,0.10)' : '1px solid rgba(0,74,198,0.08)',
    borderRadius: '14px',
})

const glassCard = (isDark) => ({
    background: isDark
        ? 'rgba(10, 10, 28, 0.85)'
        : 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: isDark
        ? '1px solid rgba(180, 197, 255, 0.12)'
        : '1px solid rgba(0, 74, 198, 0.10)',
    borderRadius: '18px',
    overflow: 'visible',
    boxShadow: isDark
        ? '0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(180,197,255,0.06)'
        : '0 16px 48px rgba(0,74,198,0.10), 0 0 0 1px rgba(0,74,198,0.04)',
})

function OrderTracking() {
    const { token } = useParams()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchOrder()
        const interval = setInterval(fetchOrder, 15000)
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
        } catch {
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
            <Box sx={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default',
            }}>
                <Box sx={{
                    width: 72, height: 72, borderRadius: '22px',
                    background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 50%, #5092f7 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 3, animation: 'float 4s ease-in-out infinite',
                    boxShadow: '0 16px 48px rgba(0,74,198,0.45)',
                }}>
                    <CircularProgress size={32} sx={{ color: '#fff' }} />
                </Box>
                <Typography variant="h6" sx={{
                    fontWeight: 700, mb: 0.5,
                    background: isDark
                        ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                        : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    Cargando pedido...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Un momento por favor
                </Typography>
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{
                minHeight: '100vh', position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3,
                bgcolor: 'background.default',
            }}>
                <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    background: isDark
                        ? `radial-gradient(ellipse 90% 70% at 50% 30%, rgba(239, 68, 68, 0.18) 0%, transparent 55%),
                           radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0, 74, 198, 0.10) 0%, transparent 50%),
                           #07071a`
                        : `radial-gradient(ellipse 90% 70% at 50% 30%, rgba(239, 68, 68, 0.10) 0%, transparent 55%),
                           radial-gradient(ellipse 60% 50% at 80% 70%, rgba(0, 74, 198, 0.06) 0%, transparent 50%),
                           #f6f6fe`,
                }} />
                <Box sx={{
                    position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 460,
                    animation: 'fade-in-up 0.5s ease both',
                }}>
                    <Box sx={{
                        width: 96, height: 96, borderRadius: '28px', mx: 'auto', mb: 3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.05))',
                        border: `1px solid ${isDark ? 'rgba(239,68,68,0.20)' : 'rgba(239,68,68,0.15)'}`,
                        animation: 'float 4s ease-in-out infinite',
                    }}>
                        <Typography sx={{ fontSize: '3rem' }}>🔍</Typography>
                    </Box>
                    <Typography variant="h4" sx={{
                        fontWeight: 700, mb: 1, lineHeight: 1.2,
                        background: isDark
                            ? 'linear-gradient(135deg, #fca5a5, #f87171, #ef4444)'
                            : 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {error}
                    </Typography>
                    <Typography color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.7 }}>
                        Si crees que esto es un error, contacta al negocio directamente.
                    </Typography>
                </Box>
            </Box>
        )
    }

    const activeStep = getActiveStep()
    const isCancelled = order.status === 'CANCELADO'
    const statusColor = STATUS_COLORS[order.status] || '#004ac6'

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
            {/* Background mesh */}
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                background: isDark
                    ? `radial-gradient(ellipse 90% 50% at 50% 0%, ${statusColor}22 0%, transparent 60%),
                       radial-gradient(ellipse 60% 40% at 20% 90%, rgba(0,74,198,0.08) 0%, transparent 50%),
                       #07071a`
                    : `radial-gradient(ellipse 90% 50% at 50% 0%, ${statusColor}15 0%, transparent 60%),
                       radial-gradient(ellipse 60% 40% at 20% 90%, rgba(0,74,198,0.05) 0%, transparent 50%),
                       #f6f6fe`,
            }} />
            {/* Dot grid */}
            <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: isDark
                    ? 'radial-gradient(circle, rgba(0,74,198,0.06) 1px, transparent 1px)'
                    : 'radial-gradient(circle, rgba(0,74,198,0.07) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                zIndex: 0,
            }} />

            {/* Header Banner */}
            <Box sx={{
                position: 'relative', zIndex: 1,
                background: isDark
                    ? `linear-gradient(160deg, ${statusColor}30 0%, ${statusColor}10 50%, transparent 100%)`
                    : `linear-gradient(160deg, ${statusColor}20 0%, ${statusColor}08 50%, transparent 100%)`,
                borderBottom: isDark
                    ? '1px solid rgba(180,197,255,0.08)'
                    : '1px solid rgba(0,74,198,0.06)',
                py: 5, px: 3, textAlign: 'center',
                animation: 'fade-in-up 0.5s ease both',
            }}>
                <Box sx={{
                    width: 72, height: 72, borderRadius: '22px',
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(0,74,198,0.18), rgba(0,74,198,0.08))'
                        : 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(0,74,198,0.05))',
                    border: isDark
                        ? '1px solid rgba(180,197,255,0.18)'
                        : '1px solid rgba(0,74,198,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2.5,
                    boxShadow: `0 12px 40px ${statusColor}20`,
                }}>
                    {order.store?.logo_url ? (
                        <Box
                            component="img"
                            src={order.store.logo_url}
                            alt={`${order.store.name || ''} logo`}
                            sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '20px' }}
                        />
                    ) : (
                        <StorefrontIcon sx={{ fontSize: 32, color: 'primary.main', opacity: 0.8 }} />
                    )}
                </Box>
                <Typography variant="h4" sx={{
                    fontWeight: 700, mb: 0.75,
                    background: isDark
                        ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                        : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    {order.store?.name || 'Seguimiento de Pedido'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>
                    Pedido #{order.id}
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
                {/* Status Card */}
                <Card sx={{
                    ...glassCard(isDark), mb: 3,
                    position: 'relative', overflow: 'visible',
                    animation: 'fade-in-up 0.5s ease both',
                    animationDelay: '0.05s',
                    '&::before': {
                        content: '""',
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: `linear-gradient(90deg, ${statusColor}, ${statusColor}99)`,
                        borderRadius: '18px 18px 0 0',
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 700,
                                background: isDark
                                    ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                                    : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Estado actual
                            </Typography>
                            <Chip
                                label={isCancelled ? '❌ Cancelado' : `${STATUS_STEPS[activeStep]?.icon} ${STATUS_STEPS[activeStep]?.label}`}
                                size="small"
                                color={isCancelled ? 'error' : undefined}
                                variant="filled"
                                sx={isCancelled ? {} : {
                                    background: `linear-gradient(135deg, ${statusColor}, ${statusColor}cc)`,
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    boxShadow: `0 2px 8px ${statusColor}30`,
                                }}
                            />
                        </Box>

                        {isCancelled ? (
                            <Alert severity="error" sx={{
                                mb: 0, borderRadius: '12px',
                                animation: 'fade-in-up 0.3s ease',
                            }}>
                                Este pedido ha sido cancelado.
                            </Alert>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                                {STATUS_STEPS[activeStep]?.description}
                            </Typography>
                        )}

                        {/* Progress Stepper */}
                        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2.5 }}>
                            {STATUS_STEPS.map((step, index) => (
                                <Step key={step.key} completed={index < activeStep}>
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: '12px',
                                                bgcolor: index <= activeStep
                                                    ? isDark
                                                        ? 'rgba(0,74,198,0.15)'
                                                        : 'rgba(0,74,198,0.10)'
                                                    : isDark
                                                        ? 'rgba(255,255,255,0.04)'
                                                        : 'rgba(0,0,0,0.04)',
                                                border: `1.5px solid ${
                                                    index < activeStep
                                                        ? `${statusColor}40`
                                                        : index === activeStep
                                                            ? `${statusColor}30`
                                                            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
                                                }`,
                                                color: index <= activeStep ? statusColor : 'text.disabled',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: index < activeStep ? '1.1rem' : '0.95rem',
                                                fontWeight: 700,
                                                transition: 'all 0.3s',
                                                boxShadow: index === activeStep
                                                    ? `0 4px 16px ${statusColor}20`
                                                    : 'none',
                                            }}>
                                                {index < activeStep ? '✓' : step.icon}
                                            </Box>
                                        )}
                                    >
                                        <Typography sx={{
                                            fontWeight: index === activeStep ? 700 : 500,
                                            fontSize: '0.875rem',
                                            color: index === activeStep
                                                ? 'text.primary'
                                                : index < activeStep
                                                    ? 'text.secondary'
                                                    : 'text.disabled',
                                        }}>
                                            {step.label}
                                        </Typography>
                                    </StepLabel>
                                    {index < activeStep && (
                                        <StepContent>
                                            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                                Completado
                                            </Typography>
                                        </StepContent>
                                    )}
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>

                {/* Estimated Delivery */}
                {order.estimated_delivery && !isCancelled && (
                    <Card sx={{
                        ...glassCard(isDark), mb: 3,
                        position: 'relative', overflow: 'visible',
                        animation: 'fade-in-up 0.5s ease both',
                        animationDelay: '0.1s',
                        '&::before': {
                            content: '""',
                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                            borderRadius: '18px 18px 0 0',
                        },
                    }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 44, height: 44, borderRadius: '14px',
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.06))'
                                    : 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.04))',
                                border: '1px solid rgba(245,158,11,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <AccessTimeIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                                    Entrega estimada
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                    {formatDate(order.estimated_delivery)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Delivery Address */}
                {order.delivery_address && (
                    <Card sx={{
                        ...glassCard(isDark), mb: 3,
                        position: 'relative', overflow: 'visible',
                        animation: 'fade-in-up 0.5s ease both',
                        animationDelay: '0.15s',
                        '&::before': {
                            content: '""',
                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            borderRadius: '18px 18px 0 0',
                        },
                    }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 44, height: 44, borderRadius: '14px',
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.06))'
                                    : 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04))',
                                border: '1px solid rgba(16,185,129,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <LocationOnIcon sx={{ color: '#10b981', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                                    Dirección de entrega
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                    {order.delivery_address}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Order Items */}
                <Card sx={{
                    ...glassCard(isDark), mb: 3,
                    position: 'relative', overflow: 'visible',
                    animation: 'fade-in-up 0.5s ease both',
                    animationDelay: '0.2s',
                    '&::before': {
                        content: '""',
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, #2563eb, #004ac6)',
                        borderRadius: '18px 18px 0 0',
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 700, mb: 2.5,
                            background: isDark
                                ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                                : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Detalle del Pedido
                        </Typography>
                        {order.items?.map((item, idx) => (
                            <Box key={idx}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                            {item.quantity}x {item.product_name}
                                        </Typography>
                                        {item.selected_size && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                Talla: {item.selected_size}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography sx={{
                                        fontWeight: 700, fontSize: '0.875rem',
                                        color: isDark ? '#dbe1ff' : '#003ea8',
                                    }}>
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </Typography>
                                </Box>
                                {idx < order.items.length - 1 && (
                                    <Divider sx={{
                                        borderColor: isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)',
                                    }} />
                                )}
                            </Box>
                        ))}
                        <Divider sx={{
                            my: 1.5,
                            borderColor: isDark ? 'rgba(180,197,255,0.12)' : 'rgba(0,74,198,0.10)',
                        }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                            <Typography sx={{
                                fontWeight: 800, fontSize: '1.125rem',
                                background: isDark
                                    ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                                    : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                ${order.total_price?.toLocaleString()}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Customer Info */}
                <Card sx={{
                    ...glassCard(isDark), mb: 3,
                    position: 'relative', overflow: 'visible',
                    animation: 'fade-in-up 0.5s ease both',
                    animationDelay: '0.25s',
                    '&::before': {
                        content: '""',
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
                        borderRadius: '18px 18px 0 0',
                    },
                }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 700, mb: 2,
                            background: isDark
                                ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                                : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Datos del Cliente
                        </Typography>
                        <Box sx={{
                            ...sectionBox(isDark),
                            p: 2,
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Nombre</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                                </Box>
                                {order.customer_phone && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Teléfono</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_phone}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Fecha del pedido</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(order.created_at)}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Box sx={{
                    textAlign: 'center', py: 4,
                    animation: 'fade-in-up 0.5s ease both',
                    animationDelay: '0.3s',
                }}>
                    <Box sx={{
                        ...sectionBox(isDark),
                        display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.25,
                        mb: 1.5,
                    }}>
                        <Box sx={{
                            width: 6, height: 6, borderRadius: '50%',
                            bgcolor: '#10b981',
                            animation: 'float 2s ease-in-out infinite',
                            boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                        }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            Se actualiza automáticamente cada 15 segundos
                        </Typography>
                    </Box>
                    {order.store?.logo_url ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
                            <Box component="img" src={order.store.logo_url} alt="Logo" sx={{ height: 18, maxWidth: 80, objectFit: 'contain' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                {order.store.name}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="caption" sx={{
                            display: 'block', fontWeight: 600, mt: 0.5,
                            background: isDark
                                ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                                : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            Powered by OSDOSOFT
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default OrderTracking
