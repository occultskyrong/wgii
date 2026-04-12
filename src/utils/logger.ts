// src/utils/logger.ts

import log4js from 'log4js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

log4js.configure({
  appenders: {
    console: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c -%] %m',
      },
    },
    file: {
      type: 'dateFile',
      filename: path.join(__dirname, '../../logs/wgii.log'),
      maxLogSize: 1024 * 1024 * 10, // 10MB
      backups: 3,
      compress: true,
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: 'info',
    },
    debug: {
      appenders: ['console'],
      level: 'debug',
    },
  },
});

/**
 * 获取Logger实例
 * @param category 日志类别
 */
export function getLogger(category: string = 'wgii'): log4js.Logger {
  return log4js.getLogger(category);
}

/**
 * 默认Logger
 */
export const logger = getLogger('wgii');

/**
 * 设置日志级别
 * @param level debug/info/warn/error
 */
export function setLogLevel(level: string): void {
  log4js.getLogger('wgii').level = level;
}