"use client";

import { API_BASE } from "./config";
import { session } from "./session";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** Token shape the backend returns: { access: { token }, refresh: { token } }. */
type Tokens = { access?: { token: string }; refresh?: { token: string } };

export function storeTokens(tokens: Tokens | null | undefined) {
  const a = tokens?.access?.token;
  const r = tokens?.refresh?.token;
  if (a) session.set(a, r);
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const rt = session.refresh;
  if (!rt) return false;
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/v1/auth/refresh-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = (await res.json()) as Tokens;
        const a = data?.access?.token;
        if (!a) return false;
        session.set(a, data?.refresh?.token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

type Opts = Omit<RequestInit, "body"> & { body?: unknown; auth?: boolean };

/** Fetch wrapper: attaches the bearer token, transparently refreshes once on a
 *  401, parses JSON, and throws a typed ApiError on failure. */
export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;

  const run = async (): Promise<Response> => {
    const h = new Headers(headers);
    if (body !== undefined && !h.has("Content-Type"))
      h.set("Content-Type", "application/json");
    const token = session.access;
    if (auth && token) h.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await run();
  if (res.status === 401 && auth && session.refresh) {
    if (await refreshTokens()) res = await run();
    else session.clear();
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message =
      (data as { message?: string })?.message || res.statusText || "Request failed";
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Many endpoints wrap payloads as { status, data } — unwrap when present. */
export function unwrap<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    return (res as { data: T }).data;
  }
  return res as T;
}
