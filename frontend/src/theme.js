import { createTheme } from '@mui/material/styles'

const commonTheme = {
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600, letterSpacing: '-0.015em' },
        h4: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
        h5: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600, letterSpacing: '-0.02em' },
        h6: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
        subtitle1: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600 },
        subtitle2: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600 },
        body1: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', lineHeight: 1.5 },
        body2: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', lineHeight: 1.43 },
        button: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
        caption: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' },
        overline: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', letterSpacing: '0.05em' },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes toast-enter {
                    from { opacity: 0; transform: translateX(40px) scale(0.95); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes toast-exit {
                    from { opacity: 1; transform: translateX(0) scale(1); }
                    to { opacity: 0; transform: translateX(40px) scale(0.9); }
                }
            `,
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#004ac6',
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: '#003ea8',
                    },
                },
                containedSecondary: {
                    backgroundColor: '#ffffff',
                    color: '#434655',
                    border: '1px solid #c3c6d7',
                    '&:hover': {
                        backgroundColor: '#f2f4f6',
                    },
                },
                outlined: {
                    borderColor: '#c3c6d7',
                    color: '#434655',
                    borderWidth: '1px',
                    '&:hover': {
                        borderWidth: '1px',
                        borderColor: '#004ac6',
                        backgroundColor: 'rgba(0, 74, 198, 0.04)',
                        color: '#004ac6',
                    },
                },
                text: {
                    color: '#434655',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 74, 198, 0.04)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: '1px solid #c3c6d7',
                    borderRadius: 16,
                    padding: 24,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        '& fieldset': {
                            borderColor: '#cbd5e1',
                            borderWidth: '1px',
                            transition: 'border-color 0.2s ease',
                        },
                        '&:hover fieldset': {
                            borderColor: '#737686',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#004ac6',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused': {
                            boxShadow: '0 0 0 3px rgba(0, 74, 198, 0.15)',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#434655',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                    height: 28,
                },
                sizeSmall: {
                    fontSize: '0.6875rem',
                    borderRadius: 2,
                    height: 24,
                },
                filledSuccess: {
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                },
                filledError: {
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                },
                filledWarning: {
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                },
                filledInfo: {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: '#434655',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: '#f8fafc',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: '#f1f5f9 !important',
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
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.875rem',
                    color: '#191c1e',
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
                    boxShadow: 'none',
                    borderBottom: '1px solid #c3c6d7',
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        color: '#004ac6',
                    },
                    '&.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#004ac6',
                        opacity: 1,
                    },
                },
                track: {
                    borderRadius: 12,
                    backgroundColor: '#c3c6d7',
                },
            },
        },
        MuiPagination: {
            styleOverrides: {
                root: {
                    '& .MuiPaginationItem-root': {
                        fontWeight: 600,
                        borderRadius: 8,
                        '&.Mui-selected': {
                            backgroundColor: '#004ac6',
                            color: '#ffffff',
                        },
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
                filledSuccess: { backgroundColor: '#d1fae5', color: '#065f46' },
                filledError: { backgroundColor: '#fee2e2', color: '#991b1b' },
                filledWarning: { backgroundColor: '#fef3c7', color: '#92400e' },
                filledInfo: { backgroundColor: '#dbeafe', color: '#1e40af' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    borderRadius: 4,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    backgroundColor: '#2d3133',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #c3c6d7',
                },
            },
        },
    },
}

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#004ac6',
            dark: '#003ea8',
            light: '#dbe1ff',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#505f76',
            dark: '#38485d',
            light: '#d3e4fe',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ba1a1a',
        },
        success: {
            main: '#059669',
        },
        warning: {
            main: '#f59e0b',
        },
        background: {
            default: '#f7f9fb',
            paper: '#ffffff',
        },
        text: {
            primary: '#191c1e',
            secondary: '#434655',
        },
        divider: '#c3c6d7',
        // ── MD3 Surface Tiers ──
        surface: '#f7f9fb',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'surface-variant': '#e0e3e5',
        'surface-tint': '#0053db',
        // ── MD3 On Colors ──
        'on-surface': '#191c1e',
        'on-surface-variant': '#434655',
        'on-background': '#191c1e',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-error': '#ffffff',
        'on-primary-container': '#eeefff',
        'on-secondary-container': '#54647a',
        // ── MD3 Containers ──
        'primary-container': '#2563eb',
        'secondary-container': '#d0e1fb',
        'tertiary': '#943700',
        'tertiary-container': '#bc4800',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffede6',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        // ── MD3 Inverse ──
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        'inverse-primary': '#b4c5ff',
        // ── MD3 Outline ──
        outline: '#737686',
        'outline-variant': '#c3c6d7',
        // ── MD3 Fixed ──
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary-fixed': '#00174b',
        'on-primary-fixed-variant': '#003ea8',
        'secondary-fixed': '#d3e4fe',
        'secondary-fixed-dim': '#b7c8e1',
        'on-secondary-fixed': '#0b1c30',
        'on-secondary-fixed-variant': '#38485d',
        'tertiary-fixed': '#ffdbcd',
        'tertiary-fixed-dim': '#ffb596',
        'on-tertiary-fixed': '#360f00',
        'on-tertiary-fixed-variant': '#7d2d00',
    },
    ...commonTheme,
})

const darkOverrides = {
    MuiCssBaseline: {
        styleOverrides: `
            ${commonTheme.components.MuiCssBaseline.styleOverrides}
            ::-webkit-scrollbar-thumb {
                background: rgba(180, 197, 255, 0.25);
            }
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(180, 197, 255, 0.4);
            }
            ::selection {
                background: rgba(180, 197, 255, 0.25);
            }
        `,
    },
    MuiButton: {
        styleOverrides: {
            ...commonTheme.components.MuiButton.styleOverrides,
            containedPrimary: {
                backgroundColor: '#b4c5ff',
                color: '#00174b',
                '&:hover': {
                    backgroundColor: '#93b3ff',
                },
            },
            containedSecondary: {
                backgroundColor: '#2d3133',
                color: '#e0e3e5',
                border: '1px solid rgba(180, 197, 255, 0.12)',
                '&:hover': {
                    backgroundColor: '#35383b',
                },
            },
            outlined: {
                borderColor: 'rgba(180, 197, 255, 0.3)',
                color: '#b4c5ff',
                '&:hover': {
                    borderColor: '#b4c5ff',
                    backgroundColor: 'rgba(180, 197, 255, 0.08)',
                    color: '#b4c5ff',
                },
            },
            text: {
                color: '#c3c6d7',
                '&:hover': {
                    backgroundColor: 'rgba(180, 197, 255, 0.08)',
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                border: '1px solid rgba(180, 197, 255, 0.12)',
                borderRadius: 16,
                padding: 24,
                backgroundColor: '#2d3133',
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    backgroundColor: '#2d3133',
                    '& fieldset': {
                        borderColor: 'rgba(180, 197, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                        borderColor: 'rgba(180, 197, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#b4c5ff',
                    },
                    '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(180, 197, 255, 0.15)',
                    },
                },
                '& .MuiInputLabel-root': {
                    color: '#c3c6d7',
                },
            },
        },
    },
    MuiTableHead: {
        styleOverrides: {
            root: {
                '& .MuiTableCell-head': {
                    color: '#c3c6d7',
                    borderBottom: '1px solid rgba(180, 197, 255, 0.08)',
                    backgroundColor: 'rgba(180, 197, 255, 0.04)',
                },
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgba(180, 197, 255, 0.04) !important',
                },
            },
        },
    },
    MuiTableCell: {
        styleOverrides: {
            root: {
                borderBottom: '1px solid rgba(180, 197, 255, 0.08)',
                color: '#e0e3e5',
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                borderBottom: '1px solid rgba(180, 197, 255, 0.12)',
                backgroundColor: '#191c1e',
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundColor: '#2d3133',
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                backgroundColor: '#2d3133',
                border: '1px solid rgba(180, 197, 255, 0.12)',
            },
        },
    },
    MuiMenu: {
        styleOverrides: {
            paper: {
                backgroundColor: '#2d3133',
                border: '1px solid rgba(180, 197, 255, 0.12)',
            },
        },
    },
}

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#b4c5ff',
            dark: '#93b3ff',
            light: '#00174b',
            contrastText: '#00174b',
        },
        secondary: {
            main: '#b7c8e1',
            dark: '#a1b6d1',
            light: '#253247',
            contrastText: '#253247',
        },
        error: {
            main: '#ffb4ab',
        },
        success: {
            main: '#34d399',
        },
        warning: {
            main: '#fbbf24',
        },
        background: {
            default: '#191c1e',
            paper: '#2d3133',
        },
        text: {
            primary: '#e0e3e5',
            secondary: '#c3c6d7',
        },
        divider: 'rgba(180, 197, 255, 0.12)',
        // ── MD3 Dark Surface Tiers ──
        surface: '#191c1e',
        'surface-dim': '#191c1e',
        'surface-bright': '#3a3d41',
        'surface-container-lowest': '#0f1114',
        'surface-container-low': '#1b1e21',
        'surface-container': '#1f2225',
        'surface-container-high': '#2a2d30',
        'surface-container-highest': '#35383b',
        'surface-variant': '#434655',
        'surface-tint': '#b4c5ff',
        // ── MD3 Dark On Colors ──
        'on-surface': '#e0e3e5',
        'on-surface-variant': '#c3c6d7',
        'on-background': '#e0e3e5',
        'on-primary': '#00174b',
        'on-secondary': '#253247',
        'on-error': '#690005',
        'on-primary-container': '#dbe1ff',
        'on-secondary-container': '#d3e4fe',
        // ── MD3 Dark Containers ──
        'primary-container': '#1a4fc9',
        'secondary-container': '#3e5475',
        'tertiary': '#ffb596',
        'tertiary-container': '#7d2d00',
        'on-tertiary': '#4a1500',
        'on-tertiary-container': '#ffdbcd',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        // ── MD3 Dark Inverse ──
        'inverse-surface': '#e0e3e5',
        'inverse-on-surface': '#191c1e',
        'inverse-primary': '#004ac6',
        // ── MD3 Dark Outline ──
        outline: '#8d909f',
        'outline-variant': '#434655',
        // ── MD3 Dark Fixed ──
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary-fixed': '#00174b',
        'on-primary-fixed-variant': '#003ea8',
        'secondary-fixed': '#d3e4fe',
        'secondary-fixed-dim': '#b7c8e1',
        'on-secondary-fixed': '#0b1c30',
        'on-secondary-fixed-variant': '#38485d',
        'tertiary-fixed': '#ffdbcd',
        'tertiary-fixed-dim': '#ffb596',
        'on-tertiary-fixed': '#360f00',
        'on-tertiary-fixed-variant': '#7d2d00',
    },
    components: darkOverrides,
    ...commonTheme,
})
