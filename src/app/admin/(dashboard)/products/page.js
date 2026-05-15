import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user || user.role !== 'SELLER') {
    redirect('/admin/login');
  }

  const products = await db.product.findMany({
    where: { storeId: user.storeId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await db.category.findMany({
    where: { storeId: user.storeId },
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Mis Productos</h1>
      
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        <div style={{ flex: 2 }}>
          <div className="card">
            <ProductList initialProducts={products} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <ProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
