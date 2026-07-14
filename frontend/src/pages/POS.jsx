import { useState, useEffect, useMemo, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid' // MUI 9 Grid
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

// Icons
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

const parseSizes = (sizesStr, overallStock) => {
    if (!sizesStr) return null
    try {
        if (sizesStr.startsWith('{')) {
            return JSON.parse(sizesStr)
        }
        // Comma separated list, assign equal/empty stock or overallStock
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
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [activeSession, setActiveSession] = useState(null)
    const [loading, setLoading] = useState(true)
    
    // POS State
    const [cart, setCart] = useState([])
    const [customerName, setCustomerName] = useState('Cliente General')
    const [customerDocument, setCustomerDocument] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    
    // Modals
    const [sizeModalProduct, setSizeModalProduct] = useState(null)
    const [selectedSize, setSelectedSize] = useState('')
    
    // Receipt Modal
    const [showReceipt, setShowReceipt] = useState(false)
    const [receiptData, setReceiptData] = useState(null)
    
    const toast = useToast()
    const printAreaRef = useRef(null)

    // Load initial data
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

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
            const matchSearch = !searchTerm ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchCategory && matchSearch
        })
    }, [products, selectedCategory, searchTerm])

    // Add to cart helper
    const handleAddProduct = (product) => {
        if (!activeSession) {
            toast.error('Debes abrir la caja antes de registrar ventas.')
            return
        }

        const parsedSizes = parseSizes(product.sizes, product.stock)
        
        if (parsedSizes) {
            setSizeModalProduct(product)
            // Select first size that has stock
            const sizeKeys = Object.keys(parsedSizes).filter(Boolean)
            const firstAvailable = sizeKeys.find(s => parsedSizes[s] > 0) || sizeKeys[0] || ''
            setSelectedSize(firstAvailable)
        } else {
            // No sizes, check global stock
            if (product.stock === 0 && product.sizes) {
                // If it requires size but sizes field exists and we couldn't parse it
                toast.error('El producto requiere seleccionar talla pero no está configurado.')
                return
            }
            
            // If stock control is enabled (stock > 0)
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
            // Check if already in cart
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
            // Check stock
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

    // Finalize Sale
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
                
                // Fetch the generated invoice details
                const invoiceRes = await fetch(`/api/invoices/order/${orderData.id}`, { headers })
                if (invoiceRes.ok) {
                    const invData = await invoiceRes.json()
                    setReceiptData(invData)
                    setShowReceipt(true)
                }
                
                // Clear POS state
                setCart([])
                setCustomerName('Cliente General')
                setCustomerDocument('')
                setPaymentMethod('EFECTIVO')
                
                // Reload products to reflect updated stock
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
        const originalContent = document.body.innerHTML
        
        // Open print window
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

    return (
        <AdminLayout title="POS / Venta Local" user={user}>
            {!activeSession && (
                <Card sx={{ mb: 3, borderLeft: '5px solid #ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
                    <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main' }}>
                                ⚠️ Caja Registradora Cerrada
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Debes realizar la apertura de caja antes de poder facturar o registrar ventas en el punto de venta.
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="error" 
                            size="small" 
                            href="/admin/cash-register"
                            sx={{ fontWeight: 700 }}
                        >
                            Ir a Control de Caja
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Grid container spacing={3} sx={{ height: 'calc(100vh - 120px)', minHeight: 500 }}>
                {/* Product Catalog Grid */}
                <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Filters & Search */}
                    <Box sx={{ mb: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flex: 1, minWidth: 200, bgcolor: 'background.paper', borderRadius: 1.5 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
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
                            sx={{ width: 180, bgcolor: 'background.paper', borderRadius: 1.5 }}
                        >
                            <MenuItem value="">Todas</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* Catalog Container */}
                    <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                        <Grid container spacing={2}>
                            {filteredProducts.map(product => {
                                const activePrice = product.promo_price || product.price
                                const isOutOfStock = product.stock === 0 && !product.sizes
                                
                                return (
                                    <Grid size={{ xs: 6, sm: 4, lg: 3 }} key={product.id}>
                                        <Card 
                                            variant="outlined"
                                            onClick={() => !isOutOfStock && handleAddProduct(product)}
                                            sx={{ 
                                                cursor: isOutOfStock ? 'not-allowed' : 'pointer', 
                                                height: '100%',
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                transition: 'all 0.2s',
                                                borderColor: isOutOfStock ? 'divider' : 'primary.light',
                                                opacity: isOutOfStock ? 0.6 : 1,
                                                '&:hover': {
                                                    transform: isOutOfStock ? 'none' : 'translateY(-3px)',
                                                    boxShadow: isOutOfStock ? 'none' : '0 6px 20px rgba(99, 102, 241, 0.15)',
                                                    borderColor: isOutOfStock ? 'divider' : 'primary.main',
                                                }
                                            }}
                                        >
                                            {product.image_url && (
                                                <Box sx={{ position: 'relative', width: '100%', pt: '75%', overflow: 'hidden', bgcolor: 'action.hover' }}>
                                                    <img 
                                                        src={product.image_url} 
                                                        alt={product.name}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            )}
                                            <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {product.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                        {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                        ${activePrice.toLocaleString()}
                                                    </Typography>
                                                    
                                                    {isOutOfStock ? (
                                                        <Chip label="Agotado" size="small" color="error" variant="filled" sx={{ height: 20, fontSize: '0.625rem' }} />
                                                    ) : (
                                                        <Chip 
                                                            label={`Stock: ${product.stock}`} 
                                                            size="small" 
                                                            color={product.stock < 5 ? 'warning' : 'success'} 
                                                            variant="outlined" 
                                                            sx={{ height: 20, fontSize: '0.625rem', fontWeight: 600 }} 
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })}
                            {filteredProducts.length === 0 && (
                                <Box sx={{ width: '100%', py: 8, display: 'flex', justifyContent: 'center' }}>
                                    <Typography color="text.secondary">No se encontraron productos.</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Box>
                </Grid>

                {/* POS Shopping Cart Sidebar */}
                <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ height: '100%' }}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            height: '100%', 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            borderRadius: 3, 
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <ShoppingCartIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Carrito de Ventas
                            </Typography>
                            <Chip label={cart.reduce((sum, item) => sum + item.quantity, 0)} size="small" color="primary" sx={{ fontWeight: 700 }} />
                        </Box>
                        
                        <Divider sx={{ mb: 1.5 }} />

                        {/* Cart Items List */}
                        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                            {cart.length === 0 ? (
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                                    <PointOfSaleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
                                        Selecciona productos del catálogo para iniciar la venta local
                                    </Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {cart.map((item, index) => (
                                        <ListItem 
                                            key={`${item.product.id}-${item.size}`}
                                            secondaryAction={
                                                <IconButton edge="end" size="small" color="error" onClick={() => handleRemoveItem(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            }
                                            sx={{ px: 0.5, py: 1, borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {item.product.name}
                                                        {item.size && (
                                                            <Chip label={`Talla: ${item.size}`} size="small" variant="filled" sx={{ ml: 1, height: 18, fontSize: '0.625rem', bgcolor: 'primary.light', color: 'white' }} />
                                                        )}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800 }}>
                                                            ${((item.price + item.extra_price) * item.quantity).toLocaleString()}
                                                        </Typography>
                                                        
                                                        {/* Quantity buttons */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, px: 0.5, bgcolor: 'background.default' }}>
                                                            <IconButton size="small" onClick={() => handleUpdateQty(index, -1)} sx={{ p: 0.25 }}>
                                                                <RemoveIcon sx={{ fontSize: 12 }} />
                                                            </IconButton>
                                                            <Typography sx={{ mx: 1, fontSize: '0.75rem', fontWeight: 700 }}>
                                                                {item.quantity}
                                                            </Typography>
                                                            <IconButton size="small" onClick={() => handleUpdateQty(index, 1)} sx={{ p: 0.25 }}>
                                                                <AddIcon sx={{ fontSize: 12 }} />
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

                        <Divider sx={{ mb: 2 }} />

                        {/* Customer & Billing Form */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    label="Cliente"
                                    placeholder="Nombre del cliente"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    sx={{ flex: 1 }}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon fontSize="small" />
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
                                    sx={{ width: 140 }}
                                />
                            </Box>
                            
                            <TextField
                                select
                                size="small"
                                label="Método de Pago"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {paymentMethod === 'EFECTIVO' ? <LocalAtmIcon fontSize="small" color="success" /> : <CreditCardIcon fontSize="small" color="primary" />}
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

                        {/* Summary & Checkout */}
                        <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2, mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>${cartTotal.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">IVA (0%)</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>$0</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total Venta</Typography>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 900 }}>
                                    ${cartTotal.toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            disabled={cart.length === 0 || !activeSession}
                            onClick={handleCheckout}
                            sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
                            startIcon={<ReceiptIcon />}
                        >
                            Facturar Venta (${cartTotal.toLocaleString()})
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Sizes Selection Dialog */}
            <Dialog open={!!sizeModalProduct} onClose={() => setSizeModalProduct(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Seleccionar Talla</DialogTitle>
                <DialogContent>
                    {sizeModalProduct && (
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                El producto <strong>{sizeModalProduct.name}</strong> tiene control de stock por talla. Selecciona una opción:
                            </Typography>
                            
                            <TextField
                                select
                                label="Talla Disponible"
                                fullWidth
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
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
                <DialogActions>
                    <Button onClick={() => setSizeModalProduct(null)}>Cancelar</Button>
                    <Button onClick={handleSizeConfirm} variant="contained">Agregar</Button>
                </DialogActions>
            </Dialog>

            {/* Receipt Modal (Invoice Print View) */}
            <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Venta Registrada Exitosamente</Typography>
                    <IconButton size="small" onClick={() => setShowReceipt(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {receiptData && (
                        <Box sx={{ p: 1 }}>
                            {/* Receipt Container */}
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 3, 
                                    bgcolor: '#fafafa', 
                                    fontFamily: 'monospace', 
                                    fontSize: '0.8125rem',
                                    color: '#333',
                                    borderRadius: 2
                                }}
                                ref={printAreaRef}
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

                                <Box sx={{ borderBottom: '1px dashed #000', mb: 2 }} />

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

                                <Box sx={{ borderBottom: '1px dashed #000', mb: 1 }} />

                                {/* Items Table */}
                                <table style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
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

                                <Box sx={{ borderBottom: '1px dashed #000', mt: 2, mb: 1 }} />

                                {/* Summary */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <span>Subtotal:</span>
                                        <span>${receiptData.invoice.subtotal.toLocaleString()}</span>
                                    </Box>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <span>Impuestos (0%):</span>
                                        <span>$0</span>
                                    </Box>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', pt: 1, borderTop: '1px solid #000' }}>
                                        <span>Total:</span>
                                        <span>${receiptData.invoice.total.toLocaleString()}</span>
                                    </Box>
                                </Box>

                                <Box sx={{ borderBottom: '1px dashed #000', mt: 2, mb: 2 }} />

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
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowReceipt(false)}>Cerrar</Button>
                    <Button 
                        onClick={handlePrint} 
                        variant="contained" 
                        color="primary"
                        startIcon={<PrintIcon />}
                    >
                        Imprimir Recibo
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    )
}

export default POS
