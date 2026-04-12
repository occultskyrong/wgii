// src/utils/http.ts

/**
 * Fetch请求选项
 */
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Fetch封装 - 发送HTTP请求并返回JSON
 * @param url 请求URL
 * @param options 请求选项
 */
export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch封装 - 发送HTTP请求并返回文本/HTML
 * @param url 请求URL
 * @param options 请求选项
 */
export async function fetchText(url: string, options: FetchOptions = {}): Promise<string> {
  const { method = 'GET', headers = {}, timeout = 30000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 带重试的Fetch
 * @param url 请求URL
 * @param options 请求选项
 * @param retries 重试次数
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {},
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson<T>(url, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}