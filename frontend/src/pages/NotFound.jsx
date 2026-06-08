import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

function NotFound() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 2.5,
                textAlign: 'center',
                background: (theme) => `radial-gradient(ellipse at 50% 0%, ${theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.08)'} 0%, transparent 60%)`,
            }}
        >
            <Box sx={{ fontSize: '5rem', mb: 2 }}>🔍</Box>
            <Typography
                variant="h1"
                sx={{
                    fontSize: '4.5rem',
                    fontWeight: 800,
                    color: 'primary.main',
                    mb: 1,
                }}
            >
                404
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                Página no encontrada
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 400, mb: 4 }}>
                La página que buscas no existe o ha sido movida. Verifica la URL o vuelve al inicio.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button component={Link} to="/" variant="contained" size="large" sx={{ px: 4, py: 1.5, fontSize: '1rem' }}>
                    Ir al Inicio
                </Button>
                <Button component={Link} to="/login" variant="outlined" size="large" sx={{ px: 4, py: 1.5, fontSize: '1rem' }}>
                    Iniciar Sesión
                </Button>
            </Box>
        </Box>
    )
}

export default NotFound