import log4js from 'log4js';
/**
 * 获取Logger实例
 * @param category 日志类别
 */
export declare function getLogger(category?: string): log4js.Logger;
/**
 * 默认Logger
 */
export declare const logger: log4js.Logger;
/**
 * 设置日志级别
 * @param level debug/info/warn/error
 */
export declare function setLogLevel(level: string): void;
//# sourceMappingURL=logger.d.ts.map