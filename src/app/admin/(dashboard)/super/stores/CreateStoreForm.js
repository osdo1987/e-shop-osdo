'use client';

import { useState } from 'react';
import { createStoreAndSeller } from '@/app/admin/actions';

export default function CreateStoreForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await createStoreAndSeller(formData);

    if (result.error) {
      setError(result.error);
    } else {
      e.target.reset(); // Limpiar formulario
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3>Crear Nueva Tienda</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
        Esto creará la tienda y la cuenta de acceso para el vendedor.
      </p>

      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="storeName">Nombre de la Tienda</label>
          <input type="text" id="storeName" name="storeName" placeholder="Zapatos Juan" required />
        </div>
        <div className="input-group">
          <label htmlFor="slug">URL / Slug (sin espacios)</label>
          <input type="text" id="slug" name="slug" placeholder="zapatos-juan" required />
        </div>
        <div className="input-group">
          <label htmlFor="whatsapp">Número de WhatsApp</label>
          <input type="text" id="whatsapp" name="whatsapp" placeholder="+573001234567" />
        </div>

        <h4 style={{ margin: '20px 0 10px 0', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>Cuenta del Vendedor</h4>
        
        <div className="input-group">
          <label htmlFor="email">Correo Electrónico (Login)</label>
          <input type="email" id="email" name="email" placeholder="juan@gmail.com" required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input type="text" id="password" name="password" placeholder="Temporal123" required />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? 'Creando...' : 'Crear Tienda y Vendedor'}
        </button>
      </form>
    </div>
  );
}
