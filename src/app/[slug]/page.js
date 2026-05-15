import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import CatalogView from './CatalogView';

export default async function CatalogPage({ params }) {
  const { slug } = await params;

  const store = await db.store.findUnique({
    where: { slug },
    include: {
      categories: true,
      products: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <CatalogView 
      store={store} 
      categories={store.categories} 
      initialProducts={store.products} 
    />
  );
}
