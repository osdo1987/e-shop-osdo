import { createTheme } from '@mui/material/styles'

// ── Premium shadow tokens ──────────────────────────────────────
const shadowColor = '99, 102, 241' // indigo

const premiumShadows = [
    'none',
    '0 1px 2px 0 rgba(0,0,0,0.05)',
    '0 1px 4px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.05)',
    `0 4px 12px -2px rgba(${shadowColor}, 0.08), 0 2px 4px -2px rgba(0,0,0,0.06)`,
    `0 6px 20px -4px rgba(${shadowColor}, 0.12), 0 2px 6px -2px rgba(0,0,0,0.07)`,
    `0 8px 28px -4px rgba(${shadowColor}, 0.14), 0 4px 8px -2px rgba(0,0,0,0.08)`,
    `0 12px 36px -6px rgba(${shadowColor}, 0.16), 0 4px 10px -2px rgba(0,0,0,0.09)`,
    `0 14px 44px -6px rgba(${shadowColor}, 0.18), 0 6px 12px -4px rgba(0,0,0,0.10)`,
    `0 16px 52px -8px rgba(${shadowColor}, 0.20), 0 6px 14px -4px rgba(0,0,0,0.11)`,
    `0 20px 60px -8px rgba(${shadowColor}, 0.22), 0 8px 16px -4px rgba(0,0,0,0.12)`,
    `0 24px 68px -10px rgba(${shadowColor}, 0.24), 0 8px 18px -6px rgba(0,0,0,0.13)`,
    `0 28px 76px -10px rgba(${shadowColor}, 0.26), 0 10px 20px -6px rgba(0,0,0,0.14)`,
    `0 32px 84px -12px rgba(${shadowColor}, 0.28), 0 10px 22px -6px rgba(0,0,0,0.15)`,
    `0 36px 92px -12px rgba(${shadowColor}, 0.30), 0 12px 24px -8px rgba(0,0,0,0.16)`,
    `0 40px 100px -14px rgba(${shadowColor}, 0.32), 0 12px 26px -8px rgba(0,0,0,0.17)`,
    `0 44px 108px -14px rgba(${shadowColor}, 0.34), 0 14px 28px -8px rgba(0,0,0,0.18)`,
    `0 48px 116px -16px rgba(${shadowColor}, 0.36), 0 14px 30px -10px rgba(0,0,0,0.19)`,
    `0 52px 124px -16px rgba(${shadowColor}, 0.38), 0 16px 32px -10px rgba(0,0,0,0.20)`,
    `0 56px 132px -18px rgba(${shadowColor}, 0.40), 0 16px 34px -10px rgba(0,0,0,0.21)`,
    `0 60px 140px -18px rgba(${shadowColor}, 0.42), 0 18px 36px -12px rgba(0,0,0,0.22)`,
    `0 64px 148px -20px rgba(${shadowColor}, 0.44), 0 18px 38px -12px rgba(0,0,0,0.23)`,
    `0 68px 156px -20px rgba(${shadowColor}, 0.46), 0 20px 40px -12px rgba(0,0,0,0.24)`,
    `0 72px 164px -22px rgba(${shadowColor}, 0.48), 0 20px 42px -14px rgba(0,0,0,0.25)`,
    `0 76px 172px -22px rgba(${shadowColor}, 0.50), 0 22px 44px -14px rgba(0,0,0,0.26)`,
    `0 80px 180px -24px rgba(${shadowColor}, 0.52), 0 22px 46px -14px rgba(0,0,0,0.27)`,
]

const commonTheme = {
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: '"DM Serif Display", "Georgia", serif', fontWeight: 400, letterSpacing: '-0.02em' },
        h2: { fontFamily: '"DM Serif Display", "Georgia", serif', fontWeight: 400, letterSpacing: '-0.02em' },
        h3: { fontFamily: '"DM Serif Display", "Georgia", serif', fontWeight: 400, letterSpacing: '-0.015em' },
        h4: { fontFamily: '"DM Serif Display", "Georgia", serif', fontWeight: 400, letterSpacing: '-0.01em' },
        h5: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
        h6: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
        subtitle1: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600 },
        subtitle2: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600 },
        body1: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', lineHeight: 1.65 },
        body2: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', lineHeight: 1.6 },
        button: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
        caption: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' },
        overline: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes orb-float-1 {
                    0%, 100% { transform: translate(0%, 0%) scale(1); }
                    33% { transform: translate(4%, -6%) scale(1.06); }
                    66% { transform: translate(-3%, 4%) scale(0.96); }
                }
                @keyframes orb-float-2 {
                    0%, 100% { transform: translate(0%, 0%) scale(1); }
                    33% { transform: translate(-5%, 6%) scale(1.08); }
                    66% { transform: translate(4%, -5%) scale(0.95); }
                }
                @keyframes count-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradient-rotate {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes mesh-shift {
                    0% { background-position: 0% 0%; }
                    25% { background-position: 100% 0%; }
                    50% { background-position: 100% 100%; }
                    75% { background-position: 0% 100%; }
                    100% { background-position: 0% 0%; }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(180deg); }
                }
                @keyframes border-dance {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes hero-glow {
                    0%, 100% { text-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 60px rgba(139, 92, 246, 0.15); }
                    50% { text-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 80px rgba(139, 92, 246, 0.25); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes toast-enter {
                    from { opacity: 0; transform: translateX(40px) scale(0.95); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes toast-exit {
                    from { opacity: 1; transform: translateX(0) scale(1); }
                    to { opacity: 0; transform: translateX(40px) scale(0.9); }
                }
                @keyframes card-glow-pulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.08); }
                    50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.15); }
                }
                @keyframes progress-fill {
                    from { width: 0%; }
                }
                @keyframes icon-bounce {
                    0% { transform: scale(1); }
                    30% { transform: scale(1.25); }
                    50% { transform: scale(0.95); }
                    70% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `,
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '0.625rem 1.375rem',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 80%, #c4b5fd 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                        backgroundPosition: 'right center',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.55), 0 0 0 1px rgba(99, 102, 241, 0.3)',
                        transform: 'translateY(-3px) scale(1.02)',
                    },
                    '&:active': {
                        transform: 'scale(0.97) translateY(0)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                    },
                },
                containedSecondary: {
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                    '&:hover': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 8px 28px rgba(245, 158, 11, 0.45)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(99, 102, 241, 0.25)',
                    color: '#4f46e5',
                    borderWidth: '1.5px',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                        borderWidth: '2px',
                        borderColor: '#6366f1',
                        background: 'rgba(99, 102, 241, 0.06)',
                        color: '#4f46e5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)',
                    },
                },
                text: {
                    '&:hover': {
                        background: 'rgba(99, 102, 241, 0.08)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(99, 102, 241, 0.12)',
                    boxShadow: '0 2px 8px 0 rgba(99, 102, 241, 0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 12px 40px -8px rgba(99, 102, 241, 0.2), 0 4px 12px -4px rgba(0,0,0,0.08)',
                        borderColor: 'rgba(99, 102, 241, 0.25)',
                        transform: 'translateY(-4px)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                        '& fieldset': {
                            borderColor: '#e0e0f0',
                            borderWidth: '1.5px',
                            transition: 'border-color 0.25s ease',
                        },
                        '&:hover fieldset': {
                            borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused': {
                            boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.12), 0 0 12px rgba(99, 102, 241, 0.08)',
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
                    borderRadius: 10,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                sizeSmall: {
                    fontSize: '0.6875rem',
                    borderRadius: 8,
                    height: 24,
                },
                sizeMedium: {
                    fontSize: '0.75rem',
                    borderRadius: 10,
                    height: 28,
                },
                sizeLarge: {
                    fontSize: '0.8125rem',
                    borderRadius: 12,
                    height: 34,
                },
                filledSuccess: {
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                },
                filledError: {
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                },
                filledWarning: {
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                },
                filledInfo: {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        color: '#9090b0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderBottom: '2px solid rgba(99, 102, 241, 0.10)',
                        background: 'rgba(99, 102, 241, 0.02)',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background 0.15s ease',
                    '&:hover': {
                        background: 'rgba(99, 102, 241, 0.04) !important',
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
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(99, 102, 241, 0.07)',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: 'none',
                    boxShadow: '4px 0 24px rgba(99, 102, 241, 0.08)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 16px rgba(99, 102, 241, 0.06)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    transition: 'box-shadow 0.3s ease, background 0.3s ease',
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
                        borderRadius: 8,
                        transition: 'all 0.15s ease',
                        '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                        },
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 500,
                    border: '1px solid',
                },
                filledSuccess: { borderColor: 'rgba(16, 185, 129, 0.3)' },
                filledError: { borderColor: 'rgba(239, 68, 68, 0.3)' },
                filledWarning: { borderColor: 'rgba(245, 158, 11, 0.3)' },
                filledInfo: { borderColor: 'rgba(99, 102, 241, 0.3)' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation3: {
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(15, 15, 35, 0.88)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 24px 72px rgba(99, 102, 241, 0.18), 0 8px 24px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.14), 0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.10)',
                    backdropFilter: 'blur(16px)',
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
            default: '#f6f6fe',
            paper: '#ffffff',
        },
        text: {
            primary: '#0f0f23',
            secondary: '#4a4a6a',
        },
        divider: 'rgba(99, 102, 241, 0.10)',
    },
    shadows: premiumShadows,
    ...commonTheme,
})

const darkShadowColor = '129, 140, 248'
const darkPremiumShadows = premiumShadows.map(s =>
    s === 'none' ? 'none' : s
        .replace(/rgba\(99, 102, 241,/g, `rgba(${darkShadowColor},`)
        .replace(/rgba\(0,0,0,/g, 'rgba(0,0,0,')
)

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
            default: '#07071a',
            paper: '#0e0e24',
        },
        text: {
            primary: '#eeeeff',
            secondary: '#a0a0c8',
        },
        divider: 'rgba(129, 140, 248, 0.12)',
    },
    shadows: darkPremiumShadows,
    components: {
        ...commonTheme.components,
        MuiCssBaseline: {
            styleOverrides: `
                ${commonTheme.components.MuiCssBaseline.styleOverrides}
                ::-webkit-scrollbar-thumb {
                    background: rgba(129, 140, 248, 0.25);
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(129, 140, 248, 0.5);
                }
                ::selection {
                    background: rgba(129, 140, 248, 0.25);
                }
            `,
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid rgba(129, 140, 248, 0.12)',
                    boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(129, 140, 248, 0.05)',
                    backdropFilter: 'blur(8px) saturate(150%)',
                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(129, 140, 248, 0.10)',
                        borderColor: 'rgba(129, 140, 248, 0.22)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                ...commonTheme.components.MuiButton.styleOverrides,
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
                    backgroundSize: '200% auto',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
                    '&:hover': {
                        backgroundPosition: 'right center',
                        boxShadow: '0 8px 28px rgba(99, 102, 241, 0.55)',
                        transform: 'translateY(-2px)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(129, 140, 248, 0.25)',
                    color: '#a0a0c8',
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                        borderColor: '#818cf8',
                        background: 'rgba(129, 140, 248, 0.08)',
                        color: '#818cf8',
                        transform: 'translateY(-1px)',
                    },
                },
                text: {
                    '&:hover': {
                        background: 'rgba(129, 140, 248, 0.08)',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background 0.15s ease',
                    '&:hover': {
                        background: 'rgba(129, 140, 248, 0.06) !important',
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        color: '#6060a0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderBottom: '2px solid rgba(129, 140, 248, 0.12)',
                        background: 'rgba(129, 140, 248, 0.03)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(129, 140, 248, 0.08)',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                        '& fieldset': {
                            borderColor: 'rgba(129, 140, 248, 0.2)',
                            borderWidth: '1.5px',
                            transition: 'border-color 0.25s ease',
                        },
                        '&:hover fieldset': {
                            borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#818cf8',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused': {
                            boxShadow: '0 0 0 4px rgba(129, 140, 248, 0.15), 0 0 16px rgba(129, 140, 248, 0.10)',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#a0a0c8',
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(129, 140, 248, 0.15)',
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(14, 14, 36, 0.95)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    background: '#0e0e24',
                    border: '1px solid rgba(129, 140, 248, 0.15)',
                    boxShadow: '0 24px 72px rgba(0, 0, 0, 0.6)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation3: {
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(129, 140, 248, 0.15)',
                },
            },
        },
    },
    ...commonTheme,
    typography: commonTheme.typography,
    shape: commonTheme.shape,
})