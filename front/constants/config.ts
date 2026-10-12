/**
 * Configuración de la API.
 *
 * Orden de prioridad para la URL del back:
 *   1. EXPO_PUBLIC_API_URL (archivo .env del front)  ej: http://192.168.0.15:3000/api
 *   2. Desarrollo local (__DEV__ o localhost)         -> http://localhost:3000/api
 *   3. Producción                                     -> Railway
 */
const PRODUCTION_URL = "https://splendid-integrity-production.up.railway.app/api";
const LOCAL_URL = "http://localhost:3000/api";

const isDevelopment =
  (typeof __DEV__ !== "undefined" && __DEV__) ||
  (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));

const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || (isDevelopment ? LOCAL_URL : PRODUCTION_URL),

  TIMEOUT: 10000,

  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
};

export default API_CONFIG;
