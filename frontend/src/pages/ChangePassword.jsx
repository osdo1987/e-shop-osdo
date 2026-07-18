import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ShieldIcon from '@mui/icons-material/Shield'

function ChangePassword({ user, onLogout }) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const handleSubmit = async (e) => {
        e.preventDefault()
        toast.clear()

        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas nuevas no coinciden')
            return
        }

        if (newPassword.length < 6) {
            toast.error('La nueva contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Error al cambiar la contraseña')
                setLoading(false)
                return
            }

            toast.success('Contraseña cambiada exitosamente')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')

        } catch (err) {
            toast.error('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            fontSize: '0.95rem',
            '&.Mui-focused': {
                boxShadow: isDark
                    ? '0 0 0 4px rgba(180, 197, 255, 0.18), 0 0 20px rgba(180, 197, 255, 0.12)'
                    : '0 0 0 4px rgba(0, 74, 198, 0.15), 0 0 16px rgba(0, 74, 198, 0.08)',
            },
        },
    }

    return (
        <AdminLayout title="Cambiar Contraseña" user={user} onLogout={onLogout} showBack>
            <Box sx={{ maxWidth: 520, mx: 'auto', animation: 'fade-in-up 0.5s ease both' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: '14px',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(0,74,198,0.2), rgba(0,74,198,0.08))'
                            : 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(0,74,198,0.04))',
                        border: isDark ? '1px solid rgba(180,197,255,0.2)' : '1px solid rgba(0,74,198,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,74,198,0.1)',
                    }}>
                        <ShieldIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                            Cambiar Contraseña
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                            Actualiza tu contraseña de acceso al panel de control
                        </Typography>
                    </Box>
                </Box>

                <Card sx={{
                    animation: 'fade-in-up 0.5s ease both',
                    animationDelay: '0.1s',
                    position: 'relative',
                    overflow: 'visible',
                    '&::before': {
                        content: '""',
                        position: 'absolute', top: 0, left: 0, right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #004ac6, #2563eb, #5092f7)',
                        borderRadius: '16px 16px 0 0',
                    },
                }}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth label="Contraseña Actual" type="password"
                                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••" required
                                sx={{ mb: 2.5, ...inputSx }}
                            />
                            <TextField
                                fullWidth label="Nueva Contraseña" type="password"
                                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••" required slotProps={{ htmlInput: { minLength: 6 } }}
                                sx={{ mb: 2.5, ...inputSx }}
                            />
                            <TextField
                                fullWidth label="Confirmar Nueva Contraseña" type="password"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••" required slotProps={{ htmlInput: { minLength: 6 } }}
                                sx={{ mb: 3.5, ...inputSx }}
                            />
                            <Button
                                type="submit" variant="contained" fullWidth disabled={loading}
                                sx={{
                                    py: 1.5, fontSize: '1rem', borderRadius: '14px',
                                    fontWeight: 700, position: 'relative', overflow: 'hidden',
                                    '&::before': {
                                        content: '""', position: 'absolute',
                                        top: 0, left: -120, width: 70, height: '100%',
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                        transform: 'skewX(-20deg)', transition: 'left 0.7s ease',
                                    },
                                    '&:hover::before': { left: '140%' },
                                }}
                            >
                                {loading ? 'Cambiando...' : 'Cambiar Contraseña →'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </AdminLayout>
    )
}

export default ChangePassword
