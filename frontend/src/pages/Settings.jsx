import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

function Settings({ user, onLogout, darkMode, setDarkMode }) {
    const [store, setStore] = useState(null)
    const [whatsapp, setWhatsapp] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [saving, setSaving] = useState(false)
    const toast = useToast()

    useEffect(() => {
        fetchStoreData()
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

    return (
        <AdminLayout title="Configuración" user={user} onLogout={onLogout}>
            {store && (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            Información Pública de la Tienda
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Configura el WhatsApp para recibir pedidos y el logo que se mostrará en el catálogo.
                            {store.slug && (
                                <Typography component="span" variant="body2" sx={{ display: 'block', mt: 0.5 }}>
                                    Catálogo: <Link to={`/${store.slug}`} target="_blank" style={{ color: '#6366f1' }}>/{store.slug}</Link>
                                </Typography>
                            )}
                        </Typography>
                        <Box component="form" onSubmit={handleSaveStoreInfo} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <TextField
                                label="Número de WhatsApp"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="+573001234567"
                                required
                                size="small"
                                sx={{ flex: 1, minWidth: 200 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                                <TextField
                                    fullWidth
                                    label="Logo de la Tienda"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://ejemplo.com/logo.png"
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                                    Puedes pegar una URL o subir una imagen desde tu computador
                                </Typography>
                                <Box
                                    component="label"
                                    sx={{
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        p: 2,
                                        textAlign: 'center',
                                        color: 'text.disabled',
                                        fontSize: '0.8125rem',
                                        cursor: 'pointer',
                                        display: 'block',
                                        bgcolor: 'background.default',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: 'primary.main' },
                                    }}
                                >
                                    📸 Arrastra una imagen aquí o haz clic para seleccionar
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onload = (ev) => {
                                                    setLogoUrl(ev.target.result)
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                </Box>
                                {logoUrl && (
                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box component="img" src={logoUrl} alt="Preview logo" sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                                        <Button variant="outlined" size="small" onClick={() => setLogoUrl('')}>
                                            Quitar imagen
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                            <Button type="submit" variant="contained" disabled={saving} sx={{ whiteSpace: 'nowrap' }}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Dark Mode Toggle */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Apariencia</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Modo Oscuro</Typography>
                            <Typography variant="caption" color="text.disabled">
                                Activa el modo oscuro para reducir la fatiga visual
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={darkMode}
                                    onChange={() => setDarkMode(!darkMode)}
                                />
                            }
                            label=""
                            sx={{ mr: 0 }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Seguridad</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Contraseña</Typography>
                            <Typography variant="caption" color="text.disabled">
                                Cambia tu contraseña de acceso al panel
                            </Typography>
                        </Box>
                        <Button component={Link} to="/admin/change-password" variant="outlined" sx={{ textDecoration: 'none' }}>
                            Cambiar Contraseña
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Información de la Cuenta</Typography>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        <Typography variant="body2"><strong>Email:</strong> {user?.email}</Typography>
                        <Typography variant="body2"><strong>Rol:</strong> {user?.role === 'SUPERADMIN' ? 'Super Administrador' : 'Vendedor'}</Typography>
                        <Typography variant="body2"><strong>ID de Tienda:</strong> {user?.storeId || 'N/A'}</Typography>
                        {store && (
                            <>
                                <Typography variant="body2"><strong>Nombre de Tienda:</strong> {store.name}</Typography>
                                <Typography variant="body2"><strong>Slug:</strong> /{store.slug}</Typography>
                                {store.whatsapp && <Typography variant="body2"><strong>WhatsApp Configurado:</strong> {store.whatsapp}</Typography>}
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}

export default Settings