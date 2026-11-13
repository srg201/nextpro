import { handler } from "@/lib/auth-server";

const CLIENT_IP_HEADER = "x-nextpro-client-ip";
const PROXY_SECRET_HEADER = "x-nextpro-proxy-secret";

const getClientIp = (request: Request) =>
  request.headers.get("x-real-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  null;

const forward = async (request: Request) => {
  const headers = new Headers(request.headers);
  headers.delete(CLIENT_IP_HEADER);
  headers.delete(PROXY_SECRET_HEADER);

  const clientIp = getClientIp(request);
  const secret = process.env.AUTH_PROXY_SECRET;
  if (clientIp && secret) {
    headers.set(CLIENT_IP_HEADER, clientIp);
    headers.set(PROXY_SECRET_HEADER, secret);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const proxied = new Request(request.url, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
  });

  return request.method === "GET" ? handler.GET(proxied) : handler.POST(proxied);
};

export const GET = forward;
export const POST = forward;
