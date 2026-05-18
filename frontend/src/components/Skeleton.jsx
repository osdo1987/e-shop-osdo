import './Skeleton.css'

function Skeleton({ width, height, borderRadius = '6px', style }) {
    return (
        <div
            className="skeleton"
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius,
                ...style
            }}
        />
    )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (
        <div className="skeleton-table">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton-row">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton key={j} height="16px" />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function GridSkeleton({ count = 8 }) {
    return (
        <div className="product-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-card">
                    <Skeleton height="180px" borderRadius="4px" />
                    <Skeleton height="12px" width="60%" style={{ marginTop: '12px' }} />
                    <Skeleton height="16px" width="80%" style={{ marginTop: '8px' }} />
                    <Skeleton height="18px" width="40%" style={{ marginTop: '8px' }} />
                    <Skeleton height="40px" style={{ marginTop: '12px' }} borderRadius="6px" />
                </div>
            ))}
        </div>
    )
}

export default Skeleton