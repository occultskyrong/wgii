/**
 * 同步更新 - 在线数据
 */
const { syncChinaBorderLines } = require('../src/borderLine/china');

/**
 * 同步 - 边界线 - 数据
 */
async function syncBorderLines() {
  await syncChinaBorderLines();
}

/**
 * 运行 - 同步 - 任务
 */
async function runSync() {
  await syncBorderLines();
}

module.exports = {
  runSync,
};
