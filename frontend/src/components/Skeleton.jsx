import SkeletonMui from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

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
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, pt: 1 }}>
            {Array.from({ length: rows }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: 2,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {Array.from({ length: cols }).map((_, j) => (
                        <SkeletonMui key={j} variant="rectangular" height="16px" sx={{ borderRadius: 1 }} />
                    ))}
                </Box>
            ))}
        </Box>
    )
}

export function GridSkeleton({ count = 8 }) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 2.75,
        }}>
            {Array.from({ length: count }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 2,
                        bgcolor: 'background.paper',
                    }}
                >
                    <SkeletonMui variant="rectangular" height="180px" sx={{ borderRadius: 1 }} />
                    <SkeletonMui variant="text" width="60%" sx={{ mt: 1.5 }} />
                    <SkeletonMui variant="text" width="80%" sx={{ mt: 1 }} />
                    <SkeletonMui variant="text" width="40%" sx={{ mt: 1 }} />
                    <SkeletonMui variant="rectangular" height="40px" sx={{ mt: 1.5, borderRadius: 1 }} />
                </Box>
            ))}
        </Box>
    )
}

export default Skeleton