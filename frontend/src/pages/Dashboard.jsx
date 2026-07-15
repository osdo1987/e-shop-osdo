import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { TableSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ViewListIcon from '@mui/icons-material/ViewList'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import FilterListIcon from '@mui/icons-material/FilterList'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import SellIcon from '@mui/icons-material/Sell'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'

const catColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function Dashboard({ user, onLogout }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [viewMode, setViewMode] = useState('list')
    const [sortBy, setSortBy] = useState('name')
    const [updatingStock, setUpdatingStock] = useState(null)
    const toast = useToast()

    const itemsPerPage = viewMode === 'grid' ? 12 : 15

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const [categoriesRes, productsRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers })
            ])
            if (categoriesRes.ok) setCategories(await categoriesRes.json())
            if (productsRes.ok) setProducts(await productsRes.json())
        } catch {
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDashboardData() }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/products/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success(`"${deleteTarget.name}" eliminado`)
                setDeleteTarget(null)
                fetchDashboardData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar')
            }
        } catch {
            toast.error('Error de conexión')
        }
    }

    const handleQuickStock = async (product, delta) => {
        const newStock = Math.max(0, (product.stock || 0) + delta)
        setUpdatingStock(product.id)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...product, stock: newStock })
            })
            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p))
            } else {
                toast.error('Error al actualizar stock')
            }
        } catch {
            toast.error('Error de conexión')
        } finally {
            setUpdatingStock(null)
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
            const matchSearch = !searchTerm ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            return matchCategory && matchSearch
        })
    }, [products, selectedCategory, searchTerm])

    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts]
        switch (sortBy) {
            case 'price-asc': return sorted.sort((a, b) => (a.promo_price || a.price) - (b.promo_price || b.price))
            case 'price-desc': return sorted.sort((a, b) => (b.promo_price || b.price) - (a.promo_price || a.price))
            case 'stock': return sorted.sort((a, b) => (a.stock || 0) - (b.stock || 0))
            case 'margin':
                return sorted.sort((a, b) => {
                    const mA = a.purchase_price ? ((a.promo_price || a.price) - a.purchase_price) / (a.promo_price || a.price) : -1
                    const mB = b.purchase_price ? ((b.promo_price || b.price) - b.purchase_price) / (b.promo_price || b.price) : -1
                    return mB - mA
                })
            case 'name':
            default: return sorted.sort((a, b) => a.name.localeCompare(b.name))
        }
    }, [filteredProducts, sortBy])

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return sortedProducts.slice(start, start + itemsPerPage)
    }, [sortedProducts, currentPage, itemsPerPage])

    useEffect(() => { setCurrentPage(1) }, [selectedCategory, searchTerm, viewMode])

    const stats = useMemo(() => {
        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length
        const outOfStock = products.filter(p => p.stock <= 0).length
        const withMargin = products.filter(p => p.purchase_price)
        const avgMargin = withMargin.length > 0
            ? withMargin.reduce((sum, p) => {
                const price = p.promo_price || p.price
                return sum + ((price - p.purchase_price) / price) * 100
            }, 0) / withMargin.length
            : null
        const promoCount = products.filter(p => p.promo_price).length
        return { total: products.length, totalStock, lowStock, outOfStock, avgMargin, promoCount }
    }, [products])

    const getStockColor = (stock) => {
        if (stock <= 0) return '#6b7280'
        if (stock < 5) return '#f59e0b'
        return '#10b981'
    }

    const getStockLabel = (stock) => {
        if (stock <= 0) return 'Sin stock'
        if (stock < 5) return `${stock} uds`
        return `${stock} uds`
    }

    const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || 'Sin categoría'
    const getCategoryColor = (catId) => catColors[(catId - 1) % catColors.length] || catColors[0]

    const c = {
        bg: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        border: isDark ? 'rgba(129,140,248,0.10)' : 'rgba(0,0,0,0.06)',
        borderHover: isDark ? 'rgba(129,140,248,0.20)' : 'rgba(99,102,241,0.15)',
        dim: isDark ? '#6060a0' : '#94a3b8',
        accent: isDark ? '#818cf8' : '#4f46e5',
        accentBg: isDark ? 'rgba(129,140,248,0.10)' : 'rgba(79,70,229,0.06)',
        surfaceHover: isDark ? 'rgba(129,140,248,0.04)' : 'rgba(0,0,0,0.02)',
    }

    return (
        <>
            <AdminLayout title="Productos" user={user} onLogout={onLogout}>

                {/* ── Stats ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.25, mb: 2.5 }}>
                    {[
                        { label: 'Productos', value: stats.total, color: '#6366f1', icon: <Inventory2Icon sx={{ fontSize: 16 }} /> },
                        { label: 'Stock total', value: stats.totalStock, color: '#10b981', icon: <LocalShippingIcon sx={{ fontSize: 16 }} /> },
                        { label: 'Bajo stock', value: stats.lowStock, color: '#f59e0b', icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
                        { label: 'Promos', value: stats.promoCount, color: '#ef4444', icon: <SellIcon sx={{ fontSize: 16 }} /> },
                        { label: 'Margen prom.', value: stats.avgMargin !== null ? `${stats.avgMargin.toFixed(0)}%` : '—', color: '#8b5cf6', icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
                    ].map(s => (
                        <Tooltip key={s.label} title={`${s.label}: ${s.value}`} arrow placement="top">
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.25,
                                px: 1.75, py: 1.25, borderRadius: '12px',
                                background: c.bg, border: `1px solid ${c.border}`,
                                cursor: 'default',
                                transition: 'all 0.2s ease',
                                '&:hover': { borderColor: c.borderHover, background: c.surfaceHover },
                            }}>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: '9px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: `${s.color}12`, color: s.color, flexShrink: 0,
                                }}>
                                    {s.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}>
                                        {s.value}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.dim, lineHeight: 1.2 }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            </Box>
                        </Tooltip>
                    ))}
                </Box>

                {/* ── Category Tabs ── */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Chip
                        label={`Todos (${products.length})`}
                        onClick={() => setSelectedCategory('')}
                        size="small"
                        sx={{
                            fontWeight: 600, fontSize: '0.72rem', borderRadius: '8px',
                            bgcolor: !selectedCategory ? c.accent : 'transparent',
                            color: !selectedCategory ? '#fff' : 'text.secondary',
                            border: `1px solid ${!selectedCategory ? c.accent : c.border}`,
                            '&:hover': { bgcolor: !selectedCategory ? c.accent : c.surfaceHover },
                        }}
                    />
                    {categories.map((cat, i) => {
                        const count = products.filter(p => p.category_id === cat.id).length
                        const active = selectedCategory === String(cat.id)
                        const color = catColors[i % catColors.length]
                        return (
                            <Chip
                                key={cat.id}
                                label={`${cat.name} (${count})`}
                                onClick={() => setSelectedCategory(active ? '' : String(cat.id))}
                                size="small"
                                sx={{
                                    fontWeight: 600, fontSize: '0.72rem', borderRadius: '8px',
                                    bgcolor: active ? color : 'transparent',
                                    color: active ? '#fff' : 'text.secondary',
                                    border: `1px solid ${active ? color : c.border}`,
                                    '&:hover': { bgcolor: active ? color : c.surfaceHover },
                                }}
                            />
                        )
                    })}
                </Box>

                {/* ── Toolbar ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Buscar por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: <SearchIcon sx={{ color: c.dim, mr: 1, fontSize: 18 }} />,
                                endAdornment: searchTerm ? (
                                    <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ p: 0.25 }}>
                                        <ClearIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                ) : null,
                            },
                        }}
                        sx={{
                            flex: 1, minWidth: 220, maxWidth: 380,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', fontSize: '0.85rem',
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                                '& fieldset': { borderColor: c.border },
                                '&:hover fieldset': { borderColor: c.borderHover },
                                '&.Mui-focused fieldset': { borderColor: c.accent },
                            },
                        }}
                    />

                    <TextField
                        select size="small" value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{
                            minWidth: 130,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px', fontSize: '0.82rem',
                                '& fieldset': { borderColor: c.border },
                            },
                        }}
                    >
                        <MenuItem value="name">Nombre</MenuItem>
                        <MenuItem value="price-asc">Precio ↑</MenuItem>
                        <MenuItem value="price-desc">Precio ↓</MenuItem>
                        <MenuItem value="stock">Stock ↓</MenuItem>
                        <MenuItem value="margin">Margen ↓</MenuItem>
                    </TextField>

                    <Box sx={{ display: 'flex', border: `1px solid ${c.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                        {[
                            { mode: 'list', icon: <ViewListIcon sx={{ fontSize: 18 }} /> },
                            { mode: 'grid', icon: <ViewModuleIcon sx={{ fontSize: 18 }} /> },
                        ].map(({ mode, icon }) => (
                            <IconButton
                                key={mode} size="small" onClick={() => setViewMode(mode)}
                                sx={{
                                    borderRadius: 0, px: 1.25, py: 0.5,
                                    color: viewMode === mode ? c.accent : c.dim,
                                    background: viewMode === mode ? c.accentBg : 'transparent',
                                }}
                            >
                                {icon}
                            </IconButton>
                        ))}
                    </Box>

                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: c.dim, fontFamily: '"JetBrains Mono", monospace', ml: 'auto' }}>
                        {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                    </Typography>

                    <Button
                        component={Link} to="/admin/products/new"
                        variant="contained" size="small"
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                        sx={{ borderRadius: '10px', px: 2.5, py: 0.65, fontWeight: 700, fontSize: '0.82rem' }}
                    >
                        Nuevo Producto
                    </Button>
                </Box>

                {/* ── Active Filters ── */}
                {(searchTerm || selectedCategory) && (
                    <Box sx={{ display: 'flex', gap: 0.75, mb: 2, alignItems: 'center' }}>
                        <FilterListIcon sx={{ fontSize: 14, color: c.dim }} />
                        {searchTerm && (
                            <Chip label={`"${searchTerm}"`} size="small" onDelete={() => setSearchTerm('')}
                                sx={{ height: 22, borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, background: `${c.accent}12`, color: c.accent, '& .MuiChip-deleteIcon': { fontSize: 14 } }}
                            />
                        )}
                        {selectedCategory && (
                            <Chip label={getCategoryName(parseInt(selectedCategory))} size="small" onDelete={() => setSelectedCategory('')}
                                sx={{ height: 22, borderRadius: '6px', fontSize: '0.68rem', fontWeight: 600, background: `${getCategoryColor(parseInt(selectedCategory))}12`, color: getCategoryColor(parseInt(selectedCategory)), '& .MuiChip-deleteIcon': { fontSize: 14 } }}
                            />
                        )}
                        <Box onClick={() => { setSearchTerm(''); setSelectedCategory('') }}
                            sx={{ fontSize: '0.68rem', fontWeight: 600, color: c.dim, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', '&:hover': { color: 'text.primary' } }}>
                            Limpiar
                        </Box>
                    </Box>
                )}

                {/* ── Content ── */}
                {loading ? (
                    <TableSkeleton rows={5} cols={5} />
                ) : filteredProducts.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center', py: 10, px: 3,
                        border: `2px dashed ${c.border}`, borderRadius: '14px',
                        background: c.bg,
                    }}>
                        <Inventory2Icon sx={{ fontSize: 48, color: c.dim, opacity: 0.3, mb: 2 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                            {products.length === 0 ? 'Tu tienda está vacía' : 'Sin resultados'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: c.dim, mb: 3, maxWidth: 360, mx: 'auto' }}>
                            {products.length === 0
                                ? 'Crea tu primer producto para empezar a vender por WhatsApp.'
                                : 'No se encontraron productos con los filtros aplicados.'}
                        </Typography>
                        {products.length === 0 && (
                            <Button component={Link} to="/admin/products/new" variant="contained" startIcon={<AddIcon />} size="small"
                                sx={{ borderRadius: '10px', px: 3, py: 0.75, fontWeight: 700 }}>
                                Crear Primer Producto
                            </Button>
                        )}
                    </Box>
                ) : viewMode === 'grid' ? (
                    /* ── Grid View ── */
                    <>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                            {paginatedProducts.map((product, idx) => {
                                const activePrice = product.promo_price || product.price
                                const hasPromo = !!product.promo_price
                                const margin = product.purchase_price ? ((activePrice - product.purchase_price) / activePrice) * 100 : null

                                return (
                                    <Box key={product.id} onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                        sx={{
                                            border: `1px solid ${c.border}`, borderRadius: '12px', overflow: 'hidden',
                                            background: c.bg, cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            animation: `fade-in-up 0.3s ease both`, animationDelay: `${idx * 30}ms`,
                                            '&:hover': {
                                                borderColor: c.borderHover,
                                                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
                                                '& .card-img': { transform: 'scale(1.03)' },
                                            },
                                        }}
                                    >
                                        {/* Image */}
                                        <Box sx={{ height: 130, overflow: 'hidden', position: 'relative', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {product.image_url ? (
                                                <Box component="img" src={product.image_url} alt={product.name} className="card-img"
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                                            ) : (
                                                <Inventory2Icon sx={{ fontSize: 32, color: 'text.disabled', opacity: 0.2 }} />
                                            )}
                                            {hasPromo && (
                                                <Chip label="PROMO" size="small"
                                                    sx={{ position: 'absolute', top: 8, left: 8, height: 20, fontSize: '0.55rem', fontWeight: 800, bgcolor: '#ef4444', color: '#fff', letterSpacing: '0.04em' }} />
                                            )}
                                            <Chip
                                                label={getStockLabel(product.stock)}
                                                size="small"
                                                sx={{
                                                    position: 'absolute', top: 8, right: 8, height: 20,
                                                    fontSize: '0.58rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace',
                                                    bgcolor: `${getStockColor(product.stock)}18`, color: getStockColor(product.stock),
                                                    border: `1px solid ${getStockColor(product.stock)}25`,
                                                }}
                                            />
                                        </Box>

                                        {/* Info */}
                                        <Box sx={{ p: 1.25 }}>
                                            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {product.name}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.75 }}>
                                                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.95rem', color: hasPromo ? '#ef4444' : 'text.primary' }}>
                                                    ${activePrice.toLocaleString()}
                                                </Typography>
                                                {hasPromo && (
                                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.62rem', textDecoration: 'line-through', color: c.dim }}>
                                                        ${product.price.toLocaleString()}
                                                    </Typography>
                                                )}
                                                {margin !== null && (
                                                    <Chip label={`${margin >= 0 ? '+' : ''}${margin.toFixed(0)}%`} size="small"
                                                        sx={{
                                                            height: 18, ml: 'auto', fontSize: '0.55rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace',
                                                            bgcolor: margin >= 0 ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                                                            color: margin >= 0 ? '#10b981' : '#ef4444', borderRadius: '5px',
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Category + Quick stock */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: getCategoryColor(product.category_id), flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 500, color: c.dim, maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {getCategoryName(product.category_id)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}
                                                    onClick={(e) => e.stopPropagation()}>
                                                    <IconButton size="small" disabled={updatingStock === product.id}
                                                        onClick={(e) => { e.stopPropagation(); handleQuickStock(product, -1); }}
                                                        sx={{ width: 22, height: 22, color: c.dim, '&:hover': { color: '#ef4444' } }}>
                                                        <RemoveCircleOutlinedIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.68rem', fontWeight: 700, minWidth: 18, textAlign: 'center', color: getStockColor(product.stock) }}>
                                                        {product.stock}
                                                    </Typography>
                                                    <IconButton size="small" disabled={updatingStock === product.id}
                                                        onClick={(e) => { e.stopPropagation(); handleQuickStock(product, 1); }}
                                                        sx={{ width: 22, height: 22, color: c.dim, '&:hover': { color: '#10b981' } }}>
                                                        <AddCircleOutlinedIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                        <Box sx={{ mt: 2.5 }}><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></Box>
                    </>
                ) : (
                    /* ── Table View ── */
                    <>
                        <Box sx={{ border: `1px solid ${c.border}`, borderRadius: '12px', overflow: 'hidden', background: c.bg }}>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ pl: 2.5 }}>Producto</TableCell>
                                            <TableCell>Precio</TableCell>
                                            <TableCell>Costo</TableCell>
                                            <TableCell>Margen</TableCell>
                                            <TableCell>Stock</TableCell>
                                            <TableCell>Categoría</TableCell>
                                            <TableCell align="right" sx={{ pr: 2.5, width: 110 }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedProducts.map((product, idx) => {
                                            const activePrice = product.promo_price || product.price
                                            const margin = product.purchase_price
                                                ? ((activePrice - product.purchase_price) / activePrice) * 100
                                                : null

                                            return (
                                                <TableRow key={product.id} hover
                                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        animation: `fade-in-up 0.2s ease both`, animationDelay: `${idx * 20}ms`,
                                                        '&:last-child td': { borderBottom: 0 },
                                                    }}
                                                >
                                                    <TableCell sx={{ pl: 2.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                                            <Box sx={{
                                                                width: 40, height: 40, borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
                                                                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                                border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                {product.image_url ? (
                                                                    <Box component="img" src={product.image_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <Inventory2Icon sx={{ fontSize: 18, color: 'text.disabled', opacity: 0.3 }} />
                                                                )}
                                                            </Box>
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }}>
                                                                    {product.name}
                                                                </Typography>
                                                                {product.description && (
                                                                    <Typography sx={{ fontSize: '0.68rem', color: c.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                                                                        {product.description}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.85rem', color: product.promo_price ? '#ef4444' : 'text.primary' }}>
                                                                ${activePrice.toLocaleString()}
                                                            </Typography>
                                                            {product.promo_price && (
                                                                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.62rem', textDecoration: 'line-through', color: c.dim }}>
                                                                    ${product.price.toLocaleString()}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', color: product.purchase_price ? 'text.primary' : c.dim }}>
                                                            {product.purchase_price ? `$${product.purchase_price.toLocaleString()}` : '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {margin !== null ? (
                                                            <Chip label={`${margin >= 0 ? '+' : ''}${margin.toFixed(0)}%`} size="small"
                                                                sx={{
                                                                    fontWeight: 700, fontSize: '0.68rem', height: 24, borderRadius: '7px',
                                                                    fontFamily: '"JetBrains Mono", monospace',
                                                                    bgcolor: margin >= 0 ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                                                                    color: margin >= 0 ? '#10b981' : '#ef4444',
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', color: c.dim }}>—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                            onClick={(e) => e.stopPropagation()}>
                                                            <IconButton size="small" disabled={updatingStock === product.id}
                                                                onClick={() => handleQuickStock(product, -1)}
                                                                sx={{ width: 24, height: 24, color: c.dim, '&:hover': { color: '#ef4444' } }}>
                                                                <RemoveCircleOutlinedIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                            <Typography sx={{
                                                                fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem', fontWeight: 700,
                                                                minWidth: 24, textAlign: 'center', color: getStockColor(product.stock),
                                                            }}>
                                                                {product.stock}
                                                            </Typography>
                                                            <IconButton size="small" disabled={updatingStock === product.id}
                                                                onClick={() => handleQuickStock(product, 1)}
                                                                sx={{ width: 24, height: 24, color: c.dim, '&:hover': { color: '#10b981' } }}>
                                                                <AddCircleOutlinedIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: getCategoryColor(product.category_id) }} />
                                                            <Typography sx={{ fontSize: '0.78rem', color: c.dim, fontWeight: 500 }}>
                                                                {getCategoryName(product.category_id)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: 2.5 }}>
                                                        <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}
                                                            onClick={(e) => e.stopPropagation()}>
                                                            <Tooltip title="Ver / Editar" arrow>
                                                                <IconButton component={Link} to={`/admin/products/edit/${product.id}`}
                                                                    size="small" sx={{ width: 30, height: 30, color: c.accent, '&:hover': { background: c.accentBg } }}>
                                                                    <EditIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Eliminar" arrow>
                                                                <IconButton size="small" onClick={() => setDeleteTarget(product)}
                                                                    sx={{ width: 30, height: 30, color: isDark ? '#f87171' : '#ef4444', '&:hover': { background: 'rgba(239,68,68,0.08)' } }}>
                                                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2.5 }}><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></Box>
                    </>
                )}
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Producto"
                message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Dashboard
