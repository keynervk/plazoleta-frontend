import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { plazoletaApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";
import RestauranteCard from "../components/RestauranteCard";

export default function Restaurantes() {
  const { rol } = useAuth();
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [tamanioPagina, setTamanioPagina] = useState(6);

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  useEffect(() => {
    setPagina(0);
  }, [busqueda, tamanioPagina]);

  async function cargarRestaurantes() {
    setCargando(true);
    setError(null);
    try {
      const res = await plazoletaApi.get("/restaurantes");
      setRestaurantes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError("No se pudieron cargar los restaurantes. Verifica que el microservicio Plazoleta (puerto 8082) esté activo.");
      }
    } finally {
      setCargando(false);
    }
  }

  // HU 9: orden alfabetico y paginado con tamanio de pagina elegible.
  // Se usa GET /restaurantes porque /restaurantes/paginado no devuelve el id para abrir el detalle.
  const restaurantesFiltrados = restaurantes
    .filter((r) => {
      const termino = busqueda.toLowerCase().trim();
      if (!termino) return true;
      return (
        r.nombre?.toLowerCase().includes(termino) ||
        r.direccion?.toLowerCase().includes(termino) ||
        r.nit?.toString().includes(termino)
      );
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const totalPages = Math.ceil(restaurantesFiltrados.length / tamanioPagina);
  const restaurantesPagina = restaurantesFiltrados.slice(pagina * tamanioPagina, (pagina + 1) * tamanioPagina);

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--accent-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Plazoleta Gastronómica
          </span>
          <h1>Nuestros Restaurantes</h1>
          <p className="text-secondary" style={{ maxWidth: 540 }}>
            Descubre la variedad gastronómica de nuestra plazoleta. Selecciona un restaurante para consultar su menú y platos disponibles.
          </p>
        </div>

        {rol === "ADMINISTRADOR" && (
          <Link to="/crear-restaurante" className="apple-btn apple-btn-primary">
            <span>+ Crear Restaurante</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
              fontSize: "1.1rem",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            className="apple-input"
            style={{ paddingLeft: 42, borderRadius: "var(--radius-pill)" }}
            placeholder="Buscar por nombre, dirección o NIT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 600 }}>
          {restaurantesFiltrados.length} restaurante{restaurantesFiltrados.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            backgroundColor: "var(--apple-red-soft)",
            border: "1px solid rgba(255, 59, 48, 0.25)",
            color: "var(--apple-red)",
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={cargarRestaurantes}
            className="apple-btn apple-btn-danger apple-btn-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Skeletons Loading */}
      {cargando && (
        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="glass-card"
              style={{ height: 320, padding: 0, display: "flex", flexDirection: "column" }}
            >
              <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: "22px 22px 0 0" }} />
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="skeleton" style={{ height: 24, width: "60%" }} />
                <div className="skeleton" style={{ height: 16, width: "85%" }} />
                <div className="skeleton" style={{ height: 16, width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loaded List */}
      {!cargando && !error && (
        <>
          {restaurantesFiltrados.length > 0 ? (
            <>
              <div className="cards-grid">
                {restaurantesPagina.map((restaurante) => (
                  <RestauranteCard key={restaurante.id} restaurante={restaurante} />
                ))}
              </div>

              {/* Pagination Controls */}
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
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                  Página {pagina + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={pagina >= totalPages - 1}
                  className="apple-btn apple-btn-outline"
                >
                  Siguiente →
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Por página:
                  </label>
                  <select
                    className="apple-select"
                    value={tamanioPagina}
                    onChange={(e) => setTamanioPagina(Number(e.target.value))}
                    style={{ padding: "6px 12px", fontSize: "0.875rem" }}
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <h3 style={{ fontSize: "1.3rem" }}>
                {busqueda ? "No encontramos restaurantes para tu búsqueda" : "Aún no hay restaurantes registrados"}
              </h3>
              <p className="text-secondary" style={{ maxWidth: 440 }}>
                {busqueda
                  ? `No se encontraron resultados para "${busqueda}". Intenta con otros términos.`
                  : "Los restaurantes aparecerán aquí una vez que el administrador los registre en el sistema."}
              </p>
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="apple-btn apple-btn-secondary"
                  style={{ marginTop: 8 }}
                >
                  Limpiar búsqueda
                </button>
              )}
              {!busqueda && rol === "ADMINISTRADOR" && (
                <Link
                  to="/crear-restaurante"
                  className="apple-btn apple-btn-primary"
                  style={{ marginTop: 8 }}
                >
                  Crear primer restaurante
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
