const ESTILOS = {
  PENDIENTE: { texto: "Pendiente", color: "var(--apple-amber)", fondo: "var(--apple-amber-soft)" },
  EN_PREPARACION: { texto: "En preparación", color: "var(--apple-blue)", fondo: "var(--apple-blue-soft)" },
  LISTO: { texto: "Listo", color: "var(--apple-purple)", fondo: "var(--apple-purple-soft)" },
  ENTREGADO: { texto: "Entregado", color: "var(--apple-green)", fondo: "var(--apple-green-soft)" },
  CANCELADO: { texto: "Cancelado", color: "var(--apple-red)", fondo: "var(--apple-red-soft)" },
};

export const ESTADOS_PEDIDO = Object.keys(ESTILOS);

export function textoEstado(estado) {
  return ESTILOS[estado]?.texto || estado;
}

export function formatearFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function EstadoPedido({ estado }) {
  const estilo = ESTILOS[estado] || { texto: estado, color: "var(--text-secondary)", fondo: "var(--bg-tertiary)" };
  return (
    <span
      style={{
        backgroundColor: estilo.fondo,
        color: estilo.color,
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        fontSize: "0.75rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {estilo.texto}
    </span>
  );
}
