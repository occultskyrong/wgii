// src/utils/config.ts

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

let cachedConfig: WgiiConfig | null = null;

/**
 * 加载配置文件
 */
export async function loadConfig(): Promise<WgiiConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(__dirname, '../../config/default.js');

  try {
    // 动态导入ES Module配置
    const configModule = await import(configPath);
    cachedConfig = configModule.default || {};
    return cachedConfig;
  } catch {
    // 配置文件不存在时返回默认配置
    cachedConfig = {
      amap: { apiKey: '' },
      output: { distDir: './dist' },
      log: { level: 'info' },
    };
    return cachedConfig;
  }
}

/**
 * 获取配置项
 * @param key 配置键名，支持点分隔如 'amap.apiKey'
 */
export async function getConfig(key: string): Promise<string | undefined> {
  const config = await loadConfig();
  const keys = key.split('.');
  let value: unknown = config;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

/**
 * 获取输出目录路径
 */
export async function getDistDir(): Promise<string> {
  const distDir = await getConfig('output.distDir') || './dist';
  return path.resolve(__dirname, '../../', distDir);
}

/**
 * 清除配置缓存（用于测试）
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}