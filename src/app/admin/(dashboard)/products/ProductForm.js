'use client';

import { useState } from 'react';
import { createProduct } from '@/app/admin/product-actions';

export default function ProductForm({ categories }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await createProduct(formData);

    if (result.error) {
      setError(result.error);
    } else {
      e.target.reset();
    }
    setLoading(false);
  };

  if (categories.length === 0) {
    return (
      <div className="card">
        <h3>Nuevo Producto</h3>
        <p style={{ color: 'var(--danger-color)', fontSize: '14px', marginTop: '10px' }}>
          Primero debes crear al menos una categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Nuevo Producto</h3>
      
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Nombre del Producto</label>
          <input type="text" id="name" name="name" placeholder="Ej: Camiseta Pro" required />
        </div>
        
        <div className="input-group">
          <label htmlFor="categoryId">Categoría</label>
          <select id="categoryId" name="categoryId" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }} required>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="description">Descripción (opcional)</label>
          <textarea id="description" name="description" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '80px' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="price">Precio</label>
            <input type="number" step="0.01" id="price" name="price" placeholder="29.99" required />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="promoPrice">Promo (opcional)</label>
            <input type="number" step="0.01" id="promoPrice" name="promoPrice" placeholder="19.99" />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="stock">Stock</label>
            <input type="number" id="stock" name="stock" defaultValue="0" min="0" required />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="image">Imagen del Producto</label>
          <input type="file" id="image" name="image" accept="image/*" />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>
    </div>
  );
}
