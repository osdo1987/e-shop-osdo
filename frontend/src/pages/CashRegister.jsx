import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useToast } from '../components/Toast'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { fetchPaymentMethods, getIconByName } from '../paymentMethodIcons'

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import HistoryIcon from '@mui/icons-material/History'

import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const tabAccent = {
    position: 'relative',
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.01em',
    transition: 'all 0.25s ease',
}

const sectionBox = (isDark) => ({
    background: isDark ? 'rgba(0,74,198,0.04)' : 'rgba(0,74,198,0.03)',
    border: isDark ? '1px solid rgba(180,197,255,0.10)' : '1px solid rgba(0,74,198,0.08)',
    borderRadius: '14px',
})

const accentCard = (isDark) => ({
    position: 'relative',
    overflow: 'visible',
    borderRadius: '16px',
    animation: 'fade-in-up 0.5s ease both',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #004ac6, #2563eb, #5092f7)',
        borderRadius: '16px 16px 0 0',
    },
})

const paymentCardAccent = (isDark) => ({
    position: 'relative',
    overflow: 'visible',
    borderRadius: '14px',
    background: isDark ? 'rgba(14,14,36,0.6)' : '#ffffff',
    border: isDark ? '1px solid rgba(180,197,255,0.10)' : '1px solid rgba(0,74,198,0.10)',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        borderRadius: '14px 14px 0 0',
    },
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: isDark
            ? '0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(180,197,255,0.10)'
            : '0 8px 28px rgba(0,74,198,0.12), 0 0 0 1px rgba(0,74,198,0.05)',
    },
})

function CashRegister({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState(0)
    const [activeSession, setActiveSession] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState([])

    const [openingBalance, setOpeningBalance] = useState('')
    const [openingNotes, setOpeningNotes] = useState('')

    const [showCloseModal, setShowCloseModal] = useState(false)
    const [closingBalanceReal, setClosingBalanceReal] = useState('')
    const [closingNotes, setClosingNotes] = useState('')

    const toast = useToast()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50)
        return () => clearTimeout(t)
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')
            const headers = { 'Authorization': `Bearer ${token}` }

            const [sessionRes, historyRes] = await Promise.all([
                fetch('/api/cash-register/session/active', { headers }),
                fetch('/api/cash-register/sessions', { headers })
            ])

            if (sessionRes.ok) {
                const sessionData = await sessionRes.json()
                setActiveSession(sessionData.session)
            }
            if (historyRes.ok) {
                const historyData = await historyRes.json()
                setHistory(historyData)
            }
        } catch (error) {
            toast.error('Error al cargar datos de caja.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPaymentMethods().then(setPaymentMethods).catch(() => {})
    }, [])

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenSession = async (e) => {
        e.preventDefault()
        if (openingBalance === '') {
            toast.error('El balance de apertura es requerido.')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/cash-register/session/open', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    opening_balance: parseFloat(openingBalance),
                    notes: openingNotes
                })
            })

            if (res.ok) {
                toast.success('Sesión de caja abierta exitosamente.')
                setOpeningBalance('')
                setOpeningNotes('')
                fetchData()
            } else {
                const errData = await res.json()
                toast.error(errData.error || 'Error al abrir la caja.')
            }
        } catch (error) {
            toast.error('Error de red al abrir caja')
        } finally {
            setLoading(false)
        }
    }

    const handleCloseSession = async (e) => {
        e.preventDefault()
        if (closingBalanceReal === '') {
            toast.error('Ingresa el monto de efectivo físico en caja.')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/cash-register/session/close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    closing_balance_real: parseFloat(closingBalanceReal),
                    notes: closingNotes
                })
            })

            if (res.ok) {
                toast.success('Sesión de caja cerrada y cuadrada exitosamente.')
                setClosingBalanceReal('')
                setClosingNotes('')
                setShowCloseModal(false)
                fetchData()
            } else {
                const errData = await res.json()
                toast.error(errData.error || 'Error al cerrar la caja.')
            }
        } catch (error) {
            toast.error('Error de red al cerrar caja')
        } finally {
            setLoading(false)
        }
    }

    const expectedCashInDrawer = useMemo(() => {
        if (!activeSession) return 0
        return (activeSession.opening_balance ?? 0) + (activeSession.cash_sales ?? 0)
    }, [activeSession])

    const closingDifference = useMemo(() => {
        const real = parseFloat(closingBalanceReal) || 0
        return real - expectedCashInDrawer
    }, [closingBalanceReal, expectedCashInDrawer])

    const getDiffChip = (diff) => {
        if (diff === 0) return <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Cuadrado ($0)" color="success" size="small" sx={{ fontWeight: 700 }} />
        if (diff < 0) return <Chip label={`Faltante ($${Math.abs(diff).toLocaleString()})`} color="error" size="small" sx={{ fontWeight: 700 }} />
        return <Chip label={`Sobrante (+$${diff.toLocaleString()})`} color="primary" size="small" sx={{ fontWeight: 700 }} />
    }

    const getPaymentTotal = useCallback((code) => {
        if (!activeSession) return 0
        const breakdown = activeSession.payment_breakdown || {}
        if (breakdown[code] !== undefined) return breakdown[code]
        if (code === 'EFECTIVO') return activeSession.cash_sales || 0
        if (code === 'TARJETA') return activeSession.card_sales || 0
        if (code === 'TRANSFERENCIA') return activeSession.transfer_sales || 0
        return 0
    }, [activeSession])

    const paymentBreakdownCards = useMemo(() => {
        if (!activeSession) return []
        const breakdown = activeSession.payment_breakdown || {}
        const codesWithSales = new Set(Object.keys(breakdown))
        if (activeSession.cash_sales) codesWithSales.add('EFECTIVO')
        if (activeSession.card_sales) codesWithSales.add('TARJETA')
        if (activeSession.transfer_sales) codesWithSales.add('TRANSFERENCIA')

        return paymentMethods
            .filter(pm => codesWithSales.has(pm.code))
            .map(pm => ({
                ...pm,
                total: getPaymentTotal(pm.code),
            }))
            .filter(pm => pm.total > 0)
    }, [activeSession, paymentMethods, getPaymentTotal])

    const totalSales = activeSession
        ? (activeSession.opening_balance ?? 0) + (activeSession.cash_sales ?? 0) + (activeSession.card_sales ?? 0) + (activeSession.transfer_sales ?? 0)
        : 0

    if (user?.role === 'STAFF') return <Navigate to="/admin/pos" />

    return (
        <AdminLayout title="Control de Caja Registradora" user={user} onLogout={onLogout}>
            {/* ── Styled Tab Bar ──────────────────────────────── */}
            <Box sx={{
                mb: 3,
                ...sectionBox(isDark),
                p: 0.5,
                display: 'inline-flex',
                borderRadius: '14px',
                animation: mounted ? 'fade-in-up 0.4s ease both' : 'none',
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, nv) => setActiveTab(nv)}
                    sx={{
                        minHeight: 44,
                        '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0',
                            background: 'linear-gradient(90deg, #004ac6, #2563eb, #5092f7)',
                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                        },
                    }}
                >
                    <Tab
                        icon={<AccountBalanceWalletIcon sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Caja Activa"
                        sx={tabAccent}
                    />
                    <Tab
                        icon={<HistoryIcon sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Historial de Turnos"
                        sx={tabAccent}
                    />
                </Tabs>
            </Box>

            {/* ═══════ TAB 0 : ACTIVE SESSION ═══════ */}
            {activeTab === 0 && (
                <Box>
                    {activeSession ? (
                        <Grid container spacing={3}>
                            {/* ── Summary Card ─────────────────────── */}
                            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                                <Card sx={{
                                    ...accentCard(isDark),
                                    animationDelay: '0.05s',
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(37,99,235,0.12))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                animation: 'icon-bounce 0.6s ease both',
                                                animationDelay: '0.3s',
                                            }}>
                                                <AccountBalanceWalletIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                                    Sesión Activa Nro.
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 400, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', lineHeight: 1.1 }}>
                                                    #{activeSession.id}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{
                                            ...sectionBox(isDark),
                                            p: 2,
                                            mb: 2.5,
                                            textAlign: 'center',
                                        }}>
                                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                Total General
                                            </Typography>
                                            <Typography variant="h4" sx={{
                                                fontWeight: 400,
                                                fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                                                background: 'linear-gradient(135deg, #004ac6, #2563eb)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                lineHeight: 1.2,
                                            }}>
                                                ${totalSales.toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                                Ventas + Apertura
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Fecha de Apertura</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {new Date(activeSession.opened_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Saldo de Apertura</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    ${(activeSession.opening_balance ?? 0).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {activeSession.notes && (
                                                <Box sx={{
                                                    ...sectionBox(isDark),
                                                    p: 1.5,
                                                    mt: 0.5,
                                                }}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                                        Notas de apertura
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                                        {activeSession.notes}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        <Button
                                            variant="contained"
                                            color="error"
                                            fullWidth
                                            size="large"
                                            onClick={() => setShowCloseModal(true)}
                                            startIcon={<CheckCircleIcon />}
                                            sx={{
                                                mt: 3,
                                                py: 1.3,
                                                fontWeight: 700,
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                                    boxShadow: '0 8px 32px rgba(239,68,68,0.45)',
                                                    transform: 'translateY(-2px)',
                                                },
                                            }}
                                        >
                                            Cerrar y Cuadrar Caja
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ── Transaction Details ─────────────── */}
                            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                                <Card sx={{ ...accentCard(isDark), animationDelay: '0.1s', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 3 }}>
                                            <Box sx={{
                                                p: 1,
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(37,99,235,0.12))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <TrendingUpIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                                Desglose por Métodos de Pago
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2.5}>
                                            {paymentBreakdownCards.map((pm, idx) => {
                                                const IconComp = getIconByName(pm.icon)
                                                return (
                                                    <Grid key={pm.code} size={{ xs: 12, sm: 4 }}>
                                                        <Box sx={{
                                                            ...paymentCardAccent(isDark),
                                                            p: 2.5,
                                                            '&::before': {
                                                                ...paymentCardAccent(isDark)['&::before'],
                                                                background: `linear-gradient(90deg, ${pm.color}, ${pm.color}88)`,
                                                            },
                                                            animation: mounted ? 'fade-in-up 0.5s ease both' : 'none',
                                                            animationDelay: `${0.15 + idx * 0.05}s`,
                                                        }}>
                                                            <Box sx={{
                                                                p: 1.2,
                                                                borderRadius: '12px',
                                                                background: isDark ? `${pm.color}26` : `${pm.color}1A`,
                                                                display: 'inline-flex',
                                                                mb: 1.5,
                                                            }}>
                                                                <IconComp sx={{ fontSize: 22, color: pm.color }} />
                                                            </Box>
                                                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                {pm.name}
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                                                                ${pm.total.toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>

                                        {/* Expected cash callout */}
                                        <Box sx={{
                                            ...sectionBox(isDark),
                                            p: 2.5,
                                            mt: 3.5,
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    Efectivo Esperado en Caja
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                                                    ${expectedCashInDrawer.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.6, display: 'block' }}>
                                                Al momento del cierre de caja, deberás contar únicamente el dinero en efectivo físico disponible en la caja. El monto esperado a declarar es de <strong>${expectedCashInDrawer.toLocaleString()}</strong>. Los saldos de tarjeta y transferencia se consideran recaudados en las respectivas cuentas bancarias.
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    ) : (
                        /* ── Open Session Form ────────────────────── */
                        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2, animation: mounted ? 'fade-in-up 0.5s ease both' : 'none' }}>
                            <Card sx={{ ...accentCard(isDark) }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                        <Box sx={{
                                            p: 1.2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(37,99,235,0.12))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            animation: 'icon-bounce 0.6s ease both',
                                            animationDelay: '0.3s',
                                        }}>
                                            <PointOfSaleIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Apertura de Caja</Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                Registra el dinero inicial para iniciar transacciones locales.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <form onSubmit={handleOpenSession}>
                                        <TextField
                                            label="Monto Inicial en Efectivo (Base de Caja)"
                                            fullWidth
                                            required
                                            value={openingBalance}
                                            onChange={(e) => setOpeningBalance(e.target.value)}
                                            sx={{ mb: 2.5 }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                                }
                                            }}
                                        />

                                        <TextField
                                            label="Notas / Observaciones"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={openingNotes}
                                            onChange={(e) => setOpeningNotes(e.target.value)}
                                            placeholder="Ej: Base de caja inicial para dar vueltas..."
                                            sx={{ mb: 3 }}
                                        />

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            startIcon={<PointOfSaleIcon />}
                                            sx={{ py: 1.3, fontWeight: 700, borderRadius: '12px' }}
                                        >
                                            Abrir Caja Registradora
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Box>
            )}

            {/* ═══════ TAB 1 : HISTORY ═══════ */}
            {activeTab === 1 && (
                <Card sx={{
                    ...accentCard(isDark),
                    animation: mounted ? 'fade-in-up 0.5s ease both' : 'none',
                    animationDelay: '0.1s',
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 3 }}>
                            <Box sx={{
                                p: 1,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(0,74,198,0.12), rgba(37,99,235,0.12))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <HistoryIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                Historial de Cierres de Caja
                            </Typography>
                        </Box>

                        {history.length === 0 ? (
                            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                                <Typography color="text.disabled" variant="body2">
                                    No se registran turnos de caja anteriores.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID Turno</TableCell>
                                            <TableCell>Apertura</TableCell>
                                            <TableCell>Cierre</TableCell>
                                            <TableCell>Saldo Inicial</TableCell>
                                            <TableCell>Ventas Efectivo</TableCell>
                                            <TableCell>Efectivo Esperado</TableCell>
                                            <TableCell>Efectivo Real</TableCell>
                                            <TableCell>Descuadre / Diferencia</TableCell>
                                            <TableCell>Notas</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {history.map((session, idx) => {
                                            const expected = (session.opening_balance ?? 0) + (session.cash_sales ?? 0)
                                            const real = session.closing_balance_real ?? 0
                                            const diff = session.status === 'CERRADA' ? (real - expected) : null

                                            return (
                                                <TableRow key={session.id} hover sx={{
                                                    animation: mounted ? 'fade-in-up 0.4s ease both' : 'none',
                                                    animationDelay: `${0.05 * Math.min(idx, 10)}s`,
                                                }}>
                                                    <TableCell>
                                                        <Chip
                                                            label={`#${session.id}`}
                                                            size="small"
                                                            color={session.status === 'CERRADA' ? 'default' : 'primary'}
                                                            variant="outlined"
                                                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{new Date(session.opened_at).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        {session.closed_at ? new Date(session.closed_at).toLocaleString() : (
                                                            <Chip label="ACTIVA" size="small" color="primary" variant="filled" sx={{ fontWeight: 700 }} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>${(session.opening_balance ?? 0).toLocaleString()}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>${(session.cash_sales ?? 0).toLocaleString()}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                                                        {session.status === 'CERRADA'
                                                            ? `$${expected.toLocaleString()}`
                                                            : `$${((session.opening_balance ?? 0) + (session.cash_sales ?? 0)).toLocaleString()}`
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {session.status === 'CERRADA'
                                                            ? <Typography variant="body2" sx={{ fontWeight: 600 }}>${real.toLocaleString()}</Typography>
                                                            : <Typography variant="body2" color="text.disabled">—</Typography>
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {session.status === 'CERRADA' && diff !== null
                                                            ? getDiffChip(diff)
                                                            : <Typography variant="body2" color="text.disabled">—</Typography>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {session.notes || <Typography variant="body2" color="text.disabled">—</Typography>}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ═══════ CLOSE SESSION DIALOG ═══════ */}
            <Dialog
                open={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            background: isDark ? 'rgba(10, 10, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(40px) saturate(200%)',
                            border: isDark ? '1px solid rgba(180, 197, 255, 0.15)' : '1px solid rgba(0, 74, 198, 0.12)',
                            borderRadius: '20px',
                            boxShadow: isDark
                                ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(180,197,255,0.08)'
                                : '0 32px 80px rgba(0,74,198,0.18), 0 0 0 1px rgba(0,74,198,0.05)',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <form onSubmit={handleCloseSession}>
                    <DialogTitle sx={{
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        borderBottom: isDark ? '1px solid rgba(180,197,255,0.08)' : '1px solid rgba(0,74,198,0.08)',
                        py: 2.5,
                        px: 3,
                    }}>
                        <Box sx={{
                            p: 0.8,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))',
                            display: 'flex',
                        }}>
                            <CheckCircleIcon sx={{ fontSize: 22, color: 'error.main' }} />
                        </Box>
                        Cierre y Cuadre de Caja
                    </DialogTitle>
                    <DialogContent dividers sx={{ borderTop: 'none', px: 3, py: 3 }}>
                        {activeSession && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Ingresa el monto de dinero físico que has contado en la caja registradora al final de tu turno. El sistema comparará este valor con las ventas registradas.
                                </Typography>

                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 6 }}>
                                        <Box sx={{
                                            ...sectionBox(isDark),
                                            p: 2,
                                            textAlign: 'center',
                                        }}>
                                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Efectivo Esperado
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 400, fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', mt: 0.5, color: 'success.main' }}>
                                                ${expectedCashInDrawer.toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Box sx={{
                                            ...sectionBox(isDark),
                                            p: 2,
                                            textAlign: 'center',
                                        }}>
                                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Diferencia
                                            </Typography>
                                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                                                {getDiffChip(closingDifference)}
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 3 }} />

                                <TextField
                                    label="Efectivo Físico Contado en Caja"
                                    fullWidth
                                    required
                                    value={closingBalanceReal}
                                    onChange={(e) => setClosingBalanceReal(e.target.value)}
                                    sx={{ mb: 2.5 }}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                        }
                                    }}
                                />

                                <TextField
                                    label="Notas / Observaciones de Cierre"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={closingNotes}
                                    onChange={(e) => setClosingNotes(e.target.value)}
                                    placeholder="Ej: Faltan $500 por cambio entregado de más, o todo cuadra perfecto..."
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: isDark ? '1px solid rgba(180,197,255,0.08)' : '1px solid rgba(0,74,198,0.08)' }}>
                        <Button
                            onClick={() => setShowCloseModal(false)}
                            sx={{ borderRadius: '12px', fontWeight: 600 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            type="submit"
                            startIcon={<CheckCircleIcon />}
                            sx={{
                                borderRadius: '12px',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                    boxShadow: '0 8px 28px rgba(239,68,68,0.45)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            Confirmar Cierre de Caja
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AdminLayout>
    )
}

export default CashRegister