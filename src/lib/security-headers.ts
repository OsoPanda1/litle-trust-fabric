const SELF = "'self'";
const NONE = "'none'";

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export const CSP_HEADER = [
  `default-src ${SELF}`,
  `script-src ${SELF} 'unsafe-inline' 'unsafe-eval'`,
  `style-src ${SELF} 'unsafe-inline'`,
  `img-src ${SELF} data: blob: https:`,
  `font-src ${SELF} data:`,
  `connect-src ${SELF} https://*.supabase.co https://api.openai.com https://api.github.com https://*.duckduckgo.com https://api.crossref.org https://pub.orcid.org https://isni.org`,
  `frame-ancestors ${NONE}`,
  `form-action ${SELF}`,
  `base-uri ${SELF}`,
  `object-src ${NONE}`,
].join("; ");

export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  if (!headers.has("Content-Security-Policy")) {
    headers.set("Content-Security-Policy", CSP_HEADER);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function secureJsonError(status: number, message: string): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(
          Object.entries(SECURITY_HEADERS).map(([k, v]) => [k, v])
        ),
      },
    },
  );
}
