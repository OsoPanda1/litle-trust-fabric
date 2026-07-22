import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders, secureJsonError } from "./lib/security-headers";
import { rateLimitMiddleware } from "./lib/rate-limit";
import { getCorsHeaders, isCorsPreflight } from "./lib/cors";
import { validateServerEnv } from "./lib/env";
import { logger } from "./lib/logger";

// Validate required environment variables at boot
const envValidation = validateServerEnv();
if (!envValidation.valid) {
  logger.error(`Missing required env vars: ${envValidation.missing.join(", ")}`, "server");
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  logger.error(`h3 swallowed SSR error: ${body}`, "server", consumeLastCapturedError());
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isStaticAsset(url: string): boolean {
  const staticPatterns = [/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?)$/i, /\/assets\//];
  return staticPatterns.some((p) => p.test(url));
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // CORS preflight
    if (isCorsPreflight(request)) {
      const origin = request.headers.get("Origin");
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    const url = new URL(request.url);

    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const secured = await normalizeCatastrophicSsrResponse(response);

      if (!isStaticAsset(url.pathname)) {
        return applySecurityHeaders(secured);
      }

      return secured;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      logger.error(`SSR unhandled error: ${message}`, "server", error);
      return secureJsonError(500, message);
    }
  },
};
