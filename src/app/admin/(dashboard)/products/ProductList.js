'use client';

import { deleteProduct, updateProductStock } from '@/app/admin/product-actions';
import { useState } from 'react';

export default function ProductList({ initialProducts }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const result = await deleteProduct(id);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  const handleStockChange = async (id, currentStock, delta) => {
    const newStock = currentStock + delta;
    if (newStock < 0) return;
    
    setLoadingId(id);
    const result = await updateProductStock(id, newStock);
    if (result.error) {
      alert(result.error);
    }
    setLoadingId(null);
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
          <th>Precio</th>
          <th>Stock</th>
          <th style={{ textAlign: 'right' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {initialProducts.map((prod) => (
          <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: loadingId === prod.id ? 0.5 : 1 }}>
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
            <td style={{ fontWeight: '500' }}>
              {prod.name}
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prod.category.name}</div>
            </td>
            <td>
              {prod.promoPrice ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '12px' }}>
                    ${prod.price}
                  </span>
                  <br/>
                  <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                    ${prod.promoPrice}
                  </span>
                </>
              ) : (
                <span>${prod.price}</span>
              )}
            </td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => handleStockChange(prod.id, prod.stock, -1)}
                  disabled={prod.stock <= 0 || loadingId === prod.id}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
                >-</button>
                <span style={{ fontWeight: prod.stock <= 0 ? 'bold' : 'normal', color: prod.stock <= 0 ? 'var(--danger-color)' : 'inherit' }}>
                  {prod.stock}
                </span>
                <button 
                  onClick={() => handleStockChange(prod.id, prod.stock, 1)}
                  disabled={loadingId === prod.id}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
                >+</button>
              </div>
            </td>
            <td style={{ textAlign: 'right' }}>
              <button
                onClick={() => handleDelete(prod.id)}
                style={{ color: 'var(--danger-color)', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
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
