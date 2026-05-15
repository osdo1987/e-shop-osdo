'use client';

import { useState } from 'react';
import { updateStoreSettings } from '@/app/admin/settings-actions';

export default function SettingsForm({ store }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await updateStoreSettings(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Configuración actualizada con éxito');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ color: 'var(--primary-dark)', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>{success}</div>}

      <div className="input-group">
        <label htmlFor="name">Nombre de la Tienda</label>
        <input type="text" id="name" name="name" defaultValue={store.name} required />
      </div>

      <div className="input-group">
        <label htmlFor="whatsapp">Número de WhatsApp (con código de país, ej: +573001234567)</label>
        <input type="text" id="whatsapp" name="whatsapp" defaultValue={store.whatsapp} placeholder="+573001234567" />
      </div>

      <div className="input-group">
        <label>URL de tu catálogo (No editable)</label>
        <input type="text" value={`http://tudominio.com/${store.slug}`} disabled style={{ background: '#f9f9f9' }} />
      </div>

      <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
}
