/**
 * 自动化构建
 */

// 同步数据
const { runSync } = require('./sync');

// 抽稀边界线
const { runSparse } = require('./sparse');

async function run() {
  await runSync(); // 同步数据
  await runSparse(); // 抽稀边界线
}

run()
  .then()
  .catch(console.error)
  .then(() => process.exit(0));
