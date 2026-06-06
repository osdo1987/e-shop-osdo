import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/AdminLayout'
import StatCard from '../components/StatCard'
import { useToast } from '../components/Toast'

function StatsDashboard({ user }) {
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
                <div className="stats-grid">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="card" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '80%', height: '20px', background: 'var(--skeleton)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                        </div>
                    ))}
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Dashboard" user={user}>
            <div className="stats-grid">
                <StatCard
                    title="Productos"
                    value={stats.total}
                    icon="📦"
                    color="var(--primary-color)"
                    subtitle={`${stats.totalUnits} piezas en total`}
                />
                <StatCard
                    title="Valor Venta"
                    value={`$${stats.inventoryValue.toLocaleString()}`}
                    icon="💰"
                    color="#2ecc71"
                    subtitle="Valuado a precio activo"
                />
                <StatCard
                    title="Costo Inventario"
                    value={`$${stats.inventoryCost.toLocaleString()}`}
                    icon="📉"
                    color="#9b59b6"
                    subtitle="Inversión total en stock"
                />
                <StatCard
                    title="Ganancia Estimada"
                    value={`$${stats.projectedProfit.toLocaleString()}`}
                    icon="📈"
                    color="#1abc9c"
                    subtitle={`Margen: ${stats.marginPercent.toFixed(1)}%`}
                />
                <StatCard
                    title="En Oferta"
                    value={stats.promoCount}
                    icon="🏷️"
                    color="#3498db"
                    subtitle="Con precio promo"
                />
                <StatCard
                    title="Stock Bajo"
                    value={stats.lowStock}
                    icon="⚠"
                    color="var(--warning)"
                    subtitle={stats.lowStock > 0 ? 'Menos de 5 unidades' : 'Todo en orden'}
                />
                <StatCard
                    title="Agotados"
                    value={stats.outOfStock}
                    icon="🚫"
                    color="var(--error)"
                    subtitle={stats.outOfStock > 0 ? 'Requieren reposición' : 'Sin novedades'}
                />
            </div>
        </AdminLayout>
    )
}

export default StatsDashboard