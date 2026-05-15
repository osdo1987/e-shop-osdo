import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Solo proteger rutas que empiecen por /admin (vista) o /api/admin (backend)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    
    // Permitir acceso a la página de login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Si es una ruta de la API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      // Si es una ruta de vista, redirigir al login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const verifiedToken = await verifyToken(token);

    if (!verifiedToken) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // (Opcional) Aquí podríamos proteger ciertas rutas solo para SUPERADMIN
    if (pathname.startsWith('/admin/super') && verifiedToken.role !== 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
