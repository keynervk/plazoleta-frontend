import { useState } from "react";

const DEGRADADOS = [
  ["#FF5A36", "#FF9500"],
  ["#0071E3", "#5AC8FA"],
  ["#34C759", "#30B0C7"],
  ["#AF52DE", "#FF2D55"],
  ["#FF9500", "#FFCC00"],
  ["#5856D6", "#AF52DE"],
];

const EMOJIS_PLATO = [
  [/hamburgues|burger/, "🍔"],
  [/pizza/, "🍕"],
  [/papa|frita/, "🍟"],
  [/perro|hot ?dog/, "🌭"],
  [/malteada|batido|jugo|limonada|gaseosa|bebida|cafe|café|soda/, "🥤"],
  [/carne|asado|parrilla|steak|res\b/, "🥩"],
  [/pollo|alita/, "🍗"],
  [/ensalada/, "🥗"],
  [/sopa|caldo/, "🍲"],
  [/pasta|espagueti|lasa/, "🍝"],
  [/taco|burrito/, "🌮"],
  [/sushi/, "🍣"],
  [/postre|helado|torta|pastel/, "🍰"],
];

export function emojiDePlato(...textos) {
  const texto = textos.filter(Boolean).join(" ").toLowerCase();
  const encontrado = EMOJIS_PLATO.find(([patron]) => patron.test(texto));
  return encontrado ? encontrado[1] : "🍽️";
}

export function iniciales(nombre) {
  return (nombre || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// Muestra la imagen; si no hay URL o no carga, un degradado (elegido por `semilla`)
// con `contenido` encima, para que cada tarjeta se distinga aunque no tenga foto.
export default function ImagenConRespaldo({ src, alt, semilla = 0, contenido, style, ...props }) {
  const [srcFallido, setSrcFallido] = useState(null);

  if (src && srcFallido !== src) {
    return <img src={src} alt={alt} onError={() => setSrcFallido(src)} style={style} {...props} />;
  }

  const [desde, hasta] = DEGRADADOS[Math.abs(Number(semilla) || 0) % DEGRADADOS.length];
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFF",
        fontWeight: 800,
        fontSize: "3rem",
        letterSpacing: "-0.02em",
        ...style,
        background: `linear-gradient(135deg, ${desde}, ${hasta})`,
      }}
      {...props}
    >
      {contenido}
    </div>
  );
}
