import { useState, useEffect, useMemo } from 'react'
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
import Grid from '@mui/material/Grid' // MUI 9 Grid
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import HistoryIcon from '@mui/icons-material/History'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PaymentIcon from '@mui/icons-material/Payment'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'

function CashRegister({ user }) {
    const [activeTab, setActiveTab] = useState(0)
    const [activeSession, setActiveSession] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Open session form state
    const [openingBalance, setOpeningBalance] = useState('')
    const [openingNotes, setOpeningNotes] = useState('')
    
    // Close session modal state
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [closingBalanceReal, setClosingBalanceReal] = useState('')
    const [closingNotes, setClosingNotes] = useState('')
    
    const toast = useToast()

    // Fetch active session and history
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

    // Calculations for closing modal
    const expectedCashInDrawer = useMemo(() => {
        if (!activeSession) return 0
        return (activeSession.opening_balance ?? 0) + (activeSession.cash_sales ?? 0)
    }, [activeSession])

    const closingDifference = useMemo(() => {
        const real = parseFloat(closingBalanceReal) || 0
        return real - expectedCashInDrawer
    }, [closingBalanceReal, expectedCashInDrawer])

    const getDiffChip = (diff) => {
        if (diff === 0) return <Chip label="Cuadrado ($0)" color="success" size="small" sx={{ fontWeight: 700 }} />
        if (diff < 0) return <Chip label={`Faltante ($${Math.abs(diff).toLocaleString()})`} color="error" size="small" sx={{ fontWeight: 700 }} />
        return <Chip label={`Sobrante (+$${diff.toLocaleString()})`} color="primary" size="small" sx={{ fontWeight: 700 }} />
    }

    return (
        <AdminLayout title="Control de Caja Registradora" user={user}>
            <Box sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, nv) => setActiveTab(nv)} indicatorColor="primary" textColor="primary">
                    <Tab label="Caja Activa" icon={<AccountBalanceWalletIcon />} iconPosition="start" />
                    <Tab label="Historial de Turnos" icon={<HistoryIcon />} iconPosition="start" />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <Box>
                    {activeSession ? (
                        /* Active Session Dashboard */
                        <Grid container spacing={3}>
                            {/* Summary Card */}
                            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                                <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '5px solid #6366f1' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                            SESIÓN ACTIVA NRO. {activeSession.id}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'primary.main' }}>
                                            ${((activeSession.opening_balance ?? 0) + (activeSession.cash_sales ?? 0) + (activeSession.card_sales ?? 0) + (activeSession.transfer_sales ?? 0)).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Total Ventas + Apertura
                                        </Typography>
                                        
                                        <Divider sx={{ mb: 2 }} />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Fecha de Apertura:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {new Date(activeSession.opened_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Saldo de Apertura:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    ${(activeSession.opening_balance ?? 0).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {activeSession.notes && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">Notas de apertura:</Typography>
                                                    <Typography variant="caption" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
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
                                            sx={{ mt: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                                        >
                                            Cerrar y Cuadrar Caja
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Transaction Details */}
                            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                                <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                                            Desglose por Métodos de Pago
                                        </Typography>

                                        <Grid container spacing={3}>
                                            {/* Cash Card */}
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                                        <LocalAtmIcon />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Efectivo (Caja)</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>${(activeSession.cash_sales ?? 0).toLocaleString()}</Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* Card Card */}
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                                        <PaymentIcon />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Tarjeta</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>${(activeSession.card_sales ?? 0).toLocaleString()}</Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            {/* Transfer Card */}
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                                                        <AccountBalanceIcon />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Transferencia</Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>${(activeSession.transfer_sales ?? 0).toLocaleString()}</Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 4, p: 2.5, borderRadius: 2, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>Efectivo Esperado en Caja (Apertura + Ventas Efectivo):</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main' }}>
                                                    ${expectedCashInDrawer.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                * Al momento del cierre de caja, deberás contar únicamente el dinero en efectivo físico disponible en la caja. El monto esperado a declarar es de <strong>${expectedCashInDrawer.toLocaleString()}</strong>. Los saldos de tarjeta y transferencia se consideran recaudados en las respectivas cuentas bancarias.
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    ) : (
                        /* Open Session Form */
                        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
                            <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                                <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                                    <PointOfSaleIcon color="primary" sx={{ fontSize: 32 }} />
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Apertura de Caja</Typography>
                                                        <Typography variant="caption" color="text.secondary">
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
                                                        sx={{ mb: 3 }}
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
                                                        sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
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

            {activeTab === 1 && (
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                            Historial de Cierres de Caja
                        </Typography>
                        
                        {history.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                No se registran turnos de caja anteriores.
                            </Typography>
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
                                        {history.map((session) => {
                                            const expected = (session.opening_balance ?? 0) + (session.cash_sales ?? 0)
                                            const real = session.closing_balance_real ?? 0
                                            const diff = session.status === 'CERRADA' ? (real - expected) : null
                                            
                                            return (
                                                <TableRow key={session.id} hover>
                                                    <TableCell sx={{ fontWeight: 700 }}>#{session.id}</TableCell>
                                                    <TableCell>{new Date(session.opened_at).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        {session.closed_at ? new Date(session.closed_at).toLocaleString() : (
                                                            <Chip label="ACTIVA" size="small" color="primary" variant="filled" sx={{ fontWeight: 700 }} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>${(session.opening_balance ?? 0).toLocaleString()}</TableCell>
                                                    <TableCell>${(session.cash_sales ?? 0).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        {session.status === 'CERRADA' 
                                                            ? `$${expected.toLocaleString()}` 
                                                            : `$${((session.opening_balance ?? 0) + (session.cash_sales ?? 0)).toLocaleString()}`
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {session.status === 'CERRADA' ? `$${real.toLocaleString()}` : <span style={{ color: 'gray' }}>—</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {session.status === 'CERRADA' && diff !== null ? getDiffChip(diff) : <span style={{ color: 'gray' }}>—</span>}
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {session.notes || '—'}
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

            {/* Close Register / Reconcile Dialog */}
            <Dialog open={showCloseModal} onClose={() => setShowCloseModal(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleCloseSession}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Cierre y Cuadre de Caja</DialogTitle>
                    <DialogContent dividers>
                        {activeSession && (
                            <Box sx={{ py: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Ingresa el monto de dinero físico que has contado en la caja registradora al final de tu turno. El sistema comparará este valor con las ventas registradas.
                                </Typography>

                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                            EFECTIVO ESPERADO EN CAJA
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                                            ${expectedCashInDrawer.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                            DIFERENCIA / DESCUADRE
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {getDiffChip(closingDifference)}
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ my: 3 }} />

                                <TextField
                                    label="Efectivo Físico Contado en Caja"
                                    fullWidth
                                    required
                                    value={closingBalanceReal}
                                    onChange={(e) => setClosingBalanceReal(e.target.value)}
                                    sx={{ mb: 3 }}
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
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setShowCloseModal(false)}>Cancelar</Button>
                        <Button variant="contained" color="error" type="submit">
                            Confirmar Cierre de Caja
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AdminLayout>
    )
}

export default CashRegister
