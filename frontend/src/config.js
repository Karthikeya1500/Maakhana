// In production (Vercel), use empty string so requests go through the same-domain proxy
// In development, use localhost backend directly
export const serverUrl = import.meta.env.DEV
    ? "http://localhost:8000"
    : (import.meta.env.VITE_SERVER_URL || "");
