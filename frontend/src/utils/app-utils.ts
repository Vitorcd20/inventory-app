export const API_BASE_URL = (() => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }
  if (typeof window !== "undefined" && window.location) {
    return "http://localhost:3000/api";
  }
  return "http://localhost:3000/api";
})();

