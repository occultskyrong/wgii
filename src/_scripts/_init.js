/* eslint-disable global-require,import/no-dynamic-require */
/**
 * 初始化国家GEO数据
 */
const fs = require('fs');
const path = require('path');

const ExceptCountriesCode3 = ['CHN']; // 过滤国家

const geoDirpath = path.join(__dirname, '../../../world.geo.json/countries');

const geoJsonFiles = fs.readdirSync(geoDirpath);

const geoJsonCodePath = geoJsonFiles.reduce((obj, filename) => {
  const filepath = path.join(geoDirpath, filename);
  const countryCode3 = filename.split('.geo.json')[0];
  if (ExceptCountriesCode3.indexOf(countryCode3) === -1) {
    obj[countryCode3] = filepath;
  }
  return obj;
}, {});


const distDirpath = path.join(__dirname, '../../dist');
const countries = require(path.join(distDirpath, '/countries.info.json'));

countries.forEach((country) => {
  const { country_code3: countryCode3, country_name_english_UN: name } = country;
  if (countryCode3 in geoJsonCodePath) {
    const geoJsonFilepath = geoJsonCodePath[countryCode3];
    const distFilePath = path.join(distDirpath, countryCode3, 'country.bd09.geo.json');
    const { features: [{ geometry: { coordinates } }] } = require(geoJsonFilepath);
    const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'MultiPolygon', coordinates: [coordinates] },
        properties: { name, code: countryCode3, coordinatesSystem: 'BD09' },
      }],
    };
    fs.writeFileSync(distFilePath, JSON.stringify(geojson));
  }
});
