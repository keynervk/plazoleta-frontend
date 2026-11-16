# Frontend Plazoleta

Interfaz web de la plazoleta de comidas: cubre las HU 1 a 18 sobre los tres microservicios
([usuarios](https://github.com/keynervk/plazoleta-usuarios) 8081,
[plazoleta](https://github.com/keynervk/plazoleta-plazoleta) 8082 y
[pedidos](https://github.com/keynervk/plazoleta-pedidos) 8083).

React 19 + Vite, React Router y axios. Sin librería de componentes: estilos propios en `index.css` y `App.css`.

## Cómo levantarlo

1. Levantar los tres microservicios (ver el README de cada uno).
2. `npm install`
3. `npm run dev` y abrir <http://localhost:5173>.

Usa el puerto **5173** (el de Vite por defecto): es el único origen que los microservicios aceptan por CORS.

Para entrar por primera vez: `admin@plazoleta.com` / `admin1234` (lo crea Usuarios al arrancar).

Otros comandos: `npm run build` (compila a `dist/`) y `npm run lint` (oxlint).

## Pantallas por rol

| Rol | Ruta | Pantalla | HU |
|-----|------|----------|----|
| Todos | `/login` | Inicio de sesión | 5 |
| Público | `/registro-cliente` | Crear cuenta de cliente | 8 |
| Autenticado | `/restaurantes` | Restaurantes en orden alfabético, paginados | 9 |
| Autenticado | `/restaurantes/:id` | Menú paginado con filtro por categoría | 10 |
| ADMINISTRADOR | `/crear-propietario` | Crear propietario | 1 |
| ADMINISTRADOR | `/crear-restaurante` | Crear restaurante | 2 |
| PROPIETARIO | `/restaurantes/:id` (el suyo) | Crear, modificar y habilitar/deshabilitar platos | 3, 4, 7 |
| PROPIETARIO | `/crear-empleado` | Crear empleado de su restaurante | 6 |
| PROPIETARIO | `/eficiencia` | Tiempo por pedido y ranking de empleados | 18 |
| CLIENTE | `/carrito` | Carrito y confirmar pedido | 11 |
| CLIENTE | `/mi-pedido` | Mis pedidos: estado, historial y cancelar | 16, 17 |
| EMPLEADO | `/pedidos-empleado` | Pedidos por estado: asignarse, marcar listo y entregar con PIN | 12–15 |

## Estructura

```
src/
├── api/clientes.js        # una instancia de axios por microservicio; agrega el token a cada petición
├── context/
│   ├── AuthContext.jsx     # token en localStorage; rol, id y nombre se leen del JWT
│   └── CarritoContext.jsx  # carrito en memoria (un solo restaurante a la vez)
├── components/            # Navbar, RutaProtegida, tarjetas, Modal, Toast, EstadoPedido, ImagenConRespaldo
├── pages/                 # una página por pantalla
└── utils/misPedidos.js    # ids de los pedidos del cliente guardados en el navegador
```

## Decisiones de diseño

- **Rutas por rol**: `RutaProtegida` redirige a `/login` sin sesión y a `/no-autorizado` si el rol no tiene
  acceso. El backend vuelve a validar el rol en cada petición; esto es solo navegación.
- **Sesión**: el token se guarda en `localStorage`. Si el backend responde 401, se cierra la sesión.
- **Mis pedidos**: el backend no tiene un endpoint para que el cliente liste sus pedidos, así que al crear
  uno se guarda su id en el navegador y el estado se obtiene de la trazabilidad (`GET /pedidos/{id}/trazabilidad`).
  Por eso solo aparecen los pedidos hechos desde ese navegador.
- **Menú del propietario**: el menú público usa `GET /platos/paginado`, que solo trae platos activos. El dueño
  del restaurante ve todos sus platos (`GET /platos`) para poder volver a habilitar los inactivos.
- **Restaurantes**: se listan con `GET /restaurantes` y se ordenan y paginan en el navegador, porque
  `GET /restaurantes/paginado` (HU 9) devuelve solo nombre y logo, sin el id que hace falta para abrir el menú.
- **PIN de entrega**: el frontend nunca lo muestra; el empleado lo escribe cuando el cliente se lo dicta. En
  desarrollo el SMS es simulado y el PIN aparece en la consola del microservicio Pedidos (`[SMS SIMULADO]`).
- **Imágenes**: si la URL de un logo o plato no carga, se muestra un degradado con las iniciales del
  restaurante o un emoji según el plato.
