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
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import CategoryIcon from '@mui/icons-material/Category'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SettingsIcon from '@mui/icons-material/Settings'
import StoreIcon from '@mui/icons-material/Store'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PaymentsIcon from '@mui/icons-material/Payments'

function AdminLayout({ title, children, user, onLogout, superadmin = false, showBack = false }) {
    const isStaff = user?.role === 'STAFF'
    const displayName = superadmin ? 'Super Admin' : (user?.storeName || 'Mi Tienda')
    const headerLabel = superadmin ? 'Super Admin' : isStaff ? `Empleado - ${user?.storeName || ''}` : (user?.storeName ? `Gerente - ${user.storeName}` : 'Gerente')
    const location = useLocation()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        document.title = superadmin
            ? 'Super Admin - Panel'
            : user?.storeName
                ? `${user.storeName} - Panel`
                : 'Mi Tienda - Panel'
    }, [user, superadmin])

    const navItems = useMemo(() => {
        if (superadmin) return [{ path: '/admin/super', label: 'Tiendas', icon: <StoreIcon /> }]

        const allItems = [
            { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon />, managerOnly: true },
            { path: '/admin', label: 'Productos', icon: <Inventory2Icon />, managerOnly: true },
            { path: '/admin/categories', label: 'Categorías', icon: <CategoryIcon />, managerOnly: true },
            { path: '/admin/pos', label: 'POS / Venta Local', icon: <PointOfSaleIcon /> },
            { path: '/admin/cash-register', label: 'Control de Caja', icon: <AccountBalanceWalletIcon />, managerOnly: true },
            { path: '/admin/invoices', label: 'Facturas', icon: <ReceiptLongIcon />, managerOnly: true },
            { path: '/admin/orders', label: 'Pedidos Web', icon: <ShoppingCartIcon /> },
            { path: '/admin/payment-methods', label: 'Métodos de Pago', icon: <PaymentsIcon />, managerOnly: true },
            { path: '/admin/settings', label: 'Configuración', icon: <SettingsIcon />, managerOnly: true }
        ]

        return allItems.filter(item => !item.managerOnly || !isStaff)
    }, [superadmin, isStaff])

    const drawerWidth = 280

    const drawerContent = (
        <Box sx={{
            display: 'flex', flexDirection: 'column', height: '100%',
            backgroundColor: isDark ? '#2d3133' : '#ffffff',
            borderRight: `1px solid ${isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7'}`,
        }}>
            {/* Profile Header */}
            <Box sx={{ px: 3, py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(180,197,255,0.12)' : '#eceef0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7'}`,
                    }}>
                        <PersonIcon sx={{ color: isDark ? '#c3c6d7' : '#737686', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2,
                            color: isDark ? '#e0e3e5' : '#191c1e',
                        }}>
                            {displayName}
                        </Typography>
                        <Typography sx={{
                            fontSize: '0.75rem', fontWeight: 400,
                            color: isDark ? '#c3c6d7' : '#434655',
                        }}>
                            {headerLabel}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Divider */}
            <Box sx={{ mx: 3, height: '1px', backgroundColor: isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7' }} />

            {/* Navigation Items */}
            <List sx={{ flex: 1, px: 2, py: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <ListItemButton
                            key={item.path}
                            component={Link}
                            to={item.path}
                            selected={isActive}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                                borderRadius: '20px',
                                mb: 0.5,
                                py: 1,
                                px: 2,
                                minHeight: 44,
                                backgroundColor: isActive
                                    ? (isDark ? 'rgba(180,197,255,0.12)' : '#f2f4f6')
                                    : 'transparent',
                                transition: 'background-color 0.15s ease',
                                '&:hover': {
                                    backgroundColor: isActive
                                        ? (isDark ? 'rgba(180,197,255,0.12)' : '#f2f4f6')
                                        : (isDark ? 'rgba(180,197,255,0.04)' : '#f2f4f6'),
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isActive
                                        ? (isDark ? '#b4c5ff' : '#004ac6')
                                        : (isDark ? '#c3c6d7' : '#434655'),
                                    minWidth: 40,
                                },
                                '& .MuiListItemText-primary': {
                                    color: isActive
                                        ? (isDark ? '#b4c5ff' : '#004ac6')
                                        : (isDark ? '#e0e3e5' : '#191c1e'),
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.875rem',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ '& svg': { fontSize: 20 } }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    )
                })}
            </List>

            {/* Bottom Divider */}
            <Box sx={{ mx: 3, height: '1px', backgroundColor: isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7' }} />

            {/* Logout */}
            <Box sx={{ px: 2, py: 1.5 }}>
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: '20px',
                        py: 1,
                        px: 2,
                        minHeight: 44,
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255,180,171,0.08)' : 'rgba(186,26,26,0.04)',
                        },
                        '& .MuiListItemIcon-root': {
                            color: isDark ? '#c3c6d7' : '#434655',
                            minWidth: 40,
                        },
                        '& .MuiListItemText-primary': {
                            color: isDark ? '#e0e3e5' : '#191c1e',
                            fontSize: '0.875rem',
                        },
                    }}
                >
                    <ListItemIcon sx={{ '& svg': { fontSize: 20 } }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Desktop permanent drawer */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: isDark ? '#2d3133' : '#ffffff',
                            borderRight: `1px solid ${isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7'}`,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Mobile temporary drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* AppBar */}
                <AppBar
                    position="sticky" color="inherit" elevation={0}
                    sx={{
                        backgroundColor: isDark ? '#191c1e' : '#ffffff',
                        borderBottom: `1px solid ${isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7'}`,
                    }}
                >
                    <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, gap: 1 }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={() => setMobileOpen(true)}
                                sx={{ mr: 0.5 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography
                            variant="h6"
                            sx={{
                                flex: 1, fontWeight: 600,
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                color: isDark ? '#e0e3e5' : '#191c1e',
                            }}
                        >
                            {title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {/* User info — desktop only */}
                            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                                <Typography sx={{
                                    fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2,
                                    color: isDark ? '#e0e3e5' : '#191c1e',
                                }}>
                                    {user?.storeName || user?.email}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.75rem', lineHeight: 1, fontWeight: 400,
                                    color: isDark ? '#c3c6d7' : '#434655',
                                }}>
                                    {headerLabel}
                                </Typography>
                            </Box>

                            {/* Avatar */}
                            <Box sx={{
                                width: 40, height: 40, borderRadius: '50%',
                                backgroundColor: isDark ? 'rgba(180,197,255,0.12)' : '#eceef0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isDark ? '#b4c5ff' : '#004ac6',
                                fontSize: '0.875rem', fontWeight: 600,
                                border: `1px solid ${isDark ? 'rgba(180,197,255,0.12)' : '#c3c6d7'}`,
                            }}>
                                {user?.storeName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                            </Box>

                            {showBack && (
                                <Button
                                    component={Link} to="/admin"
                                    variant="outlined" size="small"
                                    sx={{ fontSize: '0.75rem', py: 0.5, ml: 0.5 }}
                                >
                                    Volver
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={{
                    p: { xs: 2, md: 3 },
                    flex: 1,
                    backgroundColor: isDark ? '#191c1e' : '#f7f9fb',
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    )
}

export default AdminLayout
