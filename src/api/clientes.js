import axios from "axios";

export const usuariosApi = axios.create({
  baseURL: "http://localhost:8081",
});

export const plazoletaApi = axios.create({
  baseURL: "http://localhost:8082",
});

function agregarToken(config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

usuariosApi.interceptors.request.use(agregarToken);
plazoletaApi.interceptors.request.use(agregarToken);