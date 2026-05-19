import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import ProductForm from './pages/ProductForm'
import Settings from './pages/Settings'
import Catalog from './pages/Catalog'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
    const [user, setUser] = useState(null)
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true'
    })

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
        localStorage.setItem('darkMode', darkMode)
    }, [darkMode])

    const handleLogin = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', token)
        setUser(userData)
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
    }

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
                <Route path="/admin" element={
                    user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/products/new" element={
                    user ? <ProductForm user={user} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/products/edit/:id" element={
                    user ? <ProductForm user={user} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/categories" element={
                    user ? <Categories user={user} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/settings" element={
                    user ? <Settings user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />
                } />
                <Route path="/admin/super" element={
                    user && user.role === 'SUPERADMIN' ? <SuperAdmin user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
                } />
                <Route path="/:slug" element={<Catalog />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </ToastProvider>
    )
}

export default App