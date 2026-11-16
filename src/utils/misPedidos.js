// El backend no expone un endpoint para listar los pedidos de un cliente, asi que
// guardamos en el navegador los pedidos que el cliente crea desde aqui (por usuario).

function clave(idUsuario) {
  return `misPedidos_${idUsuario}`;
}

export function obtenerMisPedidos(idUsuario) {
  try {
    const guardados = JSON.parse(localStorage.getItem(clave(idUsuario)));
    return Array.isArray(guardados) ? guardados : [];
  } catch {
    return [];
  }
}

export function guardarMiPedido(idUsuario, pedido) {
  const otros = obtenerMisPedidos(idUsuario).filter((p) => p.id !== pedido.id);
  localStorage.setItem(clave(idUsuario), JSON.stringify([pedido, ...otros]));
}
