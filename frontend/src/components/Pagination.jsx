import MuiPagination from '@mui/material/Pagination'

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    return (
        <MuiPagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={2}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3.5,
                '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                },
            }}
        />
    )
}

export default Pagination