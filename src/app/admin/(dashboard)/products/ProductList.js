'use client';

import { deleteProduct } from '@/app/admin/product-actions';

export default function ProductList({ initialProducts }) {
  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const result = await deleteProduct(id);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  if (initialProducts.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No tienes productos creados.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
          <th style={{ padding: '10px 0' }}>Imagen</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th style={{ textAlign: 'right' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {initialProducts.map((prod) => (
          <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '10px 0' }}>
              {prod.imageUrl ? (
                <img 
                  src={prod.imageUrl} 
                  alt={prod.name} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                />
              ) : (
                <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px' }} />
              )}
            </td>
            <td style={{ fontWeight: '500' }}>{prod.name}</td>
            <td style={{ color: 'var(--text-muted)' }}>{prod.category.name}</td>
            <td>
              {prod.promoPrice ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '12px' }}>
                    ${prod.price}
                  </span>
                  <span style={{ marginLeft: '5px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                    ${prod.promoPrice}
                  </span>
                </>
              ) : (
                <span>${prod.price}</span>
              )}
            </td>
            <td style={{ textAlign: 'right' }}>
              <button
                onClick={() => handleDelete(prod.id)}
                style={{ color: 'var(--danger-color)', fontSize: '14px' }}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
