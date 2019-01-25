/**
 * 创建文件夹
 */

const fs = require('fs');
const path = require('path');

const DIR_PATH = path.join(__dirname, '../../dist');

const countries = require('../../dist/countries.info.json');

const code3Arr = countries.map(country => country.country_code3);

code3Arr.forEach((code3) => {
  const dirpath = path.join(DIR_PATH, code3);
  const exists = fs.existsSync(dirpath);
  if (!exists) {
    fs.mkdirSync(dirpath);
  }
});
