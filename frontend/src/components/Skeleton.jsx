import SkeletonMui from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

function Skeleton({ width, height, borderRadius = '6px', style }) {
    return (
        <SkeletonMui
            variant="rectangular"
            width={width || '100%'}
            height={height || '20px'}
            sx={{
                borderRadius,
                ...style,
            }}
        />
    )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column', gap: 0, pt: 1,
            borderRadius: '14px', overflow: 'hidden',
            border: isDark ? '1px solid rgba(129,140,248,0.08)' : '1px solid rgba(99,102,241,0.06)',
        }}>
            {/* Header row */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 2, py: 1.5, px: 2,
                background: isDark ? 'rgba(129,140,248,0.04)' : 'rgba(99,102,241,0.03)',
                borderBottom: isDark ? '1px solid rgba(129,140,248,0.08)' : '1px solid rgba(99,102,241,0.06)',
            }}>
                {Array.from({ length: cols }).map((_, j) => (
                    <SkeletonMui key={j} variant="text" height="12px" sx={{
                        borderRadius: 1,
                        width: `${50 + Math.random() * 30}%`,
                    }} />
                ))}
            </Box>
            {/* Data rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: 2, py: 1.5, px: 2,
                        borderBottom: i < rows - 1
                            ? isDark ? '1px solid rgba(129,140,248,0.06)' : '1px solid rgba(99,102,241,0.04)'
                            : 'none',
                        animation: `fade-in-up 0.4s ease both`,
                        animationDelay: `${i * 60}ms`,
                        '&:hover': {
                            background: isDark ? 'rgba(129,140,248,0.03)' : 'rgba(99,102,241,0.02)',
                        },
                    }}
                >
                    {Array.from({ length: cols }).map((_, j) => (
                        <SkeletonMui key={j} variant="text" height="16px" sx={{
                            borderRadius: 1,
                            width: `${40 + Math.random() * 40}%`,
                        }} />
                    ))}
                </Box>
            ))}
        </Box>
    )
}

export function GridSkeleton({ count = 8 }) {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: { xs: 2, md: 3 },
        }}>
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: isDark ? 'rgba(14, 14, 36, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: isDark ? '1px solid rgba(129,140,248,0.10)' : '1px solid rgba(99,102,241,0.08)',
                        transition: 'all 0.3s ease',
                        animation: `fade-in-up 0.4s ease both`,
                        animationDelay: `${i * 80}ms`,
                        '&:hover': {
                            borderColor: isDark ? 'rgba(129,140,248,0.18)' : 'rgba(99,102,241,0.15)',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    {/* Image skeleton */}
                    <SkeletonMui variant="rectangular" height="180px" sx={{ borderRadius: 0 }} />
                    {/* Content */}
                    <Box sx={{ p: 2 }}>
                        <SkeletonMui variant="text" width="60%" height="20px" sx={{ borderRadius: 1 }} />
                        <SkeletonMui variant="text" width="80%" height="16px" sx={{ mt: 0.75, borderRadius: 1 }} />
                        <SkeletonMui variant="text" width="40%" height="16px" sx={{ mt: 0.75, borderRadius: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                            <SkeletonMui variant="rectangular" height="36px" sx={{ flex: 1, borderRadius: '10px' }} />
                            <SkeletonMui variant="rectangular" height="36px" sx={{ width: 80, borderRadius: '10px' }} />
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    )
}

export default Skeleton
