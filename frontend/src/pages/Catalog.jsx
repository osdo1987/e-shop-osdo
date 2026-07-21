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
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { alpha } from '@mui/material/styles'
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
import HomeIcon from '@mui/icons-material/Home'
import CategoryIcon from '@mui/icons-material/Category'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PersonIcon from '@mui/icons-material/Person'

const parseSizes = (sizesStr, overallStock) => {
    if (!sizesStr) return null
    try {
        const parsed = JSON.parse(sizesStr)
        // Array format: [{"name":"X","price":"Y","stock":"Z"}, ...]
        if (Array.isArray(parsed)) {
            const map = {}
            parsed.forEach(s => {
                if (s.name) map[s.name] = { stock: parseInt(s.stock) || 0, price: parseFloat(s.price) || 0 }
            })
            return map
        }
        // Dict format (legacy): {"X": stock}
        if (typeof parsed === 'object') {
            const map = {}
            Object.entries(parsed).forEach(([k, v]) => {
                map[k] = { stock: typeof v === 'number' ? v : parseInt(v) || 0, price: 0 }
            })
            return map
        }
        return null
    } catch (e) {
        // Comma-separated legacy format
        const map = {}
        sizesStr.split(',').forEach(s => {
            const cleanS = s.trim()
            if (cleanS) {
                map[cleanS] = { stock: Math.max(0, Math.min(10, overallStock || 0)), price: 0 }
            }
        })
        return Object.keys(map).length > 0 ? map : null
    }
}

const getSizePrice = (sizesStr, sizeName, fallbackPrice) => {
    if (!sizesStr || !sizeName) return fallbackPrice
    try {
        const parsed = JSON.parse(sizesStr)
        if (Array.isArray(parsed)) {
            const found = parsed.find(s => s.name === sizeName)
            if (found && parseFloat(found.price) > 0) return parseFloat(found.price)
        }
    } catch { }
    return fallbackPrice
}

const parseToppingsConfig = (toppingsConfigStr) => {
    if (!toppingsConfigStr) return null
    try {
        const config = JSON.parse(toppingsConfigStr)
        // Handle wrapped format: {groups: [...]}
        if (config && Array.isArray(config.groups)) return config.groups
        // Handle flat array format (legacy)
        if (Array.isArray(config)) return config
        return null
    } catch (e) {
        console.error("Error parsing toppings_config:", e)
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
        config.forEach((group, idx) => {
            const groupId = group.id || `group_${idx}`
            initialSelections[groupId] = []
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
            const group = toppingConfig?.find(g => (g.id || `group_${toppingConfig.indexOf(g)}`) === groupId)
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
            const groupId = g.id || `group_${toppingConfig.indexOf(g)}`
            const selected = toppingSelections[groupId] || []
            const min = g.min || 1
            return selected.length < min
        })

        if (missingRequired && missingRequired.length > 0) {
            const label = missingRequired[0].label || missingRequired[0].group_name || 'Grupo'
            alert(`Debes seleccionar al menos ${missingRequired[0].min || 1} opción en: ${label}`)
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
        const sizeStock = parsedSizes && size ? (parsedSizes[size]?.stock ?? 0) : product.stock
        const basePrice = product.promo_price || product.price
        const itemPrice = size ? getSizePrice(product.sizes, size, basePrice) : basePrice

        const toppingsKey = toppings ? JSON.stringify(toppings) : null

        setCart(currentCart => {
            const existingItemIndex = currentCart.findIndex(
                item => item.id === product.id && item.selected_size === size && item.selected_toppings === toppingsKey
            )
            if (existingItemIndex > -1) {
                return currentCart.map((item, idx) =>
                    idx === existingItemIndex
                        ? { ...item, quantity: Math.min(item.quantity + 1, sizeStock || Infinity) }
                        : item
                )
            } else {
                return [...currentCart, {
                    id: product.id,
                    name: product.name,
                    price: itemPrice,
                    promo_price: product.promo_price,
                    image_url: product.image_url,
                    selected_size: size,
                    selected_toppings: toppingsKey,
                    extra_price: extraPrice,
                    quantity: 1,
                    stock: sizeStock,
                    manage_stock: product.manage_stock !== false,
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
            } else if (item.manage_stock !== false && item.stock > 0 && newQty > item.stock) {
                // Only check stock limit if manage_stock is true and stock > 0
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
            const sizeStr = item.selected_size ? ` (${item.selected_size})` : ''
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
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <StorefrontIcon fontSize="small" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Cargando<Box component="span" sx={{ color: 'primary.main' }}>.</Box></Typography>
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

    const isRestaurant = store?.business_type === 'restaurant'

    const filterDrawerContent = (
        <Box sx={{ p: 2.5, width: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Filtros</Typography>
                <IconButton size="small" onClick={() => setSidebarOpen(false)}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'on-surface-variant', display: 'block', mb: 1.5, fontSize: '0.75rem' }}>
                    Categoría
                </Typography>
                <List dense disablePadding>
                    <ListItemButton
                        selected={selectedCategory === 'all'}
                        onClick={() => setSelectedCategory('all')}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            px: 1.5,
                            py: 0.75,
                            '&.Mui-selected': {
                                bgcolor: 'primary-container',
                                color: 'on-primary-container',
                                '&:hover': { bgcolor: 'primary-container' },
                            },
                        }}
                    >
                        <ListItemText primary="Todos" slotProps={{ primary: { fontSize: '0.875rem', fontWeight: 500 } }} />
                        <Chip label={categoryCounts.all} size="small" sx={{ fontWeight: 700, fontSize: '0.6875rem', height: 22, bgcolor: 'surface-container-high', color: 'on-surface-variant' }} />
                    </ListItemButton>
                    {categories.map(cat => (
                        <ListItemButton
                            key={cat.id}
                            selected={selectedCategory === cat.id.toString()}
                            onClick={() => setSelectedCategory(cat.id.toString())}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                px: 1.5,
                                py: 0.75,
                                '&.Mui-selected': {
                                    bgcolor: 'primary-container',
                                    color: 'on-primary-container',
                                    '&:hover': { bgcolor: 'primary-container' },
                                },
                            }}
                        >
                            <ListItemText primary={cat.name} slotProps={{ primary: { fontSize: '0.875rem', fontWeight: 500 } }} />
                            <Chip label={categoryCounts[cat.id] || 0} size="small" sx={{ fontWeight: 700, fontSize: '0.6875rem', height: 22, bgcolor: 'surface-container-high', color: 'on-surface-variant' }} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'on-surface-variant', display: 'block', mb: 1.5, fontSize: '0.75rem' }}>
                    Rango de precio
                </Typography>
                <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue)}
                    min={priceBounds.min}
                    max={priceBounds.max}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    sx={{ mx: 0.5 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Chip label={`$${priceRange[0].toLocaleString()}`} size="small" sx={{ fontWeight: 600, fontSize: '0.6875rem', bgcolor: 'surface-container', color: 'on-surface-variant' }} />
                    <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center' }}>—</Typography>
                    <Chip label={`$${priceRange[1].toLocaleString()}`} size="small" sx={{ fontWeight: 600, fontSize: '0.6875rem', bgcolor: 'surface-container', color: 'on-surface-variant' }} />
                </Box>
            </Box>

            <Box sx={{ mb: 1.5 }}>
                <FormControlLabel
                    control={<Switch checked={onlyPromo} onChange={() => setOnlyPromo(!onlyPromo)} size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Solo en promoción</Typography>}
                    sx={{ width: '100%', mx: 0, px: 1.5, py: 1, border: '1px solid', borderColor: onlyPromo ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: onlyPromo ? 'rgba(0,74,198,0.04)' : 'transparent' }}
                />
            </Box>

            <Box sx={{ mb: 2 }}>
                <FormControlLabel
                    control={<Switch checked={onlyFavorites} onChange={() => setOnlyFavorites(!onlyFavorites)} size="small" />}
                    label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Solo mis favoritos</Typography>}
                    sx={{ width: '100%', mx: 0, px: 1.5, py: 1, border: '1px solid', borderColor: onlyFavorites ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: onlyFavorites ? 'rgba(0,74,198,0.04)' : 'transparent' }}
                />
            </Box>

            {hasActiveFilters && (
                <Button fullWidth variant="outlined" color="error" size="small" onClick={clearFilters} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                    Limpiar filtros
                </Button>
            )}
        </Box>
    )

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', pb: { xs: '80px', md: 0 } }}>
            <Box sx={{ width: '100%' }}>
                {/* Hero Banner - left gradient overlay */}
                <Box sx={{ position: 'relative', width: '100%', height: { xs: 256, md: 320 }, overflow: 'hidden' }}>
                    {currentPromo && currentPromo.image_url ? (
                        <Box component="img" src={currentPromo.image_url} alt={currentPromo.name} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Box sx={{
                            position: 'absolute', inset: 0,
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #1e1b4b 0%, #004ac6 50%, #2563eb 100%)'
                                : 'linear-gradient(135deg, #003ea8 0%, #004ac6 50%, #2563eb 100%)',
                        }} />
                    )}
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        background: (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 60%)'
                            : 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 50%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 3, md: 6 },
                    }}>
                        {currentPromo ? (
                            <Box key={promoIndex} sx={{ animation: 'promo-fade-in 0.5s ease-out', '@keyframes promo-fade-in': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                                <Typography sx={{ color: 'primary-fixed', fontWeight: 800, fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
                                    OFERTA
                                </Typography>
                                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '1.75rem', md: '2.5rem' }, lineHeight: 1.1, mb: 1 }}>
                                    {currentPromo.name}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.875rem', md: '1rem' }, mb: 3, maxWidth: 320 }}>
                                    Hasta {Math.round(((currentPromo.price - currentPromo.promo_price) / currentPromo.price) * 100)}% de descuento en productos seleccionados
                                </Typography>
                                <Button
                                    onClick={() => {
                                        const el = document.getElementById('product-grid')
                                        el?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                    sx={{
                                        bgcolor: 'primary-container',
                                        color: 'on-primary-container',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        alignSelf: 'flex-start',
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                                        '&:hover': { bgcolor: 'primary.main' },
                                    }}
                                >
                                    Ver Ofertas
                                </Button>
                                {promoProducts.length > 1 && (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', mt: 2 }}>
                                        {promoIndex + 1} / {promoProducts.length}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Box>
                                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.75rem' }, mb: 0.5 }}>
                                    Envío gratis en pedidos sobre $100.000
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.8125rem', md: '0.9375rem' } }}>
                                    Explora nuestro catálogo y encuentra las mejores ofertas
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Store Info */}
                <Box sx={{ px: { xs: 2, md: 3 }, mt: 2.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        {store.logo_url && (
                            <Box component="img" src={store.logo_url} alt={`${store.name} logo`} sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'contain', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: 0.5 }} />
                        )}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'on-surface' }}>
                                    {store.name}
                                </Typography>
                                {isRestaurant && (
                                    <Chip label="Restaurante" size="small" sx={{ bgcolor: 'secondary-container', color: 'on-secondary-container', fontWeight: 600, fontSize: '0.625rem', height: 20 }} />
                                )}
                            </Box>
                            {store.address && (
                                <Typography variant="caption" sx={{ color: 'on-surface-variant', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                    <LocationOnIcon sx={{ fontSize: 14 }} />
                                    {store.address}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box sx={{ px: { xs: 2, md: 3 }, mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                        <SearchIcon sx={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'on-surface-variant', pointerEvents: 'none' }} />
                        <InputBase
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                pl: 5,
                                pr: 2,
                                py: 1.5,
                                width: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'surface-container-low',
                                fontSize: '0.875rem',
                                '&.Mui-focused': {
                                    borderColor: 'primary.main',
                                    boxShadow: '0 0 0 3px rgba(0, 74, 198, 0.12)',
                                    bgcolor: 'background.paper',
                                },
                            }}
                        />
                    </Box>
                </Box>

                {/* Categories - horizontal chips (all viewports) */}
                <Box sx={{ px: { xs: 2, md: 3 }, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'on-surface' }}>Categorías</Typography>
                        <Button
                            size="small"
                            onClick={() => setSidebarOpen(true)}
                            sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                            Filtrar
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                        <Chip
                            label="Todos"
                            onClick={() => setSelectedCategory('all')}
                            icon={<CategoryIcon sx={{ fontSize: 18, color: selectedCategory === 'all' ? 'on-primary-container' : 'on-surface-variant' }} />}
                            sx={{
                                flexShrink: 0,
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                px: 1.5,
                                height: 40,
                                borderRadius: 'full',
                                bgcolor: selectedCategory === 'all' ? 'primary-container' : 'surface-container-high',
                                color: selectedCategory === 'all' ? 'on-primary-container' : 'on-surface-variant',
                                '&:hover': { bgcolor: selectedCategory === 'all' ? 'primary-container' : 'surface-container-highest' },
                                '& .MuiChip-icon': { m: 0 },
                            }}
                        />
                        {categories.map(cat => (
                            <Chip
                                key={cat.id}
                                label={cat.name}
                                onClick={() => setSelectedCategory(cat.id.toString())}
                                sx={{
                                    flexShrink: 0,
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    px: 1.5,
                                    height: 40,
                                    borderRadius: 'full',
                                    bgcolor: selectedCategory === cat.id.toString() ? 'primary-container' : 'surface-container-high',
                                    color: selectedCategory === cat.id.toString() ? 'on-primary-container' : 'on-surface-variant',
                                    '&:hover': { bgcolor: selectedCategory === cat.id.toString() ? 'primary-container' : 'surface-container-highest' },
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Product Grid Section */}
                <Box sx={{ px: { xs: 2, md: 3 }, pb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: 'on-surface' }}>{filteredProducts.length} productos</Typography>
                    </Box>

                    <Box id="product-grid" sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                        },
                        gap: 3,
                    }}>
                        {filteredProducts.map(product => {
                            const discount = product.promo_price ? Math.round(((product.price - product.promo_price) / product.price) * 100) : null
                            const managesStock = product.manage_stock !== false
                            const isSoldOut = managesStock && product.stock <= 0
                            const hasToppingsConfig = product.toppings_config && parseToppingsConfig(product.toppings_config)

                            const hasSizes = product.sizes && parseSizes(product.sizes, product.stock)
                            const sizeList = hasSizes ? parseSizes(product.sizes, product.stock) : null
                            const sizeCount = sizeList ? Object.keys(sizeList).filter(Boolean).length : 0
                            const sizePriceMin = hasSizes ? (() => {
                                const sizes = parseSizes(product.sizes, product.stock)
                                if (!sizes) return null
                                const prices = Object.values(sizes).map(s => s.price || 0).filter(p => p > 0)
                                return prices.length > 0 ? Math.min(...prices) : null
                            })() : null

                            return (
                                <Box
                                    key={product.id}
                                    sx={{
                                        position: 'relative',
                                        bgcolor: 'background.paper',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'outline-variant',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'box-shadow 0.3s ease',
                                        opacity: isSoldOut ? 0.6 : 1,
                                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                                    }}
                                >
                                    {/* Badges */}
                                    {isSoldOut && (
                                        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, bgcolor: 'error', color: 'on-error', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.625rem', px: 1.25, py: 0.5, borderRadius: 'full', letterSpacing: '0.05em' }}>
                                            Agotado
                                        </Box>
                                    )}
                                    {!isSoldOut && product.promo_price && (
                                        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, bgcolor: 'tertiary-container', color: 'on-tertiary-container', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.625rem', px: 1.25, py: 0.5, borderRadius: 'full', letterSpacing: '0.05em' }}>
                                            Oferta
                                        </Box>
                                    )}
                                    {hasToppingsConfig && !isSoldOut && !product.promo_price && (
                                        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1, bgcolor: 'tertiary-container', color: 'on-tertiary-container', textTransform: 'uppercase', fontWeight: 900, fontSize: '0.625rem', px: 1.25, py: 0.5, borderRadius: 'full', letterSpacing: '0.05em' }}>
                                            Personalizable
                                        </Box>
                                    )}

                                    {/* Favorite button */}
                                    <IconButton
                                        onClick={(e) => toggleFavorite(product.id, e)}
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            zIndex: 3,
                                            color: favorites.includes(product.id) ? 'error.main' : 'on-surface-variant',
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            backdropFilter: 'blur(8px)',
                                            width: 36,
                                            height: 36,
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                                        }}
                                        size="small"
                                    >
                                        {favorites.includes(product.id) ? <FavoriteIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
                                    </IconButton>

                                    {/* Image */}
                                    <Box sx={{
                                        height: { xs: 180, md: 224 },
                                        bgcolor: 'surface-container-low',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        filter: isSoldOut ? 'grayscale(100%)' : 'none',
                                        overflow: 'hidden',
                                    }}>
                                        {product.image_url ? (
                                            <Box
                                                component="img"
                                                src={product.image_url}
                                                alt={product.name}
                                                className="product-img"
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s ease',
                                                    '&:hover': { transform: 'scale(1.05)' },
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{ fontSize: '2.5rem', color: 'text.disabled' }}>📦</Box>
                                        )}
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '1rem',
                                                    lineHeight: 1.3,
                                                    color: isSoldOut ? 'text.disabled' : 'on-surface',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textDecoration: isSoldOut ? 'line-through' : 'none',
                                                }}
                                            >
                                                {product.name}
                                            </Typography>
                                            <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                                                {hasSizes && sizePriceMin ? (
                                                    <>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>
                                                            Desde
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}>
                                                            ${sizePriceMin.toLocaleString()}
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}>
                                                        ${(product.promo_price || product.price).toLocaleString()}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {product.promo_price && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'on-surface-variant', fontSize: '0.75rem' }}>
                                                    ${product.price.toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'tertiary' }}>
                                                    -{discount}%
                                                </Typography>
                                            </Box>
                                        )}

                                        {product.description && (
                                            <Typography variant="caption" sx={{ color: 'on-surface-variant', fontSize: '0.8125rem', lineHeight: 1.5, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {product.description}
                                            </Typography>
                                        )}

                                        {hasSizes && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                                                {Object.keys(parseSizes(product.sizes, product.stock) || {}).filter(Boolean).map(sizeKey => (
                                                    <Typography key={sizeKey} variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
                                                        {sizeKey}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}

                                        {managesStock && (
                                            <Typography variant="caption" sx={{ color: isSoldOut ? 'error.main' : 'on-surface-variant', fontWeight: 500, fontSize: '0.75rem', mb: 1.5 }}>
                                                {isSoldOut ? 'Agotado' : `Stock: ${product.stock} u.`}
                                            </Typography>
                                        )}

                                        {/* Add to cart button */}
                                        <Box sx={{ mt: 'auto' }}>
                                            {isSoldOut ? (
                                                <Button variant="contained" disabled fullWidth sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1.5, fontSize: '0.875rem' }}>
                                                    Sin Stock
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                    startIcon={<ShoppingCartIcon sx={{ fontSize: '20px !important' }} />}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        py: 1.5,
                                                        fontSize: '0.875rem',
                                                        bgcolor: 'primary-container',
                                                        color: 'on-primary-container',
                                                        '&:hover': { bgcolor: 'primary.main', color: 'on-primary' },
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    {isRestaurant ? 'Ordenar' : 'Añadir al carrito'}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>

                    {filteredProducts.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 7, px: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ fontSize: '3rem', color: 'text.disabled' }}>🔍</Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'on-surface' }}>No se encontraron productos</Typography>
                            <Typography variant="body2" color="on-surface-variant" sx={{ maxWidth: 340 }}>
                                Prueba cambiando de categoría, buscando otros términos o desactivando los filtros activos.
                            </Typography>
                            {hasActiveFilters && (
                                <Button variant="outlined" onClick={clearFilters} sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                                    Restablecer Búsqueda
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 3, px: { xs: 2, md: 3.5 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'surface-container-low', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mt: 'auto' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'on-surface', fontSize: '0.875rem' }}>
                    &copy; {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Powered by OSDOSOFT
                </Typography>
            </Box>

            {/* Mobile Bottom Nav */}
            <Box
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    px: 1,
                    pt: 0.75,
                    pb: 1,
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                }}
            >
                {[
                    { label: 'Inicio', icon: <HomeIcon />, active: false },
                    { label: 'Catálogo', icon: <CategoryIcon />, active: true },
                    { label: 'Pedidos', icon: <ReceiptLongIcon />, active: false },
                    { label: 'Cuenta', icon: <PersonIcon />, active: false },
                ].map(item => (
                    <Box
                        key={item.label}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.25,
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: item.active ? 'primary-container' : 'transparent',
                            color: item.active ? 'on-primary-container' : 'on-surface-variant',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {item.icon}
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: item.active ? 700 : 500 }}>{item.label}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Mobile FAB Cart */}
            {cart.length > 0 && (
                <Box
                    onClick={toggleCart}
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        position: 'fixed',
                        bottom: 88,
                        right: 24,
                        zIndex: 50,
                        width: 64,
                        height: 64,
                        borderRadius: 'full',
                        bgcolor: 'tertiary-container',
                        color: 'on-tertiary-container',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '4px solid',
                        borderColor: 'background.default',
                        transition: 'all 0.2s ease',
                        '&:active': { transform: 'scale(0.95)' },
                    }}
                >
                    <Badge
                        badgeContent={cartTotalItems}
                        color="error"
                        sx={{ position: 'absolute', top: -4, right: -4, '& .MuiBadge-badge': { fontSize: '0.75rem', fontWeight: 700, minWidth: 20, height: 20 } }}
                    >
                        <ShoppingCartIcon sx={{ fontSize: 28 }} />
                    </Badge>
                </Box>
            )}

            {/* Desktop FAB Cart */}
            {cart.length > 0 && (
                <Fab
                    onClick={toggleCart}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 50,
                        width: 60,
                        height: 60,
                        bgcolor: 'primary-container',
                        color: 'on-primary-container',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                        '&:hover': { bgcolor: 'primary.main', color: 'on-primary' },
                    }}
                >
                    <Badge badgeContent={cartTotalItems} color="error">
                        <ShoppingCartIcon />
                    </Badge>
                </Fab>
            )}

            {/* Filter Drawer (mobile + desktop) */}
            {sidebarOpen && (
                <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 998 }} onClick={() => setSidebarOpen(false)} />
            )}
            <Drawer
                anchor="right"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                slotProps={{ paper: { sx: { width: 300, bgcolor: 'background.paper' } } }}
            >
                {filterDrawerContent}
            </Drawer>

            {/* Cart Drawer */}
            <Drawer
                anchor="right"
                open={cartOpen}
                onClose={toggleCart}
                slotProps={{ paper: { sx: { width: '100%', maxWidth: 420 } } }}
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
                                <Button variant="contained" onClick={toggleCart} sx={{ mt: 1.5, bgcolor: 'primary-container', color: 'on-primary-container', '&:hover': { bgcolor: 'primary.main' } }}>Seguir explorando</Button>
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
                                            <Box sx={{ width: 60, height: 60, borderRadius: 1.5, overflow: 'hidden', bgcolor: 'surface-container-low', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {item.image_url ? (
                                                    <Box component="img" src={item.image_url} alt={item.name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <Box sx={{ fontSize: '1.5rem' }}>📦</Box>
                                                )}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{item.name}</Typography>
                                                {item.selected_size && (
                                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.6875rem', mr: 1 }}>
                                                        {item.selected_size}
                                                    </Typography>
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
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: 1, borderColor: 'divider', borderRadius: 20, px: 1, bgcolor: 'surface-container-low' }}>
                                                        <IconButton size="small" onClick={() => updateCartItemQty(item.id, item.selected_size, item.selected_toppings, -1)}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography sx={{ fontWeight: 700, minWidth: 16, textAlign: 'center', fontSize: '0.8125rem' }}>{item.quantity}</Typography>
                                                        <IconButton size="small" onClick={() => updateCartItemQty(item.id, item.selected_size, item.selected_toppings, 1)} disabled={item.manage_stock !== false && item.stock > 0 && item.quantity >= item.stock}><AddIcon fontSize="small" /></IconButton>
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
                        <Box sx={{ p: { xs: 2, md: 2.5 }, borderTop: 1, borderColor: 'divider', bgcolor: 'surface-container-low' }}>
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
                slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'visible' } } }}
            >
                <Box sx={{
                    position: 'absolute',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    zIndex: 1,
                }}>
                    📏
                </Box>
                <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 4, pb: 0.5 }}>
                    {sizeModalProduct?.name}
                </DialogTitle>
                <DialogContent sx={{ pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3, fontSize: '0.875rem' }}>
                        Selecciona una presentación
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {sizeModalProduct && (() => {
                            const parsedSizes = parseSizes(sizeModalProduct.sizes, sizeModalProduct.stock) || {}
                            const sizeKeys = Object.keys(parsedSizes).filter(Boolean)
                            const managesStock = sizeModalProduct.manage_stock !== false
                            return sizeKeys.map(size => {
                                const sizeData = parsedSizes[size] || {}
                                const sizeStock = sizeData.stock ?? 0
                                const sizePrice = sizeData.price || 0
                                const isOutOfStock = managesStock && sizeStock <= 0
                                const isSelected = selectedSizeForModal === size
                                return (
                                    <Box
                                        key={size}
                                        onClick={() => !isOutOfStock && setSelectedSizeForModal(size)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            borderRadius: 2,
                                            border: '2px solid',
                                            borderColor: isSelected ? 'primary.main' : 'divider',
                                            bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.06) : 'transparent',
                                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                            opacity: isOutOfStock ? 0.5 : 1,
                                            transition: 'all 0.2s ease',
                                            '&:hover': !isOutOfStock ? {
                                                borderColor: 'primary.main',
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                            } : {},
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: isSelected ? 'primary.main' : 'action.hover',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isSelected ? 'white' : 'text.secondary',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                transition: 'all 0.2s',
                                            }}>
                                                {isSelected ? '✓' : size.charAt(0).toUpperCase()}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                                                    {size}
                                                </Typography>
                                                <Typography variant="caption" color={isOutOfStock ? 'error.main' : 'text.secondary'} sx={{ fontWeight: 500, fontSize: '0.6875rem' }}>
                                                    {isOutOfStock ? 'Agotado' : managesStock ? `${sizeStock} disponibles` : 'Disponible'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            {sizePrice > 0 && (
                                                <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: isSelected ? 'primary.main' : 'text.primary' }}>
                                                    ${sizePrice.toLocaleString()}
                                                </Typography>
                                            )}
                                            {isSelected && (
                                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.625rem' }}>
                                                    Seleccionado
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )
                            })
                        })()}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexDirection: 'column' }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => addToCart(sizeModalProduct, selectedSizeForModal)}
                        disabled={!selectedSizeForModal}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.9375rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:disabled': { background: 'action.disabledBackground' },
                        }}
                    >
                        Agregar al carrito
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => setSizeModalProduct(null)}
                        sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                    >
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toppings Selection Modal */}
            <Dialog
                open={!!toppingModalProduct}
                onClose={() => { setToppingModalProduct(null); setToppingConfig(null); setToppingSelections({}); setToppingExtraPrice(0); }}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    🍕 Personaliza tu {toppingModalProduct?.name}
                </DialogTitle>
                <DialogContent>
                    {toppingConfig && toppingConfig.map((group) => {
                        const groupId = group.id || `group_${toppingConfig.indexOf(group)}`
                        const selected = toppingSelections[groupId] || []
                        const isAtMax = group.max > 0 && selected.length >= group.max

                        return (
                            <Box key={groupId} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                    {group.label || group.group_name || 'Grupo'}
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
                        <Box sx={{ p: 2, bgcolor: 'rgba(245,158,11,0.08)', borderRadius: 2, border: '1px solid rgba(245,158,11,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
