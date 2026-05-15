'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function createStoreAndSeller(formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = await verifyToken(token);
    
    if (user?.role !== 'SUPERADMIN') {
      return { error: 'No autorizado' };
    }

    const storeName = formData.get('storeName');
    const slug = formData.get('slug');
    const whatsapp = formData.get('whatsapp');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!storeName || !slug || !email || !password) {
      return { error: 'Faltan campos obligatorios' };
    }

    // Comprobar si el correo o slug ya existen
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { error: 'El correo ya está en uso' };

    const existingStore = await db.store.findUnique({ where: { slug } });
    if (existingStore) return { error: 'El slug/URL ya está en uso' };

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transacción para crear Store y User
    await db.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: storeName,
          slug,
          whatsapp,
        }
      });

      await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: 'SELLER',
          storeId: store.id
        }
      });
    });

    revalidatePath('/admin/super/stores');
    return { success: true };
    
  } catch (error) {
    console.error('Error creating store:', error);
    return { error: 'Error interno del servidor' };
  }
}
