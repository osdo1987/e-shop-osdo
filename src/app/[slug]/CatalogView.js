'use client';

import { useState, useMemo } from 'react';
import styles from './catalog.module.css';

export default function CatalogView({ store, categories, initialProducts }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyPromo, setOnlyPromo] = useState(false);

  // Calcular conteos por categoría
  const categoryCounts = useMemo(() => {
    const counts = { all: initialProducts.length };
    initialProducts.forEach(p => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [initialProducts]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchCategory = selectedCategory === 'all' || p.categoryId === parseInt(selectedCategory);
      const matchMinPrice = minPrice === '' || p.promoPrice || p.price >= parseFloat(minPrice);
      // Simplificamos: si hay promo se usa esa para el filtro
      const currentPrice = p.promoPrice || p.price;
      const priceMin = minPrice === '' || currentPrice >= parseFloat(minPrice);
      const priceMax = maxPrice === '' || currentPrice <= parseFloat(maxPrice);
      const promoOnly = !onlyPromo || p.promoPrice !== null;
      
      return matchCategory && priceMin && priceMax && promoOnly;
    });
  }, [initialProducts, selectedCategory, minPrice, maxPrice, onlyPromo]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setOnlyPromo(false);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.topBar}>
        <div className={styles.logo}>{store.name.toUpperCase()}<span>.</span></div>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>{filteredProducts.length} resultados</div>
      </header>

      <main className={styles.mainLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Categorías</h3>
            <div className={styles.categoryList}>
              <div 
                className={`${styles.categoryItem} ${selectedCategory === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span>Todos</span>
                <span className={styles.count}>{categoryCounts.all}</span>
              </div>
              {categories.map(cat => (
                <div 
                  key={cat.id}
                  className={`${styles.categoryItem} ${selectedCategory === cat.id.toString() ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                >
                  <span>{cat.name}</span>
                  <span className={styles.count}>{categoryCounts[cat.id] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Precio</h3>
            <div className={styles.priceInputs}>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)} 
              />
              <input 
                type="number" 
                placeholder="Máx" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Ofertas</h3>
            <div 
              className={styles.switchContainer} 
              style={{ background: onlyPromo ? '#E0F2E9' : '#eee' }}
              onClick={() => setOnlyPromo(!onlyPromo)}
            >
              <span>Solo en promoción</span>
              <div style={{ 
                width: '34px', 
                height: '18px', 
                background: onlyPromo ? 'var(--primary-color)' : '#ccc',
                borderRadius: '20px',
                position: 'relative',
                transition: '0.3s'
              }}>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  background: 'white', 
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: onlyPromo ? '18px' : '2px',
                  transition: '0.3s'
                }} />
              </div>
            </div>
          </div>

          <button className={styles.clearBtn} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </aside>

        {/* Content */}
        <section className={styles.content}>
          <div className={styles.contentHeader}>
            <div style={{ fontWeight: '700' }}>{filteredProducts.length} productos</div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Ordenar: <select style={{ border: 'none', background: 'none', fontWeight: '700' }}><option>Destacados</option></select>
            </div>
          </div>

          <div className={styles.productGrid}>
            {filteredProducts.map(product => {
              const discount = product.promoPrice ? Math.round(((product.price - product.promoPrice) / product.price) * 100) : null;
              const waMessage = encodeURIComponent(`¡Hola! Me interesa el producto: ${product.name}\nPrecio: $${product.promoPrice || product.price}`);
              const waUrl = `https://wa.me/${store.whatsapp?.replace('+', '') || ''}?text=${waMessage}`;

              return (
                <div key={product.id} className={styles.productCard}>
                  {product.promoPrice && <div className={styles.badge}>Nuevo</div>}
                  <div className={styles.imgWrapper}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className={styles.productImg} />
                    ) : (
                      <div style={{ fontSize: '40px' }}>📦</div>
                    )}
                  </div>
                  <div className={styles.itemCat}>{categories.find(c => c.id === product.categoryId)?.name}</div>
                  <h4 className={styles.itemName}>{product.name}</h4>
                  
                  <div className={styles.priceLine}>
                    <span className={styles.currPrice}>${(product.promoPrice || product.price).toLocaleString()}</span>
                    {product.promoPrice && (
                      <>
                        <span className={styles.oldPrice}>${product.price.toLocaleString()}</span>
                        <span className={styles.discount}>-{discount}%</span>
                      </>
                    )}
                  </div>

                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.buyBtn}>
                    Pedir por WhatsApp
                  </a>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
              No se encontraron productos con estos filtros.
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
        <div className={styles.powered}>Powered by OSDOSOFT</div>
      </footer>
    </div>
  );
}
