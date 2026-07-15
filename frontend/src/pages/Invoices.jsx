import { useState, useEffect, useRef } from 'react'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import { useTheme } from '@mui/material/styles'

// Icons
import SearchIcon from '@mui/icons-material/Search'
import PrintIcon from '@mui/icons-material/Print'
import CloseIcon from '@mui/icons-material/Close'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ReceiptIcon from '@mui/icons-material/Receipt'

const keyframes = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes icon-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`

function Invoices({ user }) {
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showReceipt, setShowReceipt] = useState(false)
    const [receiptData, setReceiptData] = useState(null)

    const toast = useToast()
    const printAreaRef = useRef(null)
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setInvoices(await res.json())
            }
        } catch (error) {
            toast.error('Error al cargar historial de facturas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [])

    const handleViewInvoice = async (invoiceId) => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/invoices/${invoiceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setReceiptData(data)
                setShowReceipt(true)
            } else {
                toast.error('No se pudieron cargar los detalles de la factura.')
            }
        } catch (error) {
            toast.error('Error al cargar la factura.')
        } finally {
            setLoading(false)
        }
    }

    const filteredInvoices = invoices.filter(inv => {
        const matchSearch = !searchTerm ||
            inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.customer_document && inv.customer_document.includes(searchTerm))
        return matchSearch
    })

    const handlePrint = () => {
        const printContent = printAreaRef.current.innerHTML
        const win = window.open('', '_blank')
        win.document.write(`
            <html>
            <head>
                <title>Imprimir Factura</title>
                <style>
                    body { font-family: monospace; padding: 20px; font-size: 12px; line-height: 1.4; color: #000; }
                    .center { text-align: center; }
                    .right { text-align: right; }
                    .bold { font-weight: bold; }
                    .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 3px 0; }
                    .total-row td { padding-top: 10px; font-weight: bold; }
                    @media print {
                        body { padding: 0; margin: 0; }
                        @page { size: 80mm auto; margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `)
        win.document.close()
    }

    return (
        <AdminLayout title="Historial de Facturas" user={user}>
            <style>{keyframes}</style>

            {/* Page Header */}
            <Box sx={{
                mb: 3,
                p: { xs: 2.5, sm: 3 },
                borderRadius: '18px',
                background: isDark
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(16,185,129,0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.04) 100%)',
                border: isDark ? '1px solid rgba(129,140,248,0.12)' : '1px solid rgba(99,102,241,0.08)',
                display: 'flex', alignItems: 'center', gap: 2,
                animation: 'fade-in-up 0.4s ease both',
            }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    animation: 'icon-bounce 2s ease-in-out infinite',
                }}>
                    <ReceiptIcon sx={{ fontSize: 26 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                        Historial de Facturas
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.25 }}>
                        {filteredInvoices.length} factura{filteredInvoices.length !== 1 ? 's' : ''} encontrada{filteredInvoices.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
            </Box>

            {/* Search + Table Card */}
            <Card sx={{
                animation: 'fade-in-up 0.5s ease both',
                animationDelay: '0.1s',
                position: 'relative', overflow: 'visible',
                '&::before': {
                    content: '""',
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #10b981)',
                    borderRadius: '16px 16px 0 0',
                },
            }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    {/* Search Bar */}
                    <Box sx={{
                        mb: 2.5,
                        p: 1.5, borderRadius: '14px',
                        background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.03)',
                        border: isDark ? '1px solid rgba(129,140,248,0.10)' : '1px solid rgba(99,102,241,0.08)',
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por factura, cliente o documento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    background: isDark ? 'rgba(129,140,248,0.04)' : 'rgba(255,255,255,0.7)',
                                    transition: 'all 0.2s ease',
                                    '& fieldset': {
                                        borderColor: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(99,102,241,0.12)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#6366f1',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#6366f1',
                                        boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
                                    },
                                },
                            }}
                        />
                    </Box>

                    {filteredInvoices.length === 0 ? (
                        <Box sx={{
                            py: 8,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            animation: 'fade-in-up 0.4s ease both',
                        }}>
                            <Box sx={{
                                width: 80, height: 80, borderRadius: '24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)',
                                mb: 3,
                            }}>
                                <ReceiptLongIcon sx={{ fontSize: 40, color: '#8b5cf6', opacity: 0.6 }} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                Sin facturas
                            </Typography>
                            <Typography color="text.secondary" sx={{ maxWidth: 360, textAlign: 'center' }}>
                                {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No se encontraron facturas registradas.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {['Nro Factura', 'Fecha', 'Cliente', 'Documento', 'Método de Pago', 'Total', 'Acciones'].map((label) => (
                                            <TableCell key={label} sx={{
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                color: 'text.secondary',
                                                borderBottom: isDark ? '1px solid rgba(129,140,248,0.10)' : '1px solid rgba(99,102,241,0.08)',
                                                py: 1.25,
                                            }}>
                                                {label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredInvoices.map((inv, idx) => (
                                        <TableRow
                                            key={inv.id}
                                            hover
                                            sx={{
                                                animation: `fade-in-up 0.35s ease both`,
                                                animationDelay: `${idx * 40}ms`,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                                                },
                                                '& td': {
                                                    borderBottom: isDark ? '1px solid rgba(129,140,248,0.06)' : '1px solid rgba(99,102,241,0.05)',
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                                {inv.invoice_number}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                                                {new Date(inv.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {inv.customer_name}
                                            </TableCell>
                                            <TableCell>
                                                {inv.customer_document ? (
                                                    <Typography component="span" sx={{ fontSize: '0.8125rem' }}>
                                                        {inv.customer_document}
                                                    </Typography>
                                                ) : (
                                                    <Typography component="span" sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={inv.payment_method}
                                                    size="small"
                                                    color={inv.payment_method === 'EFECTIVO' ? 'success' : 'primary'}
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '0.6875rem',
                                                        height: 26,
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                                                ${inv.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<VisibilityIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                    label="Ver"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleViewInvoice(inv.id)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        height: 26,
                                                        fontSize: '0.6875rem',
                                                        fontWeight: 600,
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
                                                            transform: 'translateY(-1px)',
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Receipt Dialog — Glassmorphism */}
            <Dialog
                open={showReceipt}
                onClose={() => setShowReceipt(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: isDark ? 'rgba(10, 10, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(40px) saturate(200%)',
                        border: isDark ? '1px solid rgba(129, 140, 248, 0.15)' : '1px solid rgba(99, 102, 241, 0.12)',
                        borderRadius: '20px',
                        boxShadow: isDark
                            ? '0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08)'
                            : '0 24px 80px rgba(0,0,0,0.12), 0 0 40px rgba(99,102,241,0.05)',
                        overflow: 'hidden',
                    },
                }}
                slotProps={{
                    backdrop: {
                        sx: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.3)' }
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    pb: 1.5,
                    borderBottom: isDark ? '1px solid rgba(129,140,248,0.08)' : '1px solid rgba(99,102,241,0.06)',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                        }}>
                            <ReceiptIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Detalle de Factura
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setShowReceipt(false)}
                        sx={{
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                            '&:hover': { background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ borderColor: 'transparent', p: 0 }}>
                    {receiptData && (
                        <Box sx={{ p: 2.5 }}>
                            {/* Receipt Container — paper look */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    fontFamily: 'monospace',
                                    fontSize: '0.8125rem',
                                    borderRadius: '14px',
                                    border: isDark ? '1px solid rgba(129,140,248,0.12)' : '1px solid rgba(99,102,241,0.10)',
                                    background: isDark ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.02)',
                                    color: isDark ? '#e2e8f0' : '#333',
                                }}
                                ref={printAreaRef}
                            >
                                {/* Store Header */}
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 1 }}>
                                        {receiptData.order?.store?.name || user?.storeName || 'E-SHOP'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                        NIT/Reg: {receiptData.invoice.store_id || '900800700-1'}<br />
                                        Dirección: {receiptData.order?.store?.address || 'Local Comercial'}<br />
                                        WhatsApp: {receiptData.order?.store?.whatsapp || 'N/A'}
                                    </Typography>
                                </Box>

                                <Box sx={{ borderBottom: `1px dashed ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(0,0,0,0.15)'}`, mb: 2 }} />

                                {/* Invoice Meta */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                                        <strong>Factura Nro:</strong> {receiptData.invoice.invoice_number}<br />
                                        <strong>Fecha:</strong> {new Date(receiptData.invoice.created_at).toLocaleString()}<br />
                                        <strong>Cliente:</strong> {receiptData.invoice.customer_name}<br />
                                        {receiptData.invoice.customer_document && (
                                            <><strong>Doc:</strong> {receiptData.invoice.customer_document}<br /></>
                                        )}
                                        <strong>Medio Pago:</strong> {receiptData.invoice.payment_method}
                                    </Typography>
                                </Box>

                                <Box sx={{ borderBottom: `1px dashed ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(0,0,0,0.15)'}`, mb: 1 }} />

                                {/* Items Table */}
                                <table style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(129,140,248,0.15)' : 'rgba(0,0,0,0.1)'}` }}>
                                            <th style={{ textAlign: 'left' }}>Detalle</th>
                                            <th style={{ textAlign: 'center' }}>Cant.</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receiptData.order?.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ padding: '4px 0' }}>
                                                    {item.product_name}
                                                    {item.selected_size && ` (${item.selected_size})`}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right', padding: '4px 0' }}>
                                                    ${((item.price + item.extra_price) * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <Box sx={{ borderBottom: `1px dashed ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(0,0,0,0.15)'}`, mt: 2, mb: 1 }} />

                                {/* Summary */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <span>Subtotal:</span>
                                        <span>${receiptData.invoice.subtotal.toLocaleString()}</span>
                                    </Box>
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <span>Impuestos (0%):</span>
                                        <span>$0</span>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex', width: '100%', justifyContent: 'space-between',
                                        fontWeight: 'bold', fontSize: '0.9rem', pt: 1,
                                        borderTop: `1px solid ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                    }}>
                                        <span>Total:</span>
                                        <span>${receiptData.invoice.total.toLocaleString()}</span>
                                    </Box>
                                </Box>

                                <Box sx={{ borderBottom: `1px dashed ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(0,0,0,0.15)'}`, mt: 2, mb: 2 }} />

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        ¡Gracias por su compra!<br />
                                        Conserve su factura para cualquier reclamo.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    borderTop: isDark ? '1px solid rgba(129,140,248,0.08)' : '1px solid rgba(99,102,241,0.06)',
                }}>
                    <Button
                        onClick={() => setShowReceipt(false)}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            textTransform: 'none',
                        }}
                    >
                        Cerrar
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Imprimir Factura
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    )
}

export default Invoices
