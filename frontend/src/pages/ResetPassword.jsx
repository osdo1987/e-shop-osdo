import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [token, setToken] = useState('')

    useEffect(() => {
        // Try to get token from URL params, or fall back to sessionStorage
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

    if (!token && !error) {
        return (
            <div className="login-container">
                <div className="card login-card">
                    <h1>Restablecer Contraseña</h1>
                    <p>Cargando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="login-container">
            <div className="card login-card">
                <h1>Restablecer Contraseña</h1>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="success-message" style={{ marginTop: '16px' }}>
                            Contraseña restablecida exitosamente
                        </div>
                        <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <Link to="/login" className="btn btn-primary submit-btn" style={{ marginTop: '24px', textDecoration: 'none' }}>
                            Iniciar Sesión
                        </Link>
                    </div>
                ) : error && !token ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="error-message" style={{ marginTop: '16px' }}>
                            {error}
                        </div>
                        <Link to="/forgot-password" className="btn btn-primary submit-btn" style={{ marginTop: '24px', textDecoration: 'none' }}>
                            Solicitar Nuevo Restablecimiento
                        </Link>
                    </div>
                ) : (
                    <>
                        <p>Ingresa tu nueva contraseña</p>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="password">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                className="btn btn-primary submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            </button>
                        </form>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link to="/login" style={{ fontSize: '14px', color: 'var(--primary-dark)' }}>
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword