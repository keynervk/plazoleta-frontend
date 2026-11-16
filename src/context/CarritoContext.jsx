import { createContext, useContext, useState } from "react";

export const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const [idRestaurante, setIdRestaurante] = useState(null);
  const [nombreRestaurante, setNombreRestaurante] = useState(null);

  function agregarAlCarrito(plato, cantidad, restauranteInfo) {
    if (idRestaurante !== null && idRestaurante !== restauranteInfo.id) {
      throw new Error("RESTAURANTE_DIFERENTE");
    }

    setItems((prev) => {
      const existente = prev.find((i) => i.idPlato === plato.id);
      if (existente) {
        return prev.map((i) =>
          i.idPlato === plato.id
            ? { ...i, cantidad: Math.min(10, i.cantidad + cantidad) }
            : i
        );
      }
      return [
        ...prev,
        {
          idPlato: plato.id,
          nombre: plato.nombre,
          precio: plato.precio,
          cantidad: Math.min(10, cantidad),
          urlImagen: plato.urlImagen,
          categoria: plato.categoria,
        },
      ];
    });

    if (idRestaurante === null) {
      setIdRestaurante(restauranteInfo.id);
      setNombreRestaurante(restauranteInfo.nombre);
    }
  }

  function eliminarDelCarrito(idPlato) {
    setItems((prev) => {
      const remaining = prev.filter((i) => i.idPlato !== idPlato);
      if (remaining.length === 0) {
        setIdRestaurante(null);
        setNombreRestaurante(null);
      }
      return remaining;
    });
  }

  function actualizarCantidad(idPlato, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(idPlato);
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.idPlato === idPlato ? { ...i, cantidad: Math.min(10, nuevaCantidad) } : i
        )
      );
    }
  }

  function vaciarCarrito() {
    setItems([]);
    setIdRestaurante(null);
    setNombreRestaurante(null);
  }

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const totalPrecio = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        idRestaurante,
        nombreRestaurante,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return ctx;
}
