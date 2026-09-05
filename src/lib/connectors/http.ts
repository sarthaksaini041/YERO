import type { Platform, ConnectorError, ConnectorErrorCode } from "./types";

/** Default request timeout across all external connector calls (ms) */
export const DEFAULT_TIMEOUT_MS = 8000;

export function createConnectorError(
  code: ConnectorErrorCode,
  message: string,
  statusCode?: number
): ConnectorError {
  return { code, message, statusCode };
}

/**
 * Executes a fetch request with an AbortController timeout.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`UPSTREAM_TIMEOUT: Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retries transient failures (timeouts, 502/503/504, temporary network drop).
 * Never retries client errors (400, 404, invalid inputs).
 */
export async function withTransientRetry<T>(
  operation: () => Promise<T>,
  options: {
    platform: Platform;
    maxRetries?: number;
    delayMs?: number;
    isTransient?: (error: unknown) => boolean;
  }
): Promise<T> {
  const maxRetries = options.maxRetries ?? 1;
  const delayMs = options.delayMs ?? 600;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      const isTransient =
        options.isTransient?.(err) ??
        (err instanceof Error &&
          (err.message.includes("UPSTREAM_TIMEOUT") ||
            err.message.includes("fetch failed") ||
            err.message.includes("ECONNRESET") ||
            err.message.includes("ETIMEDOUT")));

      if (!isTransient || attempt > maxRetries) {
        throw err;
      }

      // Small backoff before single retry
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

/**
 * Structured server-side logging for connector requests.
 * Never logs sensitive data or user tokens.
 */
export function logConnectorRequest(meta: {
  platform: Platform;
  identifier: string;
  durationMs: number;
  success: boolean;
  errorCode?: ConnectorErrorCode;
  upstreamStatus?: number;
  message?: string;
}): void {
  const prefix = `[Connector] ${meta.platform.toUpperCase()}`;
  if (meta.success) {
    console.log(
      `${prefix} handle=${meta.identifier} status=success duration=${meta.durationMs}ms`
    );
  } else {
    console.warn(
      `${prefix} handle=${meta.identifier} status=failed code=${meta.errorCode ?? "UNKNOWN"} httpStatus=${meta.upstreamStatus ?? "N/A"} duration=${meta.durationMs}ms - ${meta.message ?? ""}`
    );
  }
}
