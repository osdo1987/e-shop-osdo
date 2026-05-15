const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findUnique({ where: { slug: 'demo' } });
  if (!store) {
    console.log('Tienda demo no encontrada');
    return;
  }

  const electronics = await prisma.category.create({
    data: { name: 'Electrónica', storeId: store.id }
  });

  const fashion = await prisma.category.create({
    data: { name: 'Moda', storeId: store.id }
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Auriculares Bluetooth Pro',
        price: 199000,
        promoPrice: 149000,
        categoryId: electronics.id,
        storeId: store.id,
        description: 'Cancelación de ruido activa y 20h de batería.'
      },
      {
        name: 'Teclado Mecánico RGB',
        price: 350000,
        categoryId: electronics.id,
        storeId: store.id,
        description: 'Switches blue, retroiluminación personalizable.'
      },
      {
        name: 'Camiseta Dry-Fit',
        price: 85000,
        categoryId: fashion.id,
        storeId: store.id,
        description: 'Ideal para deportes de alta intensidad.'
      },
      {
        name: 'Zapatillas Running Air',
        price: 249000,
        promoPrice: 199000,
        categoryId: fashion.id,
        storeId: store.id,
        description: 'Máxima amortiguación para tus carreras.'
      }
    ]
  });

  console.log('Productos de prueba creados para la tienda demo');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
