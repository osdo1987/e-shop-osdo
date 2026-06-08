import { useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import Alert from '@mui/material/Alert'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al enviar solicitud')
                setLoading(false)
                return
            }

            setSent(true)
            setMessage(data.message)

            if (data.reset_token) {
                sessionStorage.setItem('reset_token', data.reset_token)
                sessionStorage.setItem('reset_email', data.email)
            }

        } catch (err) {
            setError('Error de conexión')
        } finally {
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
                <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
                    Recuperar Contraseña
                </Typography>

                {!sent ? (
                    <>
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                            Ingresa tu correo electrónico para recibir instrucciones de recuperación
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Correo Electrónico"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vendedor@tienda.com"
                                required
                                sx={{ mb: 2.5 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center' }}>
                        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                            {message || 'Correo enviado exitosamente'}
                        </Alert>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Revisa tu bandeja de entrada y sigue las instrucciones.
                        </Typography>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            fullWidth
                            sx={{ textDecoration: 'none' }}
                        >
                            Volver al Inicio de Sesión
                        </Button>
                    </Box>
                )}

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <LinkMui
                        component={Link}
                        to="/login"
                        variant="body2"
                        sx={{ color: 'primary.dark', fontWeight: 500 }}
                    >
                        ← Volver al inicio de sesión
                    </LinkMui>
                </Box>
            </Paper>
        </Box>
    )
}

export default ForgotPassword