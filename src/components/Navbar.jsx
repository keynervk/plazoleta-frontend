import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

export default function Navbar() {
  const { estaAutenticado, usuario, rol, cerrarSesion } = useAuth();
  const { totalItems, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function handleLogout() {
    vaciarCarrito();
    cerrarSesion();
    navigate("/login");
  }

  const nombreMostrar = usuario?.nombre || usuario?.sub || "Usuario";
  const inicial = (nombreMostrar[0] || "U").toUpperCase();

  return (
    <header className="glass-nav">
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Brand */}
        <Link
          to={estaAutenticado ? "/restaurantes" : "/login"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--text-primary)",
            fontWeight: 800,
            fontSize: "1.25rem",
            letterSpacing: "-0.03em",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FF5A36, #FF9500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              boxShadow: "0 4px 12px rgba(255, 90, 54, 0.3)",
              fontSize: "1.1rem",
            }}
          >
            🍽️
          </div>
          <span>Plazoleta</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: 8 }}
          className="desktop-nav"
        >
          {estaAutenticado ? (
            <>
              <NavLink
                to="/restaurantes"
                className={({ isActive }) =>
                  `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                }
                style={{ fontSize: "0.875rem", padding: "8px 16px" }}
              >
                🍴 Restaurantes
              </NavLink>

              {/* Admin Links */}
              {rol === "ADMINISTRADOR" && (
                <>
                  <NavLink
                    to="/crear-restaurante"
                    className={({ isActive }) =>
                      `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                    }
                    style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                  >
                    🏢 Crear Restaurante
                  </NavLink>
                  <NavLink
                    to="/crear-propietario"
                    className={({ isActive }) =>
                      `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                    }
                    style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                  >
                    👤 Crear Propietario
                  </NavLink>
                </>
              )}

              {/* Owner Links */}
              {rol === "PROPIETARIO" && (
                <>
                  <NavLink
                    to="/crear-empleado"
                    className={({ isActive }) =>
                      `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                    }
                    style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                  >
                    🧑‍🍳 Crear Empleado
                  </NavLink>
                  <NavLink
                    to="/eficiencia"
                    className={({ isActive }) =>
                      `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                    }
                    style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                  >
                    📊 Eficiencia
                  </NavLink>
                </>
              )}

              {/* Employee Links */}
              {rol === "EMPLEADO" && (
                <NavLink
                  to="/pedidos-empleado"
                  className={({ isActive }) =>
                    `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                  }
                  style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                >
                  📋 Pedidos
                </NavLink>
              )}

              {/* Client Links */}
              {rol === "CLIENTE" && (
                <>
                  {/* Carrito with badge */}
                  <NavLink
                    to="/carrito"
                    className={({ isActive }) =>
                      `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                    }
                    style={{ fontSize: "0.875rem", padding: "8px 16px", position: "relative" }}
                  >
                    🛒 Carrito
                    {totalItems > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          backgroundColor: "var(--apple-red)",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 18,
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </NavLink>
                  <NavLink
                    to="/mi-pedido"
                    className={({ isActive }) =>
                      `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                    }
                    style={{ fontSize: "0.875rem", padding: "8px 16px" }}
                  >
                    🧾 Mis Pedidos
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `apple-btn ${isActive ? "apple-btn-secondary" : "apple-btn-outline"}`
                }
                style={{ fontSize: "0.875rem", padding: "8px 16px" }}
              >
                Iniciar Sesión
              </NavLink>
              <NavLink
                to="/registro-cliente"
                className="apple-btn apple-btn-primary"
                style={{ fontSize: "0.875rem", padding: "8px 16px" }}
              >
                Crear Cuenta
              </NavLink>
            </>
          )}
        </nav>

        {/* User Badge & Logout */}
        {estaAutenticado && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 8px 4px 4px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "var(--text-primary)",
                  color: "var(--text-inverse)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {inicial}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: 4 }}>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    maxWidth: 110,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {nombreMostrar}
                </span>
                <span className={`role-pill role-${rol}`} style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                  {rol}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="apple-btn apple-btn-outline apple-btn-sm"
              title="Cerrar sesión"
              style={{ borderRadius: "var(--radius-pill)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
