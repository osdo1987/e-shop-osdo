import { useState, useEffect, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

function useCountUp(target, duration = 1000) {
    const [count, setCount] = useState(0)
    const frameRef = useRef(null)

    useEffect(() => {
        const num = Number(target)
        if (!num || isNaN(num)) {
            setCount(0)
            return
        }
        const start = performance.now()
        const tick = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setCount(Math.round(num * eased))
            if (progress < 1) frameRef.current = requestAnimationFrame(tick)
        }
        frameRef.current = requestAnimationFrame(tick)
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
    }, [target, duration])

    return count
}

function StatCard({ title, value, icon, color = '#004ac6', subtitle, progress }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const numericValue = typeof value === 'number' || (typeof value === 'string' && /^\d+/.test(value))
    const displayCount = useCountUp(numericValue ? parseInt(String(value).replace(/\D/g, ''), 10) : 0)
    const suffix = typeof value === 'string' ? value.replace(/^[\d,.\s]+/, '') : ''

    return (
        <Card
            sx={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                minHeight: 120,
                ...(isDark && {
                    backdropFilter: 'blur(12px)',
                    background: 'rgba(15, 17, 20, 0.6)',
                    border: '1px solid rgba(180, 197, 255, 0.12)',
                }),
                /* Gradient glow behind card */
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: `radial-gradient(ellipse at 20% 50%, ${color}12 0%, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                },
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: isDark
                        ? `0 20px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px ${color}25, 0 0 40px ${color}12`
                        : `0 20px 50px -10px rgba(0,0,0,0.12), 0 0 0 1px ${color}20, 0 0 30px ${color}08`,
                    borderColor: `${color}30`,
                    '&::before': { opacity: 1 },
                    '& .stat-icon': {
                        transform: 'scale(1.2) rotate(-8deg)',
                        boxShadow: `0 8px 28px ${color}40`,
                    },
                },
            }}
        >
            {/* Top accent gradient line */}
            <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${color}, ${color}88, ${color}44)`,
                opacity: 0.8,
            }} />

            {/* Left color accent bar */}
            <Box sx={{
                position: 'absolute', top: 0, left: 0,
                width: 5, height: '100%',
                background: `linear-gradient(180deg, ${color}, ${color}66)`,
                borderRadius: '3px 0 0 3px',
                transition: 'width 0.3s ease',
            }} />

            <CardContent sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: '20px !important',
                '&:last-child': { pb: '20px !important' },
            }}>
                {/* Icon with gradient background */}
                <Box
                    className="stat-icon"
                    sx={{
                        width: 52, height: 52,
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, flexShrink: 0,
                        background: `linear-gradient(135deg, ${color}20, ${color}35)`,
                        color: color,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        boxShadow: `0 4px 16px ${color}18`,
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1, zIndex: 1 }}>
                    <Typography sx={{
                        fontWeight: 900, lineHeight: 1.1,
                        letterSpacing: '-0.04em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontSize: { xs: '1.35rem', md: '1.5rem' },
                        animation: 'count-up 0.5s ease both',
                    }}>
                        {numericValue ? displayCount.toLocaleString() + suffix : value}
                    </Typography>
                    <Typography sx={{
                        fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', fontSize: '0.6875rem',
                        display: 'block', color: 'text.secondary',
                        mt: 0.5,
                    }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{
                            fontSize: '0.65rem', color: 'text.disabled',
                            display: 'block', mt: 0.25,
                        }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </CardContent>

            {/* Animated progress bar */}
            {progress != null && (
                <Box sx={{ px: 2.5, pb: 2 }}>
                    <Box sx={{
                        height: 4, borderRadius: 99,
                        background: isDark ? 'rgba(180,197,255,0.08)' : 'rgba(0,74,198,0.06)',
                        overflow: 'hidden',
                    }}>
                        <Box sx={{
                            height: '100%', borderRadius: 99,
                            width: `${Math.min(progress, 100)}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}cc, ${color}88)`,
                            animation: 'progress-fill 1.2s cubic-bezier(0.4, 0, 0.2, 1) both',
                            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 0 8px ${color}40`,
                        }} />
                    </Box>
                </Box>
            )}
        </Card>
    )
}

export default StatCard
