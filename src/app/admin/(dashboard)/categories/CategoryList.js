'use client';

import { deleteCategory } from '@/app/admin/category-actions';

export default function CategoryList({ initialCategories }) {
  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán también los productos asociados.')) {
      const result = await deleteCategory(id);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  if (initialCategories.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No tienes categorías creadas.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
          <th style={{ padding: '10px 0' }}>Nombre</th>
          <th style={{ textAlign: 'right' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {initialCategories.map((cat) => (
          <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '12px 0', fontWeight: '500' }}>{cat.name}</td>
            <td style={{ textAlign: 'right' }}>
              <button
                onClick={() => handleDelete(cat.id)}
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
