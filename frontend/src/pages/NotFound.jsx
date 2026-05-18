import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className="home-container">
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>🔍</div>
            <h1 style={{ fontSize: '72px', color: 'var(--primary-color)', marginBottom: '8px' }}>404</h1>
            <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '12px' }}>Página no encontrada</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '32px' }}>
                La página que buscas no existe o ha sido movida. Verifica la URL o vuelve al inicio.
            </p>
            <div className="home-actions">
                <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px' }}>
                    Ir al Inicio
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 32px', fontSize: '16px' }}>
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    )
}

export default NotFound