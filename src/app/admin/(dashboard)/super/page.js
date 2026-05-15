import { db } from '@/lib/db';

export default async function SuperAdminDashboard() {
  const storesCount = await db.store.count();
  const sellersCount = await db.user.count({ where: { role: 'SELLER' } });

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Panel de Súper Administrador</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Vista general de la plataforma.</p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--primary-dark)' }}>Tiendas Activas</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{storesCount}</p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--primary-dark)' }}>Vendedores Registrados</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{sellersCount}</p>
        </div>
      </div>
    </div>
  );
}
