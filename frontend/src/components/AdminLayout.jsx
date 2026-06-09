import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import CategoryIcon from '@mui/icons-material/Category'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SettingsIcon from '@mui/icons-material/Settings'
import StoreIcon from '@mui/icons-material/Store'
import LogoutIcon from '@mui/icons-material/Logout'
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
        ? [{ path: '/admin/super', label: 'Tiendas', icon: <StoreIcon /> }]
        : [
            { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
            { path: '/admin', label: 'Productos', icon: <Inventory2Icon /> },
            { path: '/admin/categories', label: 'Categorías', icon: <CategoryIcon /> },
            { path: '/admin/orders', label: 'Pedidos', icon: <ShoppingCartIcon /> },
            { path: '/admin/settings', label: 'Configuración', icon: <SettingsIcon /> }
        ], [superadmin])

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo / Brand */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    }}>
                        <StoreIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: '0.9375rem' }}>
                            {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.625rem' }}>
                            Panel de control
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, mb: 1 }} />

            {/* Navigation */}
            <List sx={{ flex: 1, px: 1.5, py: 0.5 }}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.path
                    return (
                        <ListItemButton
                            key={item.path}
                            component={Link}
                            to={item.path}
                            selected={isActive}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                                borderRadius: 1.5,
                                mb: 0.25,
                                py: 1,
                                px: 1.5,
                                minHeight: 40,
                                transition: 'all 0.15s ease',
                                ...(isActive ? {
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? 'rgba(129, 140, 248, 0.15)'
                                        : 'rgba(99, 102, 241, 0.08)',
                                    '& .MuiListItemIcon-root': {
                                        color: theme.palette.primary.main,
                                    },
                                    '& .MuiListItemText-primary': {
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                    },
                                } : {
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.disabled' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                slotProps={{ primary: { fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500 } }}
                            />
                        </ListItemButton>
                    )
                })}
            </List>

            <Divider sx={{ mx: 2, my: 1 }} />

            {/* Logout */}
            <Box sx={{ px: 1.5, pb: 2 }}>
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: 1.5,
                        py: 1,
                        px: 1.5,
                        minHeight: 40,
                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: 'text.disabled' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Cerrar Sesión"
                        slotProps={{ primary: { fontSize: '0.8125rem', fontWeight: 500, color: 'text.secondary' } }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Permanent drawer for desktop */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 240,
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
                    <Toolbar sx={{ minHeight: { xs: 52, md: 56 }, gap: 1 }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={() => setMobileOpen(true)}
                                size="small"
                                sx={{ mr: 0.5 }}
                            >
                                <MenuIcon fontSize="small" />
                            </IconButton>
                        )}
                        <Typography
                            variant="h6"
                            sx={{
                                flex: 1,
                                fontWeight: 700,
                                fontSize: { xs: '1rem', md: '1.125rem' },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '0.75rem', fontWeight: 700,
                            }}>
                                {user?.storeName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                            </Box>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        display: 'block',
                                        fontSize: '0.6875rem',
                                        lineHeight: 1.2,
                                        color: 'text.primary',
                                    }}
                                >
                                    {user?.storeName || user?.email}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.625rem', lineHeight: 1 }}>
                                    {headerLabel}
                                </Typography>
                            </Box>
                            {showBack && (
                                <Button
                                    component={Link}
                                    to="/admin"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontSize: '0.6875rem', py: 0.5, ml: 0.5 }}
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