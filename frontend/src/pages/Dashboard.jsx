import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { TableSkeleton } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'

function Dashboard({ user, onLogout }) {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const toast = useToast()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [categoriesRes, productsRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers })
            ])

            if (categoriesRes.ok) {
                setCategories(await categoriesRes.json())
            }
            if (productsRes.ok) {
                setProducts(await productsRes.json())
            }
        } catch (error) {
            toast.error('Error al cargar datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const res = await fetch(`/api/products/${deleteTarget.id}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                toast.success(`Producto "${deleteTarget.name}" eliminado exitosamente`)
                setDeleteTarget(null)
                fetchDashboardData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar el producto')
            }
        } catch (error) {
            toast.error('Error de conexión')
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

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredProducts.slice(start, start + itemsPerPage)
    }, [filteredProducts, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCategory, searchTerm])

    const getStockBadge = (stock) => {
        if (stock <= 0) return { color: 'error', label: 'Agotado' }
        if (stock < 5) return { color: 'warning', label: 'Stock bajo' }
        return { color: 'success', label: 'Disponible' }
    }

    return (
        <>
            <AdminLayout title="Mi Tienda" user={user} onLogout={onLogout}>
                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                label="Buscar producto"
                                placeholder="Buscar por nombre o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                sx={{ flex: 2, minWidth: 200 }}
                            />
                            <TextField
                                select
                                label="Filtrar por categoría"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                size="small"
                                sx={{ flex: 1, minWidth: 160 }}
                            >
                                <MenuItem value="">Todas las categorías</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </TextField>
                            <Box sx={{ minWidth: 'fit-content' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => { setSelectedCategory(''); setSearchTerm('') }}
                                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                                >
                                    Limpiar filtros
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Productos ({filteredProducts.length})
                                {selectedCategory && (
                                    <Typography component="span" variant="body2" color="text.disabled" sx={{ ml: 1 }}>
                                        en {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                                    </Typography>
                                )}
                            </Typography>
                            <Button component={Link} to="/admin/products/new" variant="contained" size="small" sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5 }}>
                                + Nuevo
                            </Button>
                        </Box>

                        {loading ? (
                            <TableSkeleton rows={5} cols={5} />
                        ) : filteredProducts.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
                                {products.length === 0
                                    ? 'No hay productos registrados. Crea tu primer producto.'
                                    : 'No se encontraron productos con los filtros aplicados.'}
                            </Typography>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nombre</TableCell>
                                                <TableCell>Precio Venta</TableCell>
                                                <TableCell>Costo</TableCell>
                                                <TableCell>Margen</TableCell>
                                                <TableCell>Stock</TableCell>
                                                <TableCell>Categoría</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedProducts.map(product => {
                                                const badge = getStockBadge(product.stock)
                                                const activePrice = product.promo_price || product.price
                                                const margin = product.purchase_price
                                                    ? ((activePrice - product.purchase_price) / activePrice) * 100
                                                    : null

                                                return (
                                                    <TableRow key={product.id} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                                                        <TableCell>
                                                            ${activePrice.toLocaleString()}
                                                            {product.promo_price && (
                                                                <Typography component="span" variant="caption" sx={{ textDecoration: 'line-through', color: 'text.disabled', ml: 0.75 }}>
                                                                    ${product.price.toLocaleString()}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {product.purchase_price ? `$${product.purchase_price.toLocaleString()}` : <Typography component="span" color="text.disabled">—</Typography>}
                                                        </TableCell>
                                                        <TableCell>
                                                            {margin !== null ? (
                                                                <Chip
                                                                    label={`${margin >= 0 ? '+' : ''}${margin.toFixed(0)}%`}
                                                                    size="small"
                                                                    color={margin >= 0 ? 'success' : 'error'}
                                                                    variant="filled"
                                                                    sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                                                                />
                                                            ) : (
                                                                <Typography component="span" color="text.disabled">—</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={`${badge.label}${product.stock > 0 ? ` (${product.stock})` : ''}`}
                                                                size="small"
                                                                color={badge.color}
                                                                variant="filled"
                                                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 0.75 }}>
                                                                <Chip
                                                                    icon={<span style={{ fontSize: '0.7rem' }}>✏️</span>}
                                                                    label="Editar"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    component={Link}
                                                                    to={`/admin/products/edit/${product.id}`}
                                                                    sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', textDecoration: 'none' }}
                                                                />
                                                                <Chip
                                                                    icon={<span style={{ fontSize: '0.7rem' }}>🗑️</span>}
                                                                    label="Eliminar"
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => setDeleteTarget(product)}
                                                                    sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem' }}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>

                                {/* Mobile Cards */}
                                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                                    {paginatedProducts.map(product => {
                                        const badge = getStockBadge(product.stock)
                                        return (
                                            <Card key={product.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{product.name}</Typography>
                                                        <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
                                                            ${product.promo_price || product.price}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                                                        <Chip label={badge.label} size="small" color={badge.color} variant="filled" sx={{ fontWeight: 600 }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            Categoría: {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Chip
                                                            icon={<span style={{ fontSize: '0.65rem' }}>✏️</span>}
                                                            label="Editar"
                                                            size="small"
                                                            variant="outlined"
                                                            component={Link}
                                                            to={`/admin/products/edit/${product.id}`}
                                                            sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', textDecoration: 'none', flex: 1 }}
                                                        />
                                                        <Chip
                                                            icon={<span style={{ fontSize: '0.65rem' }}>🗑️</span>}
                                                            label="Eliminar"
                                                            size="small"
                                                            color="error"
                                                            onClick={() => setDeleteTarget(product)}
                                                            sx={{ cursor: 'pointer', height: 24, fontSize: '0.625rem', flex: 1 }}
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </Box>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Producto"
                message={`¿Estás seguro de eliminar el producto "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
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