import { useEffect } from "react";

export default function Toast({ mensaje, tipo = "info", onClose, duracion = 4000 }) {
  useEffect(() => {
    if (duracion > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duracion);
      return () => clearTimeout(timer);
    }
  }, [duracion, onClose]);

  const iconos = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div className={`toast toast-${tipo}`}>
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor:
            tipo === "success"
              ? "var(--apple-green)"
              : tipo === "error"
              ? "var(--apple-red)"
              : "var(--apple-blue)",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "0.8rem",
          flexShrink: 0,
        }}
      >
        {iconos[tipo] || "ℹ"}
      </span>
      <span style={{ flex: 1 }}>{mensaje}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-tertiary)",
          cursor: "pointer",
          fontSize: "1rem",
          padding: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}
