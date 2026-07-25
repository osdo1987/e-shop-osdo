import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import SkeletonMui from '@mui/material/Skeleton'
import { useTheme, alpha } from '@mui/material/styles'
import AssessmentIcon from '@mui/icons-material/Assessment'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import BarChartIcon from '@mui/icons-material/BarChart'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const catColors = ['#004ac6', '#10b981', '#f59e0b', '#ef4444', '#2563eb', '#ec4899', '#06b6d4', '#84cc16']

function SectionDivider({ label, isDark }) {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2,
            my: { xs: 3, md: 4 },
        }}>
            <Box sx={{
                flex: 1, height: '1px',
                background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(180,197,255,0.18), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(0,74,198,0.14), transparent)',
            }} />
            <Typography variant="overline" sx={{
                fontWeight: 700, letterSpacing: '0.12em',
                fontSize: '0.6875rem',
                color: isDark ? 'rgba(180,197,255,0.55)' : 'rgba(0,74,198,0.45)',
                whiteSpace: 'nowrap',
            }}>
                {label}
            </Typography>
            <Box sx={{
                flex: 1, height: '1px',
                background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(180,197,255,0.18), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(0,74,198,0.14), transparent)',
            }} />
        </Box>
    )
}

function StatsDashboard({ user, onLogout }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [salesRange, setSalesRange] = useState(30)
    const toast = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }
            const storeId = user?.storeId || user?.store_id

            const [categoriesRes, productsRes, ordersRes, metricsRes] = await Promise.all([
                fetch('/api/categories', { headers }),
                fetch('/api/products', { headers }),
                fetch('/api/orders', { headers }),
                storeId ? fetch(`/api/metrics/dashboard/${storeId}`, { headers }) : Promise.resolve({ ok: false })
            ])

            if (categoriesRes.ok) {
                setCategories(await categoriesRes.json())
            }
            if (productsRes.ok) {
                setProducts(await productsRes.json())
            }
            if (ordersRes.ok) {
                setOrders(await ordersRes.json())
            }
            if (metricsRes.ok) {
                setMetrics(await metricsRes.json())
            }
        } catch (error) {
            toast.error('Error al cargar estadísticas')
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const stockManaged = products.filter(p => p.manage_stock !== false)
        const lowStock = stockManaged.filter(p => p.stock > 0 && p.stock < 5)
        const outOfStock = stockManaged.filter(p => p.stock <= 0)

        const inventoryValue = stockManaged.reduce((sum, p) => {
            const activePrice = (p.promo_price !== null && p.promo_price !== undefined) ? p.promo_price : p.price
            return sum + (p.stock > 0 ? activePrice * p.stock : 0)
        }, 0)

        const inventoryCost = stockManaged.reduce((sum, p) => {
            return sum + (p.stock > 0 ? (p.purchase_price || 0) * p.stock : 0)
        }, 0)

        const projectedProfit = inventoryValue - inventoryCost
        const marginPercent = inventoryValue > 0 ? (projectedProfit / inventoryValue) * 100 : 0

        const promoCount = products.filter(p => p.promo_price !== null && p.promo_price !== undefined).length
        const totalUnits = stockManaged.reduce((sum, p) => sum + (p.stock || 0), 0)

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

    const salesStats = useMemo(() => {
        const activeOrders = orders.filter(o => o.status !== 'CANCELADO')
        const now = new Date()
        const cutoff = new Date(now.getTime() - salesRange * 24 * 60 * 60 * 1000)
        const filtered = salesRange === 0 ? activeOrders : activeOrders.filter(o => new Date(o.created_at) >= cutoff)

        const webTotal = filtered.filter(o => o.origin === 'WEB').reduce((s, o) => s + (o.total_price || 0), 0)
        const localTotal = filtered.filter(o => o.origin === 'LOCAL').reduce((s, o) => s + (o.total_price || 0), 0)
        const webCount = filtered.filter(o => o.origin === 'WEB').length
        const localCount = filtered.filter(o => o.origin === 'LOCAL').length

        return { webTotal, localTotal, webCount, localCount, totalOrders: filtered.length, totalRevenue: webTotal + localTotal }
    }, [orders, salesRange])

    const salesChartData = useMemo(() => {
        const activeOrders = orders.filter(o => o.status !== 'CANCELADO')
        const now = new Date()
        const cutoff = new Date(now.getTime() - salesRange * 24 * 60 * 60 * 1000)
        const filtered = salesRange === 0 ? activeOrders : activeOrders.filter(o => new Date(o.created_at) >= cutoff)

        const dayMap = {}
        filtered.forEach(o => {
            const d = new Date(o.created_at)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            if (!dayMap[key]) dayMap[key] = { date: key, domicilio: 0, local: 0 }
            if (o.origin === 'WEB') dayMap[key].domicilio += o.total_price || 0
            else dayMap[key].local += o.total_price || 0
        })

        const result = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date))
        return result
    }, [orders, salesRange])

    if (user?.role === 'STAFF') return <Navigate to="/admin/pos" />

    if (loading) {
        return (
            <AdminLayout title="Dashboard" user={user} onLogout={onLogout}>
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                        position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                        width: 500, height: 500, borderRadius: '50%',
                        background: isDark
                            ? 'radial-gradient(circle, rgba(0,74,198,0.08) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(0,74,198,0.05) 0%, transparent 70%)',
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
        <AdminLayout title="Dashboard" user={user} onLogout={onLogout}>
            <Box sx={{ position: 'relative' }}>
                {/* Ambient gradient orb */}
                <Box sx={{
                    position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                    width: 600, height: 600, borderRadius: '50%',
                    background: isDark
                        ? 'radial-gradient(circle, rgba(0,74,198,0.1) 0%, rgba(37,99,235,0.04) 40%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(0,74,198,0.06) 0%, rgba(37,99,235,0.02) 40%, transparent 70%)',
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
                                ? 'linear-gradient(135deg, rgba(0,74,198,0.2), rgba(37,99,235,0.15))'
                                : 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(37,99,235,0.08))',
                            boxShadow: isDark
                                ? '0 4px 20px rgba(0,74,198,0.2)'
                                : '0 4px 16px rgba(0,74,198,0.12)',
                        }}>
                            <AssessmentIcon sx={{
                                fontSize: 26,
                                color: isDark ? '#b4c5ff' : '#004ac6',
                            }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #dbe1ff, #b4c5ff, #b4c5ff)'
                                    : 'linear-gradient(135deg, #00174b, #003ea8, #004ac6)',
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

                {/* Inventario + Valorización + Alertas — compact inline */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' },
                    gap: 1, mb: 2,
                }}>
                    {[
                        { label: 'Productos', value: stats.total, color: '#004ac6', icon: <Inventory2Icon sx={{ fontSize: 18 }} />, sub: `${stats.totalUnits} uds` },
                        { label: 'En Oferta', value: stats.promoCount, color: '#3b82f6', icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />, sub: 'Promos activas' },
                        { label: 'Categorías', value: stats.categories, color: '#2563eb', icon: <BarChartIcon sx={{ fontSize: 18 }} />, sub: 'Activas' },
                        { label: 'Valor Venta', value: `$${stats.inventoryValue.toLocaleString()}`, color: '#10b981', icon: <LocalAtmIcon sx={{ fontSize: 18 }} />, sub: 'Inventario' },
                        { label: 'Stock Bajo', value: stats.lowStock, color: '#f59e0b', icon: <WarningIcon sx={{ fontSize: 18 }} />, sub: stats.lowStock > 0 ? 'Reponer' : 'OK' },
                        { label: 'Agotados', value: stats.outOfStock, color: '#ef4444', icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, sub: stats.outOfStock > 0 ? 'Sin stock' : 'OK' },
                    ].map((s, i) => (
                        <Box key={s.label} sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            p: 1, borderRadius: '10px',
                            bgcolor: isDark ? `${s.color}08` : `${s.color}05`,
                            border: `1px solid ${isDark ? `${s.color}18` : `${s.color}12`}`,
                            animation: `fade-in-up 0.4s ease ${i * 50}ms both`,
                        }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${s.color}15`, color: s.color,
                            }}>
                                {s.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' }}>
                                    {s.value}
                                </Typography>
                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', lineHeight: 1.2 }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Valorización detallada */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 1, mb: 2,
                }}>
                    {[
                        { label: 'Costo Inventario', value: `$${stats.inventoryCost.toLocaleString()}`, color: '#9b59b6', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
                        { label: 'Ganancia Estimada', value: `$${stats.projectedProfit.toLocaleString()}`, color: '#1abc9c', icon: <BarChartIcon sx={{ fontSize: 18 }} /> },
                        { label: 'Margen Promedio', value: `${stats.marginPercent.toFixed(1)}%`, color: '#f59e0b', icon: <AssessmentIcon sx={{ fontSize: 18 }} /> },
                    ].map((s, i) => (
                        <Box key={s.label} sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            p: 1, borderRadius: '10px',
                            bgcolor: isDark ? `${s.color}08` : `${s.color}05`,
                            border: `1px solid ${isDark ? `${s.color}18` : `${s.color}12`}`,
                            animation: `fade-in-up 0.4s ease ${i * 50}ms both`,
                        }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${s.color}15`, color: s.color,
                            }}>
                                {s.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' }}>
                                    {s.value}
                                </Typography>
                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', lineHeight: 1.2 }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* ── Charts Section ── */}
                {products.length > 0 && (
                    <>
                        <SectionDivider label="Análisis" isDark={isDark} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, md: 3 }, mb: 3 }}>
                            {/* Stock por categoría */}
                            <Card sx={{
                                animation: 'fade-in-up 0.5s ease 0.1s both',
                                border: `1px solid ${isDark ? 'rgba(180,197,255,0.1)' : 'rgba(0,74,198,0.08)'}`,
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                    height: '3px', borderRadius: '16px 16px 0 0',
                                    background: 'linear-gradient(90deg, #004ac6, #2563eb)',
                                },
                                position: 'relative', overflow: 'visible',
                            }}>
                                <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mb: 1.5 }}>
                                        Stock por categoría
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {categories.map((cat, i) => {
                                            const catProducts = products.filter(p => p.category_id === cat.id)
                                            const catStock = catProducts.reduce((s, p) => s + (p.stock || 0), 0)
                                            const maxCatStock = Math.max(...categories.map(c2 => products.filter(p => p.category_id === c2.id).reduce((s, p) => s + (p.stock || 0), 0)), 1)
                                            const pct = (catStock / maxCatStock) * 100
                                            const color = catColors[i % catColors.length]
                                            return (
                                                <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', width: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                        {cat.name}
                                                    </Typography>
                                                    <Box sx={{ flex: 1, height: 10, borderRadius: 5, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                                                        <Box sx={{
                                                            height: '100%', borderRadius: 5, width: `${pct}%`,
                                                            background: `linear-gradient(90deg, ${color}, ${color}88)`,
                                                            transition: 'width 1s ease',
                                                        }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', color: 'text.secondary', minWidth: 32, textAlign: 'right' }}>
                                                        {catStock}
                                                    </Typography>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Top 5 productos más caros */}
                            <Card sx={{
                                animation: 'fade-in-up 0.5s ease 0.2s both',
                                border: `1px solid ${isDark ? 'rgba(180,197,255,0.1)' : 'rgba(0,74,198,0.08)'}`,
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                    height: '3px', borderRadius: '16px 16px 0 0',
                                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                                },
                                position: 'relative', overflow: 'visible',
                            }}>
                                <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mb: 1.5 }}>
                                        Top 5 productos
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {[...products].sort((a, b) => (b.promo_price || b.price) - (a.promo_price || a.price)).slice(0, 5).map((p, i) => {
                                            const price = p.promo_price || p.price
                                            const maxPrice = Math.max(...products.map(pp => pp.promo_price || pp.price), 1)
                                            const pct = (price / maxPrice) * 100
                                            return (
                                                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: i < 3 ? '#f59e0b' : 'text.disabled', width: 16, textAlign: 'center', flexShrink: 0 }}>
                                                        {i + 1}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {p.name}
                                                    </Typography>
                                                    <Box sx={{ width: 70, height: 8, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', overflow: 'hidden', flexShrink: 0 }}>
                                                        <Box sx={{
                                                            height: '100%', borderRadius: 4, width: `${pct}%`,
                                                            background: `linear-gradient(90deg, ${p.promo_price ? '#ef4444' : '#004ac6'}, ${p.promo_price ? '#ef444488' : '#004ac688'})`,
                                                        }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', color: p.promo_price ? '#ef4444' : 'text.secondary', minWidth: 52, textAlign: 'right' }}>
                                                        ${price.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Margen por categoría */}
                        <Card sx={{
                            animation: 'fade-in-up 0.5s ease 0.3s both',
                            border: `1px solid ${isDark ? 'rgba(180,197,255,0.1)' : 'rgba(0,74,198,0.08)'}`,
                            position: 'relative', overflow: 'visible',
                            '&::before': {
                                content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                height: '3px', borderRadius: '16px 16px 0 0',
                                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                            },
                        }}>
                            <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mb: 1.5 }}>
                                    Margen promedio por categoría
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                                    {categories.map((cat, i) => {
                                        const catProducts = products.filter(p => p.category_id === cat.id && p.purchase_price)
                                        const avgMargin = catProducts.length > 0
                                            ? catProducts.reduce((sum, p) => {
                                                const price = p.promo_price || p.price
                                                return sum + ((price - p.purchase_price) / price) * 100
                                            }, 0) / catProducts.length
                                            : null
                                        const color = catColors[i % catColors.length]
                                        return (
                                            <Box key={cat.id} sx={{
                                                p: 1.25, borderRadius: '10px',
                                                bgcolor: isDark ? `${color}08` : `${color}05`,
                                                border: `1px solid ${isDark ? `${color}18` : `${color}12`}`,
                                            }}>
                                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {cat.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', color: avgMargin !== null ? (avgMargin >= 0 ? '#10b981' : '#ef4444') : 'text.disabled', lineHeight: 1 }}>
                                                        {avgMargin !== null ? `${avgMargin.toFixed(0)}%` : '—'}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>
                                                        {catProducts.length} {catProducts.length === 1 ? 'prod' : 'prods'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )
                                    })}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* ── Ventas por canal: Domicilio vs En Local ── */}
                        {orders.length > 0 && (
                            <Card sx={{
                                animation: 'fade-in-up 0.5s ease 0.4s both',
                                border: `1px solid ${isDark ? 'rgba(180,197,255,0.1)' : 'rgba(0,74,198,0.08)'}`,
                                position: 'relative', overflow: 'visible',
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                    height: '3px', borderRadius: '16px 16px 0 0',
                                    background: 'linear-gradient(90deg, #004ac6, #10b981)',
                                },
                            }}>
                                <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mb: 0.5 }}>
                                                Ventas por canal
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                                                Domicilio vs En Local
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                            {[7, 30, 90, 0].map(d => (
                                                <Chip
                                                    key={d}
                                                    label={d === 0 ? 'Todo' : `${d}d`}
                                                    onClick={() => setSalesRange(d)}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600, fontSize: '0.6875rem',
                                                        borderRadius: 2,
                                                        bgcolor: salesRange === d ? 'primary-container' : 'surface-container',
                                                        color: salesRange === d ? 'on-primary-container' : 'on-surface-variant',
                                                        border: salesRange === d ? 'none' : '1px solid',
                                                        borderColor: 'divider',
                                                        '&:hover': { bgcolor: salesRange === d ? 'primary-container' : 'surface-container-high' },
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    {/* Summary chips */}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,74,198,0.12)' : 'rgba(0,74,198,0.06)', border: '1px solid', borderColor: isDark ? 'rgba(0,74,198,0.2)' : 'rgba(0,74,198,0.12)' }}>
                                            <DeliveryDiningIcon sx={{ fontSize: 16, color: '#004ac6' }} />
                                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#004ac6' }}>
                                                ${salesStats.webTotal.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                                ({salesStats.webCount} pedidos)
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 2, bgcolor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.06)', border: '1px solid', borderColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)' }}>
                                            <StorefrontIcon sx={{ fontSize: 16, color: '#10b981' }} />
                                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#10b981' }}>
                                                ${salesStats.localTotal.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                                ({salesStats.localCount} pedidos)
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {salesChartData.length > 0 ? (
                                        <Box sx={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesChartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="gradDomicilio" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#004ac6" stopOpacity={0.3} />
                                                            <stop offset="100%" stopColor="#004ac6" stopOpacity={0.02} />
                                                        </linearGradient>
                                                        <linearGradient id="gradLocal" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={v => {
                                                            const [, m, d] = v.split('-')
                                                            return `${d}/${m}`
                                                        }}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: isDark ? '#1e1e2e' : '#ffffff',
                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                                            borderRadius: 8,
                                                            fontSize: 12,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        }}
                                                        formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'domicilio' ? 'Domicilio' : 'En Local']}
                                                        labelFormatter={label => {
                                                            const [y, m, d] = label.split('-')
                                                            return `${d}/${m}/${y}`
                                                        }}
                                                    />
                                                    <Legend
                                                        formatter={(value) => value === 'domicilio' ? 'Domicilio' : 'En Local'}
                                                        wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="domicilio"
                                                        stroke="#004ac6"
                                                        strokeWidth={2}
                                                        fill="url(#gradDomicilio)"
                                                        dot={false}
                                                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#004ac6', fill: isDark ? '#1e1e2e' : '#fff' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="local"
                                                        stroke="#10b981"
                                                        strokeWidth={2}
                                                        fill="url(#gradLocal)"
                                                        dot={false}
                                                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#10b981', fill: isDark ? '#1e1e2e' : '#fff' }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                No hay ventas en este período
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* ── Rentabilidad: Ingresos vs Costos ── */}
                        {metrics && metrics.profit_summary && (
                            <Card sx={{
                                animation: 'fade-in-up 0.5s ease 0.5s both',
                                border: `1px solid ${isDark ? 'rgba(180,197,255,0.1)' : 'rgba(0,74,198,0.08)'}`,
                                position: 'relative', overflow: 'visible',
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                    height: '3px', borderRadius: '16px 16px 0 0',
                                    background: 'linear-gradient(90deg, #10b981, #f59e0b)',
                                },
                            }}>
                                <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mb: 0.5 }}>
                                                Rentabilidad del mes
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                                                Ingresos vs Costos
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`Margen: ${metrics.profit_summary.margin?.toFixed(1) || 0}%`}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.6875rem',
                                                bgcolor: (metrics.profit_summary.margin || 0) >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: (metrics.profit_summary.margin || 0) >= 0 ? '#10b981' : '#ef4444',
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                        <Box sx={{ flex: 1, minWidth: 120, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)', border: '1px solid', borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Ingresos</Typography>
                                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                                                ${(metrics.profit_summary.revenue || 0).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 120, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)', border: '1px solid', borderColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Costos</Typography>
                                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
                                                ${(metrics.profit_summary.cost || 0).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 120, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,74,198,0.08)' : 'rgba(0,74,198,0.04)', border: '1px solid', borderColor: isDark ? 'rgba(0,74,198,0.15)' : 'rgba(0,74,198,0.1)' }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Ganancia</Typography>
                                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#004ac6' }}>
                                                ${(metrics.profit_summary.gross_profit || 0).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {metrics.profit_summary.by_day && metrics.profit_summary.by_day.length > 0 && (
                                        <Box sx={{ width: '100%', height: 250 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={metrics.profit_summary.by_day} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={v => {
                                                            const [, m, d] = v.split('-')
                                                            return `${d}/${m}`
                                                        }}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: isDark ? '#1e1e2e' : '#ffffff',
                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                                                            borderRadius: 8,
                                                            fontSize: 12,
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        }}
                                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                                                    />
                                                    <Bar dataKey="revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* ── Top Productos más vendidos ── */}
                        {metrics && metrics.top_products && metrics.top_products.length > 0 && (
                            <Card sx={{
                                animation: 'fade-in-up 0.5s ease 0.6s both',
                                border: `1px solid ${isDark ? 'rgba(180,197,255,0.1)' : 'rgba(0,74,198,0.08)'}`,
                                position: 'relative', overflow: 'visible',
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                    height: '3px', borderRadius: '16px 16px 0 0',
                                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                                },
                            }}>
                                <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', mb: 1.5 }}>
                                        Top 10 productos más vendidos
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {metrics.top_products.slice(0, 10).map((p, i) => {
                                            const maxUnits = Math.max(...metrics.top_products.map(pp => pp.units_sold), 1)
                                            const pct = (p.units_sold / maxUnits) * 100
                                            const color = catColors[i % catColors.length]
                                            return (
                                                <Box key={p.product_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: i < 3 ? '#f59e0b' : 'text.disabled', width: 16, textAlign: 'center', flexShrink: 0 }}>
                                                        {i + 1}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {p.name}
                                                    </Typography>
                                                    <Box sx={{ width: 70, height: 8, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', overflow: 'hidden', flexShrink: 0 }}>
                                                        <Box sx={{
                                                            height: '100%', borderRadius: 4, width: `${pct}%`,
                                                            background: `linear-gradient(90deg, ${color}, ${color}88)`,
                                                        }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', color: 'text.secondary', minWidth: 52, textAlign: 'right' }}>
                                                        {p.units_sold} uds
                                                    </Typography>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* ── Alertas de Stock Bajo ── */}
                        {metrics && metrics.low_stock_alerts && metrics.low_stock_alerts.length > 0 && (
                            <Card sx={{
                                animation: 'fade-in-up 0.5s ease 0.7s both',
                                border: `1px solid ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'}`,
                                position: 'relative', overflow: 'visible',
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                                    height: '3px', borderRadius: '16px 16px 0 0',
                                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                                },
                            }}>
                                <CardContent sx={{ p: '16px !important', '&:last-child': { pb: '16px !important' } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <WarningIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
                                            Alertas de Stock Bajo
                                        </Typography>
                                        <Chip label={metrics.low_stock_alerts.length} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444' }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {metrics.low_stock_alerts.slice(0, 8).map((product, i) => (
                                            <Box key={product.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: product.stock <= 0 ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {product.name}
                                                </Typography>
                                                <Chip
                                                    label={product.stock <= 0 ? 'Agotado' : `${product.stock} uds`}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 700,
                                                        bgcolor: product.stock <= 0 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                                        color: product.stock <= 0 ? '#ef4444' : '#f59e0b',
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </Box>
        </AdminLayout>
    )
}

export default StatsDashboard
