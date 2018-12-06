/* eslint-disable camelcase */
const Promise = require('bluebird');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const { Op } = require('sequelize');

// const { features } = require('./raw/_countries_1');
const { features } = require('../resource/raw/_countries_2');
const model = require('./model');
const { translateEn2Zh } = require('./common/baidu/fanyi');
const unCountries = require('../resource/raw/_un_countries');
const countries = require('../dist/countries_1');

// console.info('共计 ', features.length, ' 个国家和地区');

/**
 * 构造国家数据
 * @param {*} country 国家原始数据
 */
async function setCountryInfo(country) {
  if (country === undefined) { throw new Error('未获取到国家数据'); }
  let name_chinese;
  let name_chinese_abbreviation;
  let name_chinese_UN;
  let name_english_UN;
  const { properties } = country;
  const name_english_abbreviation = properties.NAME_SORT;
  const name_english_formal = properties.FORMAL_EN;
  const name_english_short = properties.ISO_A2;
  if (name_english_formal) {
    name_chinese = await translateEn2Zh(name_english_formal);
  }
  if (name_english_formal === name_english_abbreviation) {
    name_chinese_abbreviation = name_chinese;
  } else if (name_english_abbreviation) {
    name_chinese_abbreviation = await translateEn2Zh(name_english_abbreviation);
  }
  if (name_english_formal in unCountries) {
    name_english_UN = name_english_formal;
    name_chinese_UN = unCountries[name_english_UN];
  } else if (name_english_abbreviation in unCountries) {
    name_english_UN = name_english_abbreviation;
    name_chinese_UN = unCountries[name_english_UN];
  }
  const result = {
    // capital_name_chinese: '首都中文名称',
    // capital_name_english: '首都英文名称',
    // capital_point: '首都中心坐标点',
    // country_center_point: '国家中心坐标点',
    country_code: properties.ISO_A3,
    country_type: properties.TYPE,
    name_chinese,
    name_chinese_abbreviation,
    name_chinese_UN, // 联合国用中文名
    name_english_abbreviation,
    name_english_formal,
    name_english_short,
    name_english_UN, // 联合国用英文名
    // political_institutions: '政治制度',
    continent: properties.CONTINENT,
    subregion: properties.SUBREGION,
    // time_zone: '时区',
    // geometry_type: '几何形状',
    // geometry_points: '国界坐标点',
  };
  console.info(result);
  return result;
}

/**
 * 处理国家数据
 */
async function setCountries() {
  // const sovereignCountry = features.filter(c => c.properties.TYPE === 'Sovereign country');
  const results = await Promise.map(features, (country, index, length) => {
    console.info(`-- 处理第 ${index}/${length} 个数据`);
    return setCountryInfo(country);
  }, { concurrency: 5 });
  // console.info(results);
  fs.writeFileSync(path.join(__dirname, './results/countries_1.json'), JSON.stringify(results));
}

/**
 * 保存国家数据到mysql
 */
async function saveCountries() {
  const promises = _.map(countries, model.sync);
  await Promise.all(promises);
}

/**
 * 检查UN数据是否已完全匹配mysql中数据
 */
async function checkUNinMysql() {
  const countriesNames = Object.keys(unCountries);
  const results = await model.findAll({
    attributes: ['name_english_UN'],
    where: {
      name_english_UN: {
        [Op.in]: countriesNames,
      },
    },
  });
  console.info('--- √ 联合国共 ', countriesNames.length, ' 个成员国，已有 ', results.length, ' 条数据');
  _.each(results, (country) => {
    const { name_english_UN } = country;
    if (name_english_UN in unCountries) {
      delete unCountries[name_english_UN];
    }
  });
  console.info('--- × 缺少 ', unCountries, ' 数据');
}

async function run() {
  const result = await checkUNinMysql();
  return result;
}

run()
  .then(console.info)
  .catch(console.error)
  .then(() => process.exit(1));


// console.info(features.reduce((set, item) => {
//   set.add(item.properties.TYPE);
//   return set;
// }, new Set()));
