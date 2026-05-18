import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import SuperAdmin from './pages/SuperAdmin'
import './App.css'

function App() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

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
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
                user ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/admin" element={
                user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
            } />
            <Route path="/admin/super" element={
                user && user.role === 'SUPERADMIN' ? <SuperAdmin user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
            } />
            <Route path="/:slug" element={<Catalog />} />
        </Routes>
    )
}

export default App