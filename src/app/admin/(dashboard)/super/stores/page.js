import { db } from '@/lib/db';
import CreateStoreForm from './CreateStoreForm';

export default async function StoresPage() {
  const stores = await db.store.findMany({
    include: { users: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Gestión de Tiendas</h1>
      
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* Listado de Tiendas */}
        <div style={{ flex: 2 }}>
          <div className="card">
            <h3>Tiendas Registradas</h3>
            <div style={{ marginTop: '20px' }}>
              {stores.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No hay tiendas registradas aún.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 0' }}>Nombre</th>
                      <th>URL / Slug</th>
                      <th>Vendedor (Email)</th>
                      <th>WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(store => (
                      <tr key={store.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 0', fontWeight: '500' }}>{store.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>/{store.slug}</td>
                        <td>{store.users[0]?.email}</td>
                        <td>{store.whatsapp || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div style={{ flex: 1 }}>
          <CreateStoreForm />
        </div>
      </div>
    </div>
  );
}
