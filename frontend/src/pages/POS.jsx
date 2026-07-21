import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { useTheme, alpha, keyframes } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptIcon from '@mui/icons-material/Receipt'
import StoreIcon from '@mui/icons-material/Store'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SmartphoneIcon from '@mui/icons-material/Smartphone'

const PAYMENT_METHODS = [
    { value: 'EFECTIVO', label: 'Efectivo', IconComp: AttachMoneyIcon, color: '#22c55e' },
    { value: 'TARJETA', label: 'Tarjeta', IconComp: CreditCardIcon, color: '#3b82f6' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', IconComp: AccountBalanceIcon, color: '#2563eb' },
    { value: 'NEQUI', label: 'Nequi', IconComp: SmartphoneIcon, color: '#06b6d4' },
    { value: 'DAVIPLATA', label: 'Daviplata', IconComp: SmartphoneIcon, color: '#f59e0b' },
]

const QUICK_CASH = [5000, 10000, 15000, 20000, 30000, 50000, 100000]
const CATEGORY_COLORS = ['#004ac6', '#10b981', '#f59e0b', '#ef4444', '#2563eb', '#ec4899', '#06b6d4', '#84cc16']

const popIn = keyframes`
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
`

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
    } catch {
        // Comma-separated legacy format
        const map = {}
        sizesStr.split(',').forEach(s => {
            const size = s.trim()
            if (size) map[size] = { stock: overallStock || 0, price: 0 }
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
    } catch {}
    return fallbackPrice
}

function POSProductCard({ product, cart, isDark, onAdd }) {
    const activePrice = product.promo_price || product.price
    const managesStock = product.manage_stock !== false
    const isOutOfStock = managesStock && product.stock === 0 && !product.sizes
    const hasPromo = !!product.promo_price
    const inCart = cart.find(i => i.product.id === product.id && !i.size)
    const parsedSizes = parseSizes(product.sizes, product.stock)
    const totalSizeStock = parsedSizes ? Object.values(parsedSizes).reduce((a, b) => a + (b.stock || 0), 0) : 0
    const displayStock = parsedSizes ? totalSizeStock : product.stock
    const lowStock = managesStock && displayStock > 0 && displayStock < 5

    const handleAdd = (e) => {
        e.stopPropagation()
        if (isOutOfStock) return
        onAdd(product)
    }

    return (
        <Box onClick={handleAdd} sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            p: 0.6, borderRadius: '10px',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            opacity: isOutOfStock ? 0.3 : 1,
            bgcolor: isDark ? 'rgba(15,15,35,0.7)' : '#fff',
            border: '1.5px solid',
            borderColor: inCart ? alpha('#004ac6', 0.5) : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            transition: 'all 0.1s ease',
            '&:active': isOutOfStock ? {} : { transform: 'scale(0.97)', borderColor: '#004ac6' },
            ...(inCart && { boxShadow: `0 0 0 2px ${alpha('#004ac6', 0.15)}` }),
        }}>
            <Box sx={{
                width: 44, height: 44, borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                bgcolor: isDark ? 'rgba(0,74,198,0.06)' : 'rgba(0,74,198,0.04)',
                position: 'relative',
            }}>
                {product.image_url ? (
                    <Box component="img" src={product.image_url} loading="lazy"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Inventory2Icon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    </Box>
                )}
                {isOutOfStock && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '0.4rem', fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>X</Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: inCart ? 'primary.main' : 'text.primary' }}>
                        {product.name}
                    </Typography>
                    {hasPromo && <Chip label="P" size="small" sx={{ height: 14, fontSize: '0.4rem', fontWeight: 800, bgcolor: '#f59e0b', color: '#fff', flexShrink: 0 }} />}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.15 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.78rem', color: hasPromo ? '#ef4444' : 'primary.main', lineHeight: 1 }}>
                        ${activePrice.toLocaleString()}
                    </Typography>
                    {hasPromo && <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: '0.5rem' }}>${product.price.toLocaleString()}</Typography>}
                    {lowStock && <Typography sx={{ fontSize: '0.5rem', color: '#f59e0b', fontWeight: 600, ml: 'auto' }}>{displayStock}</Typography>}
                </Box>
            </Box>

            {!isOutOfStock && (
                <Box onClick={handleAdd} sx={{
                    width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                    bgcolor: inCart ? 'primary.main' : alpha('#004ac6', 0.1),
                    color: inCart ? '#fff' : 'primary.main',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.1s ease',
                    '&:active': { transform: 'scale(0.85)' },
                    '&:hover': { bgcolor: inCart ? '#003da6' : alpha('#004ac6', 0.18) },
                }}>
                    {inCart
                        ? <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, lineHeight: 1 }}>{inCart.quantity}</Typography>
                        : <AddIcon sx={{ fontSize: 16 }} />}
                </Box>
            )}
        </Box>
    )
}

function POS({ user, onLogout }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [activeSession, setActiveSession] = useState(null)
    const [loading, setLoading] = useState(true)

    const [cart, setCart] = useState([])
    const [customerName, setCustomerName] = useState('')
    const [customerDocument, setCustomerDocument] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [showQuickCash, setShowQuickCash] = useState(false)

    const [sizeModalProduct, setSizeModalProduct] = useState(null)
    const [selectedSize, setSelectedSize] = useState('')

    const [showReceipt, setShowReceipt] = useState(false)
    const [receiptData, setReceiptData] = useState(null)

    const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
    const [recentProducts, setRecentProducts] = useState([])

    const toast = useToast()
    const printAreaRef = useRef(null)
    const searchRef = useRef(null)

    const fetchPOSData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }
            const [categoriesRes, productsRes, sessionRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers }),
                fetch('/api/cash-register/session/active', { headers }),
            ])
            if (categoriesRes.ok) setCategories(await categoriesRes.json())
            if (productsRes.ok) setProducts(await productsRes.json())
            if (sessionRes.ok) {
                const data = await sessionRes.json()
                setActiveSession(data.session)
            }
        } catch { toast.error('Error al cargar datos del POS') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchPOSData() }, [])

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus() }
            if (e.key === 'F9' && cart.length > 0 && activeSession) { e.preventDefault(); handleCheckout() }
            if (e.key === 'Escape') {
                if (sizeModalProduct) setSizeModalProduct(null)
                else if (showReceipt) setShowReceipt(false)
                else if (cartDrawerOpen) setCartDrawerOpen(false)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [cart, activeSession, sizeModalProduct, showReceipt, cartDrawerOpen])

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
            const matchSearch = !searchTerm ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchCategory && matchSearch
        })
    }, [products, selectedCategory, searchTerm])

    const categoryCounts = useMemo(() => {
        const counts = {}
        products.forEach(p => { counts[p.category_id] = (counts[p.category_id] || 0) + 1 })
        return counts
    }, [products])

    const handleAddProduct = useCallback((product) => {
        if (!activeSession) { toast.error('Debes abrir la caja antes de facturar'); return }
        const managesStock = product.manage_stock !== false
        const parsedSizes = parseSizes(product.sizes, product.stock)
        if (parsedSizes) {
            setSizeModalProduct(product)
            const sizeKeys = Object.keys(parsedSizes).filter(Boolean)
            const firstAvailable = sizeKeys.find(s => parsedSizes[s].stock > 0) || sizeKeys[0] || ''
            setSelectedSize(firstAvailable)
        } else {
            if (managesStock && product.stock > 0) {
                const cartItem = cart.find(item => item.product.id === product.id && !item.size)
                const currentQty = cartItem ? cartItem.quantity : 0
                if (currentQty >= product.stock) { toast.error(`Stock insuficiente: "${product.name}" (disp: ${product.stock})`); return }
            } else if (managesStock && !product.sizes && product.stock === 0) {
                toast.error(`"${product.name}" sin stock`); return
            }
            addToCartState(product, null)
            setRecentProducts(prev => {
                const filtered = prev.filter(p => p.id !== product.id)
                return [product, ...filtered].slice(0, 8)
            })
        }
    }, [activeSession, cart])

    const addToCartState = useCallback((product, size) => {
        const basePrice = product.promo_price || product.price
        const price = size ? getSizePrice(product.sizes, size, basePrice) : basePrice
        setCart(prev => {
            const idx = prev.findIndex(item => item.product.id === product.id && item.size === size)
            if (idx > -1) {
                const next = [...prev]
                next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
                return next
            }
            return [...prev, { product, quantity: 1, size, price, toppings: null, extra_price: 0 }]
        })
        toast.success(`+1 ${product.name}${size ? ` (${size})` : ''}`)
    }, [])

    const handleSizeConfirm = useCallback(() => {
        if (!selectedSize) { toast.error('Selecciona una talla'); return }
        const product = sizeModalProduct
        const parsedSizes = parseSizes(product.sizes, product.stock)
        const sizeStock = parsedSizes ? (parsedSizes[selectedSize]?.stock ?? 0) : product.stock
        const cartItem = cart.find(item => item.product.id === product.id && item.size === selectedSize)
        const currentQty = cartItem ? cartItem.quantity : 0
        if (currentQty >= sizeStock) { toast.error(`Stock insuficiente: talla ${selectedSize} (disp: ${sizeStock})`); return }
        addToCartState(product, selectedSize)
        setRecentProducts(prev => {
            const filtered = prev.filter(p => p.id !== product.id)
            return [product, ...filtered].slice(0, 8)
        })
        setSizeModalProduct(null)
        setSelectedSize('')
    }, [selectedSize, sizeModalProduct, cart, addToCartState])

    const handleUpdateQty = useCallback((index, delta) => {
        setCart(prev => {
            const next = [...prev]
            const item = next[index]
            const newQty = item.quantity + delta
            if (newQty <= 0) { next.splice(index, 1); return next }
            const managesStock = item.product.manage_stock !== false
            if (managesStock) {
                const parsedSizes = parseSizes(item.product.sizes, item.product.stock)
                if (delta > 0 && parsedSizes && item.size) {
                    const available = parsedSizes[item.size]?.stock ?? 0
                    if (newQty > available) { toast.error(`Stock maximo: ${available}`); return prev }
                } else if (delta > 0 && !item.size && item.product.stock > 0) {
                    if (newQty > item.product.stock) { toast.error(`Stock maximo: ${item.product.stock}`); return prev }
                }
            }
            next[index] = { ...item, quantity: newQty }
            return next
        })
    }, [])

    const handleRemoveItem = useCallback((index) => { setCart(prev => prev.filter((_, i) => i !== index)) }, [])
    const handleClearCart = useCallback(() => { if (cart.length > 0) { setCart([]); toast.success('Carrito vaciado') } }, [cart.length])

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price + item.extra_price) * item.quantity, 0), [cart])
    const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

    const handleCheckout = useCallback(async () => {
        if (cart.length === 0) { toast.error('El carrito esta vacio'); return }
        if (!activeSession) { toast.error('La caja debe estar abierta'); return }
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            const payload = {
                store_id: user.storeId || user.store_id,
                customer_name: customerName.trim() || 'Cliente General',
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
                    extra_price: item.extra_price,
                })),
            }
            const res = await fetch('/api/orders/public', { method: 'POST', headers, body: JSON.stringify(payload) })
            if (res.ok) {
                const orderData = await res.json()
                toast.success('Venta registrada')
                const invoiceRes = await fetch(`/api/invoices/order/${orderData.id}`, { headers })
                if (invoiceRes.ok) { setReceiptData(await invoiceRes.json()); setShowReceipt(true) }
                setCart([]); setCustomerName(''); setCustomerDocument(''); setPaymentMethod('EFECTIVO')
                setCartDrawerOpen(false)
                const productsRes = await fetch('/api/products', { headers })
                if (productsRes.ok) setProducts(await productsRes.json())
            } else { const err = await res.json(); toast.error(err.error || 'Error al procesar la venta') }
        } catch { toast.error('Error de red') }
        finally { setLoading(false) }
    }, [cart, activeSession, customerName, customerDocument, paymentMethod, cartTotal, user])

    const handlePrint = useCallback(() => {
        const content = printAreaRef.current?.innerHTML
        if (!content) return
        const win = window.open('', '_blank')
        win.document.write(`<html><head><title>Factura</title><style>body{font-family:monospace;padding:20px;font-size:12px;line-height:1.4;color:#000}.bold{font-weight:700}table{width:100%;border-collapse:collapse}td{padding:3px 0}@media print{body{padding:0;margin:0}@page{size:80mm auto;margin:0}}</style></head><body>${content}<script>window.onload=function(){window.print();window.close()}</script></body></html>`)
        win.document.close()
    }, [])

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha('#004ac6', isDark ? 0.25 : 0.12)}` },
        },
    }

    const cartDrawerContent = (
        <Box sx={{
            width: isMobile ? '100%' : 400, height: '100%',
            display: 'flex', flexDirection: 'column',
            bgcolor: isDark ? 'rgba(10,10,28,0.98)' : '#fff',
        }}>
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, background: `linear-gradient(180deg, ${alpha('#004ac6', isDark ? 0.08 : 0.04)}, transparent)` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCartIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>Carrito</Typography>
                        {cartItemCount > 0 && (
                            <Chip label={`${cartItemCount} items`} size="small" sx={{
                                height: 22, fontSize: '0.65rem', fontWeight: 700,
                                bgcolor: 'primary.main', color: '#fff', borderRadius: '8px',
                            }} />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {cart.length > 0 && (
                            <Tooltip title="Vaciar carrito" arrow>
                                <IconButton size="small" onClick={handleClearCart}
                                    sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}>
                                    <ClearAllIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton size="small" onClick={() => setCartDrawerOpen(false)}>
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
            <Divider sx={{ borderColor: alpha('#004ac6', 0.06) }} />

            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 1.5 }}>
                {cart.length === 0 ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', py: 8, gap: 1 }}>
                        <StoreIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Carrito vacio</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Toca un producto para agregarlo
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {cart.map((item, index) => (
                            <ListItem key={`${item.product.id}-${item.size}`} sx={{
                                px: 0, py: 1.25,
                                borderBottom: '1px solid', borderColor: alpha('#004ac6', 0.05),
                                '&:last-child': { borderBottom: 'none' },
                                animation: `${popIn} 0.25s ease`,
                            }}
                                disablePadding
                                secondaryAction={
                                    <IconButton edge="end" size="small" onClick={() => handleRemoveItem(index)}
                                        sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } }}>
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                }
                            >
                                <Box sx={{ flex: 1, pr: 5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                            {item.product.name}
                                        </Typography>
                                        {item.size && (
                                            <Chip label={item.size} size="small" sx={{
                                                height: 18, fontSize: '0.55rem', fontWeight: 700,
                                                bgcolor: alpha('#004ac6', 0.1), color: 'primary.main',
                                            }} />
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}>
                                        <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.9rem' }}>
                                            ${((item.price + item.extra_price) * item.quantity).toLocaleString()}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', border: '2px solid', borderColor: 'divider',
                                            borderRadius: '10px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                            <IconButton size="small" onClick={() => handleUpdateQty(index, -1)}
                                                sx={{ p: 0.5, borderRadius: 0, '&:hover': { color: '#ef4444' } }}>
                                                <RemoveIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, minWidth: 32, textAlign: 'center' }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleUpdateQty(index, 1)}
                                                sx={{ p: 0.5, borderRadius: 0, '&:hover': { color: '#22c55e' } }}>
                                                <AddIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            <Divider sx={{ mx: 2.5, borderColor: alpha('#004ac6', 0.06) }} />

            <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                        <TextField size="small" label="Cliente" placeholder="Nombre" value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)} sx={{ flex: 1, ...inputSx }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> } }} />
                        <TextField size="small" label="Doc" placeholder="ID" value={customerDocument}
                            onChange={(e) => setCustomerDocument(e.target.value)} sx={{ width: 90, ...inputSx }} />
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', mb: 0.75, display: 'block' }}>
                            METODO DE PAGO
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                            {PAYMENT_METHODS.map(pm => {
                                const isActive = paymentMethod === pm.value
                                const IconComp = pm.IconComp
                                return (
                                    <Chip key={pm.value}
                                        icon={<IconComp sx={{ fontSize: '14px !important', color: isActive ? pm.color : undefined }} />}
                                        label={pm.label} size="small"
                                        onClick={() => setPaymentMethod(pm.value)}
                                        sx={{
                                            fontWeight: 600, fontSize: '0.65rem', height: 32,
                                            bgcolor: isActive ? alpha(pm.color, 0.15) : 'background.paper',
                                            color: isActive ? pm.color : 'text.secondary',
                                            border: '2px solid', borderColor: isActive ? alpha(pm.color, 0.35) : 'divider',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: alpha(pm.color, 0.08) },
                                        }}
                                    />
                                )
                            })}
                        </Box>
                    </Box>

                    {paymentMethod === 'EFECTIVO' && cart.length > 0 && (
                        <Box>
                            <Button size="small" onClick={() => setShowQuickCash(!showQuickCash)}
                                sx={{ fontSize: '0.65rem', textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}>
                                {showQuickCash ? 'Ocultar billetes' : 'Billetes rapidos'}
                            </Button>
                            {showQuickCash && (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                    {QUICK_CASH.map(amount => (
                                        <Chip key={amount} label={`$${amount.toLocaleString()}`} size="small"
                                            onClick={() => {
                                                const diff = amount - cartTotal
                                                if (diff > 0) toast.info(`Cambio: $${diff.toLocaleString()}`)
                                                else if (diff < 0) toast.warning(`Falta: $${Math.abs(diff).toLocaleString()}`)
                                                else toast.success('Pago exacto')
                                            }}
                                            sx={{
                                                fontWeight: 600, fontSize: '0.6rem', height: 26,
                                                bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
                                                border: '1px solid', borderColor: alpha('#22c55e', 0.2),
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: alpha('#22c55e', 0.12) },
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    <Box sx={{
                        p: 1.5, borderRadius: '14px',
                        bgcolor: isDark ? 'rgba(0,74,198,0.06)' : 'rgba(0,74,198,0.04)',
                        border: '1px solid', borderColor: alpha('#004ac6', 0.08),
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.4rem' }}>
                                ${cartTotal.toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>

                    <Button variant="contained" fullWidth size="large"
                        disabled={cart.length === 0 || !activeSession || loading}
                        onClick={handleCheckout} startIcon={loading ? null : <ReceiptIcon />}
                        sx={{
                            py: 1.5, fontWeight: 700, borderRadius: '14px', textTransform: 'none', fontSize: '1rem',
                            background: cart.length > 0 && activeSession ? 'linear-gradient(135deg, #004ac6, #b4c5ff)' : undefined,
                            boxShadow: cart.length > 0 && activeSession ? `0 6px 24px ${alpha('#004ac6', 0.35)}` : undefined,
                            '&:hover': cart.length > 0 && activeSession ? {
                                boxShadow: `0 8px 30px ${alpha('#004ac6', 0.45)}`, transform: 'translateY(-1px)',
                            } : {},
                        }}
                    >
                        {loading ? 'Procesando...' : `Cobrar $${cartTotal.toLocaleString()}`}
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block', fontSize: '0.6rem' }}>
                        F9 para cobrar rapido
                    </Typography>
                </Box>
            </Box>
        </Box>
    )

    return (
        <AdminLayout title="POS / Venta Local" user={user} onLogout={onLogout}>
            {cartItemCount > 0 && (
                <Box onClick={() => setCartDrawerOpen(true)} sx={{
                    position: 'sticky', top: { xs: 56, md: 64 }, zIndex: 1100,
                    mx: { xs: -1.5, md: -3 }, mt: { xs: -1.5, md: -3 },
                    mb: 2, px: 2, py: 1.25,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    bgcolor: isDark ? 'rgba(0,74,198,0.12)' : 'rgba(0,74,198,0.08)',
                    borderBottom: `2px solid ${alpha('#004ac6', 0.3)}`,
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: isDark ? 'rgba(0,74,198,0.18)' : 'rgba(0,74,198,0.12)' },
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Badge badgeContent={cartItemCount} color="primary"
                            sx={{ '& .MuiBadge-badge': { fontWeight: 800, fontSize: '0.7rem', height: 20, minWidth: 20,
                                boxShadow: `0 2px 8px ${alpha('#004ac6', 0.4)}` } }}>
                            <ShoppingCartIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                        </Badge>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: 'primary.main' }}>
                                ${cartTotal.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600 }}>
                                {cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'} en carrito
                            </Typography>
                        </Box>
                    </Box>
                    <Chip label="Ver carrito" size="small" icon={<ShoppingCartIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'primary.main', color: '#fff',
                            '& .MuiChip-icon': { color: '#fff !important' } }} />
                </Box>
            )}

            {!activeSession && (
                <Box sx={{
                    mb: 2, p: 2, borderRadius: '16px',
                    border: '2px solid', borderColor: alpha('#ef4444', 0.25),
                    background: `linear-gradient(135deg, ${alpha('#ef4444', isDark ? 0.1 : 0.06)}, ${alpha('#ef4444', 0.02)})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 44, height: 44, borderRadius: '13px',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 14px ${alpha('#ef4444', 0.3)}`,
                        }}>
                            <PointOfSaleIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ef4444' }}>Caja Cerrada</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Abre la caja para registrar ventas</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="error" size="small" href="/admin/cash-register"
                        sx={{ fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 3 }}>
                        Abrir Caja
                    </Button>
                </Box>
            )}

            <Box sx={{ mb: 2 }}>
                <TextField
                    inputRef={searchRef} fullWidth size="medium"
                    placeholder="Buscar producto por nombre... (F2)"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    sx={inputSx}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 22, color: 'text.secondary' }} /></InputAdornment>,
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <CloseIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            <Box sx={{
                display: 'flex', gap: 0.75, mb: 2.5, overflowX: 'auto', pb: 0.5,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: alpha('#004ac6', 0.15) },
            }}>
                <Box onClick={() => setSelectedCategory('')} sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 2, py: 1, borderRadius: '12px', cursor: 'pointer', flexShrink: 0,
                    bgcolor: !selectedCategory ? alpha('#004ac6', 0.12) : 'transparent',
                    border: '2px solid', borderColor: !selectedCategory ? alpha('#004ac6', 0.35) : 'transparent',
                    transition: 'all 0.2s', '&:hover': { bgcolor: alpha('#004ac6', 0.06) },
                }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: !selectedCategory ? '#004ac6' : alpha('#004ac6', 0.3) }} />
                    <Typography sx={{ fontWeight: !selectedCategory ? 700 : 600, fontSize: '0.8rem',
                        color: !selectedCategory ? '#004ac6' : 'text.secondary', whiteSpace: 'nowrap' }}>Todos</Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700,
                        color: !selectedCategory ? '#004ac6' : 'text.disabled',
                        bgcolor: !selectedCategory ? alpha('#004ac6', 0.12) : alpha('#004ac6', 0.06),
                        px: 0.5, py: 0.15, borderRadius: '4px' }}>{products.length}</Typography>
                </Box>
                {categories.map((cat, idx) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                    const isActive = String(selectedCategory) === String(cat.id)
                    const count = categoryCounts[cat.id] || 0
                    return (
                        <Box key={cat.id} onClick={() => setSelectedCategory(isActive ? '' : cat.id)} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75,
                            px: 2, py: 1, borderRadius: '12px', cursor: 'pointer', flexShrink: 0,
                            bgcolor: isActive ? alpha(color, 0.12) : 'transparent',
                            border: '2px solid', borderColor: isActive ? alpha(color, 0.35) : 'transparent',
                            transition: 'all 0.2s', '&:hover': { bgcolor: alpha(color, 0.06) },
                        }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? color : alpha(color, 0.3), transition: 'all 0.2s' }} />
                            <Typography sx={{ fontWeight: isActive ? 700 : 600, fontSize: '0.8rem',
                                color: isActive ? color : 'text.secondary', whiteSpace: 'nowrap' }}>{cat.name}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700,
                                color: isActive ? color : 'text.disabled',
                                bgcolor: isActive ? alpha(color, 0.12) : alpha(color, 0.06),
                                px: 0.5, py: 0.15, borderRadius: '4px' }}>{count}</Typography>
                        </Box>
                    )
                })}
            </Box>

            <Box sx={{
                pb: 12,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(3, 1fr)' },
                gap: 0.5,
            }}>
                {filteredProducts.map(product => (
                    <POSProductCard key={product.id} product={product} cart={cart} isDark={isDark} onAdd={handleAddProduct} />
                ))}
                {filteredProducts.length === 0 && (
                    <Box sx={{ gridColumn: '1 / -1', py: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Inventory2Icon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography color="text.secondary" sx={{ fontWeight: 600, fontSize: '1rem' }}>Sin resultados</Typography>
                        <Typography variant="body2" color="text.secondary">Intenta con otra busqueda o categoria</Typography>
                    </Box>
                )}
            </Box>

            <Drawer anchor={isMobile ? 'bottom' : 'right'} open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)}
                slotProps={{
                    paper: { sx: { bgcolor: 'transparent', boxShadow: 'none',
                        ...(isMobile && { borderRadius: '24px 24px 0 0', maxHeight: '90vh' }) } },
                    backdrop: { sx: { bgcolor: alpha('#000', 0.5), backdropFilter: 'blur(4px)' } },
                }}>
                {isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
                        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: alpha('#004ac6', 0.2) }} />
                    </Box>
                )}
                {cartDrawerContent}
            </Drawer>

            <Dialog open={!!sizeModalProduct} onClose={() => setSizeModalProduct(null)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: '20px', bgcolor: isDark ? 'rgba(10,10,28,0.98)' : '#fff' } } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem', pb: 1 }}>Seleccionar Talla</DialogTitle>
                <DialogContent>
                    {sizeModalProduct && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                <strong>{sizeModalProduct.name}</strong> - Selecciona una opcion:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {sizeModalProduct && Object.entries(parseSizes(sizeModalProduct.sizes, sizeModalProduct.stock) || {}).map(([size, sizeData]) => {
                                    const stock = sizeData.stock ?? 0
                                    const price = sizeData.price || 0
                                    const isSelected = selectedSize === size
                                    const isAvailable = stock > 0 || !sizeModalProduct.manage_stock
                                    return (
                                        <Chip key={size}
                                            label={`${size}${price > 0 ? ` $${price.toLocaleString()}` : ''} - ${stock > 0 ? `${stock} disp` : (sizeModalProduct.manage_stock ? 'Agotado' : 'Disp')}`}
                                            onClick={() => isAvailable && setSelectedSize(size)}
                                            disabled={!isAvailable}
                                            sx={{
                                                fontWeight: 600, fontSize: '0.85rem', height: 44, px: 2, borderRadius: '14px',
                                                bgcolor: isSelected ? 'primary.main' : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                                color: isSelected ? '#fff' : isAvailable ? 'text.primary' : 'text.disabled',
                                                border: '2px solid', borderColor: isSelected ? 'primary.main' : 'divider',
                                                cursor: isAvailable ? 'pointer' : 'default', opacity: isAvailable ? 1 : 0.5,
                                                '&:hover': isAvailable ? { bgcolor: isSelected ? 'primary.main' : alpha('#004ac6', 0.1) } : {},
                                            }}
                                        />
                                    )
                                })}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setSizeModalProduct(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
                    <Button onClick={handleSizeConfirm} variant="contained" disabled={!selectedSize}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', px: 3 }}>Agregar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { borderRadius: '20px', bgcolor: isDark ? 'rgba(10,10,28,0.98)' : '#fff' } } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 26 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Venta Registrada</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setShowReceipt(false)}><CloseIcon fontSize="small" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    {receiptData && (
                        <Box variant="outlined" ref={printAreaRef} sx={{
                            p: 3, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontSize: '0.8rem',
                            color: isDark ? '#e2e8f0' : '#333',
                            borderRadius: '14px', bgcolor: isDark ? 'rgba(0,74,198,0.03)' : '#fafafa',
                            border: '1px solid', borderColor: 'divider',
                        }}>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 700, mt: 1 }}>
                                    {receiptData.order?.store?.name || user?.storeName || 'E-SHOP'}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', color: 'text.secondary' }}>
                                    NIT/Reg: {receiptData.invoice.store_id || '900800700-1'}<br />
                                    Dir: {receiptData.order?.store?.address || 'Local Comercial'}<br />
                                    Tel: {receiptData.order?.store?.whatsapp || 'N/A'}
                                </Typography>
                            </Box>
                            <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />
                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', display: 'block' }}>
                                    <strong>Factura:</strong> {receiptData.invoice.invoice_number}<br />
                                    <strong>Fecha:</strong> {new Date(receiptData.invoice.created_at).toLocaleString()}<br />
                                    <strong>Cliente:</strong> {receiptData.invoice.customer_name}<br />
                                    {receiptData.invoice.customer_document && <><strong>Doc:</strong> {receiptData.invoice.customer_document}<br /></>}
                                    <strong>Pago:</strong> {receiptData.invoice.payment_method}
                                </Typography>
                            </Box>
                            <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />
                            <table style={{ width: '100%', fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontSize: '0.8rem' }}>
                                <thead><tr style={{ borderBottom: '1px solid #ccc' }}><th style={{ textAlign: 'left' }}>Detalle</th><th style={{ textAlign: 'center' }}>Cant.</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                                <tbody>
                                    {receiptData.order?.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.product_name}{item.selected_size && ` (${item.selected_size})`}</td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>${((item.price + item.extra_price) * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' }}>Subtotal:</Typography>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' }}>${receiptData.invoice.subtotal.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #000' }}>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 900, fontSize: '0.9rem' }}>Total:</Typography>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 900, fontSize: '0.9rem' }}>${receiptData.invoice.total.toLocaleString()}</Typography>
                            </Box>
                            <Divider sx={{ borderStyle: 'dashed', my: 1.5 }} />
                            <Typography variant="caption" sx={{ fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', textAlign: 'center', display: 'block', fontWeight: 600 }}>
                                Gracias por su compra!
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setShowReceipt(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cerrar</Button>
                    <Button onClick={handlePrint} variant="contained" startIcon={<PrintIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px' }}>Imprimir</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    )
}

export default POS
