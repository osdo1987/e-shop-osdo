import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

function AdminLayout({ title, children, user, onLogout, superadmin = false, showBack = false }) {
    const displayName = superadmin ? 'Super Admin' : (user?.storeName || 'Mi Tienda')
    const headerLabel = superadmin ? 'Super Admin' : (user?.storeName ? `Vendedor - ${user.storeName}` : 'Vendedor')
    const location = useLocation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        if (superadmin) {
            document.title = 'Super Admin - Panel'
        } else if (user?.storeName) {
            document.title = `${user.storeName} - Panel`
        } else {
            document.title = 'Mi Tienda - Panel'
        }
    }, [user, superadmin])

    const navItems = useMemo(() => superadmin
        ? [{ path: '/admin/super', label: 'Tiendas' }]
        : [
            { path: '/admin/dashboard', label: 'Dashboard' },
            { path: '/admin', label: 'Productos' },
            { path: '/admin/categories', label: 'Categorías' },
            { path: '/admin/orders', label: 'Pedidos' },
            { path: '/admin/settings', label: 'Configuración' }
        ], [superadmin])

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
            <Typography
                variant="h6"
                sx={{
                    mb: 3,
                    px: 1,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                {displayName}
            </Typography>
            <List sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {navItems.map(item => (
                    <ListItemButton
                        key={item.path}
                        component={Link}
                        to={item.path}
                        selected={location.pathname === item.path}
                        onClick={() => setMobileOpen(false)}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            '&.Mui-selected': {
                                background: theme.palette.mode === 'dark'
                                    ? 'rgba(129, 140, 248, 0.15)'
                                    : 'rgba(99, 102, 241, 0.08)',
                                '&:hover': {
                                    background: theme.palette.mode === 'dark'
                                        ? 'rgba(129, 140, 248, 0.2)'
                                        : 'rgba(99, 102, 241, 0.12)',
                                },
                                '& .MuiListItemText-primary': {
                                    color: theme.palette.mode === 'dark'
                                        ? theme.palette.primary.main
                                        : theme.palette.primary.dark,
                                    fontWeight: 600,
                                },
                            },
                        }}
                    >
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'text.secondary',
                            }}
                        />
                    </ListItemButton>
                ))}
                <Box sx={{ flex: 1 }} />
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onLogout}
                    fullWidth
                    sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                >
                    Cerrar Sesión
                </Button>
            </List>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Permanent drawer for desktop */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 256,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 256,
                            boxSizing: 'border-box',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            background: theme.palette.background.paper,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Temporary drawer for mobile */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: 280,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <AppBar
                    position="sticky"
                    color="inherit"
                    elevation={0}
                    sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(15, 15, 40, 0.82)'
                            : 'rgba(255, 255, 255, 0.82)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={() => setMobileOpen(true)}
                                sx={{ mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h5" sx={{ flex: 1, fontWeight: 700, letterSpacing: '-0.04em' }}>
                            {title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        display: 'block',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    {headerLabel}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                            {showBack && (
                                <Button
                                    component={Link}
                                    to="/admin"
                                    variant="outlined"
                                    size="small"
                                >
                                    Volver
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box sx={{ p: { xs: 2, md: 3.5 } }}>
                    {children}
                </Box>
            </Box>
        </Box>
    )
}

export default AdminLayout