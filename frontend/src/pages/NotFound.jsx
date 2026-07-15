import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'

function NotFound() {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <Box sx={{
            minHeight: '100vh', position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2.5,
        }}>
            {/* Gradient mesh background */}
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: isDark
                    ? `
                        radial-gradient(ellipse 90% 70% at 50% 10%, rgba(0, 74, 198, 0.25) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 60% at 20% 80%, rgba(239, 68, 68, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 50% at 85% 50%, rgba(37, 99, 235, 0.18) 0%, transparent 50%),
                        #07071a
                    `
                    : `
                        radial-gradient(ellipse 90% 70% at 50% 10%, rgba(0, 74, 198, 0.15) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 60% at 20% 80%, rgba(239, 68, 68, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 50% at 85% 50%, rgba(37, 99, 235, 0.10) 0%, transparent 50%),
                        #f6f6fe
                    `,
            }} />

            {/* Floating orbs */}
            <Box sx={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,74,198,0.25) 0%, transparent 60%)',
                top: '-15%', left: '-10%',
                filter: 'blur(60px)',
                animation: 'orb-float-1 18s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 60%)',
                bottom: '-10%', right: '-8%',
                filter: 'blur(50px)',
                animation: 'orb-float-2 16s ease-in-out infinite',
                animationDelay: '-5s',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 60%)',
                top: '50%', right: '20%',
                filter: 'blur(45px)',
                animation: 'orb-float-1 14s ease-in-out infinite',
                animationDelay: '-8s',
                pointerEvents: 'none',
            }} />

            {/* Dot grid */}
            <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: isDark
                    ? 'radial-gradient(circle, rgba(0,74,198,0.06) 1px, transparent 1px)'
                    : 'radial-gradient(circle, rgba(0,74,198,0.07) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
            }} />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
                {/* Animated icon */}
                <Box sx={{
                    animation: 'fade-in-up 0.5s ease both',
                    mb: 3,
                    display: 'flex', justifyContent: 'center',
                }}>
                    <Box sx={{
                        width: 100, height: 100, borderRadius: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.05))',
                        border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
                        boxShadow: '0 12px 40px rgba(239,68,68,0.15)',
                        animation: 'float 4s ease-in-out infinite',
                    }}>
                        <SearchOffIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.8 }} />
                    </Box>
                </Box>

                {/* Massive 404 with glow */}
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '5rem', sm: '7rem', md: '8rem' },
                        fontWeight: 400,
                        mb: 1,
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        background: isDark
                            ? 'linear-gradient(135deg, #fca5a5 0%, #f87171 40%, #ef4444 70%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 40%, #f87171 70%, #fca5a5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'hero-glow 4s ease-in-out infinite',
                        filter: 'drop-shadow(0 2px 12px rgba(239, 68, 68, 0.2))',
                    }}
                >
                    404
                </Typography>

                <Typography variant="h4" sx={{
                    fontWeight: 400, mb: 1.5,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    letterSpacing: '-0.03em',
                    color: 'text.primary',
                }}>
                    Página no encontrada
                </Typography>

                <Typography color="text.secondary" sx={{
                    maxWidth: 400, mx: 'auto', mb: 5, lineHeight: 1.7,
                    fontSize: '1rem',
                }}>
                    La página que buscas no existe o ha sido movida. Verifica la URL o vuelve al inicio.
                </Typography>

                {/* Action buttons */}
                <Box sx={{
                    display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap',
                    animation: 'fade-in-up 0.6s ease both',
                    animationDelay: '0.15s',
                }}>
                    <Button
                        component={Link} to="/" variant="contained" size="large"
                        startIcon={<HomeIcon />}
                        sx={{
                            px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700,
                            borderRadius: '14px', position: 'relative', overflow: 'hidden',
                            '&::before': {
                                content: '""', position: 'absolute',
                                top: 0, left: -120, width: 70, height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                transform: 'skewX(-20deg)', transition: 'left 0.7s ease',
                            },
                            '&:hover::before': { left: '140%' },
                        }}
                    >
                        Ir al Inicio
                    </Button>
                    <Button
                        component={Link} to="/login" variant="outlined" size="large"
                        startIcon={<LoginIcon />}
                        sx={{
                            px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700,
                            borderRadius: '14px',
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </Box>

                {/* Footer */}
                <Typography variant="caption" sx={{
                    display: 'block', mt: 7, color: 'text.disabled',
                    fontSize: '0.7rem', opacity: 0.5,
                }}>
                    E-Shop WhatsApp · Panel de Control
                </Typography>
            </Box>
        </Box>
    )
}

export default NotFound
