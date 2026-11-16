import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { usuariosApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname || "/restaurantes";

  async function manejarSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const respuesta = await usuariosApi.post("/usuarios/login", { correo, clave });
      iniciarSesion(respuesta.data.token);
      navigate(destino, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Correo o contraseña incorrectos.");
      } else if (err.response?.data?.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError("Error de conexión. Verifica que el microservicio de Usuarios (puerto 8081) esté corriendo.");
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
      <div className="form-card" style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #FF5A36, #FF9500)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              boxShadow: "0 8px 20px rgba(255, 90, 54, 0.3)",
              fontSize: "1.75rem",
              marginBottom: 16,
            }}
          >
            🍽️
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>
            Bienvenido a Plazoleta
          </h1>
          <p className="text-secondary" style={{ fontSize: "0.9375rem" }}>
            Inicia sesión para gestionar restaurantes y pedidos
          </p>
        </div>

        {/* Error Alert */}
        {error && (
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
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={manejarSubmit}>
          <div className="form-group">
            <label className="apple-label">Correo electrónico</label>
            <input
              type="email"
              className="apple-input"
              placeholder="nombre@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="apple-label">Contraseña</label>
            <input
              type="password"
              className="apple-input"
              placeholder="••••••••"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="apple-btn apple-btn-primary"
            style={{ width: "100%", padding: "13px", fontSize: "1rem" }}
          >
            {cargando ? (
              <>
                <span className="spinner" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #FFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        {/* Registration Link */}
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
          ¿No tienes una cuenta aún?{" "}
          <Link
            to="/registro-cliente"
            style={{
              color: "var(--accent-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Regístrate como Cliente
          </Link>
        </div>
      </div>
    </div>
  );
}