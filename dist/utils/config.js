// src/utils/config.ts
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cachedConfig = null;
/**
 * 加载配置文件
 */
export async function loadConfig() {
    if (cachedConfig) {
        return cachedConfig;
    }
    const configPath = path.join(__dirname, '../../config/default.js');
    try {
        // 动态导入ES Module配置
        const configModule = await import(configPath);
        const config = configModule.default || {};
        cachedConfig = config;
        return config;
    }
    catch {
        // 配置文件不存在时返回默认配置
        const defaultConfig = {
            amap: { apiKey: '' },
            output: { distDir: './dist' },
            log: { level: 'info' },
        };
        cachedConfig = defaultConfig;
        return defaultConfig;
    }
}
/**
 * 获取配置项
 * @param key 配置键名，支持点分隔如 'amap.apiKey'
 */
export async function getConfig(key) {
    const config = await loadConfig();
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        }
        else {
            return undefined;
        }
    }
    return typeof value === 'string' ? value : undefined;
}
/**
 * 获取输出目录路径
 */
export async function getDistDir() {
    const distDir = await getConfig('output.distDir') || './dist';
    return path.resolve(__dirname, '../../', distDir);
}
/**
 * 清除配置缓存（用于测试）
 */
export function clearConfigCache() {
    cachedConfig = null;
}
//# sourceMappingURL=config.js.map