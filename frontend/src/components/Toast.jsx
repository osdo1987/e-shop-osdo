import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import './Toast.css'

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

    return (
        <ToastContext.Provider value={{ success, error, warning, info, clear, addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration)
        return () => clearTimeout(timer)
    }, [toast, onRemove])

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    }

    return (
        <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
            <span className="toast-icon">{icons[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); onRemove(toast.id) }}>×</button>
        </div>
    )
}

export default ToastProvider