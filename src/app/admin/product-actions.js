'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function createProduct(formData) {
  const user = await getAuthenticatedUser();
  if (!user || !user.storeId) return { error: 'No autorizado' };

  const name = formData.get('name');
  const description = formData.get('description');
  const price = parseFloat(formData.get('price'));
  const promoPrice = formData.get('promoPrice') ? parseFloat(formData.get('promoPrice')) : null;
  const categoryId = parseInt(formData.get('categoryId'));
  const imageFile = formData.get('image');

  if (!name || isNaN(price) || isNaN(categoryId)) {
    return { error: 'Faltan campos obligatorios' };
  }

  try {
    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    await db.product.create({
      data: {
        name,
        description,
        price,
        promoPrice,
        imageUrl,
        categoryId,
        storeId: user.storeId,
      },
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error('Error creating product:', error);
    return { error: 'Error al crear el producto' };
  }
}

export async function deleteProduct(id) {
  const user = await getAuthenticatedUser();
  if (!user || !user.storeId) return { error: 'No autorizado' };

  try {
    const product = await db.product.findFirst({
      where: { id, storeId: user.storeId },
    });

    if (!product) return { error: 'Producto no encontrado' };

    // Opcional: Eliminar archivo de imagen
    if (product.imageUrl) {
      const filePath = path.join(process.cwd(), 'public', product.imageUrl);
      try {
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Could not delete image file:', e);
      }
    }

    await db.product.delete({
      where: { id },
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar el producto' };
  }
}
