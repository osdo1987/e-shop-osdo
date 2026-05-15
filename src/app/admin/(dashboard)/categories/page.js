import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CategoryList from './CategoryList';
import { createCategory } from '@/app/admin/category-actions';

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user || user.role !== 'SELLER') {
    redirect('/admin/login');
  }

  const categories = await db.category.findMany({
    where: { storeId: user.storeId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Categorías</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Organiza tus productos en categorías para que tus clientes los encuentren más fácil.
      </p>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        <div style={{ flex: 2 }}>
          <div className="card">
            <CategoryList initialCategories={categories} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card">
            <h3>Nueva Categoría</h3>
            <form action={createCategory} style={{ marginTop: '20px' }}>
              <div className="input-group">
                <label htmlFor="name">Nombre de la Categoría</label>
                <input type="text" id="name" name="name" placeholder="Ej: Calzado, Accesorios..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Agregar Categoría
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
