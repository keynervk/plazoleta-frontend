import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function decodificarToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json);
    
    // Check expiration if present
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const guardado = localStorage.getItem("token");
    if (!guardado) return null;
    const decoded = decodificarToken(guardado);
    if (!decoded) {
      localStorage.removeItem("token");
      return null;
    }
    return guardado;
  });

  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("token");
    return guardado ? decodificarToken(guardado) : null;
  });

  useEffect(() => {
    if (token) {
      const decoded = decodificarToken(token);
      if (!decoded) {
        cerrarSesion();
      }
    }
  }, [token]);

  function iniciarSesion(nuevoToken) {
    const decoded = decodificarToken(nuevoToken);
    if (decoded) {
      localStorage.setItem("token", nuevoToken);
      setToken(nuevoToken);
      setUsuario(decoded);
    } else {
      localStorage.setItem("token", nuevoToken);
      setToken(nuevoToken);
      setUsuario({ sub: "usuario", rol: "CLIENTE" });
    }
  }

  function cerrarSesion() {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null);
  }

  const estaAutenticado = !!token && !!usuario;
  const rol = usuario?.rol ?? null;

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        rol,
        estaAutenticado,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}