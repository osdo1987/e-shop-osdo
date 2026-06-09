import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import Alert from '@mui/material/Alert'

function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

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

            if (data.user.role === 'SUPERADMIN') {
                navigate('/admin/super')
            } else {
                navigate('/admin')
            }

        } catch (err) {
            setError('Error de conexión')
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 2.5,
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #080818 0%, #0f0f28 50%, #080818 100%)'
                    : 'linear-gradient(135deg, #f5f5ff 0%, #eef2ff 50%, #f5f5ff 100%)',
            }}
        >
            <Paper elevation={3} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        textAlign: 'center',
                        mb: 1,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Bienvenido
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, textAlign: 'center' }}>
                    Inicia sesión en tu panel de control
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Correo Electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vendedor@tienda.com"
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        sx={{ mb: 2.5 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5, fontSize: '0.9375rem' }}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <LinkMui
                        component={Link}
                        to="/forgot-password"
                        variant="body2"
                        sx={{ color: 'primary.dark', fontWeight: 500 }}
                    >
                        ¿Olvidaste tu contraseña?
                    </LinkMui>
                </Box>
            </Paper>
        </Box>
    )
}

export default Login