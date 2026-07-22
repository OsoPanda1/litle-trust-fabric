const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://litle-trust-fabric.vercel.app",
  "https://litle-trust-fabric.railway.app",
  "https://litle-trust-fabric.onrender.com",
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://litle-trust-fabric.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function isCorsPreflight(request: Request): boolean {
  return request.method === "OPTIONS" && !!request.headers.get("Origin");
}
