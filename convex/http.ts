import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "./_generated/dataModel";

const CLIENT_IP_HEADER = "x-nextpro-client-ip";
const PROXY_SECRET_HEADER = "x-nextpro-proxy-secret";

const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

// Requests proxied by Next.js reach Convex from the server's IP, so the real
// client IP (used for rate limiting) is only trusted when signed by the proxy.
const withTrustedClientIp = (request: Request) => {
  const headers = new Headers(request.headers);
  const clientIp = headers.get(CLIENT_IP_HEADER);
  const secret = headers.get(PROXY_SECRET_HEADER);
  const expected = process.env.AUTH_PROXY_SECRET;
  headers.delete(CLIENT_IP_HEADER);
  headers.delete(PROXY_SECRET_HEADER);

  if (clientIp && secret && expected && safeEqual(secret, expected)) {
    headers.set("x-forwarded-for", clientIp);
  }

  return new Request(request, { headers });
};

const http = httpRouter();

authComponent.registerRoutes(http, (ctx: GenericCtx<DataModel>) => {
  const auth = createAuth(ctx);
  return {
    ...auth,
    handler: (request: Request) => auth.handler(withTrustedClientIp(request)),
  };
});

export default http;
