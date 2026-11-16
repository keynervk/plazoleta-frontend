import { useNavigate } from "react-router-dom";
import ImagenConRespaldo, { iniciales } from "./ImagenConRespaldo";

export default function RestauranteCard({ restaurante }) {
  const navigate = useNavigate();

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        height: "100%",
      }}
      onClick={() => navigate(`/restaurantes/${restaurante.id}`)}
    >
      {/* Restaurant Header Image/Logo */}
      <div
        style={{
          width: "100%",
          height: 180,
          position: "relative",
          backgroundColor: "var(--bg-tertiary)",
          overflow: "hidden",
        }}
      >
        <ImagenConRespaldo
          src={restaurante.urlLogo}
          alt={restaurante.nombre}
          semilla={restaurante.id}
          contenido={iniciales(restaurante.nombre)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s var(--ease-spring)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(12px)",
            color: "#FFFFFF",
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          NIT: {restaurante.nit}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.35rem", marginBottom: 8, color: "var(--text-primary)" }}>
            {restaurante.nombre}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "1rem" }}>📍</span>
              <span>{restaurante.direccion}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "1rem" }}>📞</span>
              <span>{restaurante.telefono}</span>
            </div>
            {restaurante.idPropietario && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span className="role-pill role-PROPIETARIO" style={{ fontSize: "0.7rem" }}>
                  Propietario ID: {restaurante.idPropietario}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--accent-primary)" }}>
            Explorar Menú
          </span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
}
