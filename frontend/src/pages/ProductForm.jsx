import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box, TextField, Button, Typography, Grid, IconButton,
  CircularProgress, Chip, Tooltip, Card, CardContent,
  LinearProgress, useMediaQuery, Dialog, DialogTitle,
  DialogContent, Zoom, Fade, Grow, FormControlLabel, Switch,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon,
  Delete as DeleteIcon, CloudUpload as CloudUploadIcon,
  Image as ImageIcon, Close as CloseIcon,
  CheckCircle as CheckCircleIcon, Info as InfoIcon,
  Straighten as SizeIcon, Restaurant as ToppingIcon,
  Category as CategoryIcon, AttachMoney as MoneyIcon,
  Inventory as StockIcon,
  Fullscreen as FullscreenIcon,
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

const categoryColors = [
  { bg: "#E8F5E9", color: "#2E7D32", border: "#81C784" },
  { bg: "#FFF3E0", color: "#E65100", border: "#FFB74D" },
  { bg: "#E3F2FD", color: "#1565C0", border: "#64B5F6" },
  { bg: "#F3E5F5", color: "#7B1FA2", border: "#BA68C8" },
  { bg: "#FCE4EC", color: "#C62828", border: "#E57373" },
  { bg: "#E0F2F1", color: "#00695C", border: "#4DB6AC" },
  { bg: "#FFF8E1", color: "#F57F17", border: "#FFD54F" },
  { bg: "#EDE7F6", color: "#4527A0", border: "#9575CD" },
];

const defaultData = {
  name: "", description: "", category_id: "", price: "",
  promo_price: "", purchase_price: "", stock: "",
  sizes: "", toppings_config: "",
  image_url: "", imageFile: null,
};

const parseSizesSafe = (v) => {
  if (!v) return [];
  try {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};
const parseToppingsSafe = (v) => {
  if (!v) return [];
  try {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

const fieldMeta = {
  name:           { section: "basic",      label: "Nombre del producto", required: true,  placeholder: "Ej: Burger Especial" },
  description:    { section: "basic",      label: "Descripción",         required: false, placeholder: "Describe el producto..." },
  category_id:    { section: "category",   label: "Categoría",           required: true  },
  price:          { section: "pricing",    label: "Precio de venta ($)", required: true  },
  purchase_price: { section: "pricing",    label: "Costo / precio de compra ($)", required: false },
  promo_price:    { section: "pricing",    label: "Precio promo ($) (opcional)", required: false },
  stock:          { section: "stock",      label: "Stock actual",        required: false },
  sizes:          { section: "sizes",      label: "Configuración de tamaños",  required: false },
  toppings_config:{ section: "toppings",   label: "Configuración de toppings", required: false },
};

const sections = [
  { id: "category",  label: "Categoría",  icon: <CategoryIcon fontSize="small" /> },
  { id: "basic",     label: "Básico",      icon: <InfoIcon fontSize="small" /> },
  { id: "pricing",   label: "Precios",     icon: <MoneyIcon fontSize="small" /> },
  { id: "stock",     label: "Stock",       icon: <StockIcon fontSize="small" /> },
  { id: "media",     label: "Imágenes",    icon: <ImageIcon fontSize="small" /> },
  { id: "sizes",     label: "Tamaños",     icon: <SizeIcon fontSize="small" /> },
  { id: "toppings",  label: "Toppings",    icon: <ToppingIcon fontSize="small" /> },
];

function ProductPreview({ data, categories, theme }) {
  const cat = categories.find((c) => String(c.id) === String(data.category_id));
  const sizeList = parseSizesSafe(data.sizes);
  const toppingGroups = parseToppingsSafe(data.toppings_config);
  const price = parseFloat(data.price) || 0;
  const promo = parseFloat(data.promo_price);
  const cost = parseFloat(data.purchase_price);
  const margin = price > 0 && cost > 0 ? ((price - cost) / price * 100).toFixed(0) : null;

  return (
    <Card sx={{
      borderRadius: "20px",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      position: "sticky",
      top: 100,
      backgroundColor: (t) => t.palette.mode === "dark"
        ? "rgba(255,255,255,0.04)"
        : "#fff",
    }}>
      <Box sx={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        {data.image_url ? (
          <Box
            component="img"
            src={data.image_url}
            alt={data.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box sx={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: (t) => `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.1)}, ${alpha(t.palette.secondary?.main || t.palette.primary.main, 0.05)})`,
          }}>
            <ImageIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          </Box>
        )}
      </Box>
      <CardContent sx={{ p: 2.5 }}>
        {cat && (
          <Chip
            label={cat.name}
            size="small"
            sx={{
              mb: 1, fontWeight: 600, fontSize: "0.7rem",
              background: (categoryColors.find((_, i) => categories.indexOf(cat) % categoryColors.length === i) || categoryColors[0]).bg,
              color: (categoryColors.find((_, i) => categories.indexOf(cat) % categoryColors.length === i) || categoryColors[0]).color,
            }}
          />
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, minHeight: 24 }}>
          {data.name || "Nombre del producto"}
        </Typography>
        {data.description && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.5 }}>
            {data.description}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
          {promo > 0 && promo < price ? (
            <>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "error.main", fontSize: "1.15rem" }}>
                ${promo.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                ${price.toFixed(2)}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" sx={{ fontWeight: 800, color: "primary.main", fontSize: "1.15rem" }}>
              ${price > 0 ? price.toFixed(2) : "0.00"}
            </Typography>
          )}
          {margin !== null && (
            <Chip
              label={`+${margin}%`}
              size="small"
              sx={{
                fontWeight: 700, fontSize: "0.65rem",
                backgroundColor: (t) => alpha(
                  parseFloat(margin) >= 30 ? t.palette.success.main : parseFloat(margin) >= 10 ? t.palette.warning.main : t.palette.error.main,
                  0.15
                ),
                color: (t) => parseFloat(margin) >= 30 ? t.palette.success.main : parseFloat(margin) >= 10 ? t.palette.warning.main : t.palette.error.main,
              }}
            />
          )}
        </Box>
        {sizeList.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Tamaños disponibles
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
              {sizeList.map((s, i) => (
                <Chip key={i} label={`${s.name} $${parseFloat(s.price || 0).toFixed(2)}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
              ))}
            </Box>
          </Box>
        )}
        {toppingGroups.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Extras / Toppings
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
              {toppingGroups.flatMap((g) => g.options || []).slice(0, 6).map((o, i) => (
                <Chip key={i} label={`${o.name} $${parseFloat(o.price || 0).toFixed(2)}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
              ))}
              {toppingGroups.flatMap((g) => g.options || []).length > 6 && (
                <Chip label={`+${toppingGroups.flatMap((g) => g.options || []).length - 6} más`} size="small" sx={{ fontSize: "0.7rem" }} />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function SectionHeader({ icon, label, filled, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", alignItems: "center", gap: 1, mb: 2, cursor: "pointer",
        userSelect: "none",
      }}
    >
      <Box sx={{
        width: 32, height: 32, borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: filled ? "success.main" : "action.hover",
        color: filled ? "#fff" : "text.secondary",
        transition: "all 0.3s",
      }}>
        {filled ? <CheckCircleIcon fontSize="small" /> : icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function ProductForm({ user, onLogout }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const isEditing = Boolean(id);

  const [data, setData] = useState(defaultData);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const formRef = useRef(null);
  const formSectionRef = useRef({});
  const dataRef = useRef(data);
  const loadingRef = useRef(loading);
  const errorsRef = useRef(errors);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { errorsRef.current = errors; }, [errors]);
  const dirtyRef = useRef(dirty);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  const sectionFilled = useCallback((sectionId) => {
    if (sectionId === "category") return !!data.category_id;
    if (sectionId === "media") return !!data.image_url;
    if (sectionId === "sizes") return !!data.sizes;
    if (sectionId === "toppings") return !!data.toppings_config;
    return false;
  }, [data]);

  const filledCount = useMemo(() => {
    return sections.filter((s) => sectionFilled(s.id)).length;
  }, [sectionFilled]);

  const fillPercentage = useMemo(() => {
    const filled = [!!data.name, !!data.category_id, !!data.price, !!data.stock].filter(Boolean).length;
    return Math.round((filled / 4) * 100);
  }, [data]);

  const price = parseFloat(data.price) || 0;
  const cost = parseFloat(data.purchase_price) || 0;
  const promo = parseFloat(data.promo_price);
  const hasRealPromo = !isNaN(promo) && promo > 0 && promo < price;
  const margin = price > 0 && cost > 0 ? ((price - cost) / price * 100).toFixed(1) : null;

  const validate = useCallback((d) => {
    const e = {};
    if (!d.name?.trim()) e.name = "El nombre es obligatorio";
    if (!d.category_id) e.category_id = "Selecciona una categoría";
    if (!d.price || parseFloat(d.price) <= 0) e.price = "El precio debe ser mayor a 0";
    if (d.purchase_price && d.price && parseFloat(d.purchase_price) > parseFloat(d.price))
      e.purchase_price = "El costo no puede ser mayor al precio";
    if (d.stock !== "" && d.stock !== undefined && parseInt(d.stock) < 0)
      e.stock = "El stock no puede ser negativo";
    return e;
  }, []);

  useEffect(() => {
    if (isEditing) {
      setPageLoading(true);
      fetch(`/api/products/${id}`, {
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
            purchase_price: d.purchase_price ?? "",
            stock: d.stock ?? "",
            sizes: d.sizes || "",
            toppings_config: d.toppings_config || "",
            image_url: d.image_url || "",
            imageFile: null,
          });
        })
        .catch(() => setToast({ open: true, message: "Error al cargar el producto", severity: "error" }))
        .finally(() => setPageLoading(false));
    }
  }, [id, isEditing, token]);

  useEffect(() => {
    fetch(`/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : d.categories || []))
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setToast({ open: true, message: "Error al cargar categorías", severity: "error" });
      });
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors(validate(data));
    }, 300);
    return () => clearTimeout(timer);
  }, [data, validate]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!loadingRef.current && Object.keys(errorsRef.current).length === 0) handleSubmitRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dirtyRef.current && !loadingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleChange = (field) => (e) => {
    let value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (["price", "promo_price", "purchase_price", "stock"].includes(field)) {
      value = value === "" ? "" : value.replace(/[^0-9.]/g, "");
    }
    setData((d) => ({ ...d, [field]: value }));
    setDirty(true);
  };

  const handleBlur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleCategoryImage = (catId) => {
    const cat = categories.find((c) => String(c.id) === String(catId));
    if (cat?.image_url) {
      setData((d) => ({ ...d, image_url: cat.image_url, category_id: catId }));
    } else {
      setData((d) => ({ ...d, category_id: catId }));
    }
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

  const handleSizesChange = (idx, field, value) => {
    setData((d) => {
      const list = parseSizesSafe(d.sizes).map((s, i) => ({ ...s }));
      if (!list[idx]) return d;
      list[idx][field] = value;
      return { ...d, sizes: JSON.stringify(list) };
    });
    setDirty(true);
  };

  const addSize = () => {
    setData((d) => {
      const list = parseSizesSafe(d.sizes);
      list.push({ name: "", price: "", stock: "" });
      return { ...d, sizes: JSON.stringify(list) };
    });
    setDirty(true);
  };

  const removeSize = (idx) => {
    setData((d) => {
      const list = parseSizesSafe(d.sizes).filter((_, i) => i !== idx);
      return { ...d, sizes: list.length ? JSON.stringify(list) : "" };
    });
    setDirty(true);
  };

  const handleToppingsConfigChange = (groupIdx, field, value) => {
    setData((d) => {
      const groups = parseToppingsSafe(d.toppings_config).map((g) => ({
        ...g, options: [...(g.options || [])],
      }));
      if (!groups[groupIdx]) return d;
      groups[groupIdx][field] = value;
      return { ...d, toppings_config: JSON.stringify(groups) };
    });
    setDirty(true);
  };

  const handleToppingOptionChange = (groupIdx, optIdx, field, value) => {
    setData((d) => {
      const groups = parseToppingsSafe(d.toppings_config).map((g) => ({
        ...g, options: [...(g.options || [])],
      }));
      if (!groups[groupIdx]?.options?.[optIdx]) return d;
      groups[groupIdx].options[optIdx] = { ...groups[groupIdx].options[optIdx], [field]: value };
      return { ...d, toppings_config: JSON.stringify(groups) };
    });
    setDirty(true);
  };

  const addToppingGroup = () => {
    setData((d) => {
      const groups = parseToppingsSafe(d.toppings_config);
      groups.push({ group_name: "", required: false, min: 0, max: 0, options: [{ name: "", price: "" }] });
      return { ...d, toppings_config: JSON.stringify(groups) };
    });
    setDirty(true);
  };

  const addToppingOption = (groupIdx) => {
    setData((d) => {
      const groups = parseToppingsSafe(d.toppings_config).map((g) => ({
        ...g, options: [...(g.options || [])],
      }));
      if (!groups[groupIdx]) return d;
      groups[groupIdx].options.push({ name: "", price: "" });
      return { ...d, toppings_config: JSON.stringify(groups) };
    });
    setDirty(true);
  };

  const removeToppingOption = (groupIdx, optIdx) => {
    setData((d) => {
      const groups = parseToppingsSafe(d.toppings_config).map((g) => ({
        ...g, options: [...(g.options || [])],
      }));
      if (!groups[groupIdx]) return d;
      groups[groupIdx].options = groups[groupIdx].options.filter((_, i) => i !== optIdx);
      return { ...d, toppings_config: JSON.stringify(groups) };
    });
    setDirty(true);
  };

  const removeToppingGroup = (groupIdx) => {
    setData((d) => {
      const groups = parseToppingsSafe(d.toppings_config).filter((_, i) => i !== groupIdx);
      return { ...d, toppings_config: groups.length ? JSON.stringify(groups) : "" };
    });
    setDirty(true);
  };

  const handleSubmit = async () => {
    const validation = validate(data);
    setErrors(validation);
    setTouched({
      name: true, category_id: true, price: true, stock: true,
      purchase_price: true, promo_price: true,
    });
    if (Object.keys(validation).length > 0) {
      const firstErrorField = Object.keys(validation)[0];
      const el = formSectionRef.current[fieldMeta[firstErrorField]?.section];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
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
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
        image_url: data.image_url || null,
        stock: data.stock !== "" ? parseInt(data.stock) || 0 : 0,
        sizes: data.sizes || null,
        toppings_config: data.toppings_config || null,
        category_id: parseInt(data.category_id) || null,
        store_id: user?.storeId || user?.store_id || null,
      };
      let body;
      let headers = { Authorization: `Bearer ${token}` };
      if (data.imageFile) {
        body = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) body.append(k, String(v));
        });
        body.append("image", data.imageFile);
      } else {
        body = JSON.stringify(payload);
        headers["Content-Type"] = "application/json";
      }
      const url = isEditing
        ? `/api/products/${id}`
        : `/api/products`;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers,
        body,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || result.message || "Error al guardar");
      setDirty(false);
      setToast({ open: true, message: isEditing ? "Producto actualizado" : "Producto creado", severity: "success" });
      setTimeout(() => navigate("/admin"), 1200);
    } catch (err) {
      setToast({ open: true, message: err.message || "Error al guardar el producto", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  const handleCancel = () => {
    if (dirty) {
      setPendingNav("/admin");
      setConfirmOpen(true);
    } else {
      navigate("/admin");
    }
  };

  const handleConfirmNav = () => {
    setConfirmOpen(false);
    if (pendingNav) {
      setDirty(false);
      navigate(pendingNav);
    }
  };

  const scrollToSection = (sectionId) => {
    const el = formSectionRef.current[sectionId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (user?.role === 'STAFF') return <Navigate to="/admin/pos" />

  if (pageLoading) {
    return (
      <AdminLayout title={isEditing ? "Editar Producto" : "Nuevo Producto"} user={user} onLogout={onLogout}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  const sizes = parseSizesSafe(data.sizes);
  const toppingGroups = parseToppingsSafe(data.toppings_config);

  return (
    <AdminLayout>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
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
                {isEditing ? "Editar producto" : "Nuevo producto"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {isEditing ? `Modificando "${data.name || "..."}"` : "Completa la información para agregar un producto"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Tooltip title="Vista previa en pantalla completa" arrow>
                <IconButton onClick={() => setPreviewOpen(true)} sx={{ display: { md: "none" } }}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Guardar (Ctrl+S)" arrow>
                <span>
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
                      "&:hover": { boxShadow: "0 6px 20px rgba(102,126,234,0.6)", transform: "translateY(-1px)" },
                    }}
                  >
                    {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear producto"}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Cancelar" arrow>
                <IconButton onClick={handleCancel} sx={{ color: "text.secondary" }}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{
            display: "flex", gap: 3,
            flexDirection: { xs: "column-reverse", md: "row" },
          }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {isMobile && (
                <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
                  <ProductPreview data={data} categories={categories} theme={theme} />
                </Box>
              )}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
                {sections.map((s) => (
                  <Chip
                    key={s.id}
                    icon={s.icon}
                    label={s.label}
                    size="small"
                    onClick={() => scrollToSection(s.id)}
                    sx={{
                      fontWeight: 600, borderRadius: "10px", px: 1,
                      backgroundColor: sectionFilled(s.id)
                        ? (t) => alpha(t.palette.success.main, 0.12)
                        : "action.hover",
                      color: sectionFilled(s.id) ? "success.main" : "text.secondary",
                      "&:hover": { backgroundColor: (t) => alpha(t.palette.primary.main, 0.12) },
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>

              <Box ref={formRef}>
                {/* CATEGORY SECTION */}
                <Box ref={(el) => (formSectionRef.current.category = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<CategoryIcon fontSize="small" />} label="Categoría" filled={!!data.category_id} onClick={() => scrollToSection("category")} />
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Selecciona la categoría. Si la categoría tiene imagen, se usará como imagen del producto.
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {categories.map((cat, idx) => {
                      const colors = categoryColors[idx % categoryColors.length];
                      const isSelected = String(data.category_id) === String(cat.id);
                      return (
                        <Chip
                          key={cat.id}
                          label={cat.name}
                          onClick={() => handleCategoryImage(cat.id)}
                          sx={{
                            fontWeight: 600, borderRadius: "10px", px: 1.5, py: 2.5,
                            fontSize: "0.85rem",
                            backgroundColor: isSelected ? colors.bg : "action.hover",
                            color: isSelected ? colors.color : "text.secondary",
                            border: `2px solid ${isSelected ? colors.border : "transparent"}`,
                            boxShadow: isSelected ? `0 2px 8px ${alpha(colors.border, 0.4)}` : "none",
                            transition: "all 0.2s",
                            "&:hover": { backgroundColor: colors.bg, color: colors.color, transform: "translateY(-1px)" },
                          }}
                        />
                      );
                    })}
                  </Box>
                  {touched.category_id && errors.category_id && (
                    <Typography variant="caption" sx={{ color: "error.main", mt: 1, display: "block" }}>
                      {errors.category_id}
                    </Typography>
                  )}
                </Box>

                {/* BASIC INFO SECTION */}
                <Box ref={(el) => (formSectionRef.current.basic = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<InfoIcon fontSize="small" />} label="Información básica" filled={!!data.name} onClick={() => scrollToSection("basic")} />
                  <Grid container spacing={2}>
                    <Grid xs={12}>
                      <TextField
                        fullWidth label={fieldMeta.name.label} value={data.name}
                        onChange={handleChange("name")} onBlur={handleBlur("name")}
                        placeholder={fieldMeta.name.placeholder}
                        error={touched.name && !!errors.name} helperText={touched.name && errors.name}
                        required sx={inputSx}
                      />
                    </Grid>
                    <Grid xs={12}>
                      <TextField
                        fullWidth label={fieldMeta.description.label} value={data.description}
                        onChange={handleChange("description")} onBlur={handleBlur("description")}
                        placeholder={fieldMeta.description.placeholder}
                        multiline minRows={2} maxRows={5} sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* PRICING SECTION */}
                <Box ref={(el) => (formSectionRef.current.pricing = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<MoneyIcon fontSize="small" />} label="Precios" filled={!!data.price} onClick={() => scrollToSection("pricing")} />
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth label={fieldMeta.price.label} value={data.price}
                        onChange={handleChange("price")} onBlur={handleBlur("price")}
                        required type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        error={touched.price && !!errors.price} helperText={touched.price && errors.price}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth label={fieldMeta.purchase_price.label} value={data.purchase_price}
                        onChange={handleChange("purchase_price")} onBlur={handleBlur("purchase_price")}
                        type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        error={touched.purchase_price && !!errors.purchase_price}
                        helperText={touched.purchase_price && errors.purchase_price}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth label={fieldMeta.promo_price.label} value={data.promo_price}
                        onChange={handleChange("promo_price")} onBlur={handleBlur("promo_price")}
                        type="number" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        error={touched.promo_price && !!errors.promo_price}
                        helperText={touched.promo_price && errors.promo_price}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                  {(margin !== null || hasRealPromo) && (
                    <Box sx={{
                      mt: 2, p: 1.5, borderRadius: "12px",
                      backgroundColor: (t) => alpha(t.palette.info.main, 0.06),
                      border: "1px solid", borderColor: (t) => alpha(t.palette.info.main, 0.15),
                    }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                        {margin !== null && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>Margen:</Typography>
                            <Chip
                              label={`${margin}%`}
                              size="small"
                              sx={{
                                fontWeight: 700, height: 22, fontSize: "0.7rem",
                                backgroundColor: (t) => alpha(
                                  parseFloat(margin) >= 30 ? t.palette.success.main : parseFloat(margin) >= 10 ? t.palette.warning.main : t.palette.error.main,
                                  0.15
                                ),
                                color: (t) => parseFloat(margin) >= 30 ? t.palette.success.main : parseFloat(margin) >= 10 ? t.palette.warning.main : t.palette.error.main,
                              }}
                            />
                          </Box>
                        )}
                        {hasRealPromo && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>Descuento:</Typography>
                            <Chip
                              label={`-${((1 - promo / price) * 100).toFixed(0)}%`}
                              size="small"
                              sx={{ fontWeight: 700, height: 22, fontSize: "0.7rem", backgroundColor: (t) => alpha(t.palette.error.main, 0.12), color: "error.main" }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* STOCK SECTION */}
                <Box ref={(el) => (formSectionRef.current.stock = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<StockIcon fontSize="small" />} label="Inventario" filled={!!data.stock} onClick={() => scrollToSection("stock")} />
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <TextField
                        fullWidth label={fieldMeta.stock.label} value={data.stock}
                        onChange={handleChange("stock")} onBlur={handleBlur("stock")}
                        type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }}
                        error={touched.stock && !!errors.stock} helperText={touched.stock && errors.stock}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* MEDIA SECTION */}
                <Box ref={(el) => (formSectionRef.current.media = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<ImageIcon fontSize="small" />} label="Imagen del producto" filled={!!data.image_url} onClick={() => scrollToSection("media")} />
                  {data.image_url ? (
                    <Box sx={{ position: "relative", borderRadius: "16px", overflow: "hidden", mb: 2 }}>
                      <Box component="img" src={data.image_url} alt="Vista previa"
                        sx={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} />
                      <IconButton onClick={removeImage}
                        sx={{
                          position: "absolute", top: 8, right: 8,
                          backgroundColor: "rgba(0,0,0,0.6)", color: "#fff",
                          "&:hover": { backgroundColor: "rgba(211,47,47,0.9)" },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      component="label"
                      sx={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        p: 4, mb: 2, borderRadius: "16px", cursor: "pointer",
                        border: "2px dashed", borderColor: "divider",
                        backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                        "&:hover": { borderColor: "primary.main", backgroundColor: (t) => alpha(t.palette.primary.main, 0.04) },
                        transition: "all 0.2s",
                      }}
                    >
                      <input type="file" accept="image/*" hidden onChange={handleImageFile} />
                      <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Arrastra o haz clic para subir
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                        JPG, PNG, WebP — máximo 5 MB
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* SIZES SECTION */}
                <Box ref={(el) => (formSectionRef.current.sizes = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<SizeIcon fontSize="small" />} label="Tamaños (opcional)" filled={!!data.sizes} onClick={() => scrollToSection("sizes")} />
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Define variantes de tamaño con su propio precio y stock.
                  </Typography>
                  {sizes.map((size, idx) => (
                    <Grow in key={idx} timeout={300}>
                      <Box sx={{
                        display: "flex", gap: 1, mb: 1.5, alignItems: "center",
                        p: 1.5, borderRadius: "12px",
                        backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: "1px solid", borderColor: "divider",
                      }}>
                        <TextField
                          label="Nombre" value={size.name}
                          onChange={(e) => handleSizesChange(idx, "name", e.target.value)}
                          size="small" sx={{ flex: 2, ...inputSx }}
                        />
                        <TextField
                          label="Precio" value={size.price} type="number"
                          onChange={(e) => handleSizesChange(idx, "price", e.target.value)}
                          size="small" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          sx={{ flex: 1, ...inputSx }}
                        />
                        <TextField
                          label="Stock" value={size.stock} type="number"
                          onChange={(e) => handleSizesChange(idx, "stock", e.target.value)}
                          size="small" slotProps={{ htmlInput: { min: 0, step: 1 } }}
                          sx={{ flex: 1, ...inputSx }}
                        />
                        <Tooltip title="Eliminar tamaño" arrow>
                          <IconButton onClick={() => removeSize(idx)} size="small" sx={{ color: "error.main" }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grow>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={addSize} sx={{ mt: 1, textTransform: "none", fontWeight: 600, borderRadius: "10px" }}>
                    Agregar tamaño
                  </Button>
                </Box>

                {/* TOPPINGS SECTION */}
                <Box ref={(el) => (formSectionRef.current.toppings = el)} sx={{ ...sectionBox, p: { xs: 2, md: 3 }, mb: 2.5 }}>
                  <SectionHeader icon={<ToppingIcon fontSize="small" />} label="Toppings / Extras (opcional)" filled={!!data.toppings_config} onClick={() => scrollToSection("toppings")} />
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Crea grupos de extras (ej: "Salsas", "Aderezos") con opciones y precios.
                  </Typography>
                  {toppingGroups.map((group, gIdx) => (
                    <Grow in key={gIdx} timeout={300}>
                      <Box sx={{
                        mb: 2, p: 2, borderRadius: "14px",
                        border: "1px solid", borderColor: "divider",
                        backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                      }}>
                        <Box sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}>
                          <TextField
                            label="Nombre del grupo" value={group.group_name}
                            onChange={(e) => handleToppingsConfigChange(gIdx, "group_name", e.target.value)}
                            size="small" sx={{ flex: 1, ...inputSx }}
                            placeholder="Ej: Salsas, Aderezos..."
                          />
                          <FormControlLabel
                            control={<Switch size="small" checked={!!group.required}
                              onChange={(e) => handleToppingsConfigChange(gIdx, "required", e.target.checked)} />}
                            label={<Typography variant="caption">Requerido</Typography>}
                          />
                          <Tooltip title="Eliminar grupo" arrow>
                            <IconButton onClick={() => removeToppingGroup(gIdx)} size="small" sx={{ color: "error.main" }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Grid container spacing={1} sx={{ mb: 1 }}>
                          <Grid xs={6}>
                            <TextField
                              label="Mín. selecciones" value={group.min ?? 0} type="number"
                              onChange={(e) => handleToppingsConfigChange(gIdx, "min", parseInt(e.target.value) || 0)}
                              size="small" slotProps={{ htmlInput: { min: 0 } }}
                              sx={inputSx}
                            />
                          </Grid>
                          <Grid xs={6}>
                            <TextField
                              label="Máx. selecciones" value={group.max ?? 0} type="number"
                              onChange={(e) => handleToppingsConfigChange(gIdx, "max", parseInt(e.target.value) || 0)}
                              size="small" slotProps={{ htmlInput: { min: 0 } }}
                              sx={inputSx}
                            />
                          </Grid>
                        </Grid>
                        {(group.options || []).map((opt, oIdx) => (
                          <Box key={oIdx} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                            <TextField
                              label={`Opción ${oIdx + 1}`} value={opt.name}
                              onChange={(e) => handleToppingOptionChange(gIdx, oIdx, "name", e.target.value)}
                              size="small" sx={{ flex: 2, ...inputSx }}
                            />
                            <TextField
                              label="Precio" value={opt.price} type="number"
                              onChange={(e) => handleToppingOptionChange(gIdx, oIdx, "price", e.target.value)}
                              size="small" slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                              sx={{ flex: 1, ...inputSx }}
                            />
                            <Tooltip title="Eliminar opción" arrow>
                              <IconButton onClick={() => removeToppingOption(gIdx, oIdx)} size="small" sx={{ color: "text.secondary" }}>
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                        <Button startIcon={<AddIcon />} onClick={() => addToppingOption(gIdx)} size="small" sx={{ mt: 0.5, textTransform: "none" }}>
                          Agregar opción
                        </Button>
                      </Box>
                    </Grow>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={addToppingGroup} sx={{ mt: 1, textTransform: "none", fontWeight: 600, borderRadius: "10px" }}>
                    Agregar grupo de toppings
                  </Button>
                </Box>
              </Box>

              <Box sx={{
                display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3, pb: 4,
                position: "sticky", bottom: 0, py: 2,
                backgroundColor: (t) => t.palette.mode === "dark" ? "rgba(18,18,18,0.95)" : "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)", borderRadius: "16px",
                border: "1px solid", borderColor: "divider",
              }}>
                <Button
                  variant="outlined" onClick={handleCancel}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: "12px", fontWeight: 600, textTransform: "none", px: 3, py: 1.2 }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained" onClick={handleSubmit} disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{
                    borderRadius: "12px", fontWeight: 700, textTransform: "none", px: 4, py: 1.2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                    "&:hover": { boxShadow: "0 6px 20px rgba(102,126,234,0.6)", transform: "translateY(-1px)" },
                  }}
                >
                  {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear producto"}
                </Button>
              </Box>
            </Box>

            {!isMobile && (
              <Box sx={{ width: 340, flexShrink: 0, display: { xs: "none", md: "block" } }}>
                <ProductPreview data={data} categories={categories} theme={theme} />
                {fillPercentage < 100 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Progreso del formulario
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: fillPercentage >= 75 ? "success.main" : "primary.main" }}>
                        {fillPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={fillPercentage}
                      sx={{
                        height: 6, borderRadius: 3,
                        backgroundColor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: fillPercentage >= 75
                            ? "linear-gradient(90deg, #4CAF50, #66BB6A)"
                            : "linear-gradient(90deg, #667eea, #764ba2)",
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Fade>

      <Dialog
        open={previewOpen} onClose={() => setPreviewOpen(false)}
        fullScreen={isMobile} maxWidth="sm" fullWidth
        TransitionComponent={Zoom}
        slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : "20px", overflow: "hidden" } } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Vista previa</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <ProductPreview data={data} categories={categories} theme={theme} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}