import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'

function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión')
                setLoading(false)
                return
            }
            onLogin(data.user, data.token)
            navigate(data.user.role === 'SUPERADMIN' ? '/admin/super' : '/admin')
        } catch {
            setError('Error de conexión')
            setLoading(false)
        }
    }

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', p: 2.5, position: 'relative', overflow: 'hidden',
        }}>
            {/* Full-page animated gradient mesh */}
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: isDark
                    ? `
                        radial-gradient(ellipse 90% 70% at 10% 10%, rgba(0, 74, 198, 0.30) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 60% at 90% 20%, rgba(37, 99, 235, 0.25) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 50% at 30% 90%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6, 182, 212, 0.10) 0%, transparent 45%),
                        #07071a
                    `
                    : `
                        radial-gradient(ellipse 90% 70% at 10% 10%, rgba(0, 74, 198, 0.18) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 60% at 90% 20%, rgba(37, 99, 235, 0.14) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 50% at 30% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 40% at 80% 70%, rgba(6, 182, 212, 0.06) 0%, transparent 45%),
                        #f6f6fe
                    `,
            }} />

            {/* Giant floating orbs */}
            <Box sx={{
                position: 'absolute', width: 700, height: 700, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,74,198,0.30) 0%, transparent 60%)',
                top: '-20%', left: '-15%',
                filter: 'blur(80px)',
                animation: 'orb-float-1 20s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 550, height: 550, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 60%)',
                top: '40%', right: '-18%',
                filter: 'blur(70px)',
                animation: 'orb-float-2 18s ease-in-out infinite',
                animationDelay: '-7s',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)',
                bottom: '-10%', left: '20%',
                filter: 'blur(60px)',
                animation: 'orb-float-1 16s ease-in-out infinite',
                animationDelay: '-4s',
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

            {/* Login Card with animated border */}
            <Box sx={{
                width: '100%', maxWidth: 460,
                position: 'relative', zIndex: 1,
                animation: 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
                /* Animated gradient border wrapper */
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${isDark ? '#004ac6, #2563eb, #5092f7, #10b981, #004ac6' : '#004ac6, #2563eb, #5092f7, #10b981, #004ac6'})`,
                    backgroundSize: '400% 400%',
                    animation: 'gradient-rotate 6s ease infinite',
                    zIndex: -1,
                    opacity: 0.5,
                    filter: 'blur(1px)',
                },
            }}>
                <Box sx={{
                    p: { xs: 3.5, sm: 5 },
                    borderRadius: '22px',
                    background: isDark
                        ? 'rgba(10, 10, 28, 0.88)'
                        : 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(40px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                    border: isDark
                        ? '1px solid rgba(180, 197, 255, 0.20)'
                        : '1px solid rgba(0, 74, 198, 0.15)',
                    boxShadow: isDark
                        ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(180,197,255,0.08), inset 0 1px 0 rgba(255,255,255,0.03)'
                        : '0 32px 80px rgba(0,74,198,0.16), 0 0 0 1px rgba(0,74,198,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}>
                    {/* Brand icon with glow */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
                        <Box sx={{
                            width: 68, height: 68, borderRadius: '20px',
                            background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 40%, #5092f7 70%, #7eb3ff 100%)',
                            backgroundSize: '200% auto',
                            animation: 'float 4s ease-in-out infinite, shimmer 3s linear infinite',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                            boxShadow: '0 12px 40px rgba(0,74,198,0.55), 0 0 0 1px rgba(0,74,198,0.2)',
                        }}>
                            🛍️
                        </Box>
                    </Box>

                    <Typography variant="h4" sx={{
                        fontWeight: 400, textAlign: 'center', mb: 0.75,
                        fontSize: '2rem',
                        background: isDark
                            ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #5092f7)'
                            : 'linear-gradient(135deg, #003ea8, #004ac6, #2563eb)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text', letterSpacing: '-0.04em',
                    }}>
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center', fontWeight: 400, fontSize: '0.95rem' }}>
                        Inicia sesión en tu panel de control
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, animation: 'fade-in-up 0.3s ease', borderRadius: '14px' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth label="Correo Electrónico" type="email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="vendedor@tienda.com" required
                            sx={{
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '14px',
                                    fontSize: '0.95rem',
                                    '&.Mui-focused': {
                                        boxShadow: isDark
                                            ? '0 0 0 4px rgba(180, 197, 255, 0.18), 0 0 20px rgba(180, 197, 255, 0.12)'
                                            : '0 0 0 4px rgba(0, 74, 198, 0.15), 0 0 16px rgba(0, 74, 198, 0.08)',
                                    },
                                },
                            }}
                        />
                        <TextField
                            fullWidth label="Contraseña" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" required
                            sx={{
                                mb: 3.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '14px',
                                    fontSize: '0.95rem',
                                    '&.Mui-focused': {
                                        boxShadow: isDark
                                            ? '0 0 0 4px rgba(180, 197, 255, 0.18), 0 0 20px rgba(180, 197, 255, 0.12)'
                                            : '0 0 0 4px rgba(0, 74, 198, 0.15), 0 0 16px rgba(0, 74, 198, 0.08)',
                                    },
                                },
                            }}
                        />
                        <Button
                            type="submit" variant="contained" fullWidth disabled={loading}
                            sx={{
                                py: 1.6, fontSize: '1rem', borderRadius: '14px',
                                fontWeight: 700, letterSpacing: '0.01em',
                                position: 'relative', overflow: 'hidden',
                                '&::before': {
                                    content: '""', position: 'absolute',
                                    top: 0, left: -120, width: 70, height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                    transform: 'skewX(-20deg)',
                                    transition: 'left 0.7s ease',
                                },
                                '&:hover::before': { left: '140%' },
                            }}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar al Panel →'}
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <LinkMui
                            component={Link} to="/forgot-password" variant="body2"
                            sx={{
                                color: 'primary.main', fontWeight: 600,
                                textDecoration: 'none', opacity: 0.75,
                                transition: 'all 0.2s ease',
                                '&:hover': { opacity: 1, textDecoration: 'underline' },
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </LinkMui>
                    </Box>
                </Box>
            </Box>

            <Typography variant="caption" sx={{
                position: 'absolute', bottom: 24, left: 0, right: 0,
                textAlign: 'center', color: 'text.disabled', fontSize: '0.7rem',
                opacity: 0.5,
            }}>
                E-Shop WhatsApp · Panel de Control
            </Typography>
        </Box>
    )
}

export default Login
