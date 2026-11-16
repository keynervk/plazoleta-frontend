import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { plazoletaApi, usuariosApi } from "../api/clientes";

export default function CrearRestaurante() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    urlLogo: "",
    idPropietario: "",
  });

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [verificandoPropietario, setVerificandoPropietario] = useState(false);
  const [estadoPropietario, setEstadoPropietario] = useState(null); // { valido: boolean, msg: string }

  // Check if owner ID is valid using GET /usuarios/{id}/es-propietario
  async function verificarPropietario(id) {
    if (!id || !/^\d+$/.test(id)) {
      setEstadoPropietario(null);
      return;
    }
    setVerificandoPropietario(true);
    try {
      const res = await usuariosApi.get(`/usuarios/${id}/es-propietario`);
      if (res.data === true) {
        setEstadoPropietario({ valido: true, msg: "Propietario verificado correctamente" });
      } else {
        setEstadoPropietario({ valido: false, msg: "El ID no corresponde a un usuario con rol de Propietario" });
      }
    } catch {
      setEstadoPropietario({ valido: null, msg: "No se pudo verificar el ID en el servicio de usuarios" });
    } finally {
      setVerificandoPropietario(false);
    }
  }

  function validar() {
    const errs = {};
    // Nombre: no puede ser solo números
    if (!form.nombre.trim()) {
      errs.nombre = "El nombre del restaurante es obligatorio";
    } else if (/^\d+$/.test(form.nombre.trim())) {
      errs.nombre = "El nombre del restaurante no puede componerse únicamente de números";
    }

    // NIT: solo numérico
    if (!/^\d+$/.test(form.nit)) {
      errs.nit = "El NIT debe ser únicamente numérico";
    }

    // Dirección
    if (!form.direccion.trim()) {
      errs.direccion = "La dirección es obligatoria";
    }

    // Teléfono: max 13 caracteres numéricos
    if (!/^\+?\d{1,13}$/.test(form.telefono)) {
      errs.telefono = "El teléfono debe contener máximo 13 caracteres numéricos (opcional + al inicio)";
    }

    // URL Logo
    if (!form.urlLogo.trim()) {
      errs.urlLogo = "La URL del logo es obligatoria";
    }

    // ID Propietario
    if (!form.idPropietario || !/^\d+$/.test(form.idPropietario)) {
      errs.idPropietario = "Debes ingresar un ID de propietario numérico";
    }

    setErrores(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }

    if (name === "idPropietario") {
      setEstadoPropietario(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorServidor(null);
    if (!validar()) return;

    setCargando(true);
    try {
      const payload = {
        ...form,
        idPropietario: Number(form.idPropietario),
      };
      await plazoletaApi.post("/restaurantes", payload);
      setExito(true);
      setTimeout(() => {
        navigate("/restaurantes");
      }, 1800);
    } catch (err) {
      if (err.response?.data?.mensaje) {
        setErrorServidor(err.response.data.mensaje);
      } else if (err.response?.status === 409) {
        setErrorServidor("Ya existe un restaurante registrado con este NIT.");
      } else {
        setErrorServidor("Ocurrió un error al registrar el restaurante. Verifica el servicio de Plazoleta (puerto 8082).");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ justifyContent: "center", textAlign: "center" }}>
        <div className="page-header-text" style={{ alignItems: "center" }}>
          <span className="role-pill role-ADMINISTRADOR" style={{ marginBottom: 4 }}>
            Solo Administrador
          </span>
          <h1>Crear Nuevo Restaurante</h1>
          <p className="text-secondary" style={{ maxWidth: 520 }}>
            Registra una nueva marca gastronómica y vincúlala al propietario responsable.
          </p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: 640 }}>
        {exito && (
          <div
            style={{
              backgroundColor: "var(--apple-green-soft)",
              border: "1px solid rgba(52, 199, 89, 0.3)",
              color: "var(--apple-green)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 24,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            ✓ ¡Restaurante creado con éxito! Redirigiendo a la lista de restaurantes...
          </div>
        )}

        {errorServidor && (
          <div
            style={{
              backgroundColor: "var(--apple-red-soft)",
              border: "1px solid rgba(255, 59, 48, 0.25)",
              color: "var(--apple-red)",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⚠️</span>
            <span>{errorServidor}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="apple-label">Nombre del Restaurante *</label>
            <input
              type="text"
              name="nombre"
              className={`apple-input ${errores.nombre ? "input-error" : ""}`}
              placeholder="Ej. Burger & Beer House"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            {errores.nombre && <span className="input-error-msg">{errores.nombre}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="apple-label">NIT (Solo números) *</label>
              <input
                type="text"
                name="nit"
                className={`apple-input ${errores.nit ? "input-error" : ""}`}
                placeholder="Ej. 901234567"
                value={form.nit}
                onChange={handleChange}
                required
              />
              {errores.nit && <span className="input-error-msg">{errores.nit}</span>}
            </div>

            <div className="form-group">
              <label className="apple-label">Teléfono *</label>
              <input
                type="text"
                name="telefono"
                className={`apple-input ${errores.telefono ? "input-error" : ""}`}
                placeholder="Ej. +573009876543"
                value={form.telefono}
                onChange={handleChange}
                required
              />
              {errores.telefono && <span className="input-error-msg">{errores.telefono}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="apple-label">Dirección *</label>
            <input
              type="text"
              name="direccion"
              className={`apple-input ${errores.direccion ? "input-error" : ""}`}
              placeholder="Ej. Calle 100 # 15-20, Piso 3"
              value={form.direccion}
              onChange={handleChange}
              required
            />
            {errores.direccion && <span className="input-error-msg">{errores.direccion}</span>}
          </div>

          <div className="form-group">
            <label className="apple-label">URL del Logo / Imagen de Portada *</label>
            <input
              type="url"
              name="urlLogo"
              className={`apple-input ${errores.urlLogo ? "input-error" : ""}`}
              placeholder="https://ejemplo.com/logo-restaurante.jpg"
              value={form.urlLogo}
              onChange={handleChange}
              required
            />
            {errores.urlLogo && <span className="input-error-msg">{errores.urlLogo}</span>}
          </div>

          {/* ID Propietario with inline verification */}
          <div className="form-group" style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="apple-label">ID del Propietario asignado *</label>
              {form.idPropietario && (
                <button
                  type="button"
                  onClick={() => verificarPropietario(form.idPropietario)}
                  disabled={verificandoPropietario}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--apple-blue)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {verificandoPropietario ? "Verificando..." : "🔍 Verificar propietario"}
                </button>
              )}
            </div>
            <input
              type="number"
              name="idPropietario"
              className={`apple-input ${errores.idPropietario ? "input-error" : ""}`}
              placeholder="Ej. 1"
              value={form.idPropietario}
              onChange={handleChange}
              onBlur={() => verificarPropietario(form.idPropietario)}
              required
            />
            {errores.idPropietario && (
              <span className="input-error-msg">{errores.idPropietario}</span>
            )}
            {estadoPropietario && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  marginTop: 4,
                  fontWeight: 600,
                  color: estadoPropietario.valido === true ? "var(--apple-green)" : estadoPropietario.valido === false ? "var(--apple-red)" : "var(--apple-amber)",
                }}
              >
                {estadoPropietario.valido === true ? "✓ " : estadoPropietario.valido === false ? "✕ " : "ℹ "}
                {estadoPropietario.msg}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => navigate("/restaurantes")}
              className="apple-btn apple-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || exito}
              className="apple-btn apple-btn-primary"
            >
              {cargando ? "Registrando..." : "Crear Restaurante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
