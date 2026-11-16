import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = 540 }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            paddingBottom: 12,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            className="apple-btn apple-btn-secondary"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              borderRadius: "50%",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
