import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user || user.role !== 'SELLER') {
    redirect('/admin/login');
  }

  const store = await db.store.findUnique({
    where: { id: user.storeId },
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Configuración</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Ajusta los detalles de tu tienda y el número donde recibirás los pedidos.
      </p>

      <div className="card" style={{ maxWidth: '600px' }}>
        <SettingsForm store={store} />
      </div>
    </div>
  );
}
