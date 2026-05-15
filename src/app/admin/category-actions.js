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

export async function createCategory(formData) {
  const user = await getAuthenticatedUser();
  if (!user || !user.storeId) return { error: 'No autorizado' };

  const name = formData.get('name');
  if (!name) return { error: 'El nombre es obligatorio' };

  try {
    await db.category.create({
      data: {
        name,
        storeId: user.storeId,
      },
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la categoría' };
  }
}

export async function deleteCategory(id) {
  const user = await getAuthenticatedUser();
  if (!user || !user.storeId) return { error: 'No autorizado' };

  try {
    // Verificar que la categoría pertenece a la tienda del usuario
    const category = await db.category.findFirst({
      where: { id, storeId: user.storeId },
    });

    if (!category) return { error: 'Categoría no encontrada' };

    await db.category.delete({
      where: { id },
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar la categoría' };
  }
}
