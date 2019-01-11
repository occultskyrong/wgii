/**
 * 数据转换 - 从 mysql 到 JSON
 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const { sequelize, Sequelize } = require('../common/mysql');
const countries = require('../models/countries');

const Countries = countries(sequelize, Sequelize.DataTypes);

/**
 * 查询所有数据
 */
async function findAll() {
  const data = await Countries.findAll({ where: { country_type: 'Member State' } });
  const results = _.map(data, country => ({
    capital_name_chinese: country.capital_name_chinese,
    capital_name: country.capital_name_english,
    country_iso_code: country.country_iso_code,
    country_type: country.country_type,
    country_name_chinese: country.name_chinese,
    country_name_chinese_short: country.name_chinese_short,
    country_name_chinese_UN: country.name_chinese_UN,
    country_name_english_abbreviation: country.name_english_abbreviation,
    country_name_english_formal: country.name_english_formal,
    country_name_english_short: country.name_english_short,
    country_name_english_UN: country.name_english_UN,
    continent_name: country.continent,
    subregion_name: country.subregion,
  }));
  return results;
}

async function run() {
  const results = await findAll();
  console.info(results.length);
  fs.writeFileSync(path.join(__dirname, '../../dist/countries_info.json'), JSON.stringify(results));
}

run()
  .then(console.info)
  .catch(console.error)
  .then(() => process.exit(0));
