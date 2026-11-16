import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pedidosApi, plazoletaApi, usuariosApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";
import { formatearFecha } from "../components/EstadoPedido";

function formatDuracion(minutos) {
  if (minutos == null || isNaN(minutos)) return "—";
  if (minutos < 1) return `${Math.round(minutos * 60)} s`;
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  return `${h} h ${m} min`;
}

const estiloCelda = { padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.875rem" };
const estiloEncabezado = {
  ...estiloCelda,
  textAlign: "left",
  color: "var(--text-secondary)",
  fontWeight: 600,
  fontSize: "0.8125rem",
};

function Indicador({ titulo, valor }) {
  return (
    <div className="glass-card" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>
        {titulo}
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{valor}</div>
    </div>
  );
}

export default function Eficiencia() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  const [restaurantes, setRestaurantes] = useState([]);
  const [idRestaurante, setIdRestaurante] = useState(null);
  const [datos, setDatos] = useState(null);
  const [nombresEmpleados, setNombresEmpleados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  function manejar401(err) {
    if (err.response?.status === 401) {
      cerrarSesion();
      navigate("/login");
      return true;
    }
    return false;
  }

  // Restaurantes del propietario autenticado
  useEffect(() => {
    async function cargarRestaurantes() {
      try {
        const res = await plazoletaApi.get("/restaurantes");
        const propios = res.data.filter((r) => r.idPropietario === usuario?.id);
        setRestaurantes(propios);
        if (propios.length) {
          setIdRestaurante(propios[0].id);
        } else {
          setCargando(false);
        }
      } catch (err) {
        if (manejar401(err)) return;
        setError(err.response?.data?.mensaje || "No se pudieron cargar tus restaurantes.");
        setCargando(false);
      }
    }
    cargarRestaurantes();
  }, [usuario?.id]);

  // HU 18: tiempo de cada pedido entregado y ranking de empleados
  useEffect(() => {
    if (!idRestaurante) return;
    async function cargarEficiencia() {
      setCargando(true);
      setError(null);
      try {
        const res = await pedidosApi.get("/pedidos/eficiencia", { params: { idRestaurante } });
        setDatos(res.data);
        const ids = [...new Set(res.data.empleados.map((e) => e.idEmpleado))];
        const nombres = await Promise.all(
          ids.map((id) =>
            usuariosApi
              .get(`/usuarios/${id}`)
              .then((r) => [id, `${r.data.nombre} ${r.data.apellido}`])
              .catch(() => [id, `Empleado #${id}`])
          )
        );
        setNombresEmpleados(Object.fromEntries(nombres));
      } catch (err) {
        if (manejar401(err)) return;
        setError(err.response?.data?.mensaje || "Error al cargar la eficiencia del restaurante.");
        setDatos(null);
      } finally {
        setCargando(false);
      }
    }
    cargarEficiencia();
  }, [idRestaurante]);

  function nombreEmpleado(id) {
    return nombresEmpleados[id] || `Empleado #${id}`;
  }

  const pedidos = datos?.pedidos || [];
  const empleados = datos?.empleados || [];
  const promedioGeneral = pedidos.length
    ? pedidos.reduce((s, p) => s + p.tiempoMinutos, 0) / pedidos.length
    : null;

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>📊 Eficiencia de los Pedidos</h1>
          <p className="text-secondary">Tiempo entre que un pedido inicia y se entrega, por pedido y por empleado.</p>
        </div>
        {restaurantes.length > 1 && (
          <select
            className="apple-select"
            value={idRestaurante ?? ""}
            onChange={(e) => setIdRestaurante(Number(e.target.value))}
            style={{ minWidth: 220 }}
          >
            {restaurantes.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        )}
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
        <>
          <div className="skeleton" style={{ height: 100, borderRadius: 20, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 260, borderRadius: 20 }} />
        </>
      ) : restaurantes.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <h3 style={{ fontSize: "1.25rem" }}>Aún no tienes restaurantes</h3>
          <Link to="/restaurantes" className="apple-btn apple-btn-secondary" style={{ marginTop: 12 }}>
            Ver Restaurantes
          </Link>
        </div>
      ) : (
        datos && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <Indicador titulo="Pedidos entregados" valor={pedidos.length} />
              <Indicador titulo="Tiempo medio general" valor={formatDuracion(promedioGeneral)} />
              <Indicador
                titulo="Empleado más rápido"
                valor={empleados.length ? nombreEmpleado(empleados[0].idEmpleado) : "—"}
              />
            </div>

            {pedidos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⏱️</div>
                <h3 style={{ fontSize: "1.25rem" }}>Todavía no hay pedidos entregados</h3>
                <p className="text-secondary">Cuando se entreguen pedidos aparecerán aquí sus tiempos.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 24 }}>
                {/* Ranking por empleado */}
                <div className="glass-card" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
                  <h3 style={{ marginBottom: 16, fontSize: "1.1rem" }}>🏆 Ranking de empleados</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={estiloEncabezado}>#</th>
                        <th style={estiloEncabezado}>Empleado</th>
                        <th style={estiloEncabezado}>Pedidos</th>
                        <th style={estiloEncabezado}>Tiempo medio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleados.map((e, i) => (
                        <tr key={e.idEmpleado}>
                          <td style={{ ...estiloCelda, fontWeight: 800 }}>{i + 1}</td>
                          <td style={{ ...estiloCelda, fontWeight: 600 }}>{nombreEmpleado(e.idEmpleado)}</td>
                          <td style={estiloCelda}>{e.pedidosAtendidos}</td>
                          <td style={{ ...estiloCelda, fontWeight: 700, color: "var(--accent-primary)" }}>
                            {formatDuracion(e.tiempoPromedioMinutos)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tiempo de cada pedido */}
                <div className="glass-card" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
                  <h3 style={{ marginBottom: 16, fontSize: "1.1rem" }}>⏱️ Tiempo por pedido</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={estiloEncabezado}>Pedido</th>
                        <th style={estiloEncabezado}>Empleado</th>
                        <th style={estiloEncabezado}>Inicio</th>
                        <th style={estiloEncabezado}>Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((p) => (
                        <tr key={p.idPedido}>
                          <td style={{ ...estiloCelda, fontWeight: 700 }}>#{p.idPedido}</td>
                          <td style={estiloCelda}>{nombreEmpleado(p.idEmpleado)}</td>
                          <td style={{ ...estiloCelda, color: "var(--text-secondary)" }}>
                            {formatearFecha(p.fechaInicio)}
                          </td>
                          <td style={{ ...estiloCelda, fontWeight: 700 }}>{formatDuracion(p.tiempoMinutos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
