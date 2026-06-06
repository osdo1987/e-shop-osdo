import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './AdminLayout.css'

function AdminLayout({ title, children, user, onLogout, superadmin = false, showBack = false }) {
    const displayName = superadmin ? 'Super Admin' : (user?.storeName || 'Mi Tienda')
    const headerLabel = superadmin ? 'Super Admin' : (user?.storeName ? `Vendedor - ${user.storeName}` : 'Vendedor')
    const location = useLocation()

    useEffect(() => {
        if (superadmin) {
            document.title = 'Super Admin - Panel'
        } else if (user?.storeName) {
            document.title = `${user.storeName} - Panel`
        } else {
            document.title = 'Mi Tienda - Panel'
        }
    }, [user, superadmin])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = superadmin
        ? [
            { path: '/admin/super', label: 'Tiendas' }
        ]
        : [
            { path: '/admin/dashboard', label: 'Dashboard' },
            { path: '/admin', label: 'Productos' },
            { path: '/admin/categories', label: 'Categorías' },
            { path: '/admin/orders', label: 'Pedidos' },
            { path: '/admin/settings', label: 'Configuración' }
        ]

    return (
        <div className="dashboard-layout">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>{displayName}</h2>
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
                </div>
                <nav>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <button onClick={onLogout} className="btn btn-secondary sidebar-logout">
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <div className="dashboard-header-left">
                        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Menú">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                        <h1>{title}</h1>
                    </div>
                    <div className="dashboard-header-right">
                        <div className="user-info">
                            <span className="user-role-label">{headerLabel}</span>
                            <span className="user-email">{user?.email}</span>
                        </div>
                        {showBack && (
                            <Link to="/admin" className="btn btn-secondary">Volver</Link>
                        )}
                    </div>
                </div>
                {children}
            </main>
        </div>
    )
}

export default AdminLayout