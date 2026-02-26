// In production, API calls go through Vercel's proxy (same domain, no CORS/cookie issues)
// In development, API calls go directly to the local backend
export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
