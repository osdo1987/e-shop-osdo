import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function StatCard({ title, value, icon, color = '#6366f1', subtitle }) {
    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    '& .stat-card-icon': {
                        transform: 'scale(1.15) rotate(6deg)',
                    },
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: color,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                },
                '&:hover::before': {
                    opacity: 1,
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    background: color,
                    opacity: 0.6,
                    transition: 'width 0.3s ease, opacity 0.3s ease',
                },
                '&:hover::after': {
                    width: 6,
                    opacity: 1,
                },
            }}
        >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3, '&:last-child': { pb: 3 } }}>
                <Box
                    className="stat-card-icon"
                    sx={{
                        width: 58,
                        height: 58,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 26,
                        flexShrink: 0,
                        background: `${color}15`,
                        color: color,
                        transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                >
                    {icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1, zIndex: 1 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            lineHeight: 1.2,
                            letterSpacing: '-0.04em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: { xs: '1.25rem', md: '1.625rem' },
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            display: 'block',
                            color: 'text.secondary',
                            mt: 0.25,
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.disabled',
                                fontWeight: 500,
                                display: 'block',
                                mt: 0.25,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

export default StatCard