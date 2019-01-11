/* eslint-disable camelcase */

const countries = require('./models/countries');
const { sequelize, Sequelize } = require('./common/mysql');

const Countries = countries(sequelize, Sequelize.DataTypes);

async function findOne(query) {
  const result = await Countries.findOne(query);
  return result;
}

/**
 * 查询 - 所有数据
 * @param {*} query 查询语句
 */
async function findAll(query) {
  const results = await Countries.findAll(query);
  return results;
}

/**
 * 同步：新增或更新数据
 * @param {object} country 国家数据
 */
async function sync(country) {
  const { name_english_formal } = country;
  const result = await Countries.findOne({ where: { name_english_formal }, attributes: ['id'] });
  if (result) {
    await result.update(country);
  } else {
    console.info(country);
    await Countries.create(country);
  }
}

module.exports = {
  findOne,
  findAll,
  sync,
};
