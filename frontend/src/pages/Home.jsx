import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

function Home() {
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
            <Typography
                variant="h1"
                sx={{
                    fontSize: { xs: '2.125rem', sm: '3.25rem' },
                    fontWeight: 800,
                    mb: 2.5,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                E-Shop WhatsApp
            </Typography>
            <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mb: 5, fontWeight: 400 }}
            >
                La solución más rápida para vender por WhatsApp. Crea tu catálogo, comparte el link y recibe pedidos al instante.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{ px: 5, py: 1.5, fontSize: '1.125rem' }}
                >
                    Entrar al Panel
                </Button>
            </Box>

            <Typography variant="body2" color="text.disabled" sx={{ mt: 7.5 }}>
                ¿Eres un cliente? Pide el link del catálogo directamente a tu vendedor.
            </Typography>
        </Box>
    )
}

export default Home