'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function updateStoreSettings(formData) {
  const user = await getAuthenticatedUser();
  if (!user || !user.storeId) return { error: 'No autorizado' };

  const name = formData.get('name');
  const whatsapp = formData.get('whatsapp');

  if (!name) return { error: 'El nombre de la tienda es obligatorio' };

  try {
    await db.store.update({
      where: { id: user.storeId },
      data: {
        name,
        whatsapp,
      },
    });
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar la configuración' };
  }
}
