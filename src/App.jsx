import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import RutaProtegida from "./components/RutaProtegida";
import Login from "./pages/Login";
import RegistroCliente from "./pages/RegistroCliente";
import Restaurantes from "./pages/Restaurantes";
import DetalleRestaurante from "./pages/DetalleRestaurante";
import CrearRestaurante from "./pages/CrearRestaurante";
import CrearPropietario from "./pages/CrearPropietario";
import CrearEmpleado from "./pages/CrearEmpleado";
import NoAutorizado from "./pages/NoAutorizado";
import Carrito from "./pages/Carrito";
import MisPedidos from "./pages/MisPedidos";
import PedidosEmpleado from "./pages/PedidosEmpleado";
import Eficiencia from "./pages/Eficiencia";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro-cliente" element={<RegistroCliente />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Rutas Públicas para cualquier usuario autenticado */}
        <Route
          path="/restaurantes"
          element={
            <RutaProtegida>
              <Restaurantes />
            </RutaProtegida>
          }
        />
        <Route
          path="/restaurantes/:id"
          element={
            <RutaProtegida>
              <DetalleRestaurante />
            </RutaProtegida>
          }
        />

        {/* Rutas exclusivas para ADMINISTRADOR */}
        <Route
          path="/crear-restaurante"
          element={
            <RutaProtegida rolesPermitidos={["ADMINISTRADOR"]}>
              <CrearRestaurante />
            </RutaProtegida>
          }
        />
        <Route
          path="/crear-propietario"
          element={
            <RutaProtegida rolesPermitidos={["ADMINISTRADOR"]}>
              <CrearPropietario />
            </RutaProtegida>
          }
        />

        {/* Rutas exclusivas para PROPIETARIO */}
        <Route
          path="/crear-empleado"
          element={
            <RutaProtegida rolesPermitidos={["PROPIETARIO"]}>
              <CrearEmpleado />
            </RutaProtegida>
          }
        />
        <Route
          path="/eficiencia"
          element={
            <RutaProtegida rolesPermitidos={["PROPIETARIO"]}>
              <Eficiencia />
            </RutaProtegida>
          }
        />

        {/* Rutas exclusivas para CLIENTE */}
        <Route
          path="/carrito"
          element={
            <RutaProtegida rolesPermitidos={["CLIENTE"]}>
              <Carrito />
            </RutaProtegida>
          }
        />
        <Route
          path="/mi-pedido"
          element={
            <RutaProtegida rolesPermitidos={["CLIENTE"]}>
              <MisPedidos />
            </RutaProtegida>
          }
        />

        {/* Rutas exclusivas para EMPLEADO */}
        <Route
          path="/pedidos-empleado"
          element={
            <RutaProtegida rolesPermitidos={["EMPLEADO"]}>
              <PedidosEmpleado />
            </RutaProtegida>
          }
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/restaurantes" replace />} />
        <Route path="*" element={<Navigate to="/restaurantes" replace />} />
      </Routes>
    </div>
  );
}

export default App;
