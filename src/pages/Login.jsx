import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usuariosApi } from "../api/clientes";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const respuesta = await usuariosApi.post("/usuarios/login", { correo, clave });
      iniciarSesion(respuesta.data.token);
      navigate("/restaurantes");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Correo o clave incorrectos");
      } else {
        setError("Ocurrio un error al iniciar sesion. Verifica que el backend este corriendo.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h2>Iniciar sesion</h2>
      <form onSubmit={manejarSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Correo</label>
          <br />
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Clave</label>
          <br />
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={cargando} style={{ padding: "8px 16px" }}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}