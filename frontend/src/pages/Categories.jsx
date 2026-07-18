import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import Inventory2Icon from '@mui/icons-material/Inventory2'

const categoryColors = [
    { bg: 'rgba(0,74,198,0.10)', color: '#004ac6', gradient: 'linear-gradient(135deg, rgba(0,74,198,0.15), rgba(0,74,198,0.05))' },
    { bg: 'rgba(37,99,235,0.10)', color: '#2563eb', gradient: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))' },
    { bg: 'rgba(16,185,129,0.10)', color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))' },
    { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' },
    { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' },
    { bg: 'rgba(6,182,212,0.10)', color: '#06b6d4', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))' },
    { bg: 'rgba(236,72,153,0.10)', color: '#ec4899', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))' },
    { bg: 'rgba(20,184,166,0.10)', color: '#14b8a6', gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))' },
]

function Categories({ user, onLogout }) {
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

    if (user?.role === 'STAFF') return <Navigate to="/admin/pos" />

    return (
        <>
            <AdminLayout title="Categorías" user={user} onLogout={onLogout}>
                {/* Header stats — compact inline */}
                <Box sx={{
                    display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap',
                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        px: 1.5, py: 0.75, borderRadius: '10px', flex: 1, minWidth: 120,
                        bgcolor: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)',
                        border: `1px solid ${isDark ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.10)'}`,
                    }}>
                        <CategoryIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>{categories.length}</Typography>
                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>Categorías</Typography>
                        </Box>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        px: 1.5, py: 0.75, borderRadius: '10px', flex: 1, minWidth: 120,
                        bgcolor: isDark ? 'rgba(0,74,198,0.08)' : 'rgba(0,74,198,0.04)',
                        border: `1px solid ${isDark ? 'rgba(0,74,198,0.15)' : 'rgba(0,74,198,0.10)'}`,
                    }}>
                        <Inventory2Icon sx={{ fontSize: 18, color: '#004ac6' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>{products.length}</Typography>
                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>Productos</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Create form — compact inline */}
                <Box sx={{
                    display: 'flex', gap: 1, mb: 2, alignItems: 'center',
                    p: 1, borderRadius: '10px',
                    border: `1px solid ${isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)'}`,
                    bgcolor: isDark ? 'rgba(37,99,235,0.04)' : 'rgba(37,99,235,0.02)',
                }}>
                    <TextField
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nueva categoría..."
                        required
                        size="small"
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px', fontSize: '0.85rem',
                            },
                        }}
                    />
                    <Button
                        type="button"
                        variant="contained"
                        disabled={!newCategoryName.trim() || creating}
                        startIcon={creating ? null : <AddIcon sx={{ fontSize: 16 }} />}
                        onClick={handleCreate}
                        sx={{ borderRadius: '8px', px: 2, py: 0.6, fontWeight: 700, fontSize: '0.8rem', minWidth: 90, flexShrink: 0 }}
                    >
                        {creating ? '...' : 'Crear'}
                    </Button>
                </Box>

                {/* Categories grid */}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                        {[1, 2, 3, 4].map(i => (
                            <Box key={i} sx={{ height: 60, borderRadius: '10px', animation: 'card-glow-pulse 2s ease-in-out infinite', animationDelay: `${i * 200}ms`,
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                        ))}
                    </Box>
                ) : categories.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6, borderRadius: '12px', border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        <CategoryIcon sx={{ fontSize: 36, color: '#2563eb', opacity: 0.4, mb: 1 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>Sin categorías</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>Crea una para organizar tus productos</Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                        gap: 1,
                    }}>
                        {categories.map((cat, idx) => {
                            const colorSet = categoryColors[idx % categoryColors.length]
                            const productCount = getProductCount(cat.id)

                            return (
                                <Box
                                    key={cat.id}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        p: 1, borderRadius: '10px',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                        bgcolor: isDark ? 'rgba(15,15,35,0.7)' : '#fff',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: `${colorSet.color}40`,
                                            boxShadow: isDark ? `0 4px 16px rgba(0,0,0,0.3)` : `0 4px 16px rgba(0,0,0,0.06)`,
                                            '& .del-btn': { opacity: 1 },
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: colorSet.gradient,
                                        border: `1px solid ${colorSet.color}20`,
                                    }}>
                                        <CategoryIcon sx={{ fontSize: 18, color: colorSet.color }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {cat.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary' }}>
                                            {productCount} {productCount === 1 ? 'prod' : 'prods'}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        className="del-btn"
                                        size="small"
                                        onClick={() => setDeleteTarget(cat)}
                                        sx={{
                                            opacity: { xs: 1, md: 0 },
                                            width: 24, height: 24, flexShrink: 0,
                                            color: 'text.secondary',
                                            '&:hover': { color: 'error.main', bgcolor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' },
                                        }}
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
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
