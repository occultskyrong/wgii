/**
 * 自动化构建
 */

const { runSparse } = require('./sparse').default;

runSparse()
  .then()
  .catch(console.error)
  .then(() => process.exit(0));
