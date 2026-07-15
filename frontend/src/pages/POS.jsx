import { useState, useEffect, useMemo, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'

import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import ReceiptIcon from '@mui/icons-material/Receipt'
import StoreIcon from '@mui/icons-material/Store'
import Inventory2Icon from '@mui/icons-material/Inventory2'

const keyframes = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
}
`

const injectKeyframes = () => {
  if (!document.getElementById('pos-keyframes')) {
    const style = document.createElement('style')
    style.id = 'pos-keyframes'
    style.textContent = keyframes
    document.head.appendChild(style)
  }
}

const parseSizes = (sizesStr, overallStock) => {
    if (!sizesStr) return null
    try {
        if (sizesStr.startsWith('{')) {
            return JSON.parse(sizesStr)
        }
        const sizesMap = {}
        sizesStr.split(',').forEach(s => {
            const size = s.trim()
            if (size) sizesMap[size] = overallStock
        })
        return sizesMap
    } catch (e) {
        console.error("Error parsing sizes:", e)
        return null
    }
}

function POS({ user }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [activeSession, setActiveSession] = useState(null)
    const [loading, setLoading] = useState(true)

    const [cart, setCart] = useState([])
    const [customerName, setCustomerName] = useState('Cliente General')
    const [customerDocument, setCustomerDocument] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')

    const [sizeModalProduct, setSizeModalProduct] = useState(null)
    const [selectedSize, setSelectedSize] = useState('')

    const [showReceipt, setShowReceipt] = useState(false)
    const [receiptData, setReceiptData] = useState(null)

    const toast = useToast()
    const printAreaRef = useRef(null)

    useEffect(() => { injectKeyframes() }, [])

    const fetchPOSData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [categoriesRes, productsRes, sessionRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers }),
                fetch('/api/cash-register/session/active', { headers })
            ])

            if (categoriesRes.ok) setCategories(await categoriesRes.json())
            if (productsRes.ok) setProducts(await productsRes.json())
            if (sessionRes.ok) {
                const data = await sessionRes.json()
                setActiveSession(data.session)
            }
        } catch (error) {
            toast.error('Error al cargar datos del POS')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPOSData()
    }, [])

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
            const matchSearch = !searchTerm ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchCategory && matchSearch
        })
    }, [products, selectedCategory, searchTerm])

    const handleAddProduct = (product) => {
        if (!activeSession) {
            toast.error('Debes abrir la caja antes de registrar ventas.')
            return
        }

        const parsedSizes = parseSizes(product.sizes, product.stock)

        if (parsedSizes) {
            setSizeModalProduct(product)
            const sizeKeys = Object.keys(parsedSizes).filter(Boolean)
            const firstAvailable = sizeKeys.find(s => parsedSizes[s] > 0) || sizeKeys[0] || ''
            setSelectedSize(firstAvailable)
        } else {
            if (product.stock === 0 && product.sizes) {
                toast.error('El producto requiere seleccionar talla pero no está configurado.')
                return
            }

            if (product.stock > 0) {
                const cartItem = cart.find(item => item.product.id === product.id)
                const currentQty = cartItem ? cartItem.quantity : 0
                if (currentQty >= product.stock) {
                    toast.error(`Stock insuficiente para "${product.name}". Disp: ${product.stock}`)
                    return
                }
            }

            addToCartState(product, null)
        }
    }

    const addToCartState = (product, size) => {
        const price = product.promo_price || product.price

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item =>
                item.product.id === product.id && item.size === size
            )

            if (existingIndex > -1) {
                const newCart = [...prevCart]
                newCart[existingIndex].quantity += 1
                return newCart
            } else {
                return [...prevCart, {
                    product,
                    quantity: 1,
                    size,
                    price,
                    toppings: null,
                    extra_price: 0
                }]
            }
        })
        toast.success(`"${product.name}" agregado al carrito`)
    }

    const handleSizeConfirm = () => {
        if (!selectedSize) {
            toast.error('Selecciona una talla.')
            return
        }

        const product = sizeModalProduct
        const parsedSizes = parseSizes(product.sizes, product.stock)
        const sizeStock = parsedSizes ? (parsedSizes[selectedSize] ?? 0) : product.stock

        const cartItem = cart.find(item =>
            item.product.id === product.id && item.size === selectedSize
        )
        const currentQty = cartItem ? cartItem.quantity : 0

        if (currentQty >= sizeStock) {
            toast.error(`Stock insuficiente para Talla ${selectedSize}. Disp: ${sizeStock}`)
            return
        }

        addToCartState(product, selectedSize)
        setSizeModalProduct(null)
        setSelectedSize('')
    }

    const handleUpdateQty = (index, delta) => {
        const item = cart[index]
        const product = item.product

        if (delta > 0) {
            const parsedSizes = parseSizes(product.sizes, product.stock)
            const availableStock = parsedSizes && item.size
                ? (parsedSizes[item.size] ?? 0)
                : product.stock

            if (availableStock > 0 && item.quantity >= availableStock) {
                toast.error(`Stock máximo alcanzado para "${product.name}"`)
                return
            }
        }

        setCart(prevCart => {
            const newCart = [...prevCart]
            const newQty = newCart[index].quantity + delta
            if (newQty <= 0) {
                newCart.splice(index, 1)
            } else {
                newCart[index].quantity = newQty
            }
            return newCart
        })
    }

    const handleRemoveItem = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index))
    }

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price + item.extra_price) * item.quantity, 0)
    }, [cart])

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío.')
            return
        }
        if (!activeSession) {
            toast.error('La caja debe estar abierta.')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }

            const payload = {
                store_id: user.store_id,
                customer_name: customerName || 'Cliente General',
                customer_phone: '',
                origin: 'LOCAL',
                payment_method: paymentMethod,
                customer_document: customerDocument || null,
                total_price: cartTotal,
                status: 'ENTREGADO',
                items: cart.map(item => ({
                    product_id: item.product.id,
                    product_name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    selected_size: item.size || null,
                    selected_toppings: item.toppings || null,
                    extra_price: item.extra_price
                }))
            }

            const res = await fetch('/api/orders/public', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const orderData = await res.json()
                toast.success('Venta registrada exitosamente!')

                const invoiceRes = await fetch(`/api/invoices/order/${orderData.id}`, { headers })
                if (invoiceRes.ok) {
                    const invData = await invoiceRes.json()
                    setReceiptData(invData)
                    setShowReceipt(true)
                }

                setCart([])
                setCustomerName('Cliente General')
                setCustomerDocument('')
                setPaymentMethod('EFECTIVO')

                const productsRes = await fetch('/api/products', { headers })
                if (productsRes.ok) setProducts(await productsRes.json())
            } else {
                const errData = await res.json()
                toast.error(errData.error || 'Error al procesar la venta.')
            }
        } catch (error) {
            toast.error('Error de red al procesar venta')
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        const printContent = printAreaRef.current.innerHTML
        const win = window.open('', '_blank')
        win.document.write(`
            <html>
            <head>
                <title>Imprimir Factura</title>
                <style>
                    body { font-family: monospace; padding: 20px; font-size: 12px; line-height: 1.4; color: #000; }
                    .center { text-align: center; }
                    .right { text-align: right; }
                    .bold { font-weight: bold; }
                    .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 3px 0; }
                    .total-row td { padding-top: 10px; font-weight: bold; }
                    @media print {
                        body { padding: 0; margin: 0; }
                        @page { size: 80mm auto; margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `)
        win.document.close()
    }

    const sectionBox = {
        background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)',
        border: isDark ? '1px solid rgba(129,140,248,0.10)' : '1px solid rgba(99,102,241,0.08)',
        borderRadius: '14px',
    }

    const dialogPaper = {
        background: isDark ? 'rgba(10, 10, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(40px) saturate(200%)',
        border: isDark ? '1px solid rgba(129, 140, 248, 0.15)' : '1px solid rgba(99, 102, 241, 0.12)',
        borderRadius: '20px !important',
    }

    const inputSx = {
        borderRadius: '14px',
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            transition: 'all 0.3s ease',
            '&.Mui-focused': {
                boxShadow: isDark
                    ? '0 0 0 3px rgba(99,102,241,0.25)'
                    : '0 0 0 3px rgba(99,102,241,0.15)',
            },
        },
    }

    return (
        <AdminLayout title="POS / Venta Local" user={user}>
            {!activeSession && (
                <Card sx={{
                    mb: 3,
                    borderLeft: '5px solid #ef4444',
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%)'
                        : 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.01) 100%)',
                    border: isDark
                        ? '1px solid rgba(239,68,68,0.2)'
                        : '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '14px',
                    animation: 'fadeInUp 0.5s ease',
                    backdropFilter: 'blur(10px)',
                }}>
                    <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                            }}>
                                <PointOfSaleIcon sx={{ color: '#fff', fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>
                                    Caja Registradora Cerrada
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                    Debes realizar la apertura de caja antes de facturar o registrar ventas.
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            href="/admin/cash-register"
                            sx={{
                                fontWeight: 700,
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                                '&:hover': { boxShadow: '0 6px 20px rgba(239,68,68,0.4)', transform: 'translateY(-1px)' },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Ir a Control de Caja
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Grid container spacing={3} sx={{ height: 'calc(100vh - 120px)', minHeight: 500 }}>
                {/* Product Catalog */}
                <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Search & Filters */}
                    <Box sx={{
                        mb: 2.5,
                        p: 2,
                        ...sectionBox,
                        display: 'flex',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        animation: 'fadeInUp 0.4s ease',
                    }}>
                        <TextField
                            size="small"
                            placeholder="Buscar producto por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                flex: 1,
                                minWidth: 220,
                                ...inputSx,
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <TextField
                            select
                            size="small"
                            label="Categoría"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            sx={{ width: 180, ...inputSx }}
                        >
                            <MenuItem value="">Todas</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* Product Grid */}
                    <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(129,140,248,0.2)' : 'rgba(99,102,241,0.15)', borderRadius: 3 } }}>
                        <Grid container spacing={2}>
                            {filteredProducts.map((product, idx) => {
                                const activePrice = product.promo_price || product.price
                                const isOutOfStock = product.stock === 0 && !product.sizes
                                const hasPromo = !!product.promo_price

                                return (
                                    <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={product.id}>
                                        <Card
                                            onClick={() => !isOutOfStock && handleAddProduct(product)}
                                            sx={{
                                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                overflow: 'visible',
                                                border: isDark
                                                    ? `1px solid ${isOutOfStock ? 'rgba(255,255,255,0.05)' : 'rgba(129,140,248,0.12)'}`
                                                    : `1px solid ${isOutOfStock ? 'rgba(0,0,0,0.06)' : 'rgba(99,102,241,0.10)'}`,
                                                borderRadius: '16px',
                                                bgcolor: isDark ? 'rgba(15,15,35,0.8)' : 'rgba(255,255,255,0.9)',
                                                backdropFilter: 'blur(12px)',
                                                opacity: isOutOfStock ? 0.55 : 1,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                animation: `fadeInUp 0.5s ease ${idx * 0.03}s both`,
                                                '&::before': isOutOfStock ? {} : {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '3px',
                                                    borderRadius: '16px 16px 0 0',
                                                    background: hasPromo
                                                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                                        : 'linear-gradient(90deg, #6366f1, #818cf8)',
                                                    opacity: 0,
                                                    transition: 'opacity 0.3s ease',
                                                },
                                                '&:hover': isOutOfStock ? {} : {
                                                    transform: 'translateY(-6px)',
                                                    boxShadow: isDark
                                                        ? '0 12px 40px rgba(99,102,241,0.2)'
                                                        : '0 12px 40px rgba(99,102,241,0.15)',
                                                    border: isDark
                                                        ? '1px solid rgba(129,140,248,0.25)'
                                                        : '1px solid rgba(99,102,241,0.2)',
                                                    '&::before': { opacity: 1 },
                                                },
                                            }}
                                        >
                                            {hasPromo && !isOutOfStock && (
                                                <Chip
                                                    label="PROMO"
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: 10,
                                                        zIndex: 2,
                                                        height: 22,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 800,
                                                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        boxShadow: '0 3px 10px rgba(245,158,11,0.4)',
                                                        animation: 'pulseGlow 2s infinite',
                                                    }}
                                                />
                                            )}
                                            {product.image_url && (
                                                <Box sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    pt: '80%',
                                                    overflow: 'hidden',
                                                    borderRadius: '16px 16px 0 0',
                                                    bgcolor: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
                                                }}>
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.4s ease',
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)' }}
                                                        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                                                    />
                                                    {isOutOfStock && (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            bgcolor: 'rgba(0,0,0,0.5)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <Chip label="Agotado" size="small" sx={{
                                                                bgcolor: '#ef4444', color: '#fff', fontWeight: 700,
                                                                borderRadius: '10px',
                                                            }} />
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                            <CardContent sx={{
                                                p: 1.5,
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                            }}>
                                                <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 700,
                                                            lineHeight: 1.2,
                                                            mb: 0.5,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            color: 'text.primary',
                                                        }}
                                                    >
                                                        {product.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mb: 1,
                                                            color: 'text.secondary',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 800,
                                                            color: 'primary.main',
                                                            lineHeight: 1,
                                                        }}>
                                                            ${activePrice.toLocaleString()}
                                                        </Typography>
                                                        {hasPromo && (
                                                            <Typography variant="caption" sx={{
                                                                textDecoration: 'line-through',
                                                                color: 'text.disabled',
                                                                fontWeight: 500,
                                                            }}>
                                                                ${product.price.toLocaleString()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    {!isOutOfStock && (
                                                        <Chip
                                                            label={`${product.stock} disp.`}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.6rem',
                                                                fontWeight: 700,
                                                                borderRadius: '8px',
                                                                bgcolor: product.stock < 5
                                                                    ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)')
                                                                    : (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)'),
                                                                color: product.stock < 5 ? '#f59e0b' : '#22c55e',
                                                                border: product.stock < 5
                                                                    ? '1px solid rgba(245,158,11,0.2)'
                                                                    : '1px solid rgba(34,197,94,0.2)',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })}
                            {filteredProducts.length === 0 && (
                                <Box sx={{
                                    width: '100%',
                                    py: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    animation: 'fadeInUp 0.5s ease',
                                }}>
                                    <Box sx={{
                                        width: 72, height: 72, borderRadius: '20px',
                                        background: sectionBox.background,
                                        border: sectionBox.border,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Inventory2Icon sx={{ fontSize: 32, color: 'text.disabled' }} />
                                    </Box>
                                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                                        No se encontraron productos
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Intenta con otra búsqueda o categoría
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Box>
                </Grid>

                {/* Cart Sidebar */}
                <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ height: '100%' }}>
                    <Paper
                        sx={{
                            height: '100%',
                            p: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '20px',
                            border: isDark
                                ? '1px solid rgba(129,140,248,0.12)'
                                : '1px solid rgba(99,102,241,0.10)',
                            bgcolor: isDark ? 'rgba(15,15,35,0.9)' : 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(0,0,0,0.3)'
                                : '0 8px 32px rgba(99,102,241,0.08)',
                            overflow: 'hidden',
                            animation: 'fadeInUp 0.5s ease 0.1s both',
                        }}
                    >
                        {/* Cart Header */}
                        <Box sx={{
                            px: 2.5,
                            pt: 2.5,
                            pb: 1.5,
                            background: isDark
                                ? 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)'
                                : 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: '11px',
                                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                    animation: cart.length > 0 ? 'iconBounce 0.4s ease' : 'none',
                                    key: cart.length,
                                }}>
                                    <ShoppingCartIcon sx={{ color: '#fff', fontSize: 18 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
                                    Carrito de Ventas
                                </Typography>
                                <Chip
                                    label={cart.reduce((sum, item) => sum + item.quantity, 0)}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        height: 24,
                                        fontSize: '0.7rem',
                                        bgcolor: 'primary.main',
                                        color: '#fff',
                                        borderRadius: '10px',
                                        minWidth: 28,
                                    }}
                                />
                            </Box>
                        </Box>

                        <Divider sx={{ mx: 2.5, borderColor: isDark ? 'rgba(129,140,248,0.08)' : 'rgba(99,102,241,0.06)' }} />

                        {/* Cart Items */}
                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            px: 2.5,
                            pt: 1.5,
                            pb: 0,
                            '&::-webkit-scrollbar': { width: 5 },
                            '&::-webkit-scrollbar-track': { background: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(99,102,241,0.12)', borderRadius: 3 },
                        }}>
                            {cart.length === 0 ? (
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    py: 6,
                                    gap: 1.5,
                                }}>
                                    <Box sx={{
                                        width: 64, height: 64, borderRadius: '18px',
                                        background: sectionBox.background,
                                        border: sectionBox.border,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <StoreIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                                    </Box>
                                    <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', fontWeight: 500 }}>
                                        Carrito vacío
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                                        Selecciona productos del catálogo para iniciar la venta
                                    </Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {cart.map((item, index) => (
                                        <ListItem
                                            key={`${item.product.id}-${item.size}`}
                                            sx={{
                                                px: 0,
                                                py: 1.2,
                                                borderBottom: isDark
                                                    ? '1px solid rgba(129,140,248,0.06)'
                                                    : '1px solid rgba(99,102,241,0.05)',
                                                animation: 'fadeInUp 0.3s ease',
                                                '&:last-child': { borderBottom: 'none' },
                                            }}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleRemoveItem(index)}
                                                    sx={{
                                                        color: 'text.secondary',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            color: '#ef4444',
                                                            bgcolor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2 }}>
                                                            {item.product.name}
                                                        </Typography>
                                                        {item.size && (
                                                            <Chip
                                                                label={`Talla ${item.size}`}
                                                                size="small"
                                                                sx={{
                                                                    height: 18,
                                                                    fontSize: '0.6rem',
                                                                    fontWeight: 700,
                                                                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                                                                    color: 'primary.main',
                                                                    borderRadius: '8px',
                                                                    border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.12)',
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.8 }}>
                                                        <Typography variant="subtitle2" sx={{
                                                            fontWeight: 800,
                                                            color: 'primary.main',
                                                            fontSize: '0.85rem',
                                                        }}>
                                                            ${((item.price + item.extra_price) * item.quantity).toLocaleString()}
                                                        </Typography>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0,
                                                            border: isDark ? '1px solid rgba(129,140,248,0.12)' : '1px solid rgba(99,102,241,0.10)',
                                                            borderRadius: '10px',
                                                            bgcolor: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
                                                            overflow: 'hidden',
                                                        }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateQty(index, -1)}
                                                                sx={{
                                                                    p: 0.4,
                                                                    borderRadius: 0,
                                                                    color: 'text.secondary',
                                                                    '&:hover': { bgcolor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)', color: '#ef4444' },
                                                                }}
                                                            >
                                                                <RemoveIcon sx={{ fontSize: 13 }} />
                                                            </IconButton>
                                                            <Typography sx={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 800,
                                                                minWidth: 28,
                                                                textAlign: 'center',
                                                                color: 'text.primary',
                                                            }}>
                                                                {item.quantity}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleUpdateQty(index, 1)}
                                                                sx={{
                                                                    p: 0.4,
                                                                    borderRadius: 0,
                                                                    color: 'text.secondary',
                                                                    '&:hover': { bgcolor: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.06)', color: '#22c55e' },
                                                                }}
                                                            >
                                                                <AddIcon sx={{ fontSize: 13 }} />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>

                        <Divider sx={{ mx: 2.5, borderColor: isDark ? 'rgba(129,140,248,0.08)' : 'rgba(99,102,241,0.06)' }} />

                        {/* Customer & Billing Form */}
                        <Box sx={{ px: 2.5, pt: 1.5, pb: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        label="Cliente"
                                        placeholder="Nombre del cliente"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        sx={{ flex: 1, ...inputSx }}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                    <TextField
                                        size="small"
                                        label="DNI / RUT / NIT"
                                        placeholder="Identificación"
                                        value={customerDocument}
                                        onChange={(e) => setCustomerDocument(e.target.value)}
                                        sx={{ width: 140, ...inputSx }}
                                    />
                                </Box>

                                <TextField
                                    select
                                    size="small"
                                    label="Método de Pago"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    sx={inputSx}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    {paymentMethod === 'EFECTIVO'
                                                        ? <LocalAtmIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                                                        : <CreditCardIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                    }
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                >
                                    <MenuItem value="EFECTIVO">💵 Efectivo</MenuItem>
                                    <MenuItem value="TARJETA">💳 Tarjeta de Crédito/Débito</MenuItem>
                                    <MenuItem value="TRANSFERENCIA">🏦 Transferencia Bancaria</MenuItem>
                                    <MenuItem value="OTRO">⚙️ Otro método</MenuItem>
                                </TextField>
                            </Box>
                        </Box>

                        {/* Summary */}
                        <Box sx={{ px: 2.5, pt: 1.5, pb: 0 }}>
                            <Box sx={{
                                ...sectionBox,
                                p: 1.5,
                                mb: 1.5,
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Subtotal</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>${cartTotal.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>IVA (0%)</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>$0</Typography>
                                </Box>
                                <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(129,140,248,0.1)' : 'rgba(99,102,241,0.08)' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total Venta</Typography>
                                    <Typography variant="subtitle1" sx={{
                                        fontWeight: 900,
                                        color: 'primary.main',
                                        fontSize: '1.15rem',
                                    }}>
                                        ${cartTotal.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Checkout Button */}
                        <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={cart.length === 0 || !activeSession}
                                onClick={handleCheckout}
                                startIcon={<ReceiptIcon />}
                                sx={{
                                    py: 1.4,
                                    fontWeight: 700,
                                    borderRadius: '14px',
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    background: cart.length > 0 && activeSession
                                        ? 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #6366f1 100%)'
                                        : undefined,
                                    backgroundSize: '200% auto',
                                    boxShadow: cart.length > 0 && activeSession
                                        ? '0 6px 24px rgba(99,102,241,0.35)'
                                        : undefined,
                                    transition: 'all 0.3s ease',
                                    '&:hover': cart.length > 0 && activeSession ? {
                                        backgroundPosition: 'right center',
                                        boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
                                        transform: 'translateY(-2px)',
                                    } : {},
                                    '&:active': {
                                        transform: 'translateY(0)',
                                    },
                                }}
                            >
                                Facturar Venta (${cartTotal.toLocaleString()})
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Sizes Selection Dialog */}
            <Dialog
                open={!!sizeModalProduct}
                onClose={() => setSizeModalProduct(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: dialogPaper }}
            >
                <DialogTitle sx={{
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    pb: 1,
                }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '11px',
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}>
                        <Inventory2Icon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    Seleccionar Talla
                </DialogTitle>
                <DialogContent>
                    {sizeModalProduct && (
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                                El producto <strong style={{ color: isDark ? '#a5b4fc' : '#6366f1' }}>{sizeModalProduct.name}</strong> tiene control de stock por talla. Selecciona una opción:
                            </Typography>

                            <TextField
                                select
                                label="Talla Disponible"
                                fullWidth
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                sx={inputSx}
                            >
                                {Object.entries(parseSizes(sizeModalProduct.sizes, sizeModalProduct.stock) || {}).map(([size, stock]) => (
                                    <MenuItem key={size} value={size} disabled={stock <= 0}>
                                        {size} ({stock <= 0 ? 'Agotado' : `${stock} disp.`})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setSizeModalProduct(null)}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSizeConfirm}
                        variant="contained"
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                            '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.4)' },
                        }}
                    >
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Receipt Modal */}
            <Dialog
                open={showReceipt}
                onClose={() => setShowReceipt(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: dialogPaper }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '11px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                        }}>
                            <ReceiptIcon sx={{ color: '#fff', fontSize: 18 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            Venta Registrada Exitosamente
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setShowReceipt(false)}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
                                color: '#ef4444',
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: isDark ? 'rgba(129,140,248,0.08)' : 'rgba(99,102,241,0.06)' }}>
                    {receiptData && (
                        <Box sx={{ p: 0.5 }}>
                            <Paper
                                variant="outlined"
                                ref={printAreaRef}
                                sx={{
                                    p: 3,
                                    fontFamily: 'monospace',
                                    fontSize: '0.8125rem',
                                    color: isDark ? '#e2e8f0' : '#333',
                                    borderRadius: '14px',
                                    bgcolor: isDark ? 'rgba(99,102,241,0.03)' : '#fafafa',
                                    border: isDark
                                        ? '1px solid rgba(129,140,248,0.1)'
                                        : '1px solid rgba(99,102,241,0.08)',
                                }}
                            >
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 1 }}>
                                        {receiptData.order?.store?.name || user?.storeName || 'E-SHOP'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                        NIT/Reg: {receiptData.invoice.store_id || '900800700-1'}<br />
                                        Dirección: {receiptData.order?.store?.address || 'Local Comercial'}<br />
                                        WhatsApp: {receiptData.order?.store?.whatsapp || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ borderBottom: '1px dashed', borderColor: isDark ? 'rgba(129,140,248,0.15)' : '#000', mb: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                                        <strong>Factura Nro:</strong> {receiptData.invoice.invoice_number}<br />
                                        <strong>Fecha:</strong> {new Date(receiptData.invoice.created_at).toLocaleString()}<br />
                                        <strong>Cliente:</strong> {receiptData.invoice.customer_name}<br />
                                        {receiptData.invoice.customer_document && (
                                            <><strong>Doc:</strong> {receiptData.invoice.customer_document}<br /></>
                                        )}
                                        <strong>Medio Pago:</strong> {receiptData.invoice.payment_method}
                                    </Typography>
                                </Box>

                                <Box sx={{ borderBottom: '1px dashed', borderColor: isDark ? 'rgba(129,140,248,0.15)' : '#000', mb: 1 }} />

                                <table style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(129,140,248,0.15)' : '#000'}` }}>
                                            <th style={{ textAlign: 'left' }}>Detalle</th>
                                            <th style={{ textAlign: 'center' }}>Cant.</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receiptData.order?.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.product_name}
                                                    {item.selected_size && ` (${item.selected_size})`}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    ${((item.price + item.extra_price) * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <Box sx={{ borderBottom: '1px dashed', borderColor: isDark ? 'rgba(129,140,248,0.15)' : '#000', mt: 2, mb: 1 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Subtotal:</Typography>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>${receiptData.invoice.subtotal.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Impuestos (0%):</Typography>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>$0</Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        pt: 1,
                                        borderTop: `1px solid ${isDark ? 'rgba(129,140,248,0.15)' : '#000'}`,
                                    }}>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.9rem' }}>Total:</Typography>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.9rem' }}>${receiptData.invoice.total.toLocaleString()}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ borderBottom: '1px dashed', borderColor: isDark ? 'rgba(129,140,248,0.15)' : '#000', mt: 2, mb: 2 }} />

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        ¡Gracias por su compra!<br />
                                        Conserve su factura para cualquier reclamo.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button
                        onClick={() => setShowReceipt(false)}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cerrar
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="contained"
                        startIcon={<PrintIcon />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                            '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.4)' },
                        }}
                    >
                        Imprimir Recibo
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    )
}

export default POS
