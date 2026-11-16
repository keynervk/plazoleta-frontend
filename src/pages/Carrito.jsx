import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { pedidosApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";
import { guardarMiPedido } from "../utils/misPedidos";
import Toast from "../components/Toast";
import ImagenConRespaldo, { emojiDePlato } from "../components/ImagenConRespaldo";

function formatCOP(amount) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
}

export default function Carrito() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();
  const { items, idRestaurante, nombreRestaurante, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, totalItems, totalPrecio } = useCarrito();

  const [cargandoPedido, setCargandoPedido] = useState(false);
  const [errorPedido, setErrorPedido] = useState(null);
  const [toast, setToast] = useState(null);

  async function handleConfirmarPedido() {
    if (items.length === 0) return;
    setErrorPedido(null);
    setCargandoPedido(true);
    try {
      const res = await pedidosApi.post("/pedidos", {
        idRestaurante,
        platos: items.map((i) => ({ idPlato: i.idPlato, cantidad: i.cantidad })),
      });
      guardarMiPedido(usuario?.id, {
        id: res.data.id,
        nombreRestaurante,
        fechaCreacion: res.data.fechaCreacion,
        platos: items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
      });
      vaciarCarrito();
      sessionStorage.setItem("pedidoExitoso", "1");
      navigate("/mi-pedido");
    } catch (err) {
      if (err.response?.status === 401) {
        cerrarSesion();
        navigate("/login");
        return;
      }
      const mensaje = err.response?.data?.mensaje || "Error al realizar el pedido.";
      const status = err.response?.status;
      setErrorPedido({ mensaje, status });
    } finally {
      setCargandoPedido(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="main-content">
        {toast && (
          <div className="toast-container">
            <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
          </div>
        )}
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p className="text-secondary">Agrega platos desde un restaurante para comenzar tu pedido.</p>
          <Link to="/restaurantes" className="apple-btn apple-btn-primary" style={{ marginTop: 16 }}>
            Ver Restaurantes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {toast && (
        <div className="toast-container">
          <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-header-text">🛒 Tu Carrito</h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Restaurante: <strong>{nombreRestaurante}</strong> · {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
          </p>
        </div>
        <button onClick={vaciarCarrito} className="apple-btn apple-btn-secondary">
          Vaciar carrito
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr min(360px, 100%)",
          gap: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* Items List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.idPlato}
              className="glass-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 16,
                borderRadius: "var(--radius-lg)",
              }}
            >
              {/* Image */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "var(--bg-tertiary)",
                }}
              >
                <ImagenConRespaldo
                  src={item.urlImagen}
                  alt={item.nombre}
                  semilla={item.idPlato}
                  contenido={emojiDePlato(item.nombre, item.categoria)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", fontSize: "1.8rem" }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 2 }}>{item.nombre}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 6 }}>{item.categoria}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {formatCOP(item.precio)} × {item.cantidad} = <strong style={{ color: "var(--text-primary)" }}>{formatCOP(item.precio * item.cantidad)}</strong>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-pill)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => actualizarCantidad(item.idPlato, item.cantidad - 1)}
                  style={{
                    padding: "4px 10px",
                    background: "var(--bg-tertiary)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    color: "var(--text-primary)",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    padding: "4px 10px",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    minWidth: 28,
                    textAlign: "center",
                    background: "var(--bg-primary)",
                  }}
                >
                  {item.cantidad}
                </span>
                <button
                  onClick={() => actualizarCantidad(item.idPlato, item.cantidad + 1)}
                  disabled={item.cantidad >= 10}
                  style={{
                    padding: "4px 10px",
                    background: "var(--bg-tertiary)",
                    border: "none",
                    cursor: item.cantidad >= 10 ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    color: item.cantidad >= 10 ? "var(--text-tertiary)" : "var(--text-primary)",
                  }}
                >
                  +
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => eliminarDelCarrito(item.idPlato)}
                className="apple-btn apple-btn-danger apple-btn-sm"
                title="Eliminar del carrito"
                style={{ borderRadius: "var(--radius-pill)", padding: "6px 10px" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          className="glass-card"
          style={{ padding: 24, borderRadius: "var(--radius-xl)", position: "sticky", top: 100 }}
        >
          <h3 style={{ marginBottom: 16, fontSize: "1.1rem" }}>Resumen del pedido</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {items.map((item) => (
              <div key={item.idPlato} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>
                  {item.nombre} × {item.cantidad}
                </span>
                <span style={{ fontWeight: 600 }}>{formatCOP(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: 16,
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--accent-primary)" }}>
              {formatCOP(totalPrecio)}
            </span>
          </div>

          {errorPedido && (
            <div
              style={{
                backgroundColor: "var(--apple-red-soft)",
                border: "1px solid rgba(255, 59, 48, 0.25)",
                color: "var(--apple-red)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                marginBottom: 16,
              }}
            >
              <div style={{ marginBottom: 6 }}>⚠️ {errorPedido.mensaje}</div>
              {errorPedido.status === 409 && (
                <Link
                  to="/mi-pedido"
                  style={{ color: "var(--apple-red)", fontWeight: 700, textDecoration: "underline" }}
                >
                  Ver mi pedido activo →
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handleConfirmarPedido}
            disabled={cargandoPedido}
            className="apple-btn apple-btn-primary apple-btn-lg"
            style={{ width: "100%" }}
          >
            {cargandoPedido ? "Procesando..." : "Confirmar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
