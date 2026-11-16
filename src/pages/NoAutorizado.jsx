import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NoAutorizado() {
  const { usuario, rol, cerrarSesion } = useAuth();

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div className="form-card" style={{ maxWidth: 480 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "var(--apple-red-soft)",
            color: "var(--apple-red)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            marginBottom: 20,
          }}
        >
          🔒
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: 8 }}>Acceso no autorizado</h1>
        <p className="text-secondary" style={{ marginBottom: 20, fontSize: "0.95rem" }}>
          No cuentas con los permisos necesarios para acceder a este módulo. Tu rol actual es:
        </p>

        <div style={{ marginBottom: 28 }}>
          <span className={`role-pill role-${rol || "CLIENTE"}`} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
            {rol || "SIN ROL"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/restaurantes" className="apple-btn apple-btn-primary" style={{ width: "100%" }}>
            Ir al listado de Restaurantes
          </Link>
          <button
            onClick={cerrarSesion}
            className="apple-btn apple-btn-outline"
            style={{ width: "100%" }}
          >
            Iniciar sesión con otra cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
