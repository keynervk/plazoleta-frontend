import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pedidosApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";
import { obtenerMisPedidos } from "../utils/misPedidos";
import EstadoPedido, { formatearFecha } from "../components/EstadoPedido";
import Toast from "../components/Toast";

function formatCOP(amount) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
}

const ESTADOS_EN_PROCESO = ["PENDIENTE", "EN_PREPARACION", "LISTO"];

export default function MisPedidos() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();
  const [pedidos] = useState(() => obtenerMisPedidos(usuario?.id));
  // { [idPedido]: { logs: [...], error: string|null } }
  const [trazabilidad, setTrazabilidad] = useState({});
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [toast, setToast] = useState(null);

  function manejar401(err) {
    if (err.response?.status === 401) {
      cerrarSesion();
      navigate("/login");
      return true;
    }
    return false;
  }

  // HU 17: el historial de cambios de estado; el ultimo cambio es el estado actual
  const cargarTrazabilidad = useCallback(async () => {
    setCargando(true);
    const resultados = await Promise.all(
      pedidos.map(async (p) => {
        try {
          const res = await pedidosApi.get(`/pedidos/${p.id}/trazabilidad`);
          return [p.id, { logs: res.data, error: null }];
        } catch (err) {
          if (manejar401(err)) return [p.id, { logs: [], error: null }];
          return [p.id, { logs: [], error: err.response?.data?.mensaje || "No se pudo consultar este pedido." }];
        }
      })
    );
    setTrazabilidad(Object.fromEntries(resultados));
    setCargando(false);
  }, [pedidos]);

  useEffect(() => {
    if (sessionStorage.getItem("pedidoExitoso")) {
      sessionStorage.removeItem("pedidoExitoso");
      setToast({ mensaje: "¡Pedido realizado! Quedó en estado Pendiente.", tipo: "success" });
    }
    cargarTrazabilidad();
  }, [cargarTrazabilidad]);

  // HU 16: si el pedido ya no esta PENDIENTE el backend responde con el mensaje de la HU
  async function cancelarPedido(idPedido) {
    setCancelando(idPedido);
    try {
      await pedidosApi.patch(`/pedidos/${idPedido}/cancelar`);
      setToast({ mensaje: `Pedido #${idPedido} cancelado.`, tipo: "success" });
      await cargarTrazabilidad();
    } catch (err) {
      if (manejar401(err)) return;
      setToast({ mensaje: err.response?.data?.mensaje || "No se pudo cancelar el pedido.", tipo: "error" });
    } finally {
      setCancelando(null);
    }
  }

  function estadoActual(idPedido) {
    const logs = trazabilidad[idPedido]?.logs || [];
    return logs.length ? logs[logs.length - 1].estadoNuevo : null;
  }

  return (
    <div className="main-content">
      {toast && (
        <div className="toast-container">
          <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-header">
        <div className="page-header-text">
          <h1>🧾 Mis Pedidos</h1>
          <p className="text-secondary" style={{ maxWidth: 560 }}>
            Consulta el estado y el historial de tus pedidos. Solo puedes cancelar un pedido mientras siga pendiente.
          </p>
        </div>
        {pedidos.length > 0 && (
          <button onClick={cargarTrazabilidad} disabled={cargando} className="apple-btn apple-btn-secondary">
            {cargando ? "Actualizando..." : "↻ Actualizar"}
          </button>
        )}
      </div>

      {pedidos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <h2>Aún no tienes pedidos</h2>
          <p className="text-secondary" style={{ maxWidth: 440 }}>
            Aquí aparecen los pedidos que realices desde este navegador.
          </p>
          <Link to="/restaurantes" className="apple-btn apple-btn-primary" style={{ marginTop: 16 }}>
            Ver Restaurantes
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {pedidos.map((pedido) => {
            const info = trazabilidad[pedido.id];
            const estado = estadoActual(pedido.id);
            const total = pedido.platos.reduce((s, p) => s + p.precio * p.cantidad, 0);

            return (
              <div key={pedido.id} className="glass-card" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Pedido #{pedido.id}</h3>
                      {estado && <EstadoPedido estado={estado} />}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: 4 }}>
                      {pedido.nombreRestaurante} · {formatearFecha(pedido.fechaCreacion)}
                    </div>
                  </div>

                  {ESTADOS_EN_PROCESO.includes(estado) && (
                    <button
                      onClick={() => cancelarPedido(pedido.id)}
                      disabled={cancelando === pedido.id}
                      className="apple-btn apple-btn-danger apple-btn-sm"
                    >
                      {cancelando === pedido.id ? "Cancelando..." : "Cancelar pedido"}
                    </button>
                  )}
                </div>

                {estado === "LISTO" && (
                  <div
                    style={{
                      backgroundColor: "var(--apple-purple-soft)",
                      color: "var(--apple-purple)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: 16,
                    }}
                  >
                    🔔 Tu pedido está listo. Muestra en el restaurante el PIN que te llegó por SMS.
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
                  {/* Platos */}
                  <div>
                    <div className="apple-label" style={{ marginBottom: 8 }}>Platos</div>
                    {pedido.platos.map((p, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: 6 }}
                      >
                        <span style={{ color: "var(--text-secondary)" }}>{p.nombre} × {p.cantidad}</span>
                        <span style={{ fontWeight: 600 }}>{formatCOP(p.precio * p.cantidad)}</span>
                      </div>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: 8,
                        marginTop: 8,
                        fontWeight: 700,
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: "var(--accent-primary)" }}>{formatCOP(total)}</span>
                    </div>
                  </div>

                  {/* Trazabilidad */}
                  <div>
                    <div className="apple-label" style={{ marginBottom: 8 }}>Historial de estados</div>
                    {!info ? (
                      <div className="skeleton" style={{ height: 60 }} />
                    ) : info.error ? (
                      <div style={{ color: "var(--apple-red)", fontSize: "0.875rem" }}>⚠️ {info.error}</div>
                    ) : (
                      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {info.logs.map((log, i) => (
                          <li
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "6px 0",
                              borderLeft: "2px solid var(--border-strong)",
                              paddingLeft: 12,
                              fontSize: "0.875rem",
                            }}
                          >
                            <EstadoPedido estado={log.estadoNuevo} />
                            <span style={{ color: "var(--text-tertiary)" }}>{formatearFecha(log.fechaCambio)}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
