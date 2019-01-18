/**
 * 获取中国国界线、各省边界线
 */
const { gcj02towgs84, gcj02tobd09 } = require('coordtransform');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const { gaode: { api: { map: { key } } } } = require('../../config');

const baseUrl = 'https://restapi.amap.com/v3/config/district';

/**
 * 获取 - 中国 - 边界线
 */
async function getChinaBorderLine() {
  const url = `${baseUrl}?key=${key}&keywords=100000&subdistrict=0&extensions=all`;
  const { districts: [{ polyline }] } = await request(url, { json: true });
  return polyline;
}

/**
 * 转换坐标系 + 存储 - 中国 - 边界线
 */
async function save(polyline) {
  const result = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'MultiPolygon' },
      properties: { name: 'China', code: 'CHN' },
    }],
  };
  const gcj02Coordinates = []; // 国测局坐标系
  const wgs84Coordinates = []; // GPS坐标系
  const bd09Coordinates = []; // 百度坐标系
  const pointsArray = polyline.split('|'); // 切分点组
  if (pointsArray.length === 0) { return; }
  pointsArray.forEach((pointsStr) => {
    const points = pointsStr.split(';'); // 切分成点
    const gcj02Points = []; // 国测局坐标点集
    const wgs84Points = []; // GPS坐标点集
    const bd09Points = []; // 百度坐标点集
    points.forEach((pointStr) => {
      const arr = pointStr.split(',');
      if (arr.length > 0) {
        const longitude = arr[0];
        const latitude = arr[1];
        gcj02Points.push([longitude, latitude]);
        wgs84Points.push(gcj02towgs84(longitude, latitude)); // 国测局转GPS
        bd09Points.push(gcj02tobd09(longitude, latitude)); // 国测局转百度
      }
    });
    gcj02Coordinates.push([gcj02Points]);
    wgs84Coordinates.push([wgs84Points]);
    bd09Coordinates.push([bd09Points]);
  });
  const { features: [{ geometry, properties }] } = result;
  // 写入数据
  geometry.coordinates = gcj02Coordinates;
  properties.coordinatesSystem = 'GCJ02';
  await fs.writeFileSync(path.join(__dirname, '../../dist/CHN/country.gcj02.geo.json'), JSON.stringify(result));
  geometry.coordinates = wgs84Coordinates;
  properties.coordinatesSystem = 'WGS84';
  await fs.writeFileSync(path.join(__dirname, '../../dist/CHN/country.wgs84.geo.json'), JSON.stringify(result));
  geometry.coordinates = bd09Coordinates;
  properties.coordinatesSystem = 'BD09';
  await fs.writeFileSync(path.join(__dirname, '../../dist/CHN/country.bd09.geo.json'), JSON.stringify(result));
}

/**
 * 同步 - 中国 - 国界线
 */
async function syncChinaBorderLines() {
  const polyline = await getChinaBorderLine();
  await save(polyline);
}

module.exports = {
  syncChinaBorderLines,
};
