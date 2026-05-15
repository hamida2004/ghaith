import axios from "axios";

const instance = axios.create({
  baseURL: "https://ghaith-backend.onrender.com"
  // baseURL:"http://localhost:5000"
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ✅ important fix
  }

  return config;
});

export default instance;