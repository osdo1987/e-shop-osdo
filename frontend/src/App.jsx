import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ToastProvider } from './components/Toast'
import { setAuthErrorCallback } from './fetchInterceptor'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import StatsDashboard from './pages/StatsDashboard'
import Categories from './pages/Categories'
import ProductForm from './pages/ProductForm'
import Settings from './pages/Settings'
import Catalog from './pages/Catalog'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import POS from './pages/POS'
import CashRegister from './pages/CashRegister'
import Invoices from './pages/Invoices'

function parseJwtExp(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp ? payload.exp * 1000 : null
    } catch {
        return null
    }
}

function App({ darkMode, setDarkMode }) {
    const [user, setUser] = useState(null)
    const [tokenReady, setTokenReady] = useState(false)

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
        window.location.href = '/login'
    }, [])

    const forceLogout = useCallback(() => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
        window.location.href = '/login'
    }, [])

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        if (storedUser && storedToken) {
            const exp = parseJwtExp(storedToken)
            if (exp && Date.now() >= exp) {
                localStorage.removeItem('user')
                localStorage.removeItem('token')
            } else {
                setUser(JSON.parse(storedUser))
            }
        }
        setTokenReady(true)
    }, [])

    useEffect(() => {
        setAuthErrorCallback(forceLogout)
    }, [forceLogout])

    useEffect(() => {
        if (!user) return
        const interval = setInterval(() => {
            const token = localStorage.getItem('token')
            if (!token) { handleLogout(); return }
            const exp = parseJwtExp(token)
            if (exp && Date.now() >= exp) {
                handleLogout()
            }
        }, 60000)
        return () => clearInterval(interval)
    }, [user, handleLogout])

    const handleLogin = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', token)
        setUser(userData)
    }

    if (!tokenReady) return null

    const isManagerOrAbove = user && (user.role === 'SUPERADMIN' || user.role === 'MANAGER')

    return (
        <ToastProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                    user ? (user.role === 'SUPERADMIN' ? <Navigate to="/admin/super" /> : <Navigate to="/admin" />) : <Login onLogin={handleLogin} />
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/change-password" element={
                    user ? <ChangePassword user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/dashboard" element={
                    isManagerOrAbove ? <StatsDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin" element={
                    isManagerOrAbove ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/products/new" element={
                    isManagerOrAbove ? <ProductForm user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/products/edit/:id" element={
                    isManagerOrAbove ? <ProductForm user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/categories" element={
                    isManagerOrAbove ? <Categories user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/orders" element={
                    user ? <Orders user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/pos" element={
                    user ? <POS user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/cash-register" element={
                    isManagerOrAbove ? <CashRegister user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/invoices" element={
                    isManagerOrAbove ? <Invoices user={user} onLogout={handleLogout} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/settings" element={
                    isManagerOrAbove ? <Settings user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/admin/pos" />
                } />
                <Route path="/admin/super" element={
                    user && user.role === 'SUPERADMIN' ? <SuperAdmin user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/track/:token" element={<OrderTracking />} />
                <Route path="/:slug" element={<Catalog />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </ToastProvider>
    )
}

export default App