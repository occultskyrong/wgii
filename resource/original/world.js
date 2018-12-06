// 合并世界地图-国家边界和中心点坐标

const fs = require('fs');

const worldCountryJson = require('./world-map.json');
const worldCountryCenterObject = require('./world-country-center.json');
const worldCountryTranslationObject = require('./world-country-translation.json');

// 写入结果文件名
const resultFileName = 'world-country.json';

// "center_point":[],
// "chinese_name":""

const worldCountryArray = worldCountryJson.features; // 国家数组
const resultWorldCountryArray = []; // 结果集

worldCountryArray.forEach((worldCountryItem) => {
  const item = worldCountryItem;
  const { properties: { name } } = item; // 国家数据:国家名称
  const boo1 = name in worldCountryCenterObject;
  const boo2 = name in worldCountryTranslationObject;
  const worldCountryCenter = boo1 ? worldCountryCenterObject[name] : [];
  const worldCountryTranslation = boo2 ? worldCountryTranslationObject[name] : '';
  // if (!boo1 || !boo2) {
  // console.info(name, boo1 ? '' : 'x1', boo2 ? '' : 'x2');
  // }
  item.properties.center_point = worldCountryCenter;
  item.properties.chinese_name = worldCountryTranslation;
  resultWorldCountryArray.push(item);
});

worldCountryJson.features = resultWorldCountryArray;

// console.info(`共计【${resultWorldCountryArray.length}】个国家或地区`);

fs.writeFileSync(resultFileName, JSON.stringify(worldCountryJson));
