import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function decodificarToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(() => {
    const tokenGuardado = localStorage.getItem("token");
    return tokenGuardado ? decodificarToken(tokenGuardado) : null;
  });

  function iniciarSesion(nuevoToken) {
    localStorage.setItem("token", nuevoToken);
    setToken(nuevoToken);
    setUsuario(decodificarToken(nuevoToken));
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null);
  }

  const estaAutenticado = !!token;
  const rol = usuario?.rol ?? null;

  return (
    <AuthContext.Provider value={{ token, usuario, rol, estaAutenticado, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}