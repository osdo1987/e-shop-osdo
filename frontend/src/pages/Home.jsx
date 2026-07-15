import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import StorefrontIcon from '@mui/icons-material/Storefront'
import SpeedIcon from '@mui/icons-material/Speed'
import ChatIcon from '@mui/icons-material/Chat'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import InsightsIcon from '@mui/icons-material/Insights'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import GroupsIcon from '@mui/icons-material/Groups'
import BoltIcon from '@mui/icons-material/Bolt'

const features = [
    { icon: <StorefrontIcon sx={{ fontSize: 30 }} />, title: 'Catálogo Digital', desc: 'Crea y comparte tu catálogo en segundos con un link único por WhatsApp.', color: '#004ac6', gradient: 'linear-gradient(135deg, #004ac6, #2563eb)' },
    { icon: <ChatIcon sx={{ fontSize: 30 }} />, title: 'Pedidos por WhatsApp', desc: 'Tus clientes ordenan directo por WhatsApp con un solo toque.', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { icon: <SpeedIcon sx={{ fontSize: 30 }} />, title: 'POS Ultrarrápido', desc: 'Punto de venta local que no frena tus ventas presenciales.', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { icon: <InventoryIcon sx={{ fontSize: 30 }} />, title: 'Inventario Inteligente', desc: 'Gestiona stock, variantes y categorías desde un solo lugar.', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)' },
    { icon: <ReceiptLongIcon sx={{ fontSize: 30 }} />, title: 'Facturación Auto', desc: 'Genera facturas y reportes de venta automáticos.', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    { icon: <InsightsIcon sx={{ fontSize: 30 }} />, title: 'Métricas en Vivo', desc: 'Dashboard con estadísticas de ventas, pedidos y rendimiento.', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
]

const stats = [
    { value: '10K+', label: 'Ventas procesadas', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
    { value: '500+', label: 'Tiendas activas', icon: <GroupsIcon sx={{ fontSize: 18 }} /> },
    { value: '99.9%', label: 'Uptime', icon: <BoltIcon sx={{ fontSize: 18 }} /> },
]

function Sparkle({ top, left, size, delay, duration }) {
    return (
        <Box sx={{
            position: 'absolute', top, left, width: size, height: size,
            pointerEvents: 'none', zIndex: 0,
            '&::before, &::after': {
                content: '""', position: 'absolute',
                background: 'rgba(0, 74, 198, 0.6)',
            },
            '&::before': {
                width: '100%', height: '2px', top: '50%', left: 0,
                transform: 'translateY(-50%)',
            },
            '&::after': {
                width: '2px', height: '100%', left: '50%', top: 0,
                transform: 'translateX(-50%)',
            },
            animation: `sparkle ${duration}s ease-in-out infinite`,
            animationDelay: delay,
        }} />
    )
}

function Home() {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Full-page animated gradient mesh background */}
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: isDark
                    ? `
                        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0, 74, 198, 0.25) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 50% at 80% 30%, rgba(37, 99, 235, 0.20) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 40% at 50% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
                        radial-gradient(ellipse 40% 30% at 10% 60%, rgba(6, 182, 212, 0.10) 0%, transparent 45%),
                        #07071a
                    `
                    : `
                        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0, 74, 198, 0.15) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 50% at 80% 30%, rgba(37, 99, 235, 0.12) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 40% at 50% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 40% 30% at 10% 60%, rgba(6, 182, 212, 0.06) 0%, transparent 45%),
                        #f6f6fe
                    `,
            }} />

            {/* Floating orbs — much bigger and more visible */}
            <Box sx={{
                position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,74,198,0.25) 0%, transparent 65%)',
                top: '-15%', left: '-10%',
                filter: 'blur(60px)',
                animation: 'orb-float-1 18s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 65%)',
                top: '20%', right: '-12%',
                filter: 'blur(50px)',
                animation: 'orb-float-2 20s ease-in-out infinite',
                animationDelay: '-6s',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)',
                bottom: '5%', left: '30%',
                filter: 'blur(50px)',
                animation: 'orb-float-1 15s ease-in-out infinite',
                animationDelay: '-10s',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)',
                top: '60%', left: '-5%',
                filter: 'blur(40px)',
                animation: 'orb-float-2 14s ease-in-out infinite',
                animationDelay: '-3s',
                pointerEvents: 'none',
            }} />

            {/* Sparkle particles */}
            <Sparkle top="15%" left="20%" size={12} delay="0s" duration={3} />
            <Sparkle top="25%" left="75%" size={8} delay="1s" duration={2.5} />
            <Sparkle top="45%" left="10%" size={10} delay="2s" duration={3.5} />
            <Sparkle top="60%" left="85%" size={14} delay="0.5s" duration={4} />
            <Sparkle top="80%" left="40%" size={8} delay="1.5s" duration={3} />
            <Sparkle top="10%" left="55%" size={6} delay="3s" duration={2.5} />
            <Sparkle top="70%" left="65%" size={10} delay="0.8s" duration={3.5} />

            {/* Dot grid overlay */}
            <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: isDark
                    ? 'radial-gradient(circle, rgba(0,74,198,0.06) 1px, transparent 1px)'
                    : 'radial-gradient(circle, rgba(0,74,198,0.08) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
            }} />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* HERO */}
                <Box sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '100vh', p: 2.5,
                    textAlign: 'center', maxWidth: 900, mx: 'auto',
                }}>
                    {/* Live badge */}
                    <Box sx={{
                        mb: 4,
                        px: 2.5, py: 1,
                        borderRadius: 99,
                        background: isDark ? 'rgba(16, 185, 129, 0.10)' : 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex', alignItems: 'center', gap: 1,
                        animation: 'fade-in-up 0.5s ease both',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
                    }}>
                        <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#10b981',
                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                            animation: 'pulse-glow 2s ease-in-out infinite',
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                            SISTEMA ACTIVO
                        </Typography>
                    </Box>

                    {/* Massive title with glow */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2.75rem', sm: '4.5rem', md: '5.5rem' },
                            fontWeight: 400,
                            mb: 3,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            background: isDark
                                ? 'linear-gradient(135deg, #dbe1ff 0%, #b4c5ff 30%, #5092f7 60%, #7eb3ff 100%)'
                                : 'linear-gradient(135deg, #003ea8 0%, #004ac6 30%, #2563eb 60%, #5092f7 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'hero-glow 4s ease-in-out infinite',
                            filter: 'drop-shadow(0 2px 12px rgba(0, 74, 198, 0.2))',
                        }}
                    >
                        E-Shop WhatsApp
                    </Typography>

                    <Typography
                        sx={{
                            maxWidth: 580,
                            mb: 5,
                            fontWeight: 400,
                            lineHeight: 1.7,
                            fontSize: { xs: '1.05rem', sm: '1.25rem', md: '1.35rem' },
                            color: 'text.secondary',
                            animation: 'fade-in-up 0.6s ease both',
                            animationDelay: '0.1s',
                        }}
                    >
                        La solución más rápida para vender por WhatsApp. Crea tu catálogo, comparte el link y recibe pedidos al instante.
                    </Typography>

                    {/* CTA buttons */}
                    <Box sx={{
                        display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center',
                        animation: 'fade-in-up 0.6s ease both',
                        animationDelay: '0.2s',
                    }}>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                px: 5, py: 1.75,
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0, left: -100,
                                    width: 60, height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                    transform: 'skewX(-20deg)',
                                    transition: 'left 0.7s ease',
                                },
                                '&:hover::before': { left: '130%' },
                            }}
                        >
                            Empezar Ahora
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                px: 4, py: 1.75,
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                gap: 1.5,
                                borderColor: isDark ? 'rgba(180, 197, 255, 0.3)' : 'rgba(0, 74, 198, 0.3)',
                                color: isDark ? '#a5b4fc' : '#003ea8',
                                '& .whatsapp-icon': {
                                    fill: '#25D366',
                                    filter: 'drop-shadow(0 0 4px rgba(37, 211, 102, 0.3))',
                                },
                                '&:hover': {
                                    borderColor: '#25D366',
                                    background: 'rgba(16, 185, 129, 0.06)',
                                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
                                },
                            }}
                        >
                            <svg className="whatsapp-icon" viewBox="0 0 24 24" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            Catálogo WhatsApp
                        </Button>
                    </Box>

                    {/* Social proof stats */}
                    <Box sx={{
                        display: 'flex', gap: { xs: 3, sm: 5 }, mt: 7,
                        animation: 'fade-in-up 0.6s ease both',
                        animationDelay: '0.35s',
                    }}>
                        {stats.map((s) => (
                            <Box key={s.label} sx={{ textAlign: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'primary.main', mb: 0.5 }}>
                                    {s.icon}
                                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', sm: '2rem' }, letterSpacing: '-0.03em' }}>
                                        {s.value}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Typography variant="body2" color="text.disabled" sx={{ mt: 7, fontSize: '0.8125rem', opacity: 0.6 }}>
                        ¿Eres cliente? Pide el link del catálogo a tu vendedor.
                    </Typography>
                </Box>

                {/* FEATURES SECTION */}
                <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', px: { xs: 2.5, sm: 4 }, pb: 12 }}>
                    <Box sx={{ textAlign: 'center', mb: 7 }}>
                        <Typography variant="overline" sx={{
                            fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.75rem',
                            color: 'primary.main', mb: 1.5, display: 'block',
                        }}>
                            FUNCIONALIDADES
                        </Typography>
                        <Typography variant="h3" sx={{
                            fontWeight: 400, mb: 1.5,
                            fontSize: { xs: '1.875rem', sm: '2.5rem' },
                            letterSpacing: '-0.035em',
                        }}>
                            Todo lo que necesitas para vender
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', fontSize: '1.05rem' }}>
                            Herramientas diseñadas para emprendedores que quieren vender más y mejor.
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3,
                    }}>
                        {features.map((feat, idx) => (
                            <Box
                                key={feat.title}
                                sx={{
                                    p: 3.5,
                                    borderRadius: '20px',
                                    background: isDark ? 'rgba(14, 14, 36, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    border: isDark
                                        ? '1px solid rgba(180, 197, 255, 0.12)'
                                        : '1px solid rgba(0, 74, 198, 0.10)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    animation: `fade-in-up 0.5s ease both`,
                                    animationDelay: `${idx * 100}ms`,
                                    cursor: 'default',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0,
                                        height: '3px',
                                        background: feat.gradient,
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-8px) scale(1.02)',
                                        boxShadow: isDark
                                            ? `0 20px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px ${feat.color}30, 0 0 40px ${feat.color}10`
                                            : `0 20px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px ${feat.color}25, 0 0 40px ${feat.color}08`,
                                        borderColor: `${feat.color}30`,
                                        '&::before': { opacity: 1 },
                                        '& .feat-icon': {
                                            transform: 'scale(1.15) rotate(-5deg)',
                                            boxShadow: `0 8px 24px ${feat.color}40`,
                                        },
                                    },
                                }}
                            >
                                <Box
                                    className="feat-icon"
                                    sx={{
                                        width: 56, height: 56,
                                        borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${feat.color}20, ${feat.color}30)`,
                                        color: feat.color,
                                        mb: 2.5,
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        boxShadow: `0 4px 12px ${feat.color}15`,
                                    }}
                                >
                                    {feat.icon}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                                    {feat.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                                    {feat.desc}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{
                    width: '100%', py: 4, textAlign: 'center',
                    borderTop: `1px solid ${theme.palette.divider}`,
                }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                        E-Shop WhatsApp · Panel de Control
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Home
