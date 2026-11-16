import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pedidosApi, plazoletaApi, usuariosApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";
import EstadoPedido, { ESTADOS_PEDIDO, textoEstado, formatearFecha } from "../components/EstadoPedido";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

export default function PedidosEmpleado() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  const [restaurante, setRestaurante] = useState(null);
  const [nombresPlatos, setNombresPlatos] = useState({});

  const [estado, setEstado] = useState("PENDIENTE");
  const [pagina, setPagina] = useState(0);
  const [tamanioPagina, setTamanioPagina] = useState(10);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [procesando, setProcesando] = useState(null);
  const [pedidoAEntregar, setPedidoAEntregar] = useState(null);
  const [pin, setPin] = useState("");
  const [errorPin, setErrorPin] = useState(null);
  const [toast, setToast] = useState(null);

  function manejar401(err) {
    if (err.response?.status === 401) {
      cerrarSesion();
      navigate("/login");
      return true;
    }
    return false;
  }

  // Restaurante del empleado y nombres de sus platos (el pedido solo trae idPlato)
  useEffect(() => {
    async function cargarRestaurante() {
      try {
        const resUsuario = await usuariosApi.get(`/usuarios/${usuario.id}`);
        const idRestaurante = resUsuario.data.idRestaurante;
        if (!idRestaurante) return;
        const [resRestaurante, resPlatos] = await Promise.all([
          plazoletaApi.get(`/restaurantes/${idRestaurante}`),
          plazoletaApi.get(`/platos?idRestaurante=${idRestaurante}`),
        ]);
        setRestaurante(resRestaurante.data);
        setNombresPlatos(Object.fromEntries(resPlatos.data.map((p) => [p.id, p.nombre])));
      } catch (err) {
        manejar401(err);
      }
    }
    cargarRestaurante();
  }, [usuario?.id]);

  // HU 12: pedidos del restaurante del empleado filtrados por estado y paginados.
  // El backend devuelve solo la lista de la pagina pedida.
  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await pedidosApi.get("/pedidos", { params: { estado, pagina, tamanioPagina } });
      setPedidos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (manejar401(err)) return;
      setError(err.response?.data?.mensaje || "No se pudieron cargar los pedidos.");
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }, [estado, pagina, tamanioPagina]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  function cambiarEstadoFiltro(nuevo) {
    setEstado(nuevo);
    setPagina(0);
  }

  // HU 13 (asignar) y HU 14 (listo, envia el PIN por SMS)
  async function ejecutarAccion(pedido, accion, mensajeExito) {
    setProcesando(pedido.id);
    try {
      await pedidosApi.patch(`/pedidos/${pedido.id}/${accion}`);
      setToast({ mensaje: mensajeExito, tipo: "success" });
      await cargarPedidos();
    } catch (err) {
      if (manejar401(err)) return;
      setToast({ mensaje: err.response?.data?.mensaje || "No se pudo actualizar el pedido.", tipo: "error" });
    } finally {
      setProcesando(null);
    }
  }

  function abrirEntrega(pedido) {
    setPedidoAEntregar(pedido);
    setPin("");
    setErrorPin(null);
  }

  // HU 15: entregar validando el PIN que el cliente recibio por SMS
  async function confirmarEntrega(e) {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorPin("Ingresa el PIN que el cliente recibió por SMS.");
      return;
    }
    setProcesando(pedidoAEntregar.id);
    setErrorPin(null);
    try {
      await pedidosApi.patch(`/pedidos/${pedidoAEntregar.id}/entregar`, { pin: pin.trim() });
      setToast({ mensaje: `Pedido #${pedidoAEntregar.id} entregado.`, tipo: "success" });
      setPedidoAEntregar(null);
      await cargarPedidos();
    } catch (err) {
      if (manejar401(err)) return;
      setErrorPin(err.response?.data?.mensaje || "No se pudo entregar el pedido.");
    } finally {
      setProcesando(null);
    }
  }

  function textoEmpleado(idEmpleado) {
    if (!idEmpleado) return "Sin asignar";
    return idEmpleado === usuario?.id ? "Asignado a ti" : `Empleado #${idEmpleado}`;
  }

  const hayPaginaSiguiente = pedidos.length === tamanioPagina;

  return (
    <div className="main-content">
      {toast && (
        <div className="toast-container">
          <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="page-header">
        <div className="page-header-text">
          <h1>📋 Pedidos del Restaurante</h1>
          <p className="text-secondary">
            {restaurante ? restaurante.nombre : "Tu restaurante"} · del más antiguo al más reciente
          </p>
        </div>
        <button onClick={cargarPedidos} disabled={cargando} className="apple-btn apple-btn-secondary">
          {cargando ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      <div className="category-tabs">
        {ESTADOS_PEDIDO.map((e) => (
          <button
            key={e}
            onClick={() => cambiarEstadoFiltro(e)}
            className={`category-tab ${estado === e ? "active" : ""}`}
          >
            {textoEstado(e)}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "var(--apple-red-soft)",
            border: "1px solid rgba(255, 59, 48, 0.25)",
            color: "var(--apple-red)",
            padding: "14px 18px",
            borderRadius: "var(--radius-lg)",
            marginBottom: 24,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {cargando ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: 120, borderRadius: 20 }} />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        !error && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 style={{ fontSize: "1.25rem" }}>No hay pedidos en estado {textoEstado(estado)}</h3>
          </div>
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="glass-card"
              style={{
                padding: 20,
                borderRadius: "var(--radius-lg)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Pedido #{pedido.id}</h3>
                  <EstadoPedido estado={pedido.estado} />
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginBottom: 10 }}>
                  {formatearFecha(pedido.fechaCreacion)} · Cliente #{pedido.idCliente} ·{" "}
                  {textoEmpleado(pedido.idEmpleadoAsignado)}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {pedido.platos.map((p) => (
                    <span
                      key={p.idPlato}
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-pill)",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.cantidad} × {nombresPlatos[p.idPlato] || `Plato #${p.idPlato}`}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                {pedido.estado === "PENDIENTE" && (
                  <button
                    onClick={() => ejecutarAccion(pedido, "asignar", `Te asignaste el pedido #${pedido.id}.`)}
                    disabled={procesando === pedido.id}
                    className="apple-btn apple-btn-primary"
                  >
                    {procesando === pedido.id ? "Asignando..." : "🙋 Asignarme"}
                  </button>
                )}
                {pedido.estado === "EN_PREPARACION" && (
                  <button
                    onClick={() =>
                      ejecutarAccion(pedido, "listo", `Pedido #${pedido.id} listo. Se envió el PIN al cliente por SMS.`)
                    }
                    disabled={procesando === pedido.id}
                    className="apple-btn apple-btn-primary"
                  >
                    {procesando === pedido.id ? "Guardando..." : "✅ Marcar como listo"}
                  </button>
                )}
                {pedido.estado === "LISTO" && (
                  <button onClick={() => abrirEntrega(pedido)} className="apple-btn apple-btn-primary">
                    📦 Entregar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginacion */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginTop: 32,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setPagina((p) => Math.max(0, p - 1))}
          disabled={pagina === 0}
          className="apple-btn apple-btn-outline"
        >
          ← Anterior
        </button>
        <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Página {pagina + 1}</span>
        <button
          onClick={() => setPagina((p) => p + 1)}
          disabled={!hayPaginaSiguiente}
          className="apple-btn apple-btn-outline"
        >
          Siguiente →
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>Por página:</label>
          <select
            className="apple-select"
            value={tamanioPagina}
            onChange={(e) => {
              setTamanioPagina(Number(e.target.value));
              setPagina(0);
            }}
            style={{ padding: "6px 12px", fontSize: "0.875rem" }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* MODAL: ENTREGAR CON PIN */}
      <Modal
        isOpen={pedidoAEntregar !== null}
        onClose={() => setPedidoAEntregar(null)}
        title={`Entregar pedido #${pedidoAEntregar?.id ?? ""}`}
        maxWidth={420}
      >
        {errorPin && (
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
            ⚠️ {errorPin}
          </div>
        )}
        <form onSubmit={confirmarEntrega}>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="apple-label">PIN de seguridad del cliente *</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="apple-input"
              placeholder="Ej. 482913"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              style={{ fontSize: "1.25rem", letterSpacing: "0.3em", textAlign: "center" }}
              autoFocus
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setPedidoAEntregar(null)} className="apple-btn apple-btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={procesando !== null} className="apple-btn apple-btn-primary">
              {procesando !== null ? "Entregando..." : "Confirmar entrega"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
