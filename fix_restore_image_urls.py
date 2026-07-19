#!/usr/bin/env python3
"""
One-time fix script: restore Unsplash image_url for seed products that lost
their image_url column during the images table migration.
"""
from app import create_app
from app.extensions import db
from app.models.product import Product

SEED_URLS = {
    # Ferretería
    'Martillo de Acero': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=80',
    'Destornillador Estrella': 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500&auto=format&fit=crop&q=80',
    'Llave Expansiva 10"': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80',
    'Sierra Manual 18"': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80',
    'Nivel de Burbuja 60cm': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=80',
    'Juego de Llaves Fijas x12': 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=500&auto=format&fit=crop&q=80',
    'Alicate Punta Plana': 'https://images.unsplash.com/photo-1611664438706-10de8c4f7e69?w=500&auto=format&fit=crop&q=80',
    'Taladro de Mano Manual': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
    'Cable Eléctrico 12 AWG (Metro)': 'https://images.unsplash.com/photo-1625480860249-8f866b25ac0b?w=500&auto=format&fit=crop&q=80',
    'Toma Corriente Doble': 'https://images.unsplash.com/photo-1558244402-286dd748c593?w=500&auto=format&fit=crop&q=80',
    'Multímetro Digital': 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=80',
    'Interruptor Sencillo': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80',
    'Breaker Bipolar 20A': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    'Cinta Aislante x3 Unidades': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&auto=format&fit=crop&q=80',
    'Pintura Blanca 1 Galón': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&auto=format&fit=crop&q=80',
    'Rodillo para Pintar Profesional': 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=500&auto=format&fit=crop&q=80',
    'Brocha Angular 3"': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format&fit=crop&q=80',
    'Espátula Metálica 4"': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
    'Masilla Plástica 1kg': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80',
    'Sellador Acrílico Transparente': 'https://images.unsplash.com/photo-1591491719565-9a443a903d2d?w=500&auto=format&fit=crop&q=80',
    # Licores
    'Cerveza Rubia 6-Pack': 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=500&auto=format&fit=crop&q=80',
    'Cerveza Artesanal IPA': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=80',
    'Cerveza Negra Stout': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&auto=format&fit=crop&q=80',
    'Cerveza de Trigo Weizen': 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=500&auto=format&fit=crop&q=80',
    'Six-Pack Mixto Artesanal': 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=500&auto=format&fit=crop&q=80',
    'Vino Tinto Reserva': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&auto=format&fit=crop&q=80',
    'Vino Blanco Crianza': 'https://images.unsplash.com/photo-1560148218-1a83060f7b32?w=500&auto=format&fit=crop&q=80',
    'Vino Rosé Seco': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
    'Vino Espumoso Brut': 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=500&auto=format&fit=crop&q=80',
    'Whisky 12 Años 750ml': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=80',
    'Tequila Reposado': 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=500&auto=format&fit=crop&q=80',
    'Ginebra Premium': 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=500&auto=format&fit=crop&q=80',
    'Ron Añejo 8 Años': 'https://images.unsplash.com/photo-1608885898957-0c5f3c5c03d3?w=500&auto=format&fit=crop&q=80',
    'Vodka Premium 700ml': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&auto=format&fit=crop&q=80',
    'Aguardiente Colombiano 750ml': 'https://images.unsplash.com/photo-1655838559840-74ef9e1618db?w=500&auto=format&fit=crop&q=80',
    # Miscelánea
    'Camiseta Básica': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=80',
    'Gorra Deportiva': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80',
    'Sudadera con Capucha': 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop&q=80',
    'Pantalón Jogger': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
    'Calcetines Deportivos x3 Pares': 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&auto=format&fit=crop&q=80',
    'Zapatos Casuales': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    'Tenis Running Unisex': 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop&q=80',
    'Sandalias de Playa': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&auto=format&fit=crop&q=80',
    'Audífonos Inalámbricos': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    'Reloj Inteligente Básico': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
    'Cargador de Carga Rápida 20W': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=80',
    'Power Bank 10000mAh': 'https://images.unsplash.com/photo-1609592806596-b9e3a5b3e0c5?w=500&auto=format&fit=crop&q=80',
    'Cable USB-C a USB-C 1m': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80',
    'Parlante Bluetooth Portátil': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80',
    'Paquete Snacks Surtidos': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop&q=80',
    'Caja de Chocolates': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80',
    'Maní con Sal x250g': 'https://images.unsplash.com/photo-1567892737950-30c4db37b9aa?w=500&auto=format&fit=crop&q=80',
    'Galletas Integrales x200g': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
    'Café Molido Premium 250g': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
    'Avena Instantánea x500g': 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=500&auto=format&fit=crop&q=80',
}


def fix():
    app = create_app()
    with app.app_context():
        updated = 0
        skipped = 0
        for product in Product.query.all():
            if product.image_id:
                skipped += 1
                continue
            url = SEED_URLS.get(product.name)
            if url:
                product.image_url = url
                updated += 1
            else:
                skipped += 1
        db.session.commit()
        print(f"Updated {updated} products with external image URLs")
        print(f"Skipped {skipped} products (already have image_id or no URL mapping)")


if __name__ == '__main__':
    fix()
