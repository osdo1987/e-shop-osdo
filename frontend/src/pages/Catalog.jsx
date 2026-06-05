import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import useDebounce from '../hooks/useDebounce'
import { GridSkeleton } from '../components/Skeleton'

// Adaptative parser for sizes stock JSON or comma list
const parseSizes = (sizesStr, overallStock) => {
    if (!sizesStr) return null
    try {
        if (sizesStr.startsWith('{')) {
            return JSON.parse(sizesStr)
        } else {
            const map = {}
            sizesStr.split(',').forEach(s => {
                const cleanS = s.trim()
                if (cleanS) {
                    map[cleanS] = Math.max(0, Math.min(10, overallStock))
                }
            })
            return map
        }
    } catch (e) {
        console.error("Error parsing sizes:", e)
        return null
    }
}

function Catalog() {
    const { slug } = useParams()
    const [store, setStore] = useState(null)
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [promoIndex, setPromoIndex] = useState(0)

    const [selectedCategory, setSelectedCategory] = useState('all')
    const [priceRange, setPriceRange] = useState([0, 1000000])
    const [onlyPromo, setOnlyPromo] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Estados para Favoritos y Carrito
    const [favorites, setFavorites] = useState(() => {
        const stored = localStorage.getItem(`favorites_${slug}`)
        return stored ? JSON.parse(stored) : []
    })
    const [onlyFavorites, setOnlyFavorites] = useState(false)

    const [cart, setCart] = useState(() => {
        const stored = localStorage.getItem(`cart_${slug}`)
        return stored ? JSON.parse(stored) : []
    })
    const [cartOpen, setCartOpen] = useState(false)
    const [sizeModalProduct, setSizeModalProduct] = useState(null)
    const [selectedSizeForModal, setSelectedSizeForModal] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')

    useEffect(() => {
        localStorage.setItem(`favorites_${slug}`, JSON.stringify(favorites))
    }, [favorites, slug])

    useEffect(() => {
        localStorage.setItem(`cart_${slug}`, JSON.stringify(cart))
    }, [cart, slug])

    const debouncedSearch = useDebounce(searchTerm, 300)

    useEffect(() => {
        fetchStoreData()
    }, [slug])

    useEffect(() => {
        if (store) {
            document.title = `${store.name} - Catálogo`
        }
    }, [store])

    // Products on promotion
    const promoProducts = useMemo(() => {
        return products.filter(p => p.promo_price !== null)
    }, [products])

    // Rotate promo banner every 5 seconds
    useEffect(() => {
        if (promoProducts.length <= 1) return
        const interval = setInterval(() => {
            setPromoIndex(prev => (prev + 1) % promoProducts.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [promoProducts.length])

    // Randomize initial promo product
    useEffect(() => {
        if (promoProducts.length > 0) {
            setPromoIndex(Math.floor(Math.random() * promoProducts.length))
        }
    }, [promoProducts.length])

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
            const favoriteOnly = !onlyFavorites || favorites.includes(p.id)
            const matchSearch = !debouncedSearch ||
                p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(debouncedSearch.toLowerCase()))

            return matchCategory && priceMin && priceMax && promoOnly && favoriteOnly && matchSearch
        })
    }, [products, selectedCategory, priceRange, onlyPromo, onlyFavorites, favorites, debouncedSearch])

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
        setOnlyFavorites(false)
        setSearchTerm('')
    }

    const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max || onlyPromo || onlyFavorites || searchTerm

    // Favoritos
    const toggleFavorite = (productId, e) => {
        e.preventDefault()
        e.stopPropagation()
        if (favorites.includes(productId)) {
            setFavorites(favorites.filter(id => id !== productId))
        } else {
            setFavorites([...favorites, productId])
        }
    }

    // Carrito de compras
    const toggleCart = () => setCartOpen(!cartOpen)

    const addToCart = (product, size = null) => {
        const parsedSizes = parseSizes(product.sizes, product.stock)
        
        if (parsedSizes && !size) {
            setSizeModalProduct(product)
            const availableSizes = Object.keys(parsedSizes).filter(Boolean)
            setSelectedSizeForModal(availableSizes[0] || '')
            return
        }

        const sizeStock = parsedSizes && size ? (parsedSizes[size] ?? 0) : product.stock

        setCart(currentCart => {
            const existingItemIndex = currentCart.findIndex(item => item.id === product.id && item.selected_size === size)
            if (existingItemIndex > -1) {
                return currentCart.map((item, idx) => 
                    idx === existingItemIndex 
                        ? { ...item, quantity: Math.min(item.quantity + 1, sizeStock) } 
                        : item
                )
            } else {
                return [...currentCart, {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    promo_price: product.promo_price,
                    image_url: product.image_url,
                    selected_size: size,
                    quantity: 1,
                    stock: sizeStock
                }]
            }
        })

        setSizeModalProduct(null)
        setSelectedSizeForModal('')
        setCartOpen(true) // Abrir el carrito para feedback visual inmediato
    }

    const updateCartItemQty = (productId, size, change) => {
        setCart(currentCart => {
            const itemIndex = currentCart.findIndex(item => item.id === productId && item.selected_size === size)
            if (itemIndex === -1) return currentCart

            const item = currentCart[itemIndex]
            const newQty = item.quantity + change

            if (newQty <= 0) {
                return currentCart.filter((_, idx) => idx !== itemIndex)
            } else if (newQty > item.stock) {
                return currentCart
            } else {
                return currentCart.map((it, idx) => 
                    idx === itemIndex 
                        ? { ...it, quantity: newQty } 
                        : it
                )
            }
        })
    }

    const removeCartItem = (productId, size) => {
        setCart(currentCart => currentCart.filter(item => !(item.id === productId && item.selected_size === size)))
    }

    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.promo_price || item.price) * item.quantity, 0)
    }, [cart])

    const cartTotalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }, [cart])
    const handleCheckout = async () => {
        if (cart.length === 0) return

        if (!customerName.trim()) {
            alert('Por favor, ingresa tu nombre para completar el pedido.')
            return
        }

        const orderData = {
            store_id: store.id,
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            total_price: cartSubtotal,
            items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.promo_price || item.price,
                selected_size: item.selected_size
            }))
        }

        try {
            const res = await fetch('/api/orders/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            if (!res.ok) {
                console.error("Error al registrar el pedido en la base de datos")
            }
        } catch (error) {
            console.error("Error de conexión al registrar el pedido:", error)
        }

        let message = `🛍️ *NUEVO PEDIDO - ${store.name}*\n`
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        message += `*Cliente:* ${customerName.trim()}\n`
        if (customerPhone.trim()) {
            message += `*Teléfono:* ${customerPhone.trim()}\n`
        }
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        message += `*Detalle de Productos:*\n`

        cart.forEach(item => {
            const sizeStr = item.selected_size ? ` (Talla: ${item.selected_size})` : ''
            const price = item.promo_price || item.price
            const subtotal = price * item.quantity

            message += `• ${item.quantity}x *${item.name}*${sizeStr}\n`
            message += `  Precio: $${price.toLocaleString()} c/u | Subtotal: $${subtotal.toLocaleString()}\n`
        })

        message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        message += `💰 *Total a pagar:* $${cartSubtotal.toLocaleString()}\n`
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        message += `¡Hola! Me gustaría realizar el pedido de los productos listados arriba. ¿Tienen disponibilidad?`

        const whatsappNumber = store.whatsapp?.replace('+', '').replace(/\s+/g, '') || ''
        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
        window.open(waUrl, '_blank')
        
        // Limpiar carrito y datos del cliente
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setCartOpen(false)
    }

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

    // Current promo product to display
    const currentPromo = promoProducts.length > 0
        ? promoProducts[promoIndex % promoProducts.length]
        : null

    return (
        <div className="catalog-wrapper">
            <div className="promo-banner">
                {currentPromo ? (
                    <span className="promo-banner-content">
                        <span className="promo-badge">🔥 OFERTA</span>
                        <span className="promo-name">{currentPromo.name}</span>
                        <span className="promo-price-old">${currentPromo.price.toLocaleString()}</span>
                        <span className="promo-price-new">${currentPromo.promo_price.toLocaleString()}</span>
                        <span className="promo-discount">
                            -{Math.round(((currentPromo.price - currentPromo.promo_price) / currentPromo.price) * 100)}%
                        </span>
                        {promoProducts.length > 1 && (
                            <span className="promo-counter">{promoIndex + 1}/{promoProducts.length}</span>
                        )}
                    </span>
                ) : (
                    <span>🚀 Envío gratis en pedidos sobre $100.000</span>
                )}
            </div>
            <header className="catalog-top-bar">
                <div className="logo-container">
                    <div className="logo-icon">
                        {store.logo_url ? (
                            <img src={store.logo_url} alt={`${store.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.809c0-.816-.31-1.597-.86-2.176l-3.32-3.483A3.013 3.013 0 0015.36 3.25h-6.72c-.8 0-1.564.316-2.128.878L3.192 7.61a3 3 0 00-.86 2.122V21m15.66 0h-3.66m-1.34 0v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21M3.66 21H2.34m0 0v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21" />
                            </svg>
                        )}
                    </div>
                    <div className="logo-text">{store.name}<span>.</span></div>
                </div>
                
                <div className="navbar-center">
                    <div className="search-wrapper navbar-search">
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
                    <div className="navbar-categories">
                        <button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => setSelectedCategory('all')}>Todos</button>
                        {categories.slice(0, 4).map(cat => (
                            <button key={cat.id} className={selectedCategory === cat.id.toString() ? 'active' : ''} onClick={() => setSelectedCategory(cat.id.toString())}>{cat.name}</button>
                        ))}
                    </div>
                </div>

                <div className="navbar-actions">
                    <button
                        className="btn btn-secondary"
                        style={{ display: 'none', padding: '6px 10px', fontSize: '13px', alignItems: 'center', gap: '6px', borderRadius: '20px' }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        id="mobile-filter-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                    </button>
                    <button className={`nav-icon-btn ${onlyFavorites ? 'active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)} title="Mis Favoritos">
                        <svg xmlns="http://www.w3.org/2000/svg" fill={onlyFavorites ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
                    </button>
                    <button className="nav-icon-btn" onClick={toggleCart} title="Carrito de compras">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        {cartTotalItems > 0 && <span className="nav-badge">{cartTotalItems}</span>}
                    </button>
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

                    {/* Mobile Search - Only visible when navbar search is hidden */}
                    <div className="filter-group mobile-only-search">
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

                    {/* Favorites Switch */}
                    <div className="filter-group">
                        <h3 className="filter-title">Favoritos</h3>
                        <div
                            className={`switch-container ${onlyFavorites ? 'active' : ''}`}
                            onClick={() => setOnlyFavorites(!onlyFavorites)}
                        >
                            <span className="switch-label">
                                <span className="switch-icon">{onlyFavorites ? '❤️' : '🤍'}</span>
                                Solo mis favoritos
                            </span>
                            <div className={`switch-track ${onlyFavorites ? 'active' : ''}`}>
                                <div className={`switch-thumb ${onlyFavorites ? 'active' : ''}`} />
                            </div>
                        </div>
                    </div>

                    <button className="clear-btn" onClick={clearFilters}>
                        Limpiar filtros
                    </button>
                </aside>

                <section className="catalog-content">
                    {/* Mobile Horizontal Category Chips */}
                    <div className="mobile-category-scroll">
                        <button 
                            className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            🏷️ Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-chip ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id.toString())}
                            >
                                {cat.name === 'Ropa' ? '👕' : cat.name === 'Calzado' ? '👟' : cat.name === 'Accesorios' ? '👜' : '📦'} {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="content-header">
                        <div style={{ fontWeight: '700' }}>{filteredProducts.length} productos</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ display: 'none', padding: '6px 12px', fontSize: '13px', alignItems: 'center', gap: '6px', borderRadius: '20px' }}
                                onClick={() => setSidebarOpen(true)}
                                id="mobile-filter-btn-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 0V21m6-7.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 0V21m6-9V3.75m0 9a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 0V21" />
                                </svg>
                                Filtrar {hasActiveFilters ? '✓' : ''}
                            </button>
                            Ordenar: <select style={{ border: 'none', background: 'none', fontWeight: '700' }}><option>Destacados</option></select>
                        </div>
                    </div>

                    <div className="product-grid">
                        {filteredProducts.map(product => {
                            const discount = product.promo_price ? Math.round(((product.price - product.promo_price) / product.price) * 100) : null
                            const isSoldOut = product.stock <= 0

                            return (
                                <div key={product.id} className="product-card" style={{ opacity: isSoldOut ? 0.6 : 1, position: 'relative' }}>
                                    {isSoldOut ? (
                                        <div className="badge" style={{ background: 'var(--error)' }}>Agotado</div>
                                    ) : (
                                        product.promo_price && <div className="badge">Oferta</div>
                                    )}

                                    {/* Botón Favorito Floating ❤️ */}
                                    <button
                                        className={`fav-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                                        onClick={(e) => toggleFavorite(product.id, e)}
                                        aria-label="Agregar a favoritos"
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: 'var(--surface)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            zIndex: 2,
                                            transition: 'all 0.2s ease',
                                            color: favorites.includes(product.id) ? '#ef5350' : 'var(--text-secondary)'
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill={favorites.includes(product.id) ? '#ef5350' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </button>

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
                                        <button className="buy-btn" style={{ background: 'var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed', boxShadow: 'none', border: 'none', width: '100%' }} disabled>
                                            Sin Stock
                                        </button>
                                    ) : (
                                        <button onClick={() => addToCart(product)} className="buy-btn" style={{ border: 'none', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <span>🛒 Agregar al Carrito</span>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'var(--background)',
                            borderRadius: '12px',
                            border: '1px dashed var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            width: '100%',
                            boxSizing: 'border-box',
                            margin: '30px 0',
                            gridColumn: '1 / -1'
                        }}>
                            <div style={{ fontSize: '54px', animation: 'float 3s ease-in-out infinite' }}>🔍</div>
                            <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>No se encontraron productos</h3>
                            <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '340px', lineHeight: '1.5' }}>
                                Prueba cambiando de categoría, buscando otros términos o desactivando los filtros activos.
                            </p>
                            {hasActiveFilters && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ marginTop: '12px', padding: '10px 20px', fontSize: '13px', borderRadius: '30px', fontWeight: '600' }}
                                    onClick={clearFilters}
                                >
                                    Restablecer Búsqueda
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

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={toggleCart}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 999,
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    className="floating-cart"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '28px', height: '28px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: '#ef5350',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {cartTotalItems}
                    </span>
                </button>
            )}

            {/* Cart Drawer */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: cartOpen ? 0 : '-420px',
                    width: '100%',
                    maxWidth: '420px',
                    height: '100vh',
                    background: 'var(--surface)',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🛒 Mi Carrito <span style={{ fontSize: '13px', background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>{cartTotalItems}</span>
                    </h3>
                    <button
                        onClick={toggleCart}
                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                        &times;
                    </button>
                </div>
                
                {/* Items List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                            <p>Tu carrito está vacío</p>
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: '12px' }}
                                onClick={toggleCart}
                            >
                                Seguir explorando
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cart.map((item, idx) => {
                                const price = item.promo_price || item.price
                                return (
                                    <div key={`${item.id}-${item.selected_size}-${idx}`} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ fontSize: '24px' }}>📦</span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</h4>
                                            {item.selected_size && (
                                                <span style={{ display: 'inline-block', fontSize: '11px', background: 'var(--background)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                                                    Talla: {item.selected_size}
                                                </span>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-dark)' }}>
                                                    ${(price * item.quantity).toLocaleString()}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 8px', background: 'var(--background)' }}>
                                                    <button
                                                        onClick={() => updateCartItemQty(item.id, item.selected_size, -1)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateCartItemQty(item.id, item.selected_size, 1)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}
                                                        disabled={item.quantity >= item.stock}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeCartItem(item.id, item.selected_size)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'center', color: '#ef5350' }}
                                            aria-label="Eliminar artículo"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Footer / Summary */}
                {cart.length > 0 && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nombre completo *</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej. Juan Pérez" 
                                    value={customerName} 
                                    onChange={(e) => setCustomerName(e.target.value)} 
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>Teléfono móvil (opcional)</label>
                                <input 
                                    type="tel" 
                                    placeholder="Ej. +34 600 000 000" 
                                    value={customerPhone} 
                                    onChange={(e) => setCustomerPhone(e.target.value)} 
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total a pagar:</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-dark)' }}>
                                ${cartSubtotal.toLocaleString()}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', borderColor: '#25D366', color: 'white', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.949h.004c4.368 0 7.926-3.558 7.93-7.93a7.896 7.896 0 0 0-2.33-5.593l.04-.025zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.202-.101-1.202-.594-1.392-.66-.189-.07-.327-.101-.466.101-.138.2-.536.66-.657.798-.12.137-.24.153-.442.052-1.92-.958-3.08-2.074-3.8-3.32-.202-.349.202-.324.577-1.072.077-.153.038-.288-.019-.389-.058-.1-.466-1.121-.639-1.543-.169-.408-.34-.352-.466-.358-.121-.006-.26-.006-.399-.006-.139 0-.365.052-.556.262-.19.201-.728.712-.728 1.74 0 1.026.748 2.017.852 2.158.104.14 1.472 2.25 3.566 3.15.498.214.887.342 1.19.438.502.16 1.002.137 1.38.08.42-.064 1.202-.492 1.373-.962.17-.47.17-.872.12-.962-.05-.09-.19-.14-.39-.241z"/>
                            </svg>
                            Finalizar pedido por WhatsApp
                        </button>
                    </div>
                )}
            </div>

            {/* Size Selection Modal */}
            {sizeModalProduct && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        backdropFilter: 'blur(4px)',
                        padding: '16px'
                    }}
                >
                    <div
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '400px',
                            padding: '24px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={() => setSizeModalProduct(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            &times;
                        </button>
                        
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Seleccionar Talla</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Elige una talla para <strong>{sizeModalProduct.name}</strong> antes de agregarlo al carrito.
                        </p>
                        
                        {(() => {
                            const parsedSizes = parseSizes(sizeModalProduct.sizes, sizeModalProduct.stock) || {}
                            const sizeKeys = Object.keys(parsedSizes).filter(Boolean)
                            
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {sizeKeys.map(size => {
                                            const sizeStock = parsedSizes[size] ?? 0
                                            const isOutOfStock = sizeStock <= 0
                                            const isSelected = selectedSizeForModal === size
                                            
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => !isOutOfStock && setSelectedSizeForModal(size)}
                                                    disabled={isOutOfStock}
                                                    style={{
                                                        minWidth: '60px',
                                                        height: '48px',
                                                        padding: '6px 8px',
                                                        borderRadius: '8px',
                                                        border: isSelected 
                                                            ? '2px solid #4caf50' 
                                                            : (isOutOfStock ? '1px dashed var(--border)' : '1px solid var(--border)'),
                                                        background: isSelected 
                                                            ? '#e8f5e9' 
                                                            : (isOutOfStock ? 'rgba(0,0,0,0.03)' : 'var(--surface)'),
                                                        color: isSelected 
                                                            ? '#2e7d32' 
                                                            : (isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)'),
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        opacity: isOutOfStock ? 0.5 : 1,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '13px' }}>{size}</span>
                                                    <span style={{ fontSize: '9px', fontWeight: '500', marginTop: '2px', color: isSelected ? '#2e7d32' : (isOutOfStock ? 'var(--error)' : 'var(--text-muted)') }}>
                                                        {isOutOfStock ? 'Agotado' : `${sizeStock} u.`}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })()}
                        
                        <button
                            onClick={() => addToCart(sizeModalProduct, selectedSizeForModal)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' }}
                            disabled={!selectedSizeForModal}
                        >
                            Confirmar y Agregar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Catalog