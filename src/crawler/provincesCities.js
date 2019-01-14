/* eslint-disable no-param-reassign */
/**
 * 从高德地图获取省份及城市对应关系
 * @see {@link https://lbs.amap.com/api/webservice/guide/api/district}
 */

const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const request = require('request-promise');
const _ = require('lodash');

const { gaode: { api: { map: { key } } } } = require('../../config');
const chineseProvincesCode = require('../../resource/raw/chinese_provinces_code');
const chineseProvincesTranslation = require('../../resource/raw/chinese_provinces_translation');
const chineseProvincesShort = require('../../resource/raw/chinese_provinces_short');

const baseUri = 'https://restapi.amap.com/v3/config/district?';

/**
 * 获取省份列表
 */
async function getProvinces() {
  const result = [];
  const params = {
    key,
    keywords: 100000, // 查询adcode
    subdistrict: 1, // 0：不返回下级行政区；1：返回下一级行政区；2：返回下两级行政区；3：返回下三级行政区；
    // offset:35, // 最外层返回数据个数
  };
  const uri = `${baseUri}${querystring.stringify(params)}`;
  const { districts: [{ districts }] } = await request(uri, { json: true });
  const translation = chineseProvincesTranslation.reduce((obj, item) => { obj[item.code] = item.name; return obj; }, {});
  _.each(districts, (region) => {
    const { adcode, name } = region;
    const number = adcode.substring(0, 2);
    let abbreviation = name.length > 4 ? name.substring(0, 2) : name.substring(0, name.length - 1); // 内蒙古少一个“古”字
    if (abbreviation === '内蒙') {
      abbreviation = '内蒙古';
    }
    result.push({
      region_name: translation[number],
      region_name_short: chineseProvincesCode[name],
      region_name_abbreviation: '', // fixme 手动填充
      region_name_chinese: name,
      region_name_chinese_short: chineseProvincesShort[abbreviation],
      region_name_chinese_abbreviation: abbreviation,
      region_code: number,
    });
  });
  // 按照code排序
  result.sort((o1, o2) => (o1.region_code > o2.region_code ? 1 : -1));
  return result;
}

/**
 * 存储省级信息列表
 */
async function saveProvinces(province) {
  // 格式化存储
  fs.writeFileSync(path.join(__dirname, '../../dist/CHN/region/region.info.json'), JSON.stringify(province).replace(/\},\{/gi, '\n},\n{\n'));
}

async function run() {
  const region = await getProvinces();
  await saveProvinces(region);
}

run()
  .then(console.info)
  .catch(console.error)
  .then(() => process.exit(0));
