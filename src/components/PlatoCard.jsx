import ImagenConRespaldo, { emojiDePlato } from "./ImagenConRespaldo";

export default function PlatoCard({ plato, esPropietario, onEditar, onToggleActivo, toggleCargando }) {

  function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(precio);
  }

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        opacity: plato.activo ? 1 : 0.72,
        transition: "opacity 0.25s, transform 0.25s var(--ease-spring)",
      }}
    >
      {/* Dish Image */}
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
          src={plato.urlImagen}
          alt={plato.nombre}
          semilla={plato.id}
          contenido={emojiDePlato(plato.nombre, plato.categoria)}
          style={{
            fontSize: "4rem",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: plato.activo ? "none" : "grayscale(80%)",
            transition: "all 0.3s var(--ease-spring)",
          }}
        />

        {/* Category Pill */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(12px)",
            color: "#FFFFFF",
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {plato.categoria}
        </div>

        {/* Status Pill */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            backgroundColor: plato.activo ? "rgba(52, 199, 89, 0.9)" : "rgba(255, 59, 48, 0.9)",
            backdropFilter: "blur(12px)",
            color: "#FFFFFF",
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {plato.activo ? "● Disponible" : "○ Deshabilitado"}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <h4
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.25,
              }}
            >
              {plato.nombre}
            </h4>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--accent-primary)",
                whiteSpace: "nowrap",
              }}
            >
              {formatearPrecio(plato.precio)}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {plato.descripcion}
          </p>
        </div>

        {/* Owner Controls (HU7) */}
        {esPropietario && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTop: "1px solid var(--border-subtle)",
              gap: 8,
            }}
          >
            {/* Toggle Status switch */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label className="apple-switch" title={plato.activo ? "Deshabilitar plato" : "Habilitar plato"}>
                <input
                  type="checkbox"
                  checked={plato.activo}
                  disabled={toggleCargando}
                  onChange={() => onToggleActivo(plato)}
                />
                <span className="apple-switch-slider"></span>
              </label>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                {plato.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => onEditar(plato)}
              className="apple-btn apple-btn-secondary apple-btn-sm"
              style={{ fontSize: "0.8125rem" }}
            >
              ✏️ Editar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
