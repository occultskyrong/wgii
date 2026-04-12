/**
 * WGII配置接口
 */
export interface WgiiConfig {
    amap?: {
        apiKey: string;
    };
    output?: {
        distDir: string;
    };
    log?: {
        level: string;
    };
}
/**
 * 加载配置文件
 */
export declare function loadConfig(): Promise<WgiiConfig>;
/**
 * 获取配置项
 * @param key 配置键名，支持点分隔如 'amap.apiKey'
 */
export declare function getConfig(key: string): Promise<string | undefined>;
/**
 * 获取输出目录路径
 */
export declare function getDistDir(): Promise<string>;
/**
 * 清除配置缓存（用于测试）
 */
export declare function clearConfigCache(): void;
//# sourceMappingURL=config.d.ts.map