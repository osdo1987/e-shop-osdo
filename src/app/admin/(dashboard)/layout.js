import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import AdminShell from './AdminShell';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  let user = null;
  if (token) {
    user = await verifyToken(token);
  }

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
