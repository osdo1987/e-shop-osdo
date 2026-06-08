import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

function ChangePassword({ user, onLogout }) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()

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

    return (
        <AdminLayout title="Cambiar Contraseña" user={user} onLogout={onLogout} showBack>
            <Card sx={{ maxWidth: 500 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Cambiar Contraseña
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        Actualiza tu contraseña de acceso al panel de control.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Contraseña Actual"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Nueva Contraseña"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{ py: 1.5, fontSize: '1rem' }}
                        >
                            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}

export default ChangePassword