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
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

function AdminLayout({ title, children, user, onLogout, superadmin = false, showBack = false }) {
    const displayName = superadmin ? 'Super Admin' : (user?.storeName || 'Mi Tienda')
    const headerLabel = superadmin ? 'Super Admin' : (user?.storeName ? `Vendedor - ${user.storeName}` : 'Vendedor')
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

    const navItems = useMemo(() => superadmin
        ? [{ path: '/admin/super', label: 'Tiendas', icon: <StoreIcon /> }]
        : [
            { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
            { path: '/admin', label: 'Productos', icon: <Inventory2Icon /> },
            { path: '/admin/categories', label: 'Categorías', icon: <CategoryIcon /> },
            { path: '/admin/pos', label: 'POS / Venta Local', icon: <PointOfSaleIcon /> },
            { path: '/admin/cash-register', label: 'Control de Caja', icon: <AccountBalanceWalletIcon /> },
            { path: '/admin/invoices', label: 'Facturas', icon: <ReceiptLongIcon /> },
            { path: '/admin/orders', label: 'Pedidos Web', icon: <ShoppingCartIcon /> },
            { path: '/admin/settings', label: 'Configuración', icon: <SettingsIcon /> }
        ], [superadmin])

    const drawerWidth = 260

    const drawerContent = (
        <Box sx={{
            display: 'flex', flexDirection: 'column', height: '100%',
            background: isDark
                ? 'linear-gradient(180deg, #080820 0%, #0b0b28 40%, #0a0a24 70%, #080820 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #fafafe 50%, #f5f5fe 100%)',
            borderRight: `1px solid ${isDark ? 'rgba(129,140,248,0.10)' : 'rgba(99,102,241,0.08)'}`,
        }}>
            {/* Logo / Brand — premium glow */}
            <Box sx={{ px: 3, pt: 3.5, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 80%, #c4b5fd 100%)',
                        backgroundSize: '200% auto',
                        animation: 'shimmer 4s linear infinite',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 24px rgba(99, 102, 241, 0.55)',
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.7)',
                        },
                    }}>
                        <StoreIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 800, lineHeight: 1.2, fontSize: '1rem',
                            background: isDark
                                ? 'linear-gradient(135deg, #e0e7ff, #a5b4fc)'
                                : 'linear-gradient(135deg, #4338ca, #6366f1)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            {displayName}
                        </Typography>
                        <Typography sx={{
                            fontSize: '0.6rem', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.12em',
                            color: isDark ? 'rgba(160,160,200,0.45)' : 'rgba(74,74,106,0.4)',
                        }}>
                            Panel de control
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Gradient divider */}
            <Box sx={{
                mx: 2.5, mb: 1.5, height: '2px', borderRadius: 99,
                background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(129,140,248,0.3), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)',
            }} />

            <Typography sx={{
                px: 3, mb: 0.75,
                fontSize: '0.6rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.14em',
                color: isDark ? 'rgba(160,160,200,0.35)' : 'rgba(74,74,106,0.35)',
            }}>
                Navegación
            </Typography>

            {/* Navigation items */}
            <List sx={{ flex: 1, px: 1.5, py: 0 }}>
                {navItems.map((item, idx) => {
                    const isActive = location.pathname === item.path
                    return (
                        <ListItemButton
                            key={item.path}
                            component={Link}
                            to={item.path}
                            selected={isActive}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                                borderRadius: '14px',
                                mb: 0.5,
                                py: 1,
                                px: 1.75,
                                minHeight: 46,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                animation: `slide-in-right 0.35s ease both`,
                                animationDelay: `${idx * 50}ms`,
                                ...(isActive ? {
                                    background: isDark
                                        ? 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.18) 100%)'
                                        : 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.08) 100%)',
                                    boxShadow: isDark
                                        ? '0 4px 16px rgba(99,102,241,0.25), inset 0 0 0 1px rgba(99,102,241,0.18), 0 0 20px rgba(99,102,241,0.08)'
                                        : '0 4px 12px rgba(99,102,241,0.15), inset 0 0 0 1px rgba(99,102,241,0.12)',
                                    '& .MuiListItemIcon-root': { color: isDark ? '#c7d2fe' : '#4f46e5' },
                                    '& .MuiListItemText-primary': {
                                        color: isDark ? '#e0e7ff' : '#4338ca',
                                        fontWeight: 800,
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0, top: '12%', bottom: '12%',
                                        width: 4,
                                        borderRadius: '0 4px 4px 0',
                                        background: 'linear-gradient(180deg, #6366f1, #8b5cf6, #a78bfa)',
                                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                                    },
                                } : {
                                    '&:hover': {
                                        background: isDark
                                            ? 'rgba(129,140,248,0.10)'
                                            : 'rgba(99,102,241,0.07)',
                                        transform: 'translateX(4px)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    },
                                }),
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 36,
                                color: isActive
                                    ? (isDark ? '#a5b4fc' : '#6366f1')
                                    : (isDark ? 'rgba(160,160,200,0.4)' : 'rgba(74,74,106,0.4)'),
                                transition: 'all 0.25s ease',
                                '& svg': { fontSize: 20 },
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                slotProps={{ primary: {
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? 800 : 500,
                                    letterSpacing: '0.01em',
                                } }}
                            />
                        </ListItemButton>
                    )
                })}
            </List>

            {/* Bottom gradient divider */}
            <Box sx={{
                mx: 2.5, my: 1, height: '2px', borderRadius: 99,
                background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(129,140,248,0.2), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)',
            }} />

            {/* Logout */}
            <Box sx={{ px: 1.5, pb: 2.5 }}>
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: '14px',
                        py: 1, px: 1.75,
                        minHeight: 46,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            background: 'rgba(239, 68, 68, 0.10)',
                            boxShadow: '0 2px 12px rgba(239, 68, 68, 0.1)',
                            '& .MuiListItemIcon-root': { color: '#ef4444' },
                            '& .MuiListItemText-primary': { color: '#ef4444', fontWeight: 700 },
                            transform: 'translateX(4px)',
                        },
                    }}
                >
                    <ListItemIcon sx={{
                        minWidth: 36,
                        color: isDark ? 'rgba(160,160,200,0.3)' : 'rgba(74,74,106,0.3)',
                        transition: 'color 0.2s ease',
                    }}>
                        <LogoutIcon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Cerrar Sesión"
                        slotProps={{ primary: { fontSize: '0.85rem', fontWeight: 500 } }}
                    />
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
                            background: 'transparent',
                            borderRight: 'none',
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
                {/* Premium AppBar with intense glassmorphism */}
                <AppBar
                    position="sticky" color="inherit" elevation={0}
                    sx={{
                        borderBottom: isDark
                            ? '1px solid rgba(129,140,248,0.14)'
                            : '1px solid rgba(99,102,241,0.10)',
                        background: isDark
                            ? 'rgba(7, 7, 26, 0.75)'
                            : 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(32px) saturate(220%)',
                        WebkitBackdropFilter: 'blur(32px) saturate(220%)',
                        boxShadow: isDark
                            ? '0 1px 0 rgba(129,140,248,0.12), 0 8px 32px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(129,140,248,0.06)'
                            : '0 1px 0 rgba(99,102,241,0.08), 0 8px 32px rgba(99,102,241,0.06), inset 0 -1px 0 rgba(99,102,241,0.04)',
                    }}
                >
                    <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, gap: 1 }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={() => setMobileOpen(true)}
                                sx={{
                                    mr: 0.5,
                                    '&:hover': { background: 'rgba(99, 102, 241, 0.1)' },
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography
                            variant="h6"
                            sx={{
                                flex: 1, fontWeight: 800,
                                fontSize: { xs: '1rem', md: '1.2rem' },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {/* User info — desktop only */}
                            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                                <Typography sx={{
                                    fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2,
                                    color: 'text.primary',
                                }}>
                                    {user?.storeName || user?.email}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.6rem', lineHeight: 1, fontWeight: 600,
                                    color: isDark ? 'rgba(160,160,200,0.4)' : 'rgba(74,74,106,0.4)',
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                }}>
                                    {headerLabel}
                                </Typography>
                            </Box>

                            {/* Avatar with animated gradient border ring */}
                            <Box sx={{ position: 'relative' }}>
                                <Box sx={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: isDark
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)'
                                        : 'linear-gradient(135deg, #4f46e5, #6366f1, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '0.85rem', fontWeight: 900,
                                    boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 6px 28px rgba(99,102,241,0.65)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: -3,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa, #10b981, #6366f1)`,
                                        backgroundSize: '400% 400%',
                                        animation: 'gradient-rotate 5s linear infinite',
                                        zIndex: -1,
                                    },
                                }}>
                                    {user?.storeName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                                </Box>
                                {/* Pulsing online dot */}
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0, right: 0,
                                    width: 12, height: 12,
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    border: `2.5px solid ${isDark ? '#0e0e24' : '#fff'}`,
                                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                                    animation: 'pulse-glow 2s ease-in-out infinite',
                                }} />
                            </Box>

                            {showBack && (
                                <Button
                                    component={Link} to="/admin"
                                    variant="outlined" size="small"
                                    sx={{ fontSize: '0.7rem', py: 0.5, ml: 0.5, borderRadius: '10px' }}
                                >
                                    Volver
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content with entrance animation */}
                <Box sx={{
                    p: { xs: 2, md: 3.5 },
                    flex: 1,
                    animation: 'fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) both',
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    )
}

export default AdminLayout
