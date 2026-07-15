import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import SkeletonMui from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import AssessmentIcon from '@mui/icons-material/Assessment'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import BarChartIcon from '@mui/icons-material/BarChart'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

function SectionDivider({ label, isDark }) {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2,
            my: { xs: 3, md: 4 },
        }}>
            <Box sx={{
                flex: 1, height: '1px',
                background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(129,140,248,0.18), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.14), transparent)',
            }} />
            <Typography variant="overline" sx={{
                fontWeight: 700, letterSpacing: '0.12em',
                fontSize: '0.6875rem',
                color: isDark ? 'rgba(129,140,248,0.55)' : 'rgba(99,102,241,0.45)',
                whiteSpace: 'nowrap',
            }}>
                {label}
            </Typography>
            <Box sx={{
                flex: 1, height: '1px',
                background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(129,140,248,0.18), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.14), transparent)',
            }} />
        </Box>
    )
}

function StatsDashboard({ user }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
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
            toast.error('Error al cargar estadísticas')
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 5)
        const outOfStock = products.filter(p => p.stock <= 0)

        const inventoryValue = products.reduce((sum, p) => {
            const activePrice = (p.promo_price !== null && p.promo_price !== undefined) ? p.promo_price : p.price
            return sum + (p.stock > 0 ? activePrice * p.stock : 0)
        }, 0)

        const inventoryCost = products.reduce((sum, p) => {
            return sum + (p.stock > 0 ? (p.purchase_price || 0) * p.stock : 0)
        }, 0)

        const projectedProfit = inventoryValue - inventoryCost
        const marginPercent = inventoryValue > 0 ? (projectedProfit / inventoryValue) * 100 : 0

        const promoCount = products.filter(p => p.promo_price !== null && p.promo_price !== undefined).length
        const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0)

        return {
            total: products.length,
            lowStock: lowStock.length,
            outOfStock: outOfStock.length,
            categories: categories.length,
            inventoryValue,
            inventoryCost,
            projectedProfit,
            marginPercent,
            promoCount,
            totalUnits
        }
    }, [products, categories])

    if (loading) {
        return (
            <AdminLayout title="Dashboard" user={user}>
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                        position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                        width: 500, height: 500, borderRadius: '50%',
                        background: isDark
                            ? 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
                        pointerEvents: 'none', filter: 'blur(60px)',
                    }} />
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: 3,
                    }}>
                        {[...Array(7)].map((_, i) => (
                            <Card key={i} sx={{ opacity: 0.5 }}>
                                <CardContent sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SkeletonMui variant="rectangular" width="80%" height={20} sx={{ borderRadius: 1 }} />
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Dashboard" user={user}>
            <Box sx={{ position: 'relative' }}>
                {/* Ambient gradient orb */}
                <Box sx={{
                    position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                    width: 600, height: 600, borderRadius: '50%',
                    background: isDark
                        ? 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.02) 40%, transparent 70%)',
                    pointerEvents: 'none', filter: 'blur(80px)',
                    animation: 'orb-float-1 20s ease-in-out infinite',
                }} />

                {/* Page Header */}
                <Box sx={{
                    mb: { xs: 3, md: 4 },
                    animation: 'fade-in-up 0.6s ease both',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{
                            width: 48, height: 48, borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                                : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                            boxShadow: isDark
                                ? '0 4px 20px rgba(99,102,241,0.2)'
                                : '0 4px 16px rgba(99,102,241,0.12)',
                        }}>
                            <AssessmentIcon sx={{
                                fontSize: 26,
                                color: isDark ? '#a5b4fc' : '#6366f1',
                            }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8)'
                                    : 'linear-gradient(135deg, #312e81, #4f46e5, #6366f1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                lineHeight: 1.2,
                            }}>
                                Dashboard
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: 'text.secondary', mt: 0.25,
                                fontWeight: 500,
                            }}>
                                Resumen de inventario y métricas clave
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Inventario Section */}
                <SectionDivider label="Inventario" isDark={isDark} />

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: { xs: 2, md: 3 },
                }}>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.1s both' }}>
                        <StatCard title="Productos" value={stats.total} icon={<Inventory2Icon />} color="#6366f1" subtitle={`${stats.totalUnits} piezas en total`} />
                    </Box>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.2s both' }}>
                        <StatCard title="En Oferta" value={stats.promoCount} icon={<ShoppingCartIcon />} color="#3498db" subtitle="Con precio promo" />
                    </Box>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.3s both' }}>
                        <StatCard title="Categorías" value={stats.categories} icon={<BarChartIcon />} color="#8b5cf6" subtitle="Categorías activas" />
                    </Box>
                </Box>

                {/* Valorización Section */}
                <SectionDivider label="Valorización" isDark={isDark} />

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: { xs: 2, md: 3 },
                }}>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.1s both' }}>
                        <StatCard title="Valor Venta" value={`$${stats.inventoryValue.toLocaleString()}`} icon={<LocalAtmIcon />} color="#2ecc71" subtitle="Valuado a precio activo" />
                    </Box>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.2s both' }}>
                        <StatCard title="Costo Inventario" value={`$${stats.inventoryCost.toLocaleString()}`} icon={<TrendingUpIcon />} color="#9b59b6" subtitle="Inversión total en stock" />
                    </Box>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.3s both' }}>
                        <StatCard title="Ganancia Estimada" value={`$${stats.projectedProfit.toLocaleString()}`} icon={<BarChartIcon />} color="#1abc9c" subtitle={`Margen: ${stats.marginPercent.toFixed(1)}%`} />
                    </Box>
                </Box>

                {/* Alertas Section */}
                <SectionDivider label="Alertas" isDark={isDark} />

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: { xs: 2, md: 3 },
                }}>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.1s both' }}>
                        <StatCard title="Stock Bajo" value={stats.lowStock} icon={<WarningIcon />} color="#f59e0b" subtitle={stats.lowStock > 0 ? 'Menos de 5 unidades' : 'Todo en orden'} progress={stats.total > 0 ? ((stats.total - stats.lowStock) / stats.total) * 100 : 100} />
                    </Box>
                    <Box sx={{ animation: 'fade-in-up 0.5s ease 0.2s both' }}>
                        <StatCard title="Agotados" value={stats.outOfStock} icon={<CheckCircleIcon />} color="#ef4444" subtitle={stats.outOfStock > 0 ? 'Requieren reposición' : 'Sin novedades'} progress={stats.total > 0 ? ((stats.total - stats.outOfStock) / stats.total) * 100 : 100} />
                    </Box>
                </Box>
            </Box>
        </AdminLayout>
    )
}

export default StatsDashboard
