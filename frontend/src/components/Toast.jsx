import { useState, useCallback, createContext, useContext } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoIcon from '@mui/icons-material/Info'
import { useTheme } from '@mui/material/styles'

const ToastContext = createContext(null)

export function useToast() {
    return useContext(ToastContext)
}

let toastId = 0

const severityConfig = {
    success: {
        icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
        border: 'rgba(16, 185, 129, 0.4)',
        shadow: '0 8px 32px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.15)',
        iconColor: '#10b981',
        barColor: 'linear-gradient(90deg, #10b981, #059669)',
    },
    error: {
        icon: <ErrorIcon sx={{ fontSize: 22 }} />,
        gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
        border: 'rgba(239, 68, 68, 0.4)',
        shadow: '0 8px 32px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.15)',
        iconColor: '#ef4444',
        barColor: 'linear-gradient(90deg, #ef4444, #dc2626)',
    },
    warning: {
        icon: <WarningAmberIcon sx={{ fontSize: 22 }} />,
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
        border: 'rgba(245, 158, 11, 0.4)',
        shadow: '0 8px 32px rgba(245, 158, 11, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.15)',
        iconColor: '#f59e0b',
        barColor: 'linear-gradient(90deg, #f59e0b, #d97706)',
    },
    info: {
        icon: <InfoIcon sx={{ fontSize: 22 }} />,
        gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
        border: 'rgba(99, 102, 241, 0.4)',
        shadow: '0 8px 32px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.15)',
        iconColor: '#6366f1',
        barColor: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    },
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, message, type, duration, entering: true }])
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, entering: false } : t))
        }, 50)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 300)
    }, [])

    const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast])
    const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast])
    const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast])
    const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast])
    const clear = useCallback(() => setToasts([]), [])

    return (
        <ToastContext.Provider value={{ success, error, warning, info, clear, addToast }}>
            {children}
            <Box sx={{
                position: 'fixed', top: 24, right: 24, zIndex: 10000,
                display: 'flex', flexDirection: 'column', gap: 1.5,
                maxWidth: 420,
            }}>
                {toasts.map(toast => {
                    const cfg = severityConfig[toast.type] || severityConfig.info
                    return (
                        <Box
                            key={toast.id}
                            sx={{
                                position: 'relative',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                background: isDark
                                    ? 'rgba(14, 14, 36, 0.9)'
                                    : 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(24px) saturate(200%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                                border: `1px solid ${cfg.border}`,
                                boxShadow: isDark
                                    ? `0 12px 48px rgba(0,0,0,0.5), ${cfg.shadow}`
                                    : cfg.shadow,
                                animation: toast.exiting
                                    ? 'toast-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                                    : 'toast-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateX(-4px)',
                                    boxShadow: isDark
                                        ? `0 16px 56px rgba(0,0,0,0.6), ${cfg.shadow}`
                                        : `0 16px 56px rgba(0,0,0,0.1), ${cfg.shadow}`,
                                },
                            }}
                        >
                            {/* Top accent line */}
                            <Box sx={{
                                height: '3px',
                                background: cfg.barColor,
                                animation: 'progress-fill 4s linear both',
                            }} />

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2 }}>
                                {/* Icon */}
                                <Box sx={{
                                    color: cfg.iconColor,
                                    mt: '1px',
                                    flexShrink: 0,
                                    filter: `drop-shadow(0 0 6px ${cfg.iconColor}40)`,
                                }}>
                                    {cfg.icon}
                                </Box>

                                {/* Message */}
                                <Typography sx={{
                                    flex: 1,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5,
                                    color: 'text.primary',
                                }}>
                                    {toast.message}
                                </Typography>

                                {/* Close button */}
                                <IconButton
                                    size="small"
                                    onClick={() => removeToast(toast.id)}
                                    sx={{
                                        mt: -0.5, mr: -0.5,
                                        color: 'text.secondary',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: 'text.primary',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                        },
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </ToastContext.Provider>
    )
}

export default ToastProvider
