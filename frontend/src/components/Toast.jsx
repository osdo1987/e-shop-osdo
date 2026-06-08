import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

const ToastContext = createContext(null)

export function useToast() {
    return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, message, type, duration }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const clear = useCallback(() => {
        setToasts([])
    }, [])

    const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast])
    const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast])
    const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast])
    const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast])

    const getSeverity = (type) => {
        switch (type) {
            case 'success': return 'success'
            case 'error': return 'error'
            case 'warning': return 'warning'
            default: return 'info'
        }
    }

    return (
        <ToastContext.Provider value={{ success, error, warning, info, clear, addToast }}>
            {children}
            <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 380 }}>
                {toasts.map(toast => (
                    <Snackbar
                        key={toast.id}
                        open={true}
                        autoHideDuration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{ position: 'static', transform: 'none' }}
                    >
                        <Alert
                            onClose={() => removeToast(toast.id)}
                            severity={getSeverity(toast.type)}
                            variant="filled"
                            sx={{
                                width: '100%',
                                backdropFilter: 'blur(16px)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
                                '& .MuiAlert-icon': { alignItems: 'center' },
                            }}
                        >
                            {toast.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Box>
        </ToastContext.Provider>
    )
}

export default ToastProvider