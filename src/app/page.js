import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: 'var(--primary-dark)', marginBottom: '20px' }}>E-Shop WhatsApp</h1>
      <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '40px' }}>
        La solución más rápida para vender por WhatsApp. Crea tu catálogo, comparte el link y recibe pedidos al instante.
      </p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link href="/admin/login" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '18px' }}>
          Entrar al Panel
        </Link>
      </div>

      <div style={{ marginTop: '60px', color: 'var(--text-muted)' }}>
        <p>¿Eres un cliente? Pide el link del catálogo directamente a tu vendedor.</p>
      </div>
    </div>
  );
}
