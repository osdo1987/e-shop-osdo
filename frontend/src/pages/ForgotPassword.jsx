import { useState } from 'react'
import { Link } from 'react-router-dom'

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

            // If reset_token is returned (no email service configured), store it temporarily
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
        <div className="login-container">
            <div className="card login-card">
                <h1>Recuperar Contraseña</h1>

                {!sent ? (
                    <>
                        <p>Ingresa tu correo electrónico para recibir instrucciones de recuperación</p>

                        {error && <div className="error-message">{error}</div>}
                        {message && <div className="success-message">{message}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vendedor@tienda.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div className="success-message" style={{ marginTop: '16px' }}>
                            {message || 'Correo enviado exitosamente'}
                        </div>
                        <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Revisa tu bandeja de entrada y sigue las instrucciones.
                        </p>
                        <Link to="/login" className="btn btn-primary submit-btn" style={{ marginTop: '24px', textDecoration: 'none' }}>
                            Volver al Inicio de Sesión
                        </Link>
                    </div>
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

export default ForgotPassword