import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box, TextField, Button, Typography, Grid, IconButton,
    CircularProgress, Chip, Tooltip, Card, CardContent,
    useMediaQuery, Dialog, DialogTitle, DialogContent,
    Zoom, Fade, Grow, FormControlLabel, Switch,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
    Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon,
    Delete as DeleteIcon, CloudUpload as CloudUploadIcon,
    Image as ImageIcon, Close as CloseIcon,
    CheckCircle as CheckCircleIcon, Info as InfoIcon,
    Category as CategoryIcon, AttachMoney as MoneyIcon,
    ShoppingCart as ComboIcon, Fullscreen as FullscreenIcon,
    Inventory as StockIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        backgroundColor: (theme) => theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
        "& fieldset": { borderColor: "divider" },
        "&:hover fieldset": { borderColor: "primary.main" },
        "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiInputBase-input": { color: "text.primary", py: "14px" },
};

const sectionBox = {
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: (theme) => theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.02)"
        : "#fff",
    overflow: "hidden",
    transition: "border-color 0.3s, box-shadow 0.3s",
    "&:hover": {
        borderColor: "primary.main",
        boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
};

const defaultData = {
    name: "", description: "", category_id: "", price: "",
    promo_price: "", is_active: true, max_per_order: 0,
    image_url: "", imageFile: null,
    items: [],
};

export default function ComboForm({ user, onLogout }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const token = localStorage.getItem("token");
    const isEditing = Boolean(id);

    const [data, setData] = useState(defaultData);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEditing);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [dirty, setDirty] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingNav, setPendingNav] = useState(null);
    const [productSearch, setProductSearch] = useState("");

    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Calcular precios del combo
    const totalSinDescuento = useMemo(() => {
        return data.items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                const price = product.promo_price || product.price;
                return sum + price * item.quantity;
            }
            return sum;
        }, 0);
    }, [data.items, products]);

    const precioVenta = parseFloat(data.promo_price || data.price) || 0;
    const ahorro = totalSinDescuento - precioVenta;
    const ahorroPorcentaje = totalSinDescuento > 0
        ? Math.round((ahorro / totalSinDescuento) * 100)
        : 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [catRes, prodRes] = await Promise.all([
                    fetch("/api/categories", { headers }),
                    fetch("/api/products", { headers })
                ]);
                if (catRes.ok) setCategories(await catRes.json());
                if (prodRes.ok) setProducts(await prodRes.json());
            } catch {
                setToast({ open: true, message: "Error al cargar datos", severity: "error" });
            }
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        if (isEditing) {
            setPageLoading(true);
            fetch(`/api/combos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => r.json())
                .then((d) => {
                    setData({
                        name: d.name || "",
                        description: d.description || "",
                        category_id: d.category_id || "",
                        price: d.price ?? "",
                        promo_price: d.promo_price ?? "",
                        is_active: d.is_active !== false,
                        max_per_order: d.max_per_order || 0,
                        image_url: d.image_url || "",
                        imageFile: null,
                        items: (d.items || []).map(item => ({
                            _id: item.id || `new_${Math.random()}`,
                            product_id: item.product_id,
                            quantity: item.quantity || 1,
                            is_optional: item.is_optional || false,
                            allow_size_variant: item.allow_size_variant !== false,
                            product_name: item.product_name || "",
                        })),
                    });
                })
                .catch(() => setToast({ open: true, message: "Error al cargar el combo", severity: "error" }))
                .finally(() => setPageLoading(false));
        }
    }, [id, isEditing, token]);

    const validate = useCallback((d) => {
        const e = {};
        if (!d.name?.trim()) e.name = "El nombre es obligatorio";
        if (!d.category_id) e.category_id = "Selecciona una categoría";
        if (!d.price || parseFloat(d.price) <= 0) e.price = "El precio debe ser mayor a 0";
        if (d.items.length === 0) e.items = "Agrega al menos un producto al combo";
        return e;
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setErrors(validate(data)), 300);
        return () => clearTimeout(timer);
    }, [data, validate]);

    const handleChange = (field) => (e) => {
        let value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        if (["price", "promo_price"].includes(field)) {
            value = value === "" ? "" : value.replace(/[^0-9.]/g, "");
        }
        if (field === "max_per_order") value = parseInt(value) || 0;
        setData((d) => ({ ...d, [field]: value }));
        setDirty(true);
    };

    const handleBlur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

    const addProductToCombo = (product) => {
        if (data.items.some(i => i.product_id === product.id)) {
            setToast({ open: true, message: "El producto ya está en el combo", severity: "warning" });
            return;
        }
        setData((d) => ({
            ...d,
            items: [...d.items, {
                _id: `new_${Date.now()}_${Math.random()}`,
                product_id: product.id,
                quantity: 1,
                is_optional: false,
                allow_size_variant: true,
                product_name: product.name,
            }]
        }));
        setDirty(true);
    };

    const removeProductFromCombo = (itemId) => {
        setData((d) => ({
            ...d,
            items: d.items.filter(i => i._id !== itemId)
        }));
        setDirty(true);
    };

    const updateItemField = (itemId, field, value) => {
        setData((d) => ({
            ...d,
            items: d.items.map(i =>
                i._id === itemId ? { ...i, [field]: value } : i
            )
        }));
        setDirty(true);
    };

    const handleImageFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setToast({ open: true, message: "Máximo 5 MB", severity: "warning" });
            return;
        }
        if (!file.type.startsWith("image/")) {
            setToast({ open: true, message: "Solo se permiten imágenes", severity: "warning" });
            return;
        }
        setData((d) => ({ ...d, imageFile: file, image_url: URL.createObjectURL(file) }));
        setDirty(true);
    };

    const removeImage = () => {
        setData((d) => ({ ...d, image_url: "", imageFile: null }));
        setDirty(true);
    };

    const handleSubmit = async () => {
        const validation = validate(data);
        setErrors(validation);
        setTouched({ name: true, category_id: true, price: true });
        if (Object.keys(validation).length > 0) {
            setToast({ open: true, message: "Revisa los campos marcados en rojo", severity: "warning" });
            return;
        }
        setLoading(true);
        try {
            const payload = {
                name: data.name,
                description: data.description || null,
                price: parseFloat(data.price) || 0,
                promo_price: data.promo_price ? parseFloat(data.promo_price) : null,
                image_url: data.image_url || null,
                category_id: parseInt(data.category_id) || null,
                store_id: user?.storeId || user?.store_id || null,
                is_active: data.is_active,
                max_per_order: parseInt(data.max_per_order) || 0,
                items: data.items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity || 1,
                    is_optional: i.is_optional || false,
                    allow_size_variant: i.allow_size_variant !== false,
                })),
            };

            if (!payload.store_id) {
                setToast({ open: true, message: "Error: No se encontró la tienda", severity: "error" });
                setLoading(false);
                return;
            }

            let body;
            let headers = { Authorization: `Bearer ${token}` };
            if (data.imageFile) {
                body = new FormData();
                Object.entries(payload).forEach(([k, v]) => {
                    if (v !== null && v !== undefined) {
                        if (k === "items") {
                            body.append(k, JSON.stringify(v));
                        } else {
                            body.append(k, String(v));
                        }
                    }
                });
                body.append("image", data.imageFile);
            } else {
                body = JSON.stringify(payload);
                headers["Content-Type"] = "application/json";
            }

            const url = isEditing ? `/api/combos/${id}` : "/api/combos";
            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers,
                body,
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(result.error || "Error al guardar");
            setDirty(false);
            setToast({ open: true, message: isEditing ? "Combo actualizado" : "Combo creado", severity: "success" });
            setTimeout(() => navigate("/admin/combos"), 1200);
        } catch (err) {
            setToast({ open: true, message: err.message || "Error al guardar", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (dirty) {
            setPendingNav("/admin/combos");
            setConfirmOpen(true);
        } else {
            navigate("/admin/combos");
        }
    };

    const handleConfirmNav = () => {
        setConfirmOpen(false);
        if (pendingNav) {
            setDirty(false);
            navigate(pendingNav);
        }
    };

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
            !data.items.some(i => i.product_id === p.id)
        ).slice(0, 8);
    }, [products, productSearch, data.items]);

    if (user?.role === "STAFF") return <Navigate to="/admin/pos" />;

    if (pageLoading) {
        return (
            <AdminLayout title={isEditing ? "Editar Combo" : "Nuevo Combo"} user={user} onLogout={onLogout}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={user} onLogout={onLogout}>
            <Toast open={toast.open} message={toast.message} severity={toast.severity}
                onClose={() => setToast((t) => ({ ...t, open: false }))} />
            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmNav}
                title="¿Salir sin guardar?"
                message="Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
                confirmText="Salir"
                cancelText="Quedarme"
                type="warning"
            />

            <Fade in timeout={600}>
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" } }}>
                                {isEditing ? "Editar combo" : "Nuevo combo"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                                {isEditing ? `Modificando "${data.name || "..."}"` : "Agrupa productos en un combo con precio especial"}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    borderRadius: "12px", fontWeight: 700, textTransform: "none",
                                    px: 3, py: 1.2,
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                                }}
                            >
                                {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear combo"}
                            </Button>
                            <IconButton onClick={handleCancel} sx={{ color: "text.secondary" }}>
                                <CancelIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column-reverse", md: "row" } }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            {/* ── BASIC INFO ── */}
                            <Box sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Información del combo</Typography>
                                <Grid container spacing={2}>
                                    <Grid xs={12}>
                                        <TextField fullWidth label="Nombre del combo" value={data.name}
                                            onChange={handleChange("name")} onBlur={handleBlur("name")}
                                            placeholder="Ej: Combo Burger Especial"
                                            error={touched.name && !!errors.name} helperText={touched.name && errors.name}
                                            required sx={inputSx} />
                                    </Grid>
                                    <Grid xs={12}>
                                        <TextField fullWidth label="Descripción" value={data.description}
                                            onChange={handleChange("description")}
                                            placeholder="Incluye: Hamburguesa + Papas + Gaseosa"
                                            multiline minRows={2} sx={inputSx} />
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <TextField fullWidth label="Categoría" select value={data.category_id}
                                            onChange={handleChange("category_id")} onBlur={handleBlur("category_id")}
                                            error={touched.category_id && !!errors.category_id}
                                            helperText={touched.category_id && errors.category_id}
                                            required sx={inputSx}
                                            slotProps={{ native: true }}>
                                            <option value="">Seleccionar...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <TextField fullWidth label="Precio del combo ($)" value={data.price}
                                            onChange={handleChange("price")} onBlur={handleBlur("price")}
                                            required type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                            error={touched.price && !!errors.price}
                                            helperText={touched.price && errors.price}
                                            sx={inputSx} />
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <TextField fullWidth label="Precio promocional ($)" value={data.promo_price}
                                            onChange={handleChange("promo_price")}
                                            type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                            sx={inputSx} />
                                    </Grid>
                                    <Grid xs={6} sm={4}>
                                        <TextField fullWidth label="Máx. por pedido" value={data.max_per_order}
                                            onChange={handleChange("max_per_order")} type="number"
                                            helperText="0 = sin límite"
                                            slotProps={{ htmlInput: { min: 0 } }}
                                            sx={inputSx} />
                                    </Grid>
                                    <Grid xs={6} sm={4}>
                                        <FormControlLabel
                                            control={<Switch checked={data.is_active} onChange={(e) => {
                                                setData(d => ({ ...d, is_active: e.target.checked }));
                                                setDirty(true);
                                            }} />}
                                            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Combo activo</Typography>}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Resumen de ahorro */}
                                {precioVenta > 0 && totalSinDescuento > 0 && (
                                    <Box sx={{
                                        mt: 2, p: 1.5, borderRadius: "12px",
                                        backgroundColor: (t) => alpha(t.palette.success.main, 0.06),
                                        border: "1px solid", borderColor: (t) => alpha(t.palette.success.main, 0.15),
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Resumen de precio:
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            Sin combo: <strong>${totalSinDescuento.toLocaleString()}</strong>
                                            {" → "}Precio combo: <strong style={{ color: theme.palette.success.main }}>${precioVenta.toLocaleString()}</strong>
                                        </Typography>
                                        {ahorro > 0 && (
                                            <Chip
                                                label={`Ahorro: $${ahorro.toLocaleString()} (${ahorroPorcentaje}%)`}
                                                size="small"
                                                sx={{ mt: 0.5, fontWeight: 700, backgroundColor: (t) => alpha(t.palette.success.main, 0.12), color: "success.main" }}
                                            />
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {/* ── PRODUCTOS ── */}
                            <Box sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Productos del combo</Typography>

                                {/* Buscador de productos */}
                                <Box sx={{ position: "relative", mb: 2 }}>
                                    <TextField fullWidth label="Buscar y agregar productos..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        size="small" sx={inputSx} />
                                    {productSearch && filteredProducts.length > 0 && (
                                        <Box sx={{
                                            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                                            backgroundColor: "background.paper", borderRadius: "12px",
                                            border: "1px solid", borderColor: "divider",
                                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxHeight: 300, overflow: "auto", mt: 0.5,
                                        }}>
                                            {filteredProducts.map(p => (
                                                <Box key={p.id} onClick={() => { addProductToCombo(p); setProductSearch(""); }}
                                                    sx={{
                                                        display: "flex", alignItems: "center", gap: 1.5, p: 1.5, cursor: "pointer",
                                                        "&:hover": { backgroundColor: "action.hover" },
                                                        borderBottom: "1px solid", borderColor: "divider",
                                                    }}>
                                                    <Box sx={{
                                                        width: 36, height: 36, borderRadius: "8px", overflow: "hidden", flexShrink: 0,
                                                        backgroundColor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}>
                                                        {p.image_url ? (
                                                            <Box component="img" src={p.image_url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        ) : (
                                                            <StockIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                            ${(p.promo_price || p.price).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <AddIcon fontSize="small" sx={{ color: "primary.main" }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                {errors.items && (
                                    <Typography variant="caption" sx={{ color: "error.main", display: "block", mb: 1 }}>
                                        {errors.items}
                                    </Typography>
                                )}

                                {/* Lista de productos agregados */}
                                {data.items.length === 0 ? (
                                    <Box sx={{
                                        textAlign: "center", py: 4,
                                        border: "2px dashed", borderColor: "divider", borderRadius: "12px",
                                    }}>
                                        <ComboIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            Busca productos arriba para agregarlos al combo
                                        </Typography>
                                    </Box>
                                ) : (
                                    data.items.map((item, idx) => {
                                        const product = products.find(p => p.id === item.product_id);
                                        const itemPrice = product ? (product.promo_price || product.price) : 0;
                                        return (
                                            <Grow in key={item._id} timeout={300}>
                                                <Box sx={{
                                                    display: "flex", gap: 1, mb: 1.5, alignItems: "center",
                                                    p: 1.5, borderRadius: "12px",
                                                    backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                                    border: "1px solid", borderColor: "divider",
                                                }}>
                                                    <Box sx={{
                                                        width: 36, height: 36, borderRadius: "8px", overflow: "hidden", flexShrink: 0,
                                                        backgroundColor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}>
                                                        {product?.image_url ? (
                                                            <Box component="img" src={product.image_url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        ) : (
                                                            <StockIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ flex: 2, minWidth: 0 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, noWrap: true }}>
                                                            {product?.name || item.product_name || "Producto"}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                            ${itemPrice.toLocaleString()} c/u
                                                        </Typography>
                                                    </Box>
                                                    <TextField
                                                        label="Cant." value={item.quantity}
                                                        onChange={(e) => updateItemField(item._id, "quantity", parseInt(e.target.value) || 1)}
                                                        type="number" size="small"
                                                        slotProps={{ htmlInput: { min: 1 } }}
                                                        sx={{ width: 70, ...inputSx }} />
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                                            ${(itemPrice * item.quantity).toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <Tooltip title="Eliminar del combo" arrow>
                                                        <IconButton onClick={() => removeProductFromCombo(item._id)} size="small" sx={{ color: "error.main" }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Grow>
                                        );
                                    })
                                )}

                                {data.items.length > 0 && (
                                    <Box sx={{ mt: 2, p: 1.5, borderRadius: "12px", backgroundColor: "action.hover" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right" }}>
                                            Total productos: <strong>${totalSinDescuento.toLocaleString()}</strong>
                                            {" → "}Precio combo: <strong style={{ color: theme.palette.success.main }}>${precioVenta.toLocaleString()}</strong>
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* ── IMAGEN ── */}
                            <Box sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Imagen del combo</Typography>
                                {data.image_url ? (
                                    <Box sx={{ position: "relative", borderRadius: "16px", overflow: "hidden" }}>
                                        <Box component="img" src={data.image_url} alt="Preview"
                                            sx={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
                                        <IconButton onClick={removeImage}
                                            sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box component="label" sx={{
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                        p: 4, borderRadius: "16px", cursor: "pointer",
                                        border: "2px dashed", borderColor: "divider",
                                        "&:hover": { borderColor: "primary.main" },
                                    }}>
                                        <input type="file" accept="image/*" hidden onChange={handleImageFile} />
                                        <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Arrastra o haz clic para subir</Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>JPG, PNG, WebP — máx 5 MB</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Botón guardar inferior */}
                            <Box sx={{
                                display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3, pb: 4,
                                position: "sticky", bottom: 0, py: 2,
                                backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(18,18,18,0.95)" : "rgba(255,255,255,0.95)",
                                backdropFilter: "blur(8px)", borderRadius: "16px",
                                border: "1px solid", borderColor: "divider",
                            }}>
                                <Button variant="outlined" onClick={handleCancel} startIcon={<CancelIcon />}
                                    sx={{ borderRadius: "12px", fontWeight: 600, textTransform: "none", px: 3, py: 1.2 }}>
                                    Cancelar
                                </Button>
                                <Button variant="contained" onClick={handleSubmit} disabled={loading}
                                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                    sx={{
                                        borderRadius: "12px", fontWeight: 700, textTransform: "none", px: 4, py: 1.2,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                                    }}>
                                    {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear combo"}
                                </Button>
                            </Box>
                        </Box>

                        {/* ── SIDEBAR PREVIEW ── */}
                        {!isMobile && (
                            <Box sx={{ width: 320, flexShrink: 0, display: { xs: "none", md: "block" } }}>
                                <Card sx={{
                                    borderRadius: "20px", overflow: "hidden",
                                    border: "1px solid", borderColor: "divider",
                                    position: "sticky", top: 100,
                                    backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#fff",
                                }}>
                                    <Box sx={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                                        {data.image_url ? (
                                            <Box component="img" src={data.image_url} alt={data.name}
                                                sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <Box sx={{
                                                width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.05)})`,
                                            }}>
                                                <ComboIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                            </Box>
                                        )}
                                        <Chip label="COMBO" size="small"
                                            sx={{ position: "absolute", top: 12, left: 12, fontWeight: 800, fontSize: "0.65rem", backgroundColor: theme.palette.success.main, color: "#fff" }} />
                                    </Box>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                            {data.name || "Nombre del combo"}
                                        </Typography>
                                        {data.description && (
                                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.5 }}>
                                                {data.description}
                                            </Typography>
                                        )}
                                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                                            {ahorro > 0 ? (
                                                <>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>
                                                        ${precioVenta.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                                                        ${totalSinDescuento.toLocaleString()}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                                                    ${precioVenta > 0 ? precioVenta.toLocaleString() : "0"}
                                                </Typography>
                                            )}
                                        </Box>
                                        {ahorro > 0 && (
                                            <Chip label={`Ahorra ${ahorroPorcentaje}%`} size="small"
                                                sx={{ fontWeight: 700, backgroundColor: (t) => alpha(t.palette.success.main, 0.12), color: "success.main" }} />
                                        )}
                                        {data.items.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary" }}>
                                                    Incluye:
                                                </Typography>
                                                {data.items.map((item, idx) => {
                                                    const product = products.find(p => p.id === item.product_id);
                                                    return (
                                                        <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                                {item.quantity}x {product?.name || item.product_name || "Producto"}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Fade>
        </AdminLayout>
    );
}