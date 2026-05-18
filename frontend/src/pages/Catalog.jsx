import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import useDebounce from '../hooks/useDebounce'
import { GridSkeleton } from '../components/Skeleton'

function Catalog() {
    const { slug } = useParams()
    const [store, setStore] = useState(null)
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedCategory, setSelectedCategory] = useState('all')
    const [priceRange, setPriceRange] = useState([0, 1000000])
    const [onlyPromo, setOnlyPromo] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const debouncedSearch = useDebounce(searchTerm, 300)

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

    // Dynamic price bounds based on actual products
    const priceBounds = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 1000000 }
        const prices = products.flatMap(p => [p.price, p.promo_price].filter(Boolean))
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        }
    }, [products])

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCategory = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory)
            const currentPrice = p.promo_price || p.price
            const priceMin = currentPrice >= priceRange[0]
            const priceMax = currentPrice <= priceRange[1]
            const promoOnly = !onlyPromo || p.promo_price !== null
            const matchSearch = !debouncedSearch ||
                p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(debouncedSearch.toLowerCase()))

            return matchCategory && priceMin && priceMax && promoOnly && matchSearch
        })
    }, [products, selectedCategory, priceRange, onlyPromo, debouncedSearch])

    // Reset price range when products load
    useEffect(() => {
        if (products.length > 0) {
            setPriceRange([priceBounds.min, priceBounds.max])
        }
    }, [products])

    const clearFilters = () => {
        setSelectedCategory('all')
        setPriceRange([priceBounds.min, priceBounds.max])
        setOnlyPromo(false)
        setSearchTerm('')
    }

    const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max || onlyPromo || searchTerm

    if (loading) {
        return (
            <div className="catalog-wrapper">
                <header className="catalog-top-bar">
                    <div className="logo-container">
                        <div className="logo-icon">🏪</div>
                        <div className="logo-text">Cargando<span>.</span></div>
                    </div>
                </header>
                <main className="catalog-main-layout">
                    <section className="catalog-content">
                        <GridSkeleton count={8} />
                    </section>
                </main>
            </div>
        )
    }

    if (!store) {
        return (
            <div className="home-container">
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Tienda no encontrada</h2>
                <p style={{ color: 'var(--text-secondary)' }}>El catálogo que buscas no existe o fue eliminado.</p>
            </div>
        )
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
                <div className="top-bar-stats" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Mobile filter toggle */}
                    <button
                        className="btn btn-secondary"
                        style={{ display: 'none', padding: '6px 10px', fontSize: '13px' }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        id="mobile-filter-btn"
                    >
                        Filtros {hasActiveFilters ? '✓' : ''}
                    </button>
                    <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', marginRight: '8px' }}></span>
                    {filteredProducts.length} resultados
                </div>
            </header>

            <main className="catalog-main-layout">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside className={`catalog-sidebar ${sidebarOpen ? 'catalog-sidebar-open' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="filter-title" style={{ margin: 0 }}>Filtros</h3>
                        <button
                            style={{ display: 'none', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            onClick={() => setSidebarOpen(false)}
                            id="sidebar-close-btn"
                        >
                            ×
                        </button>
                    </div>

                    {/* Search */}
                    <div className="filter-group">
                        <h3 className="filter-title">Buscar</h3>
                        <div className="search-wrapper">
                            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title">Categorías</h3>
                        <div className="category-list">
                            <div
                                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => { setSelectedCategory('all'); setSidebarOpen(false) }}
                            >
                                <span>Todos</span>
                                <span className="count-badge">{categoryCounts.all}</span>
                            </div>
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`category-item ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                                    onClick={() => { setSelectedCategory(cat.id.toString()); setSidebarOpen(false) }}
                                >
                                <span>{cat.name}</span>
                                <span className="count-badge">{categoryCounts[cat.id] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Range – Modern Slider with filled track */}
                    <div className="filter-group">
                        <h3 className="filter-title">Precio</h3>
                        <div className="price-range-container">
                            <div className="price-slider-wrapper">
                                {/* Custom track background that fills only the selected range */}
                                <div
                                    className="price-track-fill"
                                    style={{
                                        left: `${((priceRange[0] - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                                        width: `${((priceRange[1] - priceRange[0]) / (priceBounds.max - priceBounds.min)) * 100}%`,
                                    }}
                                />
                                <input
                                    type="range"
                                    className="price-slider"
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    step={1}
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const val = Math.min(Number(e.target.value), priceRange[1] - 1)
                                        setPriceRange([val, priceRange[1]])
                                    }}
                                />
                                <input
                                    type="range"
                                    className="price-slider"
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    step={1}
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const val = Math.max(Number(e.target.value), priceRange[0] + 1)
                                        setPriceRange([priceRange[0], val])
                                    }}
                                />
                            </div>
                            <div className="price-labels">
                                <span className="price-label-value">${priceRange[0].toLocaleString()}</span>
                                <span className="price-label-sep">—</span>
                                <span className="price-label-value">${priceRange[1].toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Promotions Switch – Improved */}
                    <div className="filter-group">
                        <h3 className="filter-title">Ofertas</h3>
                        <div
                            className={`switch-container ${onlyPromo ? 'active' : ''}`}
                            onClick={() => setOnlyPromo(!onlyPromo)}
                        >
                            <span className="switch-label">
                                <span className="switch-icon">{onlyPromo ? '🏷️' : '📋'}</span>
                                Solo en promoción
                            </span>
                            <div className={`switch-track ${onlyPromo ? 'active' : ''}`}>
                                <div className={`switch-thumb ${onlyPromo ? 'active' : ''}`} />
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
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ display: 'none', padding: '6px 10px', fontSize: '13px' }}
                                onClick={() => setSidebarOpen(true)}
                                id="mobile-filter-btn-2"
                            >
                                Filtrar {hasActiveFilters ? '✓' : ''}
                            </button>
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
                                        product.promo_price && <div className="badge">Oferta</div>
                                    )}
                                    <div className="img-wrapper" style={{ filter: isSoldOut ? 'grayscale(100%)' : 'none' }}>
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="product-img" />
                                        ) : (
                                            <div style={{ fontSize: '40px' }}>📦</div>
                                        )}
                                    </div>
                                    <div className="item-cat">{categories.find(c => c.id === product.category_id)?.name}</div>
                                    <h4 className="item-name" style={{
                                        textDecoration: isSoldOut ? 'line-through' : 'none',
                                        color: isSoldOut ? 'var(--text-muted)' : 'var(--text-primary)'
                                    }}>{product.name}</h4>

                                    <div className="price-line">
                                        <span className="curr-price">${(product.promo_price || product.price).toLocaleString()}</span>
                                        {product.promo_price && (
                                            <>
                                                <span className="old-price">${product.price.toLocaleString()}</span>
                                                <span className="discount">-{discount}%</span>
                                            </>
                                        )}
                                    </div>

                                    <div style={{
                                        fontSize: '12px',
                                        color: isSoldOut ? 'var(--error)' : 'var(--text-muted)',
                                        marginBottom: '15px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: isSoldOut ? 'var(--error)' : (product.stock < 5 ? 'var(--warning)' : 'var(--success)')
                                        }}></span>
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
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                            <p style={{ fontSize: '16px' }}>No se encontraron productos con estos filtros.</p>
                            {hasActiveFilters && (
                                <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '16px' }}>
                                    Limpiar filtros
                                </button>
                            )}
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