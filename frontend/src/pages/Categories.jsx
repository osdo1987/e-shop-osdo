import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'

const categoryColors = [
    { bg: 'rgba(99,102,241,0.10)', color: '#6366f1', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))' },
    { bg: 'rgba(139,92,246,0.10)', color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))' },
    { bg: 'rgba(16,185,129,0.10)', color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' },
    { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' },
    { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' },
    { bg: 'rgba(6,182,212,0.10)', color: '#06b6d4', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))' },
    { bg: 'rgba(236,72,153,0.10)', color: '#ec4899', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))' },
    { bg: 'rgba(20,184,166,0.10)', color: '#14b8a6', gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))' },
]

function Categories({ user }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [creating, setCreating] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const toast = useToast()

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const [catRes, prodRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers })
            ])
            if (catRes.ok) setCategories(await catRes.json())
            if (prodRes.ok) setProducts(await prodRes.json())
        } catch {
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const getProductCount = (catId) => products.filter(p => p.category_id === catId).length

    const handleCreate = async (e) => {
        e.preventDefault()
        setCreating(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newCategoryName, store_id: user.storeId })
            })
            if (res.ok) {
                toast.success(`Categoría "${newCategoryName}" creada`)
                setNewCategoryName('')
                fetchData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al crear')
            }
        } catch {
            toast.error('Error de conexión')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/categories/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success(`Categoría "${deleteTarget.name}" eliminada`)
                setDeleteTarget(null)
                fetchData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar')
            }
        } catch {
            toast.error('Error de conexión')
        }
    }

    return (
        <>
            <AdminLayout title="Categorías" user={user}>
                {/* Header stats */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' },
                    gap: 2, mb: 3,
                }}>
                    {[
                        { label: 'Categorías', value: categories.length, icon: <CategoryIcon sx={{ fontSize: 22 }} />, color: '#8b5cf6' },
                        { label: 'Productos Totales', value: products.length, icon: <Inventory2Icon sx={{ fontSize: 22 }} />, color: '#6366f1' },
                    ].map((s, i) => (
                        <Card key={s.label} sx={{ animation: `fade-in-up 0.4s ease both`, animationDelay: `${i * 80}ms`, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${s.color}, ${s.color}66)` }} />
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}15`, color: s.color }}>
                                    {s.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>{s.value}</Typography>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>{s.label}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Create form — inline premium */}
                <Card sx={{ mb: 3, animation: 'fade-in-up 0.4s ease both', animationDelay: '0.16s' }}>
                    <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <Box sx={{
                                width: 42, height: 42, borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)',
                                color: '#8b5cf6', flexShrink: 0,
                            }}>
                                <AddIcon sx={{ fontSize: 22 }} />
                            </Box>
                            <TextField
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nombre de la nueva categoría..."
                                required
                                size="small"
                                sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        background: isDark ? 'rgba(129,140,248,0.04)' : 'rgba(99,102,241,0.03)',
                                    },
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!newCategoryName.trim() || creating}
                                startIcon={creating ? null : <AddIcon sx={{ fontSize: 18 }} />}
                                sx={{ borderRadius: '12px', px: 3, py: 0.85, fontWeight: 700, minWidth: 120 }}
                            >
                                {creating ? 'Creando...' : 'Crear'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Categories grid */}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {[1, 2, 3].map(i => (
                            <Card key={i} sx={{ height: 140, animation: 'card-glow-pulse 2s ease-in-out infinite', animationDelay: `${i * 200}ms` }} />
                        ))}
                    </Box>
                ) : categories.length === 0 ? (
                    <Card sx={{ animation: 'fade-in-up 0.4s ease both' }}>
                        <CardContent sx={{ textAlign: 'center', py: 8, px: 3 }}>
                            <Box sx={{
                                width: 80, height: 80, borderRadius: '24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)',
                                mx: 'auto', mb: 3,
                            }}>
                                <CategoryIcon sx={{ fontSize: 40, color: '#8b5cf6', opacity: 0.6 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                Sin categorías aún
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 1, maxWidth: 400, mx: 'auto' }}>
                                Crea tu primera categoría para organizar tus productos.
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 2,
                    }}>
                        {categories.map((cat, idx) => {
                            const colorSet = categoryColors[idx % categoryColors.length]
                            const productCount = getProductCount(cat.id)

                            return (
                                <Card
                                    key={cat.id}
                                    sx={{
                                        animation: `fade-in-up 0.4s ease both`,
                                        animationDelay: `${idx * 60}ms`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: isDark
                                                ? `0 16px 48px -8px rgba(0,0,0,0.5), 0 0 0 1px ${colorSet.color}25`
                                                : `0 16px 48px -8px rgba(0,0,0,0.1), 0 0 0 1px ${colorSet.color}20`,
                                            '& .delete-btn': { opacity: 1 },
                                        },
                                    }}
                                >
                                    {/* Top accent */}
                                    <Box sx={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                        background: `linear-gradient(90deg, ${colorSet.color}, ${colorSet.color}66)`,
                                    }} />

                                    <CardContent sx={{ p: '18px !important', '&:last-child': { pb: '18px !important' } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 46, height: 46, borderRadius: '14px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: colorSet.gradient,
                                                    border: `1px solid ${colorSet.color}20`,
                                                }}>
                                                    <CategoryIcon sx={{ fontSize: 22, color: colorSet.color }} />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
                                                        {cat.name}
                                                    </Typography>
                                                    <Typography sx={{
                                                        fontSize: '0.7rem', fontWeight: 600,
                                                        color: 'text.secondary', mt: 0.25,
                                                    }}>
                                                        {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <IconButton
                                                className="delete-btn"
                                                size="small"
                                                onClick={() => setDeleteTarget(cat)}
                                                sx={{
                                                    opacity: { xs: 1, md: 0 },
                                                    transition: 'all 0.2s ease',
                                                    color: 'text.secondary',
                                                    '&:hover': {
                                                        color: 'error.main',
                                                        background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                                                    },
                                                }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>

                                        {/* Product count visual bar */}
                                        <Box sx={{
                                            height: 4, borderRadius: 99,
                                            background: isDark ? 'rgba(129,140,248,0.08)' : 'rgba(99,102,241,0.06)',
                                            overflow: 'hidden',
                                        }}>
                                            <Box sx={{
                                                height: '100%', borderRadius: 99,
                                                width: `${Math.min((productCount / Math.max(products.length, 1)) * 100, 100)}%`,
                                                background: `linear-gradient(90deg, ${colorSet.color}, ${colorSet.color}88)`,
                                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </Box>
                )}
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Categoría"
                message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Los productos asociados quedarán sin categoría.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Categories
