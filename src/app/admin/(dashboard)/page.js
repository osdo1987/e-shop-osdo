import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    redirect('/admin/login');
  }

  const user = await verifyToken(token);

  if (user?.role === 'SUPERADMIN') {
    redirect('/admin/super');
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Mi Catálogo</h1>
      <p style={{ color: 'var(--text-muted)' }}>Bienvenido a tu panel de administración, Vendedor.</p>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Resumen</h3>
        <p>Aún no has agregado productos.</p>
      </div>
    </div>
  );
}
