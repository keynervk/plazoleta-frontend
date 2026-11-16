import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usuariosApi } from "../api/clientes";

export default function RegistroCliente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documentoDeIdentidad: "",
    celular: "",
    correo: "",
    clave: "",
  });

  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  function validar() {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) errs.apellido = "El apellido es obligatorio";

    // Documento: solo numérico
    if (!/^\d+$/.test(form.documentoDeIdentidad)) {
      errs.documentoDeIdentidad = "El documento de identidad debe ser solo numérico";
    }

    // Celular: max 13 caracteres, dígitos y opcional + al inicio
    if (!/^\+?\d{1,13}$/.test(form.celular)) {
      errs.celular = "El celular debe contener máximo 13 caracteres numéricos (opcional + al inicio)";
    }

    // Correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      errs.correo = "Ingresa un correo electrónico válido";
    }

    // Clave
    if (form.clave.length < 4) {
      errs.clave = "La clave debe tener al menos 4 caracteres";
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
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorServidor(null);
    if (!validar()) return;

    setCargando(true);
    try {
      await usuariosApi.post("/usuarios/cliente", form);
      setExito(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err.response?.data?.mensaje) {
        setErrorServidor(err.response.data.mensaje);
      } else if (err.response?.status === 409) {
        setErrorServidor("Ya existe un usuario con este correo o documento de identidad.");
      } else {
        setErrorServidor("Ocurrió un error al registrar la cuenta. Verifica que el backend esté disponible.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div className="form-card" style={{ width: "100%", maxWidth: 540 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span className="role-pill role-CLIENTE" style={{ marginBottom: 12 }}>
            Registro Público
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>
            Crear Cuenta de Cliente
          </h1>
          <p className="text-secondary" style={{ fontSize: "0.9375rem" }}>
            Únete a la plazoleta para explorar restaurantes y realizar pedidos
          </p>
        </div>

        {exito && (
          <div
            style={{
              backgroundColor: "var(--apple-green-soft)",
              border: "1px solid rgba(52, 199, 89, 0.3)",
              color: "var(--apple-green)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 20,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            ✓ ¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="apple-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                className={`apple-input ${errores.nombre ? "input-error" : ""}`}
                placeholder="Ej. Carlos"
                value={form.nombre}
                onChange={handleChange}
                required
              />
              {errores.nombre && <span className="input-error-msg">{errores.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="apple-label">Apellido *</label>
              <input
                type="text"
                name="apellido"
                className={`apple-input ${errores.apellido ? "input-error" : ""}`}
                placeholder="Ej. Gómez"
                value={form.apellido}
                onChange={handleChange}
                required
              />
              {errores.apellido && <span className="input-error-msg">{errores.apellido}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="apple-label">Documento de Identidad *</label>
              <input
                type="text"
                name="documentoDeIdentidad"
                className={`apple-input ${errores.documentoDeIdentidad ? "input-error" : ""}`}
                placeholder="Ej. 1020304050"
                value={form.documentoDeIdentidad}
                onChange={handleChange}
                required
              />
              {errores.documentoDeIdentidad && (
                <span className="input-error-msg">{errores.documentoDeIdentidad}</span>
              )}
            </div>

            <div className="form-group">
              <label className="apple-label">Celular *</label>
              <input
                type="text"
                name="celular"
                className={`apple-input ${errores.celular ? "input-error" : ""}`}
                placeholder="Ej. +573001234567"
                value={form.celular}
                onChange={handleChange}
                required
              />
              {errores.celular && <span className="input-error-msg">{errores.celular}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="apple-label">Correo electrónico *</label>
            <input
              type="email"
              name="correo"
              className={`apple-input ${errores.correo ? "input-error" : ""}`}
              placeholder="cliente@ejemplo.com"
              value={form.correo}
              onChange={handleChange}
              required
            />
            {errores.correo && <span className="input-error-msg">{errores.correo}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 26 }}>
            <label className="apple-label">Contraseña *</label>
            <input
              type="password"
              name="clave"
              className={`apple-input ${errores.clave ? "input-error" : ""}`}
              placeholder="Crea una contraseña segura"
              value={form.clave}
              onChange={handleChange}
              required
            />
            {errores.clave && <span className="input-error-msg">{errores.clave}</span>}
          </div>

          <button
            type="submit"
            disabled={cargando || exito}
            className="apple-btn apple-btn-primary"
            style={{ width: "100%", padding: "13px", fontSize: "1rem" }}
          >
            {cargando ? "Registrando cliente..." : "Crear Cuenta"}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--border-subtle)",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
