import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PaletteIcon from '@mui/icons-material/Palette'
import SecurityIcon from '@mui/icons-material/Security'
import InfoIcon from '@mui/icons-material/Info'
import LinkIcon from '@mui/icons-material/Link'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'

function Settings({ user, onLogout, darkMode, setDarkMode }) {
    const [store, setStore] = useState(null)
    const [whatsapp, setWhatsapp] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [saving, setSaving] = useState(false)
    const [staffList, setStaffList] = useState([])
    const [staffLoading, setStaffLoading] = useState(false)
    const [newStaffEmail, setNewStaffEmail] = useState('')
    const [newStaffPassword, setNewStaffPassword] = useState('')
    const [creatingStaff, setCreatingStaff] = useState(false)
    const toast = useToast()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    useEffect(() => {
        fetchStoreData()
        fetchStaff()
    }, [])

    const fetchStoreData = async () => {
        if (!user?.storeId) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${user.storeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStore(data)
                setWhatsapp(data.whatsapp || '')
                setLogoUrl(data.logo_url || '')
            }
        } catch (error) {
            console.error('Error fetching store:', error)
        }
    }

    const handleSaveStoreInfo = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/stores/${user.storeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    whatsapp: whatsapp,
                    logo_url: logoUrl
                })
            })

            if (res.ok) {
                toast.success('Información de la tienda actualizada exitosamente')
                fetchStoreData()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al actualizar información')
            }
        } catch (err) {
            toast.error('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    const fetchStaff = async () => {
        setStaffLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/staff', { headers: { 'Authorization': `Bearer ${token}` } })
            if (res.ok) setStaffList(await res.json())
            else setStaffList([])
        } catch { setStaffList([]) }
        finally { setStaffLoading(false) }
    }

    const handleCreateStaff = async (e) => {
        e.preventDefault()
        if (!newStaffEmail || !newStaffPassword) { toast.error('Email y contraseña son obligatorios'); return }
        setCreatingStaff(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/auth/register-staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: newStaffEmail, password: newStaffPassword })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Empleado creado exitosamente')
                setNewStaffEmail(''); setNewStaffPassword('')
                fetchStaff()
            } else {
                toast.error(data.error || 'Error al crear empleado')
            }
        } catch { toast.error('Error de conexión') }
        finally { setCreatingStaff(false) }
    }

    const handleDeleteStaff = async (staffId) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/auth/staff/${staffId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Empleado eliminado')
                fetchStaff()
            } else {
                toast.error(data.error || 'Error al eliminar empleado')
            }
        } catch { toast.error('Error de conexión') }
    }

    const sectionCardStyle = (accentColor) => ({
        mb: 3,
        position: 'relative',
        overflow: 'visible',
        animation: 'fade-in-up 0.5s ease both',
        '&::before': {
            content: '""',
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '3px',
            background: accentColor,
            borderRadius: '16px 16px 0 0',
        },
    })

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            fontSize: '0.95rem',
            '&.Mui-focused': {
                boxShadow: isDark
                    ? '0 0 0 4px rgba(180, 197, 255, 0.18), 0 0 20px rgba(180, 197, 255, 0.12)'
                    : '0 0 0 4px rgba(0, 74, 198, 0.15), 0 0 16px rgba(0, 74, 198, 0.08)',
            },
        },
    }

    if (user?.role === 'STAFF') return <Navigate to="/admin/pos" />

    return (
        <AdminLayout title="Configuración" user={user} onLogout={onLogout}>
            {store && (
                <Card sx={sectionCardStyle('linear-gradient(90deg, #10b981, #059669, #34d399)')}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
                                border: '1px solid rgba(16,185,129,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <StorefrontIcon sx={{ fontSize: 18, color: '#10b981' }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                    Información Pública de la Tienda
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                    Configura el WhatsApp y el logo de tu catálogo
                                </Typography>
                            </Box>
                        </Box>

                        {store.slug && (
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, p: 1.5,
                                borderRadius: '12px',
                                background: isDark ? 'rgba(0,74,198,0.06)' : 'rgba(0,74,198,0.04)',
                                border: isDark ? '1px solid rgba(180,197,255,0.12)' : '1px solid rgba(0,74,198,0.10)',
                            }}>
                                <LinkIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Catálogo:{' '}
                                    <Box component={Link} to={`/${store.slug}`} target="_blank" sx={{
                                        color: 'primary.main', fontWeight: 700, textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}>
                                        /{store.slug}
                                    </Box>
                                </Typography>
                            </Box>
                        )}

                        <Box component="form" onSubmit={handleSaveStoreInfo}>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'wrap', mb: 2 }}>
                                <TextField
                                    label="Número de WhatsApp"
                                    value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="+573001234567" required size="small"
                                    sx={{ flex: 1, minWidth: 200, ...inputSx }}
                                />
                                <Button
                                    type="submit" variant="contained" disabled={saving}
                                    sx={{
                                        whiteSpace: 'nowrap', borderRadius: '12px',
                                        px: 3, position: 'relative', overflow: 'hidden',
                                        '&::before': {
                                            content: '""', position: 'absolute',
                                            top: 0, left: -100, width: 60, height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                            transform: 'skewX(-20deg)', transition: 'left 0.7s ease',
                                        },
                                        '&:hover::before': { left: '130%' },
                                    }}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </Box>

                            <TextField
                                fullWidth label="Logo de la Tienda"
                                value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://ejemplo.com/logo.png" size="small"
                                sx={{ mb: 1, ...inputSx }}
                            />
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
                                Puedes pegar una URL o subir una imagen desde tu computador
                            </Typography>
                            <Box
                                component="label"
                                sx={{
                                    border: '2px dashed',
                                    borderColor: isDark ? 'rgba(180,197,255,0.2)' : 'rgba(0,74,198,0.15)',
                                    borderRadius: '14px',
                                    p: 3, textAlign: 'center', cursor: 'pointer', display: 'block',
                                    color: 'text.disabled', fontSize: '0.875rem',
                                    background: isDark ? 'rgba(0,74,198,0.03)' : 'rgba(0,74,198,0.02)',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        background: isDark ? 'rgba(0,74,198,0.06)' : 'rgba(0,74,198,0.04)',
                                    },
                                }}
                            >
                                📸 Arrastra una imagen aquí o haz clic para seleccionar
                                <input
                                    type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (ev) => setLogoUrl(ev.target.result)
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                />
                            </Box>
                            {logoUrl && (
                                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box component="img" src={logoUrl} alt="Preview logo" sx={{
                                        width: 56, height: 56, objectFit: 'cover', borderRadius: '12px',
                                        border: isDark ? '1px solid rgba(180,197,255,0.15)' : '1px solid rgba(0,74,198,0.1)',
                                    }} />
                                    <Button variant="outlined" size="small" onClick={() => setLogoUrl('')} sx={{ borderRadius: '10px' }}>
                                        Quitar imagen
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Dark Mode Toggle */}
            <Card sx={{ animation: 'fade-in-up 0.5s ease both', animationDelay: '0.1s', mb: 3, position: 'relative', overflow: 'visible', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #004ac6, #2563eb, #5092f7)', borderRadius: '16px 16px 0 0' } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: isDark ? 'rgba(180,197,255,0.15)' : 'rgba(0,74,198,0.10)',
                            border: isDark ? '1px solid rgba(180,197,255,0.2)' : '1px solid rgba(0,74,198,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <PaletteIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Apariencia</Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        py: 1.5, mt: 1,
                        borderRadius: '12px', px: 2,
                        background: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
                    }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Modo Oscuro</Typography>
                            <Typography variant="caption" color="text.disabled">
                                Activa el modo oscuro para reducir la fatiga visual
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
                            label="" sx={{ mr: 0 }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card sx={{ animation: 'fade-in-up 0.5s ease both', animationDelay: '0.2s', mb: 3, position: 'relative', overflow: 'visible', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #d97706, #fbbf24)', borderRadius: '16px 16px 0 0' } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(245,158,11,0.10)',
                            border: isDark ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(245,158,11,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <SecurityIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Seguridad</Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        py: 1.5, mt: 1,
                        borderRadius: '12px', px: 2,
                        background: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
                    }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Contraseña</Typography>
                            <Typography variant="caption" color="text.disabled">
                                Cambia tu contraseña de acceso al panel
                            </Typography>
                        </Box>
                        <Button
                            component={Link} to="/admin/change-password" variant="outlined"
                            sx={{ textDecoration: 'none', borderRadius: '12px', fontWeight: 600 }}
                        >
                            Cambiar
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Empleados */}
            <Card sx={sectionCardStyle('linear-gradient(90deg, #8b5cf6, #7c3aed, #a78bfa)')}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.10)',
                            border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <PeopleIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                Gestionar Empleados
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                Crea y administra cuentas de empleados (solo pueden usar POS y ver pedidos)
                            </Typography>
                        </Box>
                    </Box>

                    <Box component="form" onSubmit={handleCreateStaff} sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            label="Email del empleado"
                            type="email"
                            value={newStaffEmail}
                            onChange={(e) => setNewStaffEmail(e.target.value)}
                            size="small"
                            required
                            placeholder="empleado@tienda.com"
                            sx={{ flex: 1, minWidth: 200, ...inputSx }}
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            size="small"
                            required
                            placeholder="Mínimo 6 caracteres"
                            sx={{ flex: 1, minWidth: 200, ...inputSx }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={creatingStaff}
                            startIcon={<PersonAddIcon />}
                            sx={{
                                whiteSpace: 'nowrap', borderRadius: '12px',
                                px: 3, fontWeight: 700,
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                '&:hover': { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
                            }}
                        >
                            {creatingStaff ? 'Creando...' : 'Crear Empleado'}
                        </Button>
                    </Box>

                    {staffLoading ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>Cargando empleados...</Typography>
                    ) : staffList.length === 0 ? (
                        <Box sx={{
                            p: 3, textAlign: 'center', borderRadius: '12px',
                            background: isDark ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.03)',
                            border: isDark ? '1px solid rgba(139,92,246,0.1)' : '1px solid rgba(139,92,246,0.08)',
                        }}>
                            <PeopleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                No hay empleados registrados
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                Crea una cuenta para que tu empleado pueda usar el sistema
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {staffList.map((staff) => (
                                <Box
                                    key={staff.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: isDark ? '1px solid rgba(139,92,246,0.1)' : '1px solid rgba(139,92,246,0.08)',
                                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(139,92,246,0.02)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.10)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <PersonAddIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{staff.email}</Typography>
                                            <Typography variant="caption" color="text.secondary">Empleado</Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="text"
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteOutlineIcon sx={{ fontSize: '1rem !important' }} />}
                                        onClick={() => handleDeleteStaff(staff.id)}
                                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                                    >
                                        Eliminar
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card sx={{ animation: 'fade-in-up 0.5s ease both', animationDelay: '0.3s', position: 'relative', overflow: 'visible', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #06b6d4, #0891b2, #22d3ee)', borderRadius: '16px 16px 0 0' } }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.10)',
                            border: isDark ? '1px solid rgba(6,182,212,0.2)' : '1px solid rgba(6,182,212,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <InfoIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Información de la Cuenta</Typography>
                    </Box>
                    <Box sx={{
                        display: 'grid', gap: 1, p: 2, borderRadius: '12px',
                        background: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
                        border: isDark ? '1px solid rgba(180,197,255,0.08)' : '1px solid rgba(0,74,198,0.06)',
                    }}>
                        {[
                            { label: 'Email', value: user?.email },
                            { label: 'Rol', value: user?.role === 'SUPERADMIN' ? 'Super Administrador' : user?.role === 'MANAGER' ? 'Gerente' : user?.role === 'STAFF' ? 'Empleado' : user?.role },
                            { label: 'ID de Tienda', value: user?.storeId || 'N/A' },
                            store && { label: 'Nombre de Tienda', value: store.name },
                            store && { label: 'Slug', value: `/${store.slug}` },
                            store?.whatsapp && { label: 'WhatsApp', value: store.whatsapp },
                        ].filter(Boolean).map((item) => (
                            <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                    {item.label}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                    {item.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}

export default Settings
