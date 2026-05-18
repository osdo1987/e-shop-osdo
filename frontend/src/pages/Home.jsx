import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className="home-container">
            <h1>E-Shop WhatsApp</h1>
            <p>
                La solución más rápida para vender por WhatsApp. Crea tu catálogo, comparte el link y recibe pedidos al instante.
            </p>

            <div className="home-actions">
                <Link to="/login" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '18px' }}>
                    Entrar al Panel
                </Link>
            </div>

            <div style={{ marginTop: '60px', color: 'var(--text-muted)' }}>
                <p>¿Eres un cliente? Pide el link del catálogo directamente a tu vendedor.</p>
            </div>
        </div>
    )
}

export default Home