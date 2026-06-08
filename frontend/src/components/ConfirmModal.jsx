import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false }) {
    if (!isOpen) return null

    return (
        <Dialog
            open={isOpen}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    textAlign: 'center',
                    p: 1,
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
                <Box
                    sx={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        mb: 2,
                        background: danger
                            ? 'rgba(239, 68, 68, 0.1)'
                            : (theme) => theme.palette.primary.light,
                        color: danger ? 'error.main' : 'primary.dark',
                        boxShadow: danger
                            ? '0 0 0 8px rgba(239, 68, 68, 0.08)'
                            : (theme) => `0 0 0 8px ${theme.palette.primary.main}15`,
                    }}
                >
                    {danger ? '⚠' : '?'}
                </Box>
            </Box>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', pb: 1 }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
                <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onCancel} variant="outlined" fullWidth>
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={danger ? 'error' : 'primary'}
                    fullWidth
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmModal