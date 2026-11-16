import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children, rolesPermitidos }) {
  const { estaAutenticado, rol } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
