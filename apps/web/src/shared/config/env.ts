/** Client runtime configuration sourced from Vite env vars. */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8787",
} as const;
