'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './layout.module.css';

export default function AdminShell({ user, children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          WhatsApp Catalog
        </div>
        <nav className={styles.nav}>
          {user?.role === 'SUPERADMIN' && (
            <>
              <Link href="/admin/super" className={styles.navLink}>Resumen (Super)</Link>
              <Link href="/admin/super/stores" className={styles.navLink}>Gestión de Tiendas</Link>
            </>
          )}
          {user?.role === 'SELLER' && (
            <>
              <Link href="/admin" className={styles.navLink}>Dashboard</Link>
              <Link href="/admin/categories" className={styles.navLink}>Categorías</Link>
              <Link href="/admin/products" className={styles.navLink}>Productos</Link>
              <Link href="/admin/settings" className={styles.navLink}>Configuración</Link>
              <div className={styles.storeLinkWrapper}>
                <a 
                  href={`/${user.storeSlug || ''}`}
                  target="_blank"
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '14px', textAlign: 'center' }}
                >
                  Ver Mi Tienda
                </a>
              </div>
            </>
          )}
        </nav>
        <div className={styles.logoutBtn} onClick={handleLogout}>
          Cerrar Sesión
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
