// 获取联合国用中英文名

const Promise = require('bluebird');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const { translateEn2Zh } = require('../../common/baidu/fanyi');

const unCountriesChinese = require('../raw/_un_countries_chinese');
const unCountriesEnglish = require('../raw/_un_countries_english');
const unCountries = require('../raw/_un_countries.json');

const chineseNamesUri = 'http://www.un.org/zh/member-states/index.html';
const englishNamesUri = 'http://www.un.org/en/member-states/index.html';

async function getNamesArray(uri) {
  const html = await request(uri);
  const $ = cheerio.load(html);
  const array = $('.member-state-name').map((index, ele) => $(ele).get(0).children[0].data).get();
  return array;
}

// 获取原始国家名称信息
async function getNames() {
  const englishNames = await getNamesArray(englishNamesUri);
  await fs.writeFileSync(path.join(__dirname, './raw/_un_countries_english.json'), JSON.stringify(englishNames.map(name => name.replace(/[\\*]/gm, '').trim())));
  const chinessNames = await getNamesArray(chineseNamesUri);
  await fs.writeFileSync(path.join(__dirname, './raw/_un_countries_chinese.json'), JSON.stringify(chinessNames.map(name => name.replace(/[^\u4e00-\u9fa5]/gm, ''))));
}

// 获取国家名称翻译对照
async function getNamesTranlation() {
  const result = {};
  await Promise.map(unCountriesEnglish, (country, index, length) => {
    console.info(`-- 处理第 ${index}/${length} 个数据`);
    return translateEn2Zh(country)
      .then((chineseName) => {
        const ind = unCountriesChinese.indexOf(chineseName);
        if (ind > -1) {
          result[country] = chineseName;
          unCountriesChinese.splice(ind, 1);
        } else {
          result[country] = `-${chineseName}`;
        }
        return true;
      });
  }, { concurrency: 2 });
  await fs.writeFileSync(path.join(__dirname, '../raw/_un_countries_chinese.1.json'), JSON.stringify(unCountriesChinese));
  await fs.writeFileSync(path.join(__dirname, '../raw/_un_countries.json'), JSON.stringify(result));
}

// 重排序国家名称翻译对照
async function sortCountries() {
  const result = {};
  const keys = Object.keys(unCountries).sort();
  keys.forEach((key) => {
    result[key] = unCountries[key];
  });
  await fs.writeFileSync(path.join(__dirname, '../raw/_un_countries.json'), JSON.stringify(result));
}

async function run() {
  await sortCountries();
}

run()
  .then(() => console.info('----- √ 执行成功'))
  .catch(console.error)
  .then(() => process.exit(1));
