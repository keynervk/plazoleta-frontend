import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { plazoletaApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import PlatoCard from "../components/PlatoCard";
import ImagenConRespaldo, { iniciales } from "../components/ImagenConRespaldo";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

export default function DetalleRestaurante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, rol, cerrarSesion } = useAuth();
  const { agregarAlCarrito, nombreRestaurante: carritoRestaurante, vaciarCarrito } = useCarrito();

  const [restaurante, setRestaurante] = useState(null);
  // Todos los platos del restaurante, activos e inactivos (GET /platos)
  const [todosPlatos, setTodosPlatos] = useState([]);
  // Pagina actual del menu que devuelve el backend (GET /platos/paginado, HU 10)
  const [platosPagina, setPlatosPagina] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [pagina, setPagina] = useState(0);
  const [tamanioPagina, setTamanioPagina] = useState(8);

  // Filtering
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [busquedaPlato, setBusquedaPlato] = useState("");

  // Modal Crear Plato state
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    urlImagen: "",
    categoria: "Plato Fuerte",
  });
  const [cargandoCrear, setCargandoCrear] = useState(false);
  const [errorCrear, setErrorCrear] = useState(null);

  // Modal Editar Plato state
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [platoAEditar, setPlatoAEditar] = useState(null);
  const [formEditar, setFormEditar] = useState({ precio: "", descripcion: "" });
  const [cargandoEditar, setCargandoEditar] = useState(false);
  const [errorEditar, setErrorEditar] = useState(null);

  // Toggle status loading
  const [toggleCargando, setToggleCargando] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  // Carrito / confirm state (CLIENTE)
  const [cantidades, setCantidades] = useState({});
  const [confirmRestaurante, setConfirmRestaurante] = useState(null); // { plato, cantidad }

  const esCliente = rol === "CLIENTE";
  // Solo el propietario dueno de este restaurante puede gestionar sus platos
  const esDueno = rol === "PROPIETARIO" && restaurante != null && restaurante.idPropietario === usuario?.id;

  // Handle 401
  function manejar401(err) {
    if (err.response?.status === 401) {
      cerrarSesion();
      navigate("/login");
      return true;
    }
    return false;
  }

  const cargarRestaurante = useCallback(async () => {
    try {
      const res = await plazoletaApi.get(`/restaurantes/${id}`);
      setRestaurante(res.data);
      return true;
    } catch (err) {
      if (manejar401(err)) return false;
      setError(
        err.response?.status === 404
          ? "No se encontró el restaurante solicitado."
          : err.response?.data?.mensaje || "Error al cargar la información del restaurante."
      );
      return false;
    }
  }, [id]);

  const cargarTodosPlatos = useCallback(async () => {
    try {
      const res = await plazoletaApi.get(`/platos?idRestaurante=${id}`);
      setTodosPlatos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (manejar401(err)) return;
      setError(err.response?.data?.mensaje || "Error al cargar los platos.");
    }
  }, [id]);

  // HU 10: el backend devuelve directamente la lista de la pagina pedida
  const cargarPaginaMenu = useCallback(async (pg, tam, cat) => {
    try {
      let url = `/platos/paginado?idRestaurante=${id}&pagina=${pg}&tamanioPagina=${tam}`;
      if (cat && cat !== "Todos") {
        url += `&categoria=${encodeURIComponent(cat)}`;
      }
      const res = await plazoletaApi.get(url);
      setPlatosPagina(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (manejar401(err)) return;
      setError(err.response?.data?.mensaje || "Error al cargar los platos.");
    }
  }, [id]);

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError(null);
      setPagina(0);
      setCategoriaSeleccionada("Todos");
      if (await cargarRestaurante()) {
        await cargarTodosPlatos();
      }
      setCargando(false);
    }
    cargarDatos();
  }, [id]);

  // El dueno ve todos sus platos (tambien los inactivos, para poder habilitarlos);
  // el resto ve el menu paginado del backend, que solo trae platos activos
  useEffect(() => {
    if (restaurante && !esDueno) {
      cargarPaginaMenu(pagina, tamanioPagina, categoriaSeleccionada);
    }
  }, [restaurante, esDueno, pagina, tamanioPagina, categoriaSeleccionada]);

  const platosBase = esDueno ? todosPlatos : todosPlatos.filter((p) => p.activo);
  const categoriasDisponibles = [
    "Todos",
    ...new Set(platosBase.map((p) => p.categoria).filter(Boolean)),
  ];
  const platosDeCategoria = platosBase.filter(
    (p) => categoriaSeleccionada === "Todos" || p.categoria?.toLowerCase() === categoriaSeleccionada.toLowerCase()
  );
  const totalPages = Math.ceil(platosDeCategoria.length / tamanioPagina);
  const platos = esDueno
    ? [...platosDeCategoria]
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .slice(pagina * tamanioPagina, (pagina + 1) * tamanioPagina)
    : platosPagina;

  function handleCategoriaChange(cat) {
    setCategoriaSeleccionada(cat);
    setPagina(0);
  }

  function handleTamanioPaginaChange(e) {
    setTamanioPagina(Number(e.target.value));
    setPagina(0);
  }

  // Filtered dishes client-side by search
  const platosFiltrados = platos.filter((plato) => {
    if (!busquedaPlato) return true;
    return (
      plato.nombre?.toLowerCase().includes(busquedaPlato.toLowerCase()) ||
      plato.descripcion?.toLowerCase().includes(busquedaPlato.toLowerCase())
    );
  });

  // --- CREAR PLATO ---
  function abrirModalCrear() {
    setFormCrear({ nombre: "", precio: "", descripcion: "", urlImagen: "", categoria: "Plato Fuerte" });
    setErrorCrear(null);
    setModalCrearAbierto(true);
  }

  async function manejarCrearPlato(e) {
    e.preventDefault();
    setErrorCrear(null);
    const precioNum = parseInt(formCrear.precio, 10);
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorCrear("El precio del plato debe ser un número entero positivo mayor a 0.");
      return;
    }
    if (!formCrear.nombre.trim()) { setErrorCrear("El nombre del plato es obligatorio."); return; }
    if (!formCrear.descripcion.trim()) { setErrorCrear("La descripción es obligatoria."); return; }
    if (!formCrear.urlImagen.trim()) { setErrorCrear("La URL de la imagen es obligatoria."); return; }

    setCargandoCrear(true);
    try {
      const payload = { ...formCrear, precio: precioNum, idRestaurante: Number(id) };
      await plazoletaApi.post("/platos", payload);
      setModalCrearAbierto(false);
      setToast({ mensaje: "¡Plato creado con éxito!", tipo: "success" });
      await cargarTodosPlatos();
    } catch (err) {
      if (manejar401(err)) return;
      setErrorCrear(err.response?.data?.mensaje || "Ocurrió un error al crear el plato.");
    } finally {
      setCargandoCrear(false);
    }
  }

  // --- EDITAR PLATO ---
  function abrirModalEditar(plato) {
    setPlatoAEditar(plato);
    setFormEditar({ precio: plato.precio?.toString() || "", descripcion: plato.descripcion || "" });
    setErrorEditar(null);
    setModalEditarAbierto(true);
  }

  async function manejarEditarPlato(e) {
    e.preventDefault();
    if (!platoAEditar) return;
    setErrorEditar(null);
    const precioNum = parseInt(formEditar.precio, 10);
    if (isNaN(precioNum) || precioNum <= 0) { setErrorEditar("El precio debe ser un número entero positivo mayor a 0."); return; }
    if (!formEditar.descripcion.trim()) { setErrorEditar("La descripción no puede estar vacía."); return; }

    setCargandoEditar(true);
    try {
      await plazoletaApi.patch(`/platos/${platoAEditar.id}`, {
        precio: precioNum,
        descripcion: formEditar.descripcion.trim(),
      });
      setModalEditarAbierto(false);
      setToast({ mensaje: `Plato "${platoAEditar.nombre}" actualizado correctamente.`, tipo: "success" });
      setTodosPlatos((prev) =>
        prev.map((p) =>
          p.id === platoAEditar.id ? { ...p, precio: precioNum, descripcion: formEditar.descripcion.trim() } : p
        )
      );
    } catch (err) {
      if (manejar401(err)) return;
      setErrorEditar(err.response?.data?.mensaje || "Ocurrió un error al modificar el plato.");
    } finally {
      setCargandoEditar(false);
    }
  }

  // --- TOGGLE HABILITAR / DESHABILITAR ---
  async function manejarToggleActivo(plato) {
    setToggleCargando(true);
    const nuevoEstado = !plato.activo;
    const endpoint = nuevoEstado ? `/platos/${plato.id}/habilitar` : `/platos/${plato.id}/deshabilitar`;
    try {
      await plazoletaApi.patch(endpoint);
      setTodosPlatos((prev) => prev.map((p) => (p.id === plato.id ? { ...p, activo: nuevoEstado } : p)));
      setToast({ mensaje: `Plato ${nuevoEstado ? "habilitado para pedidos" : "deshabilitado"} con éxito.`, tipo: "success" });
    } catch (err) {
      if (manejar401(err)) return;
      setToast({ mensaje: "Error al cambiar el estado del plato.", tipo: "error" });
    } finally {
      setToggleCargando(false);
    }
  }

  // --- CARRITO (CLIENTE) ---
  function getCantidad(idPlato) {
    return cantidades[idPlato] || 1;
  }

  function setCantidad(idPlato, val) {
    const n = Math.max(1, Math.min(10, Number(val)));
    setCantidades((prev) => ({ ...prev, [idPlato]: n }));
  }

  function handleAgregarAlCarrito(plato) {
    const cantidad = getCantidad(plato.id);
    try {
      agregarAlCarrito(plato, cantidad, { id: Number(id), nombre: restaurante?.nombre || "" });
      setToast({ mensaje: "¡Agregado al carrito!", tipo: "success" });
    } catch (err) {
      if (err.message === "RESTAURANTE_DIFERENTE") {
        setConfirmRestaurante({ plato, cantidad });
      }
    }
  }

  function handleVaciarYAgregar() {
    if (!confirmRestaurante) return;
    vaciarCarrito();
    const { plato, cantidad } = confirmRestaurante;
    agregarAlCarrito(plato, cantidad, { id: Number(id), nombre: restaurante?.nombre || "" });
    setConfirmRestaurante(null);
    setToast({ mensaje: "¡Carrito actualizado y plato agregado!", tipo: "success" });
  }

  if (cargando) {
    return (
      <div className="main-content">
        <div style={{ marginBottom: 32 }}>
          <div className="skeleton" style={{ height: 36, width: 220, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 24 }} />
        </div>
        <div className="cards-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: 280, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurante) {
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h2>Error al cargar restaurante</h2>
          <p className="text-secondary">{error || "Restaurante no encontrado"}</p>
          <Link to="/restaurantes" className="apple-btn apple-btn-secondary" style={{ marginTop: 12 }}>
            ← Volver a Restaurantes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Toast Feedback */}
      {toast && (
        <div className="toast-container">
          <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Confirm dialog - replace restaurant */}
      {confirmRestaurante && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="glass-card"
            style={{ maxWidth: 420, width: "100%", padding: 28, borderRadius: "var(--radius-xl)" }}
          >
            <h3 style={{ marginBottom: 10, fontSize: "1.1rem" }}>⚠️ Carrito de otro restaurante</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.5 }}>
              Tu carrito tiene platos de <strong>{carritoRestaurante}</strong>. ¿Deseas vaciar el carrito y agregar este plato?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmRestaurante(null)}
                className="apple-btn apple-btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleVaciarYAgregar}
                className="apple-btn apple-btn-danger"
              >
                Vaciar y agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/restaurantes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          <span>← Volver a Restaurantes</span>
        </Link>
      </div>

      {/* Restaurant Hero Banner */}
      <div
        className="glass-card"
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          padding: 28,
          gap: 24,
          alignItems: "center",
          marginBottom: 36,
          background: "linear-gradient(135deg, var(--bg-secondary) 60%, var(--bg-tertiary))",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "22px",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            flexShrink: 0,
            backgroundColor: "var(--bg-tertiary)",
          }}
        >
          <ImagenConRespaldo
            src={restaurante.urlLogo}
            alt={restaurante.nombre}
            semilla={restaurante.id}
            contenido={iniciales(restaurante.nombre)}
            style={{ width: "100%", height: "100%", objectFit: "cover", fontSize: "2.2rem" }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{ fontSize: "2rem", margin: 0 }}>{restaurante.nombre}</h1>
            <span
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent-primary)",
                border: "1px solid var(--accent-border)",
                padding: "3px 10px",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              NIT: {restaurante.nit}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              marginTop: 8,
            }}
          >
            <span>📍 {restaurante.direccion}</span>
            <span>📞 {restaurante.telefono}</span>
            {restaurante.idPropietario && (
              <span className="role-pill role-PROPIETARIO" style={{ fontSize: "0.7rem" }}>
                Propietario ID: {restaurante.idPropietario}
              </span>
            )}
          </div>
        </div>

        {esDueno && (
          <div>
            <button onClick={abrirModalCrear} className="apple-btn apple-btn-primary" style={{ padding: "12px 22px" }}>
              <span>+ Nuevo Plato</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div className="category-tabs" style={{ marginBottom: 0 }}>
          {categoriasDisponibles.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoriaChange(cat)}
              className={`category-tab ${categoriaSeleccionada === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 220 }}>
          <input
            type="text"
            className="apple-input"
            style={{ padding: "8px 14px", paddingLeft: 34, fontSize: "0.875rem", borderRadius: "var(--radius-pill)" }}
            placeholder="Buscar plato..."
            value={busquedaPlato}
            onChange={(e) => setBusquedaPlato(e.target.value)}
          />
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.85rem",
              color: "var(--text-tertiary)",
            }}
          >
            🔍
          </span>
        </div>
      </div>

      {/* Dishes Grid */}
      {platosFiltrados.length > 0 ? (
        <div className="cards-grid">
          {platosFiltrados.map((plato) => (
            <div key={plato.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <PlatoCard
                plato={plato}
                esPropietario={esDueno}
                onEditar={abrirModalEditar}
                onToggleActivo={manejarToggleActivo}
                toggleCargando={toggleCargando}
              />

              {/* CLIENTE: agregar al carrito */}
              {esCliente && plato.activo && (
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderTop: "none",
                    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Quantity stepper */}
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
                      onClick={() => setCantidad(plato.id, getCantidad(plato.id) - 1)}
                      style={{
                        padding: "4px 12px",
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
                        padding: "4px 12px",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        minWidth: 32,
                        textAlign: "center",
                        background: "var(--bg-primary)",
                      }}
                    >
                      {getCantidad(plato.id)}
                    </span>
                    <button
                      onClick={() => setCantidad(plato.id, getCantidad(plato.id) + 1)}
                      style={{
                        padding: "4px 12px",
                        background: "var(--bg-tertiary)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleAgregarAlCarrito(plato)}
                    className="apple-btn apple-btn-primary apple-btn-sm"
                    style={{ flex: 1 }}
                  >
                    🛒 Agregar al carrito
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🍲</div>
          <h3 style={{ fontSize: "1.25rem" }}>No hay platos en esta sección</h3>
          <p className="text-secondary" style={{ maxWidth: 400 }}>
            {busquedaPlato
              ? `No encontramos platos con el término "${busquedaPlato}".`
              : "Aún no se han registrado platos en esta categoría para este restaurante."}
          </p>
          {esDueno && (
            <button onClick={abrirModalCrear} className="apple-btn apple-btn-primary" style={{ marginTop: 12 }}>
              Agregar el primer plato
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 0 && (
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
            <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>Por página:</label>
            <select
              className="apple-select"
              value={tamanioPagina}
              onChange={handleTamanioPaginaChange}
              style={{ padding: "6px 12px", fontSize: "0.875rem" }}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>
      )}

      {/* MODAL: CREAR NUEVO PLATO */}
      <Modal isOpen={modalCrearAbierto} onClose={() => setModalCrearAbierto(false)} title="Crear Nuevo Plato">
        {errorCrear && (
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
            ⚠️ {errorCrear}
          </div>
        )}
        <form onSubmit={manejarCrearPlato}>
          <div className="form-group">
            <label className="apple-label">Nombre del Plato *</label>
            <input
              type="text"
              className="apple-input"
              placeholder="Ej. Hamburguesa Doble Carne con Queso"
              value={formCrear.nombre}
              onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="apple-label">Precio ($ COP, entero &gt; 0) *</label>
              <input
                type="number"
                min="1"
                step="1"
                className="apple-input"
                placeholder="Ej. 28000"
                value={formCrear.precio}
                onChange={(e) => setFormCrear({ ...formCrear, precio: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="apple-label">Categoría *</label>
              <select
                className="apple-select"
                value={formCrear.categoria}
                onChange={(e) => setFormCrear({ ...formCrear, categoria: e.target.value })}
                required
              >
                <option value="Entradas">Entradas</option>
                <option value="Plato Fuerte">Plato Fuerte</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Postres">Postres</option>
                <option value="Combos">Combos</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="apple-label">URL de la Imagen *</label>
            <input
              type="url"
              className="apple-input"
              placeholder="https://ejemplo.com/foto-plato.jpg"
              value={formCrear.urlImagen}
              onChange={(e) => setFormCrear({ ...formCrear, urlImagen: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="apple-label">Descripción detallada *</label>
            <textarea
              className="apple-textarea"
              rows="3"
              placeholder="Describe los ingredientes, preparación y presentación..."
              value={formCrear.descripcion}
              onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setModalCrearAbierto(false)} className="apple-btn apple-btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={cargandoCrear} className="apple-btn apple-btn-primary">
              {cargandoCrear ? "Guardando..." : "Crear Plato"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: MODIFICAR PLATO */}
      <Modal
        isOpen={modalEditarAbierto}
        onClose={() => setModalEditarAbierto(false)}
        title={`Modificar Plato: ${platoAEditar?.nombre || ""}`}
      >
        {errorEditar && (
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
            ⚠️ {errorEditar}
          </div>
        )}
        <div
          style={{
            backgroundColor: "var(--bg-tertiary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            marginBottom: 18,
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
          }}
        >
          ℹ️ De acuerdo a las reglas de negocio, únicamente el <strong>precio</strong> y la{" "}
          <strong>descripción</strong> pueden ser modificados. El nombre, categoría e imagen permanecen inalterables.
        </div>
        <form onSubmit={manejarEditarPlato}>
          <div className="form-group">
            <label className="apple-label">Precio ($ COP, entero &gt; 0) *</label>
            <input
              type="number"
              min="1"
              step="1"
              className="apple-input"
              value={formEditar.precio}
              onChange={(e) => setFormEditar({ ...formEditar, precio: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="apple-label">Descripción *</label>
            <textarea
              className="apple-textarea"
              rows="4"
              value={formEditar.descripcion}
              onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setModalEditarAbierto(false)} className="apple-btn apple-btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={cargandoEditar} className="apple-btn apple-btn-primary">
              {cargandoEditar ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
