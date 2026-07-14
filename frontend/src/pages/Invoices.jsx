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

// Icons
import SearchIcon from '@mui/icons-material/Search'
import PrintIcon from '@mui/icons-material/Print'
import CloseIcon from '@mui/icons-material/Close'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import VisibilityIcon from '@mui/icons-material/Visibility'

function Invoices({ user }) {
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    
    // Receipt Modal
    const [showReceipt, setShowReceipt] = useState(false)
    const [receiptData, setReceiptData] = useState(null)
    
    const toast = useToast()
    const printAreaRef = useRef(null)

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
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
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Facturas Emitidas
                        </Typography>
                        <TextField
                            size="small"
                            placeholder="Buscar factura o cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: 300 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Box>

                    {filteredInvoices.length === 0 ? (
                        <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary" variant="body2">
                                No se encontraron facturas registradas.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nro Factura</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Cliente</TableCell>
                                        <TableCell>Documento</TableCell>
                                        <TableCell>Método de Pago</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredInvoices.map((inv) => (
                                        <TableRow key={inv.id} hover>
                                            <TableCell sx={{ fontWeight: 700 }}>{inv.invoice_number}</TableCell>
                                            <TableCell>{new Date(inv.created_at).toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{inv.customer_name}</TableCell>
                                            <TableCell>{inv.customer_document || <span style={{ color: 'gray' }}>—</span>}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={inv.payment_method} 
                                                    size="small" 
                                                    color={inv.payment_method === 'EFECTIVO' ? 'success' : 'primary'}
                                                    variant="outlined" 
                                                    sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>${inv.total.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<VisibilityIcon style={{ fontSize: '0.75rem' }} />}
                                                    label="Ver Factura"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleViewInvoice(inv.id)}
                                                    sx={{ cursor: 'pointer', height: 24, fontSize: '0.6875rem' }}
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

            {/* Receipt Modal */}
            <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Detalle de Factura</Typography>
                    <IconButton size="small" onClick={() => setShowReceipt(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {receiptData && (
                        <Box sx={{ p: 1 }}>
                            {/* Receipt Container */}
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 3, 
                                    bgcolor: '#fafafa', 
                                    fontFamily: 'monospace', 
                                    fontSize: '0.8125rem',
                                    color: '#333',
                                    borderRadius: 2
                                }}
                                ref={printAreaRef}
                            >
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

                                <Box sx={{ borderBottom: '1px dashed #000', mb: 2 }} />

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

                                <Box sx={{ borderBottom: '1px dashed #000', mb: 1 }} />

                                {/* Items Table */}
                                <table style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ textAlign: 'left' }}>Detalle</th>
                                            <th style={{ textAlign: 'center' }}>Cant.</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receiptData.order?.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.product_name}
                                                    {item.selected_size && ` (${item.selected_size})`}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    ${((item.price + item.extra_price) * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <Box sx={{ borderBottom: '1px dashed #000', mt: 2, mb: 1 }} />

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
                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', pt: 1, borderTop: '1px solid #000' }}>
                                        <span>Total:</span>
                                        <span>${receiptData.invoice.total.toLocaleString()}</span>
                                    </Box>
                                </Box>

                                <Box sx={{ borderBottom: '1px dashed #000', mt: 2, mb: 2 }} />

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
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowReceipt(false)}>Cerrar</Button>
                    <Button 
                        onClick={handlePrint} 
                        variant="contained" 
                        color="primary"
                        startIcon={<PrintIcon />}
                    >
                        Imprimir Factura
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    )
}

export default Invoices
