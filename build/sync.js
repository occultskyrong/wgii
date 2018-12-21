/**
 * 同步更新 - 在线数据
 */

const logger = require('../src/common/logger');
const { syncChinaBorderLines } = require('../src/borderLine/china');

/**
 * 同步 - 边界线 - 数据
 */
async function syncBorderLines() {
  await syncChinaBorderLines();
  logger.info('    √ 同步 - 边界线 - 完成');
}

/**
 * 运行 - 同步 - 任务
 */
async function runSync() {
  await syncBorderLines();
  logger.info('  √ 运行 - 同步 - 完成');
}

module.exports = {
  runSync,
};
