import './Pagination.css'

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages = []
        const delta = 2
        const start = Math.max(1, currentPage - delta)
        const end = Math.min(totalPages, currentPage + delta)

        if (start > 1) {
            pages.push(1)
            if (start > 2) pages.push('...')
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Página anterior"
            >
                ← Anterior
            </button>
            <div className="pagination-pages">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>
            <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Página siguiente"
            >
                Siguiente →
            </button>
        </div>
    )
}

export default Pagination