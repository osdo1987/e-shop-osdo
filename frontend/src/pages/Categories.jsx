import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
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

function Categories({ user }) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)
    const toast = useToast()

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                setCategories(await res.json())
            }
        } catch (error) {
            toast.error('Error al cargar categorías')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    store_id: user.storeId
                })
            })
            if (res.ok) {
                toast.success(`Categoría "${newCategoryName}" creada exitosamente`)
                setNewCategoryName('')
                fetchCategories()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al crear categoría')
            }
        } catch (err) {
            toast.error('Error de conexión')
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/categories/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                toast.success(`Categoría "${deleteTarget.name}" eliminada`)
                setDeleteTarget(null)
                fetchCategories()
            } else {
                const data = await res.json()
                toast.error(data.error || 'Error al eliminar categoría')
            }
        } catch (error) {
            toast.error('Error de conexión')
        }
    }

    return (
        <>
            <AdminLayout title="Categorías" user={user}>
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Nueva Categoría
                        </Typography>
                        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nombre de la categoría"
                                required
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <Button type="submit" variant="contained">Crear</Button>
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Lista de Categorías ({categories.length})
                        </Typography>
                        {loading ? (
                            <Typography color="text.secondary">Cargando...</Typography>
                        ) : categories.length === 0 ? (
                            <Typography color="text.secondary">No hay categorías. Crea la primera.</Typography>
                        ) : (
                            <>
                                <Box sx={{ overflowX: 'auto', display: { xs: 'none', md: 'block' } }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nombre</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {categories.map(cat => (
                                                <TableRow key={cat.id} hover>
                                                    <TableCell>{cat.name}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => setDeleteTarget(cat)}
                                                        >
                                                            🗑️ Eliminar
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>

                                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                                    {categories.map(cat => (
                                        <Card key={cat.id} variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:last-child': { pb: 2 } }}>
                                                <Typography sx={{ fontWeight: 600 }}>{cat.name}</Typography>
                                                <Button variant="contained" color="error" size="small" onClick={() => setDeleteTarget(cat)}>
                                                    🗑️ Eliminar
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </AdminLayout>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Eliminar Categoría"
                message={`¿Estás seguro de eliminar la categoría "${deleteTarget?.name}"? Los productos asociados quedarán sin categoría.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}

export default Categories