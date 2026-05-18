import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

function Catalog() {
    const { slug } = useParams()
    const [store, setStore] = useState(null)
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedCategory, setSelectedCategory] = useState('all')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [onlyPromo, setOnlyPromo] = useState(false)

    useEffect(() => {
        fetchStoreData()
    }, [slug])

    const fetchStoreData = async () => {
        try {
            const res = await fetch(`/api/stores/public/${slug}`)
            if (res.ok) {
                const data = await res.json()
                setStore(data)
                setCategories(data.categories || [])
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Error fetching store data:', error)
        } finally {
            setLoading(false)
        }
    }

    const categoryCounts = useMemo(() => {
        const counts = { all: products.length }
        products.forEach(p => {
            counts[p.category_id] = (counts[p.category_id] || 0) + 1
        })
        return counts
    }, [products])

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCategory = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory)
            const currentPrice = p.promo_price || p.price
            const priceMin = minPrice === '' || currentPrice >= parseFloat(minPrice)
            const priceMax = maxPrice === '' || currentPrice <= parseFloat(maxPrice)
            const promoOnly = !onlyPromo || p.promo_price !== null

            return matchCategory && priceMin && priceMax && promoOnly
        })
    }, [products, selectedCategory, minPrice, maxPrice, onlyPromo])

    const clearFilters = () => {
        setSelectedCategory('all')
        setMinPrice('')
        setMaxPrice('')
        setOnlyPromo(false)
    }

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <p>Cargando catálogo...</p>
        </div>
    }

    if (!store) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card">
                <h2>Tienda no encontrada</h2>
                <p>El catálogo que buscas no existe o fue eliminado.</p>
            </div>
        </div>
    }

    return (
        <div className="catalog-wrapper">
            <header className="catalog-top-bar">
                <div className="logo-container">
                    <div className="logo-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.809c0-.816-.31-1.597-.86-2.176l-3.32-3.483A3.013 3.013 0 0015.36 3.25h-6.72c-.8 0-1.564.316-2.128.878L3.192 7.61a3 3 0 00-.86 2.122V21m15.66 0h-3.66m-1.34 0v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21M3.66 21H2.34m0 0v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21" />
                        </svg>
                    </div>
                    <div className="logo-text">{store.name}<span>.</span></div>
                </div>
                <div className="top-bar-stats">
                    <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', marginRight: '8px' }}></span>
                    {filteredProducts.length} resultados
                </div>
            </header>

            <main className="catalog-main-layout">
                <aside className="catalog-sidebar">
                    <div className="filter-group">
                        <h3 className="filter-title">Categorías</h3>
                        <div className="category-list">
                            <div
                                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                <span>Todos</span>
                                <span className="count">{categoryCounts.all}</span>
                            </div>
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`category-item ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id.toString())}
                                >
                                    <span>{cat.name}</span>
                                    <span className="count">{categoryCounts[cat.id] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Precio</h3>
                        <div className="price-inputs">
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

                    <div className="filter-group">
                        <h3 className="filter-title">Ofertas</h3>
                        <div
                            className={`switch-container ${onlyPromo ? 'active' : ''}`}
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

                    <button className="clear-btn" onClick={clearFilters}>
                        Limpiar filtros
                    </button>
                </aside>

                <section className="catalog-content">
                    <div className="content-header">
                        <div style={{ fontWeight: '700' }}>{filteredProducts.length} productos</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Ordenar: <select style={{ border: 'none', background: 'none', fontWeight: '700' }}><option>Destacados</option></select>
                        </div>
                    </div>

                    <div className="product-grid">
                        {filteredProducts.map(product => {
                            const discount = product.promo_price ? Math.round(((product.price - product.promo_price) / product.price) * 100) : null
                            const waMessage = encodeURIComponent(`¡Hola! Me interesa el producto: ${product.name}\nPrecio: $${(product.promo_price || product.price).toLocaleString()}`)
                            const waUrl = `https://wa.me/${store.whatsapp?.replace('+', '') || ''}?text=${waMessage}`
                            const isSoldOut = product.stock <= 0

                            return (
                                <div key={product.id} className="product-card" style={{ opacity: isSoldOut ? 0.6 : 1 }}>
                                    {isSoldOut ? (
                                        <div className="badge" style={{ background: 'var(--error)' }}>Agotado</div>
                                    ) : (
                                        product.promo_price && <div className="badge">Nuevo</div>
                                    )}
                                    <div className="img-wrapper" style={{ filter: isSoldOut ? 'grayscale(100%)' : 'none' }}>
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="product-img" />
                                        ) : (
                                            <div style={{ fontSize: '40px' }}>📦</div>
                                        )}
                                    </div>
                                    <div className="item-cat">{categories.find(c => c.id === product.category_id)?.name}</div>
                                    <h4 className="item-name" style={{ textDecoration: isSoldOut ? 'line-through' : 'none', color: isSoldOut ? 'var(--text-muted)' : 'var(--text-primary)' }}>{product.name}</h4>

                                    <div className="price-line">
                                        <span className="curr-price">${(product.promo_price || product.price).toLocaleString()}</span>
                                        {product.promo_price && (
                                            <>
                                                <span className="old-price">${product.price.toLocaleString()}</span>
                                                <span className="discount">-{discount}%</span>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ fontSize: '12px', color: isSoldOut ? 'var(--error)' : 'var(--text-muted)', marginBottom: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSoldOut ? 'var(--error)' : (product.stock < 5 ? 'var(--warning)' : 'var(--success)') }}></span>
                                        {isSoldOut ? 'Producto Agotado' : `Disponibles: ${product.stock} unidades`}
                                    </div>

                                    {isSoldOut ? (
                                        <div className="buy-btn" style={{ background: 'var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed', boxShadow: 'none' }}>
                                            Sin Stock
                                        </div>
                                    ) : (
                                        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="buy-btn">
                                            Pedir por WhatsApp
                                        </a>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                            No se encontraron productos con estos filtros.
                        </div>
                    )}
                </section>
            </main>

            <footer className="catalog-footer">
                <p>&copy; {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
                <div className="powered">Powered by OSDOSOFT</div>
            </footer>
        </div>
    )
}

export default Catalog