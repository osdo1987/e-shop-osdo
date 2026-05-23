import './StatCard.css'

function StatCard({ title, value, icon, color = 'var(--primary-color)', subtitle }) {
    return (
        <div className="stat-card" style={{ '--card-color': color }}>
            <div className="stat-card-icon" style={{ background: color + '15', color: color }}>
                {icon}
            </div>
            <div className="stat-card-info">
                <span className="stat-card-value">{value}</span>
                <span className="stat-card-title">{title}</span>
                {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
            </div>
        </div>
    )
}

export default StatCard