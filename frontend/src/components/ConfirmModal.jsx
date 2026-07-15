import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import HelpIcon from '@mui/icons-material/Help'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useTheme } from '@mui/material/styles'

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false }) {
    const [open, setOpen] = useState(false)
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setOpen(true))
        } else {
            setOpen(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    overflow: 'visible',
                    background: isDark
                        ? 'rgba(10, 10, 28, 0.95)'
                        : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(40px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                    border: isDark
                        ? '1px solid rgba(180, 197, 255, 0.15)'
                        : '1px solid rgba(0, 74, 198, 0.12)',
                    boxShadow: isDark
                        ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(180,197,255,0.08)'
                        : '0 32px 80px rgba(0,74,198,0.18), 0 0 0 1px rgba(0,74,198,0.05)',
                    p: 0,
                    animation: 'fade-in-up 0.35s cubic-bezier(0.4, 0, 0.2, 1) both',
                },
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                    },
                },
            }}
        >
            <DialogContent sx={{ pt: 4, pb: 1, px: 4, textAlign: 'center' }}>
                {/* Animated icon */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
                    <Box sx={{
                        width: 72, height: 72, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: danger
                            ? isDark
                                ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))'
                                : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))'
                            : isDark
                                ? 'linear-gradient(135deg, rgba(0,74,198,0.2), rgba(0,74,198,0.08))'
                                : 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(0,74,198,0.04))',
                        border: `1px solid ${danger
                            ? isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'
                            : isDark ? 'rgba(180,197,255,0.2)' : 'rgba(0,74,198,0.15)'}`,
                        boxShadow: danger
                            ? '0 0 0 8px rgba(239,68,68,0.06), 0 8px 24px rgba(239,68,68,0.12)'
                            : '0 0 0 8px rgba(0,74,198,0.06), 0 8px 24px rgba(0,74,198,0.12)',
                        animation: 'icon-bounce 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
                        animationDelay: '0.15s',
                    }}>
                        {danger
                            ? <WarningAmberIcon sx={{ fontSize: 36, color: 'error.main' }} />
                            : <HelpIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                        }
                    </Box>
                </Box>

                <Typography variant="h5" sx={{
                    fontWeight: 400, mb: 1,
                    fontSize: '1.25rem',
                    color: 'text.primary',
                }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: '0.875rem', lineHeight: 1.6,
                }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 3.5, pt: 2, gap: 1.5 }}>
                <Button
                    onClick={onCancel} variant="outlined" fullWidth
                    sx={{ borderRadius: '12px', py: 1.1 }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm} variant="contained" fullWidth
                    color={danger ? 'error' : 'primary'}
                    sx={{
                        borderRadius: '12px', py: 1.1,
                        position: 'relative', overflow: 'hidden',
                        '&::before': {
                            content: '""', position: 'absolute',
                            top: 0, left: -120, width: 70, height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                            transform: 'skewX(-20deg)', transition: 'left 0.7s ease',
                        },
                        '&:hover::before': { left: '140%' },
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmModal
