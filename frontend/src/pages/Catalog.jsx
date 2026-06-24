import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import useDebounce from '../hooks/useDebounce'
import { GridSkeleton } from '../components/Skeleton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputBase from '@mui/material/InputBase'
import Fab from '@mui/material/Fab'
import Badge from '@mui/material/Badge'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import StorefrontIcon from '@mui/icons-material/Storefront'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ScheduleIcon from '@mui/icons-material/Schedule'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useTheme } from '@mui/material/styles'

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

const parseToppingsConfig = (toppingsConfigStr) => {
    if (!toppingsConfigStr) return null
    try {
        const config = JSON.parse(toppingsConfigStr)
        return config.groups || null
    } catch (e) {
        console.error("Error parsing toppings_config:", e)
        return null
    }
}

function Catalog() {
    const { slug } = useParams()
    const theme = useTheme()
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

    // Toppings modal state
    const [toppingModalProduct, setToppingModalProduct] = useState(null)
    const [toppingSelections, setToppingSelections] = useState({})
    const [toppingConfig, setToppingConfig] = useState(null)
    const [toppingExtraPrice, setToppingExtraPrice] = useState(0)
    const [toppingSize, setToppingSize] = useState(null)

    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [customerNotes, setCustomerNotes] = useState('')
    const [toastOpen, setToastOpen] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

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

    const promoProducts = useMemo(() => {
        return products.filter(p => p.promo_price !== null)
    }, [products])

    useEffect(() => {
        if (promoProducts.length <= 1) return
        const interval = setInterval(() => {
            setPromoIndex(prev => (prev + 1) % promoProducts.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [promoProducts.length])

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

    const toggleFavorite = (productId, e) => {
        e.preventDefault()
        e.stopPropagation()
        if (favorites.includes(productId)) {
            setFavorites(favorites.filter(id => id !== productId))
        } else {
            setFavorites([...favorites, productId])
        }
    }

    const toggleCart = () => setCartOpen(!cartOpen)

    // Calculate extra price for selected toppings
    const calcToppingExtraPrice = (selections, groups) => {
        if (!groups) return 0
        let total = 0
        Object.entries(selections).forEach(([groupId, selectedNames]) => {
            const group = groups.find(g => g.id === groupId)
            if (group && Array.isArray(selectedNames)) {
                selectedNames.forEach(name => {
                    const option = group.options.find(o => o.name === name)
                    if (option) total += option.price
                })
            }
        })
        return total
    }

    const openToppingModal = (product, selectedSize = null) => {
        const config = parseToppingsConfig(product.toppings_config)
        if (!config) {
            // No toppings configured, add directly
            addToCartDirect(product, selectedSize, null, 0)
            return
        }
        // Initialize empty selections for each group
        const initialSelections = {}
        config.forEach(group => {
            initialSelections[group.id] = []
        })
        setToppingConfig(config)
        setToppingSelections(initialSelections)
        setToppingExtraPrice(0)
        setToppingModalProduct(product)
        setToppingSize(selectedSize)
    }

    const handleToppingToggle = (groupId, optionName) => {
        setToppingSelections(prev => {
            const current = [...(prev[groupId] || [])]
            const idx = current.indexOf(optionName)
            const group = toppingConfig?.find(g => g.id === groupId)
            const max = group?.max || 0

            if (idx >= 0) {
                current.splice(idx, 1)
            } else {
                if (max > 0 && current.length >= max) {
                    return prev // Can't add more than max
                }
                current.push(optionName)
            }

            const newSelections = { ...prev, [groupId]: current }
            // Recalculate extra price
            const extra = calcToppingExtraPrice(newSelections, toppingConfig)
            setToppingExtraPrice(extra)
            return newSelections
        })
    }

    const confirmToppingsAndAddToCart = () => {
        if (!toppingModalProduct) return

        // Validate required groups
        const missingRequired = toppingConfig?.filter(g => {
            if (!g.required) return false
            const selected = toppingSelections[g.id] || []
            const min = g.min || 1
            return selected.length < min
        })

        if (missingRequired && missingRequired.length > 0) {
            alert(`Debes seleccionar al menos ${missingRequired[0].min || 1} opción en: ${missingRequired[0].label}`)
            return
        }

        addToCartDirect(toppingModalProduct, toppingSize, toppingSelections, toppingExtraPrice)
        setToppingModalProduct(null)
        setToppingConfig(null)
        setToppingSelections({})
        setToppingExtraPrice(0)
        setToppingSize(null)
    }

    const addToCart = (product, size = null) => {
        const parsedSizes = parseSizes(product.sizes, product.stock)

        if (parsedSizes && !size) {
            setSizeModalProduct(product)
            const availableSizes = Object.keys(parsedSizes).filter(Boolean)
            setSelectedSizeForModal(availableSizes[0] || '')
            return
        }

        // Check if product has toppings
        if (product.toppings_config) {
            openToppingModal(product, size)
            return
        }

        addToCartDirect(product, size, null, 0)
    }

    const addToCartDirect = (product, size, toppings, extraPrice) => {
        const parsedSizes = parseSizes(product.sizes, product.stock)
        const sizeStock = parsedSizes && size ? (parsedSizes[size] ?? 0) : product.stock

        const toppingsKey = toppings ? JSON.stringify(toppings) : null

        setCart(currentCart => {
            const existingItemIndex = currentCart.findIndex(
                item => item.id === product.id && item.selected_size === size && item.selected_toppings === toppingsKey
            )
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
                    selected_toppings: toppingsKey,
                    extra_price: extraPrice,
                    quantity: 1,
                    stock: sizeStock
                }]
            }
        })

        setSizeModalProduct(null)
        setSelectedSizeForModal('')
        setToastMessage(`"${product.name}" agregado al carrito`)
        setToastOpen(true)
    }

    const updateCartItemQty = (productId, size, toppings, change) => {
        setCart(currentCart => {
            const itemIndex = currentCart.findIndex(
                item => item.id === productId && item.selected_size === size && item.selected_toppings === toppings
            )
            if (itemIndex === -1) return currentCart

            const item = currentCart[itemIndex]
            const newQty = item.quantity + change

            if (newQty <= 0) {
                return currentCart.filter((_, idx) => idx !== itemIndex)
            } else if (item.stock > 0 && newQty > item.stock) {
                // Only check stock limit if stock > 0 (stock=0 means no limit for restaurant items)
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

    const removeCartItem = (productId, size, toppings) => {
        setCart(currentCart => currentCart.filter(
            item => !(item.id === productId && item.selected_size === size && item.selected_toppings === toppings)
        ))
    }

    const cartSubtotal = useMemo(() => {
        return cart.reduce((total, item) => {
            const basePrice = (item.promo_price || item.price) + (item.extra_price || 0)
            return total + basePrice * item.quantity
        }, 0)
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
            delivery_address: deliveryAddress.trim(),
            customer_notes: customerNotes.trim(),
            total_price: cartSubtotal,
            items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.promo_price || item.price,
                selected_size: item.selected_size,
                selected_toppings: item.selected_toppings,
                extra_price: item.extra_price || 0
            }))
        }

        try {
            const res = await fetch('/api/orders/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            if (!res.ok) {
                const errData = await res.json()
                alert(errData.error || "Hubo un problema al registrar tu pedido. Por favor, inténtalo de nuevo.")
                return
            }
        } catch (error) {
            console.error("Error de conexión al registrar el pedido:", error)
            alert("Error de conexión con el servidor. Por favor, verifica tu conexión a internet.")
            return
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
            const basePrice = item.promo_price || item.price
            const itemPrice = basePrice + (item.extra_price || 0)
            const subtotal = itemPrice * item.quantity
            message += `• ${item.quantity}x *${item.name}*${sizeStr}\n`
            message += `  Precio: $${basePrice.toLocaleString()} c/u`
            if (item.extra_price) {
                message += ` (+$${item.extra_price.toLocaleString()} toppings)`
            }
            message += ` | Subtotal: $${subtotal.toLocaleString()}\n`

            // Show selected toppings
            if (item.selected_toppings) {
                try {
                    const toppings = JSON.parse(item.selected_toppings)
                    Object.entries(toppings).forEach(([groupId, names]) => {
                        if (names && names.length > 0) {
                            const config = parseToppingsConfig(products.find(p => p.id === item.id)?.toppings_config)
                            const group = config?.find(g => g.id === groupId)
                            const label = group?.label || groupId
                            message += `    └ ${label}: ${names.join(', ')}\n`
                        }
                    })
                } catch (e) { }
            }
        })

        message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        message += `💰 *Total a pagar:* $${cartSubtotal.toLocaleString()}\n`
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        message += `¡Hola! Me gustaría realizar el pedido de los productos listados arriba. ¿Tienen disponibilidad?`

        const whatsappNumber = store.whatsapp?.replace('+', '').replace(/\s+/g, '') || ''
        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
        window.open(waUrl, '_blank')

        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setDeliveryAddress('')
        setCustomerNotes('')
        setCartOpen(false)
    }

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Toolbar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <StorefrontIcon fontSize="small" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Cargando<span style={{ color: '#6366f1' }}>.</span></Typography>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{ p: { xs: 2, md: 3.5 }, flex: 1 }}>
                    <GridSkeleton count={8} />
                </Box>
            </Box>
        )
    }

    if (!store) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', p: 2.5 }}>
                <Box sx={{ fontSize: '4rem', mb: 1 }}>🔍</Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Negocio no encontrado</Typography>
                <Typography color="text.secondary">El catálogo que buscas no existe o fue eliminado.</Typography>
            </Box>
        )
    }

    const currentPromo = promoProducts.length > 0
        ? promoProducts[promoIndex % promoProducts.length]
        : null

    const sidebarContent = (
        <Box sx={{ p: 2.5, width: 280 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.disabled' }}>
                    Filtros
                </Typography>
                <IconButton size="small" onClick={() => setSidebarOpen(false)} sx={{ display: { md: 'none' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Mobile Search */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.disabled', display: 'block', mb: 1 }}>
                    Buscar
                </Typography>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ position: 'absolute', left: 13, color: 'text.disabled', pointerEvents: 'none' }} fontSize="small" />
                    <InputBase
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            pl: 4.5,
                            pr: 2,
                            py: 1,
                            width: '100%',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            borderRadius: 20,
                            bgcolor: 'background.paper',
                            fontSize: '0.875rem',
                            '&.Mui-focused': {
                                borderColor: 'primary.main',
                            },
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.disabled', display: 'block', mb: 1 }}>
                    Categorías
                </Typography>
                <List dense>
                    <ListItemButton
                        selected={selectedCategory === 'all'}
                        onClick={() => { setSelectedCategory('all'); setSidebarOpen(false) }}
                        sx={{ borderRadius: 20, mb: 0.5 }}
                    >
                        <ListItemText primary="Todos" slotProps={{ primary: { fontSize: '0.875rem', fontWeight: 500 } }} />
                        <Chip label={categoryCounts.all} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6875rem' }} />
                    </ListItemButton>
                    {categories.map(cat => (
                        <ListItemButton
                            key={cat.id}
                            selected={selectedCategory === cat.id.toString()}
                            onClick={() => { setSelectedCategory(cat.id.toString()); setSidebarOpen(false) }}
                            sx={{ borderRadius: 20, mb: 0.5 }}
                        >
                            <ListItemText primary={cat.name} slotProps={{ primary: { fontSize: '0.875rem', fontWeight: 500 } }} />
                            <Chip label={categoryCounts[cat.id] || 0} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6875rem' }} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.disabled', display: 'block', mb: 2 }}>
                    Precio
                </Typography>
                <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue)}
                    min={priceBounds.min}
                    max={priceBounds.max}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    sx={{ mx: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Chip label={`$${priceRange[0].toLocaleString()}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center' }}>—</Typography>
                    <Chip label={`$${priceRange[1].toLocaleString()}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
                <FormControlLabel
                    control={<Switch checked={onlyPromo} onChange={() => setOnlyPromo(!onlyPromo)} size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 500 }}>🏷️ Solo en promoción</Typography>}
                    sx={{ width: '100%', mx: 0, px: 1.75, py: 1.5, border: 1, borderColor: onlyPromo ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: onlyPromo ? 'primary.light' : 'transparent' }}
                />
            </Box>

            <Box sx={{ mb: 2 }}>
                <FormControlLabel
                    control={<Switch checked={onlyFavorites} onChange={() => setOnlyFavorites(!onlyFavorites)} size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{onlyFavorites ? '❤️' : '🤍'} Solo mis favoritos</Typography>}
                    sx={{ width: '100%', mx: 0, px: 1.75, py: 1.5, border: 1, borderColor: onlyFavorites ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: onlyFavorites ? 'primary.light' : 'transparent' }}
                />
            </Box>

            {hasActiveFilters && (
                <Button fullWidth variant="text" color="error" size="small" onClick={clearFilters} sx={{ mt: 1 }}>
                    Limpiar filtros
                </Button>
            )}
        </Box>
    )

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Promo Banner */}
            <Box
                sx={{
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, #1e1b4b 0%, #4f46e5 40%, #7c3aed 60%, #1e1b4b 100%)'
                        : 'linear-gradient(90deg, #3730a3 0%, #6366f1 40%, #8b5cf6 60%, #3730a3 100%)',
                    backgroundSize: '200% 100%',
                    color: 'white',
                    textAlign: 'center',
                    py: 2,
                    px: 3,
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    minHeight: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: (theme) => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.35)'}`,
                    animation: 'promo-gradient-shift 4s ease infinite',
                    '@keyframes promo-gradient-shift': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                    },
                }}
            >
                {currentPromo ? (
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        animation: 'promo-slide-in 0.5s ease-out',
                        '@keyframes promo-slide-in': {
                            from: { opacity: 0, transform: 'translateY(-100%)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        },
                        maxWidth: '100%',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                        <Chip label="🔥 OFERTA" size="small" sx={{ bgcolor: '#f59e0b', color: 'white', fontWeight: 900, fontSize: '0.75rem' }} />
                        <Typography sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: 120, sm: 240 }, textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                            {currentPromo.name}
                        </Typography>
                        <Typography sx={{ textDecoration: 'line-through', opacity: 0.65, fontSize: '0.8125rem' }}>
                            ${currentPromo.price.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontWeight: 900, color: '#fde047', textShadow: '0 0 12px rgba(253, 224, 71, 0.6)' }}>
                            ${currentPromo.promo_price.toLocaleString()}
                        </Typography>
                        <Chip
                            label={`-${Math.round(((currentPromo.price - currentPromo.promo_price) / currentPromo.price) * 100)}%`}
                            size="small"
                            sx={{ bgcolor: 'rgba(245, 158, 11, 0.25)', color: '#fde047', fontWeight: 800, border: '1px solid rgba(245, 158, 11, 0.35)' }}
                        />
                        {promoProducts.length > 1 && (
                            <Typography sx={{ fontSize: '0.6875rem', opacity: 0.7 }}>
                                {promoIndex + 1}/{promoProducts.length}
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.9375rem' } }}>🚀 Envío gratis en pedidos sobre $100.000</Typography>
                )}
            </Box>

            {/* Top Bar */}
            <AppBar position="sticky" color="inherit" elevation={0} sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 15, 40, 0.82)' : 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(20px)',
            }}>
                <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 64 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexShrink: 0 }}>
                        <Box sx={{
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            '&:hover': { transform: 'scale(1.08) rotate(-4deg)' },
                        }}>
                            {store.logo_url ? (
                                <Box component="img" src={store.logo_url} alt={`${store.name} logo`} sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 1 }} />
                            ) : (
                                <StorefrontIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem' }, display: { xs: 'none', sm: 'block' } }}>
                                    {store.name}<span style={{ color: '#6366f1' }}>.</span>
                                </Typography>
                                {store.business_type === 'restaurant' && (
                                    <Chip label="🍽️ Restaurante" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700, fontSize: '0.625rem', height: 20, display: { xs: 'none', sm: 'flex' } }} />
                                )}
                            </Box>
                            {store.business_type === 'restaurant' && (store.address || store.schedule) && (
                                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1.5, alignItems: 'center' }}>
                                    {store.address && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                            <LocationOnIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>{store.address}</Typography>
                                        </Box>
                                    )}
                                    {store.schedule && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                            <ScheduleIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>{store.schedule}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Center Search - Desktop only */}
                    <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', maxWidth: 600, mx: 'auto' }}>
                        <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                            <SearchIcon sx={{ position: 'absolute', left: 13, color: 'text.disabled', pointerEvents: 'none' }} fontSize="small" />
                            <InputBase
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    pl: 4.5,
                                    pr: 2,
                                    py: 0.75,
                                    width: '100%',
                                    border: '1.5px solid',
                                    borderColor: 'divider',
                                    borderRadius: 20,
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem',
                                    '&.Mui-focused': {
                                        borderColor: 'primary.main',
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                        {/* Mobile filter button */}
                        <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { md: 'none' } }}>
                            <FilterListIcon />
                        </IconButton>
                        <IconButton onClick={() => setOnlyFavorites(!onlyFavorites)} color={onlyFavorites ? 'error' : 'default'} size="small">
                            {onlyFavorites ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                        <IconButton onClick={toggleCart} size="small">
                            <Badge badgeContent={cartTotalItems} color="error">
                                <ShoppingCartIcon fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Mobile overlay for sidebar */}
                {sidebarOpen && (
                    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 998, display: { md: 'none' } }} onClick={() => setSidebarOpen(false)} />
                )}

                {/* Desktop sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: 280,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 280,
                            boxSizing: 'border-box',
                            borderRight: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                            position: 'static',
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>

                {/* Mobile sidebar drawer */}
                <Drawer
                    variant="temporary"
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}
                >
                    {sidebarContent}
                </Drawer>

                {/* Content */}
                <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 }, bgcolor: 'background.default', overflow: 'hidden' }}>
                    {/* Mobile Category Chips */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, overflowX: 'auto', pb: 1.5, mb: 1.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                        <Chip label="🏷️ Todos" onClick={() => setSelectedCategory('all')} color={selectedCategory === 'all' ? 'primary' : 'default'} variant={selectedCategory === 'all' ? 'filled' : 'outlined'} size="small" sx={{ borderRadius: 20, flexShrink: 0 }} />
                        {categories.map(cat => (
                            <Chip key={cat.id} label={`${cat.name === 'Ropa' ? '👕' : cat.name === 'Calzado' ? '👟' : '📦'} ${cat.name}`} onClick={() => setSelectedCategory(cat.id.toString())} color={selectedCategory === cat.id.toString() ? 'primary' : 'default'} variant={selectedCategory === cat.id.toString() ? 'filled' : 'outlined'} size="small" sx={{ borderRadius: 20, flexShrink: 0 }} />
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', md: '1rem' } }}>{filteredProducts.length} productos</Typography>
                        <Typography variant="caption" color="text.disabled">Ordenar: <strong>Destacados</strong></Typography>
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(auto-fill, minmax(200px, 1fr))',
                            md: 'repeat(auto-fill, minmax(240px, 1fr))',
                        },
                        gap: { xs: 1.5, md: 2.75 },
                    }}>
                        {filteredProducts.map(product => {
                            const discount = product.promo_price ? Math.round(((product.price - product.promo_price) / product.price) * 100) : null
                            const isRestaurant = store?.business_type === 'restaurant'
                            const isSoldOut = !isRestaurant && product.stock <= 0
                            const hasToppingsConfig = product.toppings_config && parseToppingsConfig(product.toppings_config)
                            const noStockControl = isRestaurant && product.stock <= 0

                            return (
                                <Card
                                    key={product.id}
                                    sx={{
                                        position: 'relative',
                                        opacity: isSoldOut ? 0.6 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: { xs: 'none', md: 'translateY(-6px)' },
                                            boxShadow: { xs: 1, md: 6 },
                                        },
                                    }}
                                >
                                    {isSoldOut ? (
                                        <Chip label="Agotado" size="small" color="error" sx={{ position: 'absolute', top: 1, left: 1, zIndex: 1, fontWeight: 700 }} />
                                    ) : product.promo_price && (
                                        <Chip label="Oferta" size="small" color="primary" sx={{ position: 'absolute', top: 1, left: 1, zIndex: 1, fontWeight: 700 }} />
                                    )}

                                    {hasToppingsConfig && !isSoldOut && (
                                        <Chip label="🍕 Personalizable" size="small" sx={{ position: 'absolute', top: 1, left: 1, zIndex: 1, fontWeight: 700, bgcolor: '#f3e5f5', color: '#7b1fa2', fontSize: '0.625rem' }} />
                                    )}

                                    <IconButton
                                        onClick={(e) => toggleFavorite(product.id, e)}
                                        sx={{
                                            position: 'absolute',
                                            top: 1,
                                            right: 1,
                                            zIndex: 3,
                                            color: favorites.includes(product.id) ? '#ef5350' : 'text.secondary',
                                            bgcolor: 'background.paper',
                                            boxShadow: 1,
                                            '&:hover': { bgcolor: 'background.paper', transform: 'scale(1.15)' },
                                            width: { xs: 32, md: 36 },
                                            height: { xs: 32, md: 36 },
                                        }}
                                        size="small"
                                    >
                                        {favorites.includes(product.id) ? <FavoriteIcon sx={{ fontSize: { xs: 16, md: 20 } }} /> : <FavoriteBorderIcon sx={{ fontSize: { xs: 16, md: 20 } }} />}
                                    </IconButton>

                                    <Box sx={{
                                        height: { xs: 140, sm: 160, md: 190 },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'background.default',
                                        borderTopLeftRadius: 1,
                                        borderTopRightRadius: 1,
                                        position: 'relative',
                                        filter: isSoldOut ? 'grayscale(100%)' : 'none',
                                    }}>
                                        {product.image_url ? (
                                            <Box component="img" src={product.image_url} alt={product.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: 1 }} />
                                        ) : (
                                            <Box sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>📦</Box>
                                        )}

                                        {!isSoldOut && (
                                            <IconButton
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 1,
                                                    right: 1,
                                                    bgcolor: 'background.paper',
                                                    boxShadow: 2,
                                                    opacity: 0.85,
                                                    width: { xs: 30, md: 36 },
                                                    height: { xs: 30, md: 36 },
                                                    '&:hover': { bgcolor: 'primary.main', color: 'white', opacity: 1, transform: 'scale(1.12)' },
                                                }}
                                                size="small"
                                            >
                                                <ShoppingCartIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <CardContent sx={{ p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', flex: 1, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, fontSize: { xs: '0.625rem', md: '0.75rem' } }}>
                                            {categories.find(c => c.id === product.category_id)?.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 600,
                                            mb: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: { xs: 32, md: 40 },
                                            lineHeight: 1.35,
                                            textDecoration: isSoldOut ? 'line-through' : 'none',
                                            color: isSoldOut ? 'text.disabled' : 'text.primary',
                                            fontSize: { xs: '0.8125rem', md: '0.875rem' },
                                        }}>
                                            {product.name}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                            <Typography sx={{
                                                fontWeight: 800,
                                                fontSize: { xs: '0.9375rem', md: '1.125rem' },
                                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}>
                                                ${(product.promo_price || product.price).toLocaleString()}
                                            </Typography>
                                            {product.promo_price && (
                                                <>
                                                    <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: { xs: '0.625rem', md: '0.75rem' } }}>
                                                        ${product.price.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.625rem', md: '0.75rem' }, background: 'linear-gradient(135deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                                        -{discount}%
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>

                                        {!isRestaurant && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, mt: 'auto' }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isSoldOut ? 'error.main' : (product.stock < 5 ? 'warning.main' : 'success.main'), flexShrink: 0 }} />
                                                <Typography variant="caption" color={isSoldOut ? 'error.main' : 'text.disabled'} sx={{ fontWeight: 600, fontSize: { xs: '0.625rem', md: '0.75rem' } }}>
                                                    {isSoldOut ? 'Agotado' : `Disponibles: ${product.stock} u.`}
                                                </Typography>
                                            </Box>
                                        )}

                                        {isSoldOut ? (
                                            <Button variant="contained" disabled fullWidth sx={{ bgcolor: 'action.disabledBackground', fontSize: { xs: '0.75rem', md: '0.875rem' }, py: { xs: 0.75, md: 1 } }}>
                                                Sin Stock
                                            </Button>
                                        ) : (
                                            <Button variant="contained" fullWidth onClick={(e) => { e.stopPropagation(); addToCart(product); }} sx={{ mt: 'auto', fontSize: { xs: '0.75rem', md: '0.875rem' }, py: { xs: 0.75, md: 1 } }}>
                                                {isRestaurant ? 'Ordenar' : 'Carrito'}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </Box>

                    {filteredProducts.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 7.5, px: 2.5, bgcolor: 'background.default', borderRadius: 2, border: '1px dashed', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ fontSize: '3.375rem' }}>🔍</Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>No se encontraron productos</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
                                Prueba cambiando de categoría, buscando otros términos o desactivando los filtros activos.
                            </Typography>
                            {hasActiveFilters && (
                                <Button variant="outlined" onClick={clearFilters} sx={{ mt: 1, borderRadius: 20 }}>
                                    Restablecer Búsqueda
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 2, px: { xs: 2, md: 3.5 }, borderTop: 1, borderColor: 'divider', textAlign: 'center', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.disabled">
                    &copy; {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Powered by OSDOSOFT
                </Typography>
            </Box>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <Fab
                    color="success"
                    onClick={toggleCart}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 16, md: 24 },
                        right: { xs: 16, md: 24 },
                        zIndex: 999,
                        width: { xs: 50, md: 60 },
                        height: { xs: 50, md: 60 },
                        boxShadow: 3,
                        animation: 'cart-bounce 2.5s infinite ease-in-out',
                        '@keyframes cart-bounce': {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-8px)' },
                        },
                        '&:hover': { animation: 'none', transform: 'scale(1.1) translateY(-5px)' },
                    }}
                >
                    <Badge badgeContent={cartTotalItems} color="error">
                        <ShoppingCartIcon />
                    </Badge>
                </Fab>
            )}

            {/* Cart Drawer */}
            <Drawer
                anchor="right"
                open={cartOpen}
                onClose={toggleCart}
                PaperProps={{ sx: { width: '100%', maxWidth: 420 } }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                            🛒 Mi Carrito
                            <Chip label={cartTotalItems} size="small" color="primary" sx={{ fontWeight: 700 }} />
                        </Typography>
                        <IconButton onClick={toggleCart} size="small"><CloseIcon /></IconButton>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 2.5 } }}>
                        {cart.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5, color: 'text.disabled' }}>
                                <Box sx={{ fontSize: '3rem', mb: 2 }}>🛒</Box>
                                <Typography>Tu carrito está vacío</Typography>
                                <Button variant="contained" onClick={toggleCart} sx={{ mt: 1.5 }}>Seguir explorando</Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {cart.map((item, idx) => {
                                    const basePrice = item.promo_price || item.price
                                    const toppingsStr = item.selected_toppings
                                    let toppingsDisplay = null
                                    if (toppingsStr) {
                                        try {
                                            const toppings = JSON.parse(toppingsStr)
                                            toppingsDisplay = Object.entries(toppings)
                                                .filter(([, names]) => names && names.length > 0)
                                                .map(([groupId, names]) => {
                                                    const config = parseToppingsConfig(products.find(p => p.id === item.id)?.toppings_config)
                                                    const group = config?.find(g => g.id === groupId)
                                                    return `${group?.label || groupId}: ${names.join(', ')}`
                                                })
                                        } catch (e) { }
                                    }

                                    return (
                                        <Box key={`${item.id}-${item.selected_size}-${item.selected_toppings}-${idx}`} sx={{ display: 'flex', gap: 1.5, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                                            <Box sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {item.image_url ? (
                                                    <Box component="img" src={item.image_url} alt={item.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <Box sx={{ fontSize: '1.5rem' }}>📦</Box>
                                                )}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{item.name}</Typography>
                                                {item.selected_size && (
                                                    <Chip label={`Talla: ${item.selected_size}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.6875rem', mb: 0.5, mr: 0.5 }} />
                                                )}
                                                {toppingsDisplay && toppingsDisplay.length > 0 && (
                                                    <Box sx={{ mb: 0.5 }}>
                                                        {toppingsDisplay.map((line, i) => (
                                                            <Typography key={i} variant="caption" color="primary.main" sx={{ display: 'block', fontSize: '0.625rem', fontWeight: 600 }}>
                                                                🍕 {line}
                                                            </Typography>
                                                        ))}
                                                        {item.extra_price > 0 && (
                                                            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700, fontSize: '0.625rem' }}>
                                                                +${item.extra_price.toLocaleString()} extra
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                                        ${((basePrice + (item.extra_price || 0)) * item.quantity).toLocaleString()}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: 1, borderColor: 'divider', borderRadius: 20, px: 1, bgcolor: 'background.default' }}>
                                                        <IconButton size="small" onClick={() => updateCartItemQty(item.id, item.selected_size, item.selected_toppings, -1)}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography sx={{ fontWeight: 700, minWidth: 16, textAlign: 'center', fontSize: '0.8125rem' }}>{item.quantity}</Typography>
                                                        <IconButton size="small" onClick={() => updateCartItemQty(item.id, item.selected_size, item.selected_toppings, 1)} disabled={item.quantity >= item.stock}><AddIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <IconButton size="small" onClick={() => removeCartItem(item.id, item.selected_size, item.selected_toppings)} sx={{ color: 'error.main', alignSelf: 'center' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )
                                })}
                            </Box>
                        )}
                    </Box>

                    {cart.length > 0 && (
                        <Box sx={{ p: { xs: 2, md: 2.5 }, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                                <TextField
                                    size="small"
                                    label="Nombre completo *"
                                    placeholder="Ej. Juan Pérez"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    size="small"
                                    label="Teléfono móvil (opcional)"
                                    placeholder="Ej. +34 600 000 000"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    size="small"
                                    label="Dirección de entrega"
                                    placeholder="Calle 123 #45-67, Barrio, Ciudad"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    size="small"
                                    label="Notas adicionales (opcional)"
                                    placeholder="Ej. Sin cebolla, timbre 3A, etc."
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total a pagar:</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                                    ${cartSubtotal.toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5, textAlign: 'center', fontSize: '0.6875rem' }}>
                                * El valor no contempla los costos de envío o domicilio
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleCheckout}
                                sx={{
                                    bgcolor: '#25D366',
                                    '&:hover': { bgcolor: '#128C7E' },
                                    py: 1.75,
                                    fontWeight: 700,
                                    gap: 1,
                                }}
                            >
                                Finalizar pedido por WhatsApp
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* Size Selection Modal */}
            <Dialog
                open={!!sizeModalProduct}
                onClose={() => setSizeModalProduct(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Seleccionar Talla
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Elige una talla para <strong>{sizeModalProduct?.name}</strong> antes de agregarlo al carrito.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {sizeModalProduct && (() => {
                            const parsedSizes = parseSizes(sizeModalProduct.sizes, sizeModalProduct.stock) || {}
                            const sizeKeys = Object.keys(parsedSizes).filter(Boolean)
                            return sizeKeys.map(size => {
                                const sizeStock = parsedSizes[size] ?? 0
                                const isOutOfStock = sizeStock <= 0
                                const isSelected = selectedSizeForModal === size
                                return (
                                    <Chip
                                        key={size}
                                        label={<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}><span>{size}</span><span style={{ fontSize: '0.5625rem', fontWeight: 500, marginTop: 2, color: isSelected ? '#2e7d32' : (isOutOfStock ? '#ef4444' : 'inherit') }}>{isOutOfStock ? 'Agotado' : `${sizeStock} u.`}</span></Box>}
                                        onClick={() => !isOutOfStock && setSelectedSizeForModal(size)}
                                        disabled={isOutOfStock}
                                        color={isSelected ? 'success' : 'default'}
                                        variant={isSelected ? 'filled' : 'outlined'}
                                        sx={{ minWidth: 60, height: 'auto', py: 0.5, opacity: isOutOfStock ? 0.5 : 1 }}
                                    />
                                )
                            })
                        })()}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => addToCart(sizeModalProduct, selectedSizeForModal)}
                        disabled={!selectedSizeForModal}
                        sx={{ py: 1.5 }}
                    >
                        Confirmar y Agregar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toppings Selection Modal */}
            <Dialog
                open={!!toppingModalProduct}
                onClose={() => { setToppingModalProduct(null); setToppingConfig(null); setToppingSelections({}); setToppingExtraPrice(0); }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    🍕 Personaliza tu {toppingModalProduct?.name}
                </DialogTitle>
                <DialogContent>
                    {toppingConfig && toppingConfig.map((group) => {
                        const selected = toppingSelections[group.id] || []
                        const isAtMax = group.max > 0 && selected.length >= group.max
                        const isAtMin = group.required && (group.min || 1) > 0 && selected.length > 0

                        return (
                            <Box key={group.id} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                    {group.label || 'Grupo'}
                                    {group.required && <span style={{ color: '#ef4444' }}> *</span>}
                                    <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1, fontWeight: 500 }}>
                                        ({group.max > 0 ? selected.length + '/' + group.max : selected.length} seleccionados)
                                    </Typography>
                                </Typography>
                                {group.min > 0 && group.required && selected.length < group.min && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                        Selecciona al menos {group.min} opción(es)
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {group.options.map((opt) => {
                                        const isSelected = selected.includes(opt.name)
                                        return (
                                            <Chip
                                                key={opt.name}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.5 }}>
                                                        <span>{opt.name}</span>
                                                        {opt.price > 0 && (
                                                            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#f59e0b' }}>
                                                                +${opt.price.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </Box>
                                                }
                                                onClick={() => handleToppingToggle(group.id, opt.name)}
                                                color={isSelected ? 'primary' : 'default'}
                                                variant={isSelected ? 'filled' : 'outlined'}
                                                disabled={!isSelected && isAtMax}
                                                sx={{
                                                    borderRadius: 20,
                                                    opacity: !isSelected && isAtMax ? 0.5 : 1,
                                                }}
                                            />
                                        )
                                    })}
                                </Box>
                            </Box>
                        )
                    })}

                    {toppingExtraPrice > 0 && (
                        <Box sx={{ p: 2, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>💵 Costo adicional por toppings:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                                +${toppingExtraPrice.toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => { setToppingModalProduct(null); setToppingConfig(null); setToppingSelections({}); setToppingExtraPrice(0); }}
                        sx={{ py: 1.5 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={confirmToppingsAndAddToCart}
                        sx={{ py: 1.5 }}
                    >
                        Agregar al Carrito
                        {toppingExtraPrice > 0 && ` (+$${toppingExtraPrice.toLocaleString()})`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add to Cart Toast */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={2000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MuiAlert
                    onClose={() => setToastOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%', fontWeight: 600 }}
                >
                    🛒 {toastMessage}
                </MuiAlert>
            </Snackbar>
        </Box>
    )
}

export default Catalog