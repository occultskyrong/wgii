/* eslint-disable global-require,import/no-dynamic-require */
/**
 * 根据多国家、多坐标体系的边界坐标点抽稀
 */

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const _ = require('lodash');

const douglasPeucker = require('../src/common/map/douglas-peucker');

const MaxHeight = [1, 2, 5, 10, 20];

/**
 * 获取文件列表
 */
async function geoJsonFiles() {
  const filePaths = [];
  const dirsPath = path.join(__dirname, '../dist');
  const dirs = fs.readdirSync(dirsPath);
  _.each(dirs, (dirName) => {
    const dirPath = path.join(dirsPath, `/${dirName}`);
    const dir = fs.statSync(dirPath);
    if (dir.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      _.each(files, (fileName) => {
        // 根据文件名称过滤
        if (/country\.[a-zA-z0-9]*\.geo\.json/g.test(fileName)) {
          filePaths.push(path.join(dirPath, `/${fileName}`));
        }
      });
    }
  });
  return filePaths;
}

/**
 * 读取文件内容
 * @param {*} filePath 文件路径
 */
async function sparse(filePath) {
  const json = require(filePath);
  const { features: [{ geometry: { coordinates } }] } = json;
  _.each(MaxHeight, (maxHeight) => {
    const resultFilePath = filePath.replace(/\.geo\.json/g, `.${maxHeight}.geo.json`);
    const resultCoorinates = douglasPeucker(coordinates, maxHeight);
    json.features[0].geometry.coordinates = resultCoorinates;
    fs.writeFileSync(resultFilePath, JSON.stringify(json));
  });
}

async function runSparse() {
  const filePaths = await geoJsonFiles();
  const promises = filePaths.map(sparse);
  await Promise.map(promises);
}

module.exports = {
  runSparse,
};
