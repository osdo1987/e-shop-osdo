import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import Alert from '@mui/material/Alert'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [token, setToken] = useState('')

    useEffect(() => {
        const urlToken = searchParams.get('token')
        const storedToken = sessionStorage.getItem('reset_token')

        if (urlToken) {
            setToken(urlToken)
        } else if (storedToken) {
            setToken(storedToken)
        } else {
            setError('No se encontró un token de recuperación válido. Solicita un nuevo restablecimiento.')
        }
    }, [searchParams])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al restablecer la contraseña')
                setLoading(false)
                return
            }

            setSuccess(true)
            sessionStorage.removeItem('reset_token')
            sessionStorage.removeItem('reset_email')

        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const renderContent = () => {
        if (success) {
            return (
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                        Contraseña restablecida exitosamente
                    </Alert>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva contraseña.
                    </Typography>
                    <Button component={Link} to="/login" variant="contained" fullWidth sx={{ textDecoration: 'none' }}>
                        Iniciar Sesión
                    </Button>
                </Box>
            )
        }

        if (error && !token) {
            return (
                <Box sx={{ textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
                    <Button component={Link} to="/forgot-password" variant="contained" fullWidth sx={{ textDecoration: 'none' }}>
                        Solicitar Nuevo Restablecimiento
                    </Button>
                </Box>
            )
        }

        return (
            <>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                    Ingresa tu nueva contraseña
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Nueva Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        inputProps={{ minLength: 6 }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Confirmar Nueva Contraseña"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        inputProps={{ minLength: 6 }}
                        sx={{ mb: 2.5 }}
                    />
                    <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </Button>
                </Box>
            </>
        )
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
                <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
                    Restablecer Contraseña
                </Typography>
                {renderContent()}

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <LinkMui component={Link} to="/login" variant="body2" sx={{ color: 'primary.dark', fontWeight: 500 }}>
                        ← Volver al inicio de sesión
                    </LinkMui>
                </Box>
            </Paper>
        </Box>
    )
}

export default ResetPassword