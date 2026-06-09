import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'

function ProductForm({ user }) {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(isEditing)
    const toast = useToast()
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        promo_price: '',
        purchase_price: '',
        stock: '',
        category_id: '',
        image_url: '',
        sizes: ''
    })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [sizeStockMap, setSizeStockMap] = useState({})
    const [customSize, setCustomSize] = useState('')

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token')
            try {
                const res = await fetch('/api/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    setCategories(await res.json())
                }
            } catch (err) {
                console.error('Error fetching categories:', err)
            }
        }

        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`/api/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const product = await res.json()
                    setForm({
                        name: product.name || '',
                        description: product.description || '',
                        price: product.price?.toString() || '',
                        promo_price: product.promo_price?.toString() || '',
                        purchase_price: product.purchase_price?.toString() || '',
                        stock: product.stock?.toString() || '',
                        category_id: product.category_id?.toString() || '',
                        image_url: product.image_url || '',
                        sizes: product.sizes || ''
                    })

                    let parsedSizes = {}
                    if (product.sizes) {
                        try {
                            if (product.sizes.startsWith('{')) {
                                parsedSizes = JSON.parse(product.sizes)
                            } else {
                                product.sizes.split(',').forEach(s => {
                                    const cleanS = s.trim()
                                    if (cleanS) parsedSizes[cleanS] = 10
                                })
                            }
                        } catch (e) {
                            console.error("Error parsing sizes:", e)
                        }
                    }
                    setSizeStockMap(parsedSizes)
                } else {
                    setError('Error al cargar el producto')
                }
            } catch (err) {
                setError('Error de conexión')
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
        if (isEditing) {
            fetchProduct()
        }
    }, [id])

    const [hasSizes, setHasSizes] = useState(false)

    useEffect(() => {
        if (Object.keys(sizeStockMap).length > 0) {
            setHasSizes(true)
        }
    }, [sizeStockMap])

    const presetClothing = ['S', 'M', 'L', 'XL', 'XXL']
    const presetShoes = ['36', '37', '38', '39', '40', '41', '42', '43']

    const selectedSizes = Object.keys(sizeStockMap)

    const handleToggleSize = (size) => {
        setSizeStockMap(prev => {
            const next = { ...prev }
            if (next.hasOwnProperty(size)) {
                delete next[size]
            } else {
                next[size] = 10
            }
            return next
        })
    }

    const handleToggleHasSizes = () => {
        if (hasSizes) {
            setSizeStockMap({})
        }
        setHasSizes(!hasSizes)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        const token = localStorage.getItem('token')
        try {
            const url = isEditing ? `/api/products/${id}` : '/api/products'
            const method = isEditing ? 'PUT' : 'POST'

            const finalStock = hasSizes
                ? Object.values(sizeStockMap).reduce((a, b) => a + b, 0)
                : parseInt(form.stock)

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
                    purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
                    stock: finalStock,
                    sizes: hasSizes ? JSON.stringify(sizeStockMap) : '',
                    category_id: parseInt(form.category_id),
                    store_id: user.storeId
                })
            })

            if (res.ok) {
                toast.success(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
                navigate('/admin')
            } else {
                const data = await res.json()
                setError(data.error || `Error al ${isEditing ? 'actualizar' : 'crear'} producto`)
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Cargando..." user={user}>
                <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>Cargando producto...</Typography>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} user={user} showBack>
            <Card sx={{ maxWidth: 700 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Nombre del Producto"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Camiseta Algodón Premium"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Descripción del producto..."
                            sx={{ mb: 2 }}
                        />
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Precio de Venta"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                    type="number"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    placeholder="45000"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Precio Promocional"
                                    name="promo_price"
                                    value={form.promo_price}
                                    onChange={handleChange}
                                    type="number"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    placeholder="35000"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Precio de Compra (Costo)"
                                    name="purchase_price"
                                    value={form.purchase_price}
                                    onChange={handleChange}
                                    type="number"
                                    inputProps={{ min: 0, step: 0.01 }}
                                    placeholder="25000"
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={`Stock ${hasSizes ? '(Calculado de las tallas)' : ''}`}
                                    name="stock"
                                    value={hasSizes ? Object.values(sizeStockMap).reduce((a, b) => a + b, 0) : form.stock}
                                    onChange={handleChange}
                                    required
                                    disabled={hasSizes}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    placeholder="50"
                                    sx={hasSizes ? { '& .MuiInputBase-root': { opacity: 0.7 } } : {}}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Categoría"
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="">Seleccionar categoría</MenuItem>
                                    {categories.map(cat => (
                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        {/* Tallas y Variantes */}
                        <Box sx={{ mb: 2.5 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={hasSizes}
                                        onChange={handleToggleHasSizes}
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>¿Este producto tiene tallas o variantes?</Typography>}
                            />

                            {hasSizes && (
                                <Box sx={{
                                    mt: 1.5,
                                    p: 2,
                                    bgcolor: 'background.default',
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
                                        Tallas de Ropa Comunes
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {presetClothing.map(size => (
                                            <Chip
                                                key={size}
                                                label={size}
                                                onClick={() => handleToggleSize(size)}
                                                color={selectedSizes.includes(size) ? 'primary' : 'default'}
                                                variant={selectedSizes.includes(size) ? 'filled' : 'outlined'}
                                                size="small"
                                                sx={{ borderRadius: 20 }}
                                            />
                                        ))}
                                    </Box>

                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
                                        Tallas de Calzado Comunes
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {presetShoes.map(size => (
                                            <Chip
                                                key={size}
                                                label={size}
                                                onClick={() => handleToggleSize(size)}
                                                color={selectedSizes.includes(size) ? 'primary' : 'default'}
                                                variant={selectedSizes.includes(size) ? 'filled' : 'outlined'}
                                                size="small"
                                                sx={{ borderRadius: 20 }}
                                            />
                                        ))}
                                    </Box>

                                    {/* Custom Size */}
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mb: 2.5 }}>
                                        <TextField
                                            size="small"
                                            label="Agregar Talla Personalizada"
                                            value={customSize}
                                            onChange={(e) => setCustomSize(e.target.value)}
                                            placeholder="Ej: XXL, 44, Única"
                                            sx={{ flex: 1 }}
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => {
                                                const cleanSize = customSize.trim().toUpperCase()
                                                if (cleanSize && !sizeStockMap.hasOwnProperty(cleanSize)) {
                                                    setSizeStockMap(prev => ({ ...prev, [cleanSize]: 10 }))
                                                    setCustomSize('')
                                                }
                                            }}
                                            sx={{ height: 40 }}
                                        >
                                            + Agregar
                                        </Button>
                                    </Box>

                                    {selectedSizes.length > 0 && (
                                        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                                                Configurar Unidades por Talla
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {selectedSizes.map(size => (
                                                    <Box key={size} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, border: 1, borderColor: 'divider' }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 40 }}>{size}</Typography>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            inputProps={{ min: 0 }}
                                                            value={sizeStockMap[size] ?? 10}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0
                                                                setSizeStockMap(prev => ({ ...prev, [size]: val }))
                                                            }}
                                                            sx={{ width: 80 }}
                                                        />
                                                        <Typography variant="caption" color="text.disabled">unidades</Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSizeStockMap(prev => {
                                                                    const next = { ...prev }
                                                                    delete next[size]
                                                                    return next
                                                                })
                                                            }}
                                                            sx={{ ml: 'auto', color: 'error.main' }}
                                                        >
                                                            🗑️
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            label="URL de Imagen (opcional)"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            sx={{ mb: 2 }}
                        />

                        {/* Image Upload */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>O subir imagen</Typography>
                            <Box
                                component="label"
                                sx={{
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 3,
                                    textAlign: 'center',
                                    color: 'text.disabled',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'block',
                                    bgcolor: 'background.default',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                📸 Arrastra una imagen aquí o haz clic para seleccionar
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (ev) => {
                                                setForm({ ...form, image_url: ev.target.result })
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                />
                            </Box>
                            {form.image_url && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        component="img"
                                        src={form.image_url}
                                        alt="Preview"
                                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                    <Button variant="outlined" size="small" onClick={() => setForm({ ...form, image_url: '' })}>
                                        Quitar imagen
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        <Grid container spacing={1.5} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <Button type="submit" variant="contained" fullWidth disabled={saving} sx={{ py: 1.5 }}>
                                    {saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Guardar Producto')}
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button component={Link} to="/admin" variant="outlined" fullWidth sx={{ py: 1.5 }}>
                                    Cancelar
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}

export default ProductForm