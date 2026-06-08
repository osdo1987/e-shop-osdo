import { createTheme } from '@mui/material/styles'

const commonTheme = {
    typography: {
        fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.03em' },
        h2: { fontWeight: 700, letterSpacing: '-0.03em' },
        h3: { fontWeight: 700, letterSpacing: '-0.03em' },
        h4: { fontWeight: 700, letterSpacing: '-0.03em' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '0.625rem 1.375rem',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'scale(0.97)',
                    },
                },
                containedSecondary: {
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                outlined: {
                    borderColor: '#e0e0f0',
                    color: '#0f0f23',
                    '&:hover': {
                        borderColor: '#6366f1',
                        background: '#eef2ff',
                        color: '#4f46e5',
                    },
                },
                text: {
                    '&:hover': {
                        background: '#eef2ff',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid #e0e0f0',
                    boxShadow: '0 1px 3px 0 rgba(99, 102, 241, 0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 4px 16px -2px rgba(99, 102, 241, 0.10), 0 2px 6px -2px rgba(0,0,0,0.06)',
                        borderColor: 'rgba(99, 102, 241, 0.12)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#e0e0f0',
                            borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                            borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '1.5px',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#4a4a6a',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#9090b0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        borderBottom: '2px solid #e0e0f0',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        background: '#eef2ff',
                    },
                    '&:last-child td': {
                        borderBottom: 0,
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '11px 14px',
                    borderBottom: '1px solid #ededf8',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 12px rgba(99, 102, 241, 0.06)',
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        color: '#6366f1',
                    },
                    '&.Mui-checked + .MuiSwitch-track': {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        opacity: 1,
                    },
                },
                track: {
                    borderRadius: 12,
                },
            },
        },
        MuiPagination: {
            styleOverrides: {
                root: {
                    '& .MuiPaginationItem-root': {
                        fontWeight: 600,
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
}

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6366f1',
            dark: '#4f46e5',
            light: '#eef2ff',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f59e0b',
            dark: '#d97706',
            light: '#fef3c7',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ef4444',
        },
        success: {
            main: '#10b981',
        },
        warning: {
            main: '#f59e0b',
        },
        background: {
            default: '#f5f5ff',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f0f23',
            secondary: '#4a4a6a',
        },
        divider: '#e0e0f0',
    },
    ...commonTheme,
})

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#818cf8',
            dark: '#6366f1',
            light: '#1e1b4b',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#fbbf24',
            dark: '#f59e0b',
            light: '#451a03',
            contrastText: '#ffffff',
        },
        error: {
            main: '#f87171',
        },
        success: {
            main: '#34d399',
        },
        warning: {
            main: '#fbbf24',
        },
        background: {
            default: '#080818',
            paper: '#0f0f28',
        },
        text: {
            primary: '#eeeeff',
            secondary: '#a0a0c8',
        },
        divider: '#252550',
    },
    components: {
        ...commonTheme.components,
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid #252550',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
                    transition: 'box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(129,140,248,0.06)',
                        borderColor: 'rgba(129, 140, 248, 0.15)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                ...commonTheme.components.MuiButton.styleOverrides,
                outlined: {
                    borderColor: '#252550',
                    color: '#a0a0c8',
                    '&:hover': {
                        borderColor: '#818cf8',
                        background: '#1e1b4b',
                        color: '#818cf8',
                    },
                },
                text: {
                    '&:hover': {
                        background: '#1e1b4b',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        background: '#16163a',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#252550',
                            borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                            borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#818cf8',
                            borderWidth: '1.5px',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#a0a0c8',
                    },
                },
            },
        },
    },
})