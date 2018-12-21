const log4js = require('log4js');
const path = require('path');

// 加载配置
log4js.configure({
  appenders: {
    out: { // 控制台输出
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c -%] %m',
      },
    },
    debug: { // 开发日志
      type: 'dateFile',
      filename: path.join(__dirname, '../../logs/debug.log'),
      maxLogSize: 1024 * 1024 * 10, // 最大10M文件大小
      backups: 1,
    },
  },
  categories: {
    default: {
      appenders: ['debug', 'out'],
      level: 'info',
    },
  },
});

const logger = log4js.getLogger();

module.exports = logger;
