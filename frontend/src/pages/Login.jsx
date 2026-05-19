import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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

            // Redirect based on role
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
        <div className="login-container">
            <div className="card login-card">
                <h1>Bienvenido</h1>
                <p>Inicia sesión en tu panel de control</p>

                {error && <div className="error-message">{error}</div>}

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
                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--primary-dark)' }}>
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login