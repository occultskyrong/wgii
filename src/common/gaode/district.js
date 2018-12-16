/* eslint-disable prefer-destructuring */
/* eslint-disable global-require */
/**
 * 高德API查询国内行政区域
 */

const fs = require('fs');
const path = require('path');
const { gcj02towgs84 } = require('coordtransform');
const request = require('request-promise');

const douglasPeucker = require('../../common/map/douglas-peucker'); // 抽稀算法
const { gaode: { api: { map: { key } } } } = require('../../../config');

const baseUrl = 'https://restapi.amap.com/v3/config/district';

const adcodes = [
  110000, 120000, 130000, 140000, 150000,
  210000, 220000, 230000,
  310000, 320000, 330000, 340000, 350000, 360000, 370000,
  410000, 420000, 430000, 440000, 450000, 460000,
  500000, 510000, 520000, 530000, 540000,
  610000, 620000, 630000, 640000, 650000,
  710000,
  810000, 820000,
];

async function getProvince(adcode) {
  const result = await request(`${baseUrl}?key=${key}&keywords=${adcode}&subdistrict=0&extensions=all`, { json: true });
  return result;
}

async function china() {
  const result = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'MultiPolygon' },
      properties: { name: 'China', code: 'CHN' },
    }],
  };
  const { districts: [{ polyline }] } = await getProvince(100000);
  const gcj02Coordinates = [];
  const wgs84Coordinates = [];
  const pointsArray = polyline.split('|'); // 切分点组
  if (pointsArray.length === 0) { return; }
  pointsArray.forEach((pointsStr) => {
    const points = pointsStr.split(';'); // 切分成点
    const gcj02Points = []; // 国测局坐标点集
    const wgs84Points = []; // GPS坐标点集
    points.forEach((pointStr) => {
      const arr = pointStr.split(',');
      if (arr.length > 0) {
        const longitude = arr[0];
        const latitude = arr[1];
        gcj02Points.push([longitude, latitude]);
        wgs84Points.push(gcj02towgs84(longitude, latitude));
      }
    });
    gcj02Coordinates.push([gcj02Points]);
    wgs84Coordinates.push([wgs84Points]);
  });
  const { features: [{ geometry, properties }] } = result;
  geometry.coordinates = gcj02Coordinates;
  properties.coordinatesSystem = 'GCJ02';
  await fs.writeFileSync(path.join(__dirname, '../../../dist/CHN/country.gcj02.geo.json'), JSON.stringify(result));
  geometry.coordinates = wgs84Coordinates;
  properties.coordinatesSystem = 'WGS84';
  await fs.writeFileSync(path.join(__dirname, '../../../dist/CHN/country.wgs84.geo.json'), JSON.stringify(result));
}

/**
 * 抽稀坐标点
 */
async function sparse() {
  const result = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'MultiPolygon' },
      properties: { name: 'China', code: 'CHN' },
    }],
  };
  const MAX_HEIGHT = 1;
  const resultsCoordinates1 = []; // 结果集1
  const resultsCoordinates2 = []; // 结果集2
  const { features: [{ geometry: { coordinates } }] } = require('../../../dist/CHN/country.wgs84.geo.json');
  const pointsLength = coordinates.reduce((num, item) => num + item.length, 0);
  console.info('--- 共计 ', coordinates.length, ' 组 ， ', pointsLength, ' 个点数据 ---');
  coordinates.sort((a1, a2) => a2[0].length - a1[0].length)
    // .forEach(item => console.info(item[0].length))
    // .slice(0, 1)
    // coordinates.forEach(item => console.info(item[0].length));
    .filter(item => item[0].length > 100) // 过滤100个点以上的块
    .forEach((item) => {
      const pointsArray = item[0];
      console.info(' -- 抽稀前点数量：', pointsArray.length);
      // resultsCoordinates2.push([pointsArray]);
      const results = douglasPeucker(pointsArray, MAX_HEIGHT);
      // const results = douglasPeucker(pointsArray.slice(0, Math.ceil(pointsArray.length / 2)), 1);
      console.info(' -- 抽稀后点数量：', results.length, ' --');
      if (results.length > 10) { // 结果中含10个点以上
        resultsCoordinates1.push([results]);
      }
    });
  console.info('抽稀结果:共', resultsCoordinates1.length, '组数据');
  result.features[0].geometry.coordinates = resultsCoordinates1;
  // await fs.writeFileSync(path.join(__dirname, '../../../dist/CHN/country.wgs84.sparse.geo.json'), JSON.stringify(result));
  // result.features[0].geometry.coordinates = resultsCoordinates2;
  await fs.writeFileSync(path.join(__dirname, `../../../dist/CHN/country.wgs84.${MAX_HEIGHT}.sparse.geo.json`), JSON.stringify(result));
}

async function run() {
  await sparse();
}

run()
  .then(console.info)
  .catch(console.error);
