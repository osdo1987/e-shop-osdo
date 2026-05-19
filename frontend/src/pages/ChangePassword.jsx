import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'

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
            <div className="card" style={{ maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '16px' }}>Cambiar Contraseña</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Actualiza tu contraseña de acceso al panel de control.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="currentPassword">Contraseña Actual</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default ChangePassword