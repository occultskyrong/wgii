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
export declare function fetchJson<T>(url: string, options?: FetchOptions): Promise<T>;
/**
 * Fetch封装 - 发送HTTP请求并返回文本/HTML
 * @param url 请求URL
 * @param options 请求选项
 */
export declare function fetchText(url: string, options?: FetchOptions): Promise<string>;
/**
 * 带重试的Fetch
 * @param url 请求URL
 * @param options 请求选项
 * @param retries 重试次数
 */
export declare function fetchWithRetry<T>(url: string, options?: FetchOptions, retries?: number): Promise<T>;
//# sourceMappingURL=http.d.ts.map