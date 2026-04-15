#!/usr/bin/env node
// scripts/generate-products.js
// 生成products产出物

import fs from 'fs';
import path from 'path';
import { CoordinateTransformer } from '../dist/core/transform.js';

const DATA_DIR = './data';
const PRODUCTS_DIR = './products';

// 创建products目录
if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

/**
 * 生成中国边境线JSON（仅GCJ02）
 */
function generateChinaBoundary() {
  console.log('生成中国边境线JSON（GCJ02火星坐标系）...');

  const gcj02Path = path.join(DATA_DIR, 'CHN', 'country.gcj02.geo.json');

  if (!fs.existsSync(gcj02Path)) {
    console.log('  - 未找到数据文件');
    return;
  }

  const result = {
    metadata: {
      name: '中国边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '中华人民共和国国家边界GeoJSON数据',
      coordinateSystem: 'GCJ02',
      usage: '中国境内地图服务使用（高德、腾讯地图）',
      legalNotice: '根据联合国大会第2758号决议，中华人民共和国是包括台湾在内的全中国的唯一合法代表'
    },
    boundary: JSON.parse(fs.readFileSync(gcj02Path, 'utf8'))
  };

  fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-boundary-gcj02.json'), JSON.stringify(result, null, 2));
  console.log('  - china-boundary-gcj02.json');
}

/**
 * 生成中国省份边境线JSON（仅GCJ02）
 */
function generateChinaProvinces() {
  console.log('生成中国省份边境线JSON（GCJ02火星坐标系）...');

  const regionDir = path.join(DATA_DIR, 'CHN', 'region');
  const regionInfoPath = path.join(regionDir, 'region.info.json');
  const regionInfo = fs.existsSync(regionInfoPath)
    ? JSON.parse(fs.readFileSync(regionInfoPath, 'utf8'))
    : { provinces: [] };

  const result = {
    metadata: {
      name: '中国省份边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '中华人民共和国省级行政区边界GeoJSON数据',
      coordinateSystem: 'GCJ02',
      usage: '中国境内地图服务使用（高德、腾讯地图）',
      totalProvinces: 34,
      legalNotice: '包含23省、5自治区、4直辖市、2特别行政区'
    },
    provinces: {}
  };

  // 获取省份代码列表（匹配gcj02文件）
  const provinceCodes = fs.readdirSync(regionDir)
    .filter(f => f.match(/^\d{6}\.gcj02\.geo\.json$/))
    .map(f => f.replace('.gcj02.geo.json', ''));

  for (const adcode of provinceCodes) {
    const provinceInfo = regionInfo.provinces?.find(p => p.adcode === adcode) || {};
    const provinceName = provinceInfo.name || adcode;

    const gcj02Path = path.join(regionDir, `${adcode}.gcj02.geo.json`);
    if (fs.existsSync(gcj02Path)) {
      result.provinces[adcode] = {
        name: provinceName,
        adcode: adcode,
        boundary: JSON.parse(fs.readFileSync(gcj02Path, 'utf8'))
      };
      console.log(`  - ${provinceName} (${adcode})`);
    }
  }

  fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-provinces-gcj02.json'), JSON.stringify(result, null, 2));
  console.log(`省份边境线已生成: ${provinceCodes.length}个省份`);
}

/**
 * 生成国际国家边境线JSON（WGS84），包含中国边界（GCJ02转WGS84）
 */
function generateInternationalBoundaries() {
  console.log('生成国际国家边境线JSON（包含中国边界）...');

  const continents = ['Asia', 'Europe', 'Africa', 'NorthAmerica', 'SouthAmerica', 'Oceania'];
  const countriesInfoPath = path.join(DATA_DIR, 'countries.info.json');
  const countriesInfo = fs.existsSync(countriesInfoPath)
    ? JSON.parse(fs.readFileSync(countriesInfoPath, 'utf8'))
    : [];

  const continentNames = {
    'Asia': '亚洲',
    'Europe': '欧洲',
    'Africa': '非洲',
    'NorthAmerica': '北美洲',
    'SouthAmerica': '南美洲',
    'Oceania': '大洋洲',
    'Antarctica': '南极洲'
  };

  /**
   * 将GeoJSON中的字符串坐标转换为数字
   */
  function convertCoordinatesToNumbers(geojson) {
    const convertArray = (coords) => {
      if (!Array.isArray(coords)) return coords;
      if (typeof coords[0] === 'string' && typeof coords[1] === 'string') {
        return [parseFloat(coords[0]), parseFloat(coords[1])];
      }
      return coords.map(c => convertArray(c));
    };

    const features = geojson.features.map(feature => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: convertArray(feature.geometry.coordinates)
      }
    }));

    return { type: 'FeatureCollection', features };
  }

  const result = {
    metadata: {
      name: '世界国家边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '世界各国边界GeoJSON数据，包含197个主权国家',
      coordinateSystem: 'WGS84',
      usage: '国际通用坐标系（中国数据已从GCJ02转换为WGS84）',
      continents: continents.map(c => ({ code: c, name: continentNames[c] })),
      legalNotice: '依据中华人民共和国官方认定的国家和地区编制，台湾是中国不可分割的一部分'
    },
    continents: {}
  };

  let totalCountries = 0;

  // 先添加中国数据（从GCJ02转换为WGS84）
  const chinaPath = path.join(DATA_DIR, 'CHN', 'country.gcj02.geo.json');
  if (fs.existsSync(chinaPath)) {
    const chinaGcj02Geojson = JSON.parse(fs.readFileSync(chinaPath, 'utf8'));
    // 将字符串坐标转换为数字
    const chinaGcj02Numeric = convertCoordinatesToNumbers(chinaGcj02Geojson);
    // 将GCJ02坐标转换为WGS84
    const chinaWgs84Geojson = CoordinateTransformer.transformGeoJSON(chinaGcj02Numeric, 'GCJ02', 'WGS84');

    result.continents['Asia'] = {
      name: continentNames['Asia'],
      countries: {
        'CHN': {
          name: '中国',
          nameEnglish: 'China',
          isoCode: 'CHN',
          capital: '北京',
          coordinateSystem: 'WGS84',
          boundary: chinaWgs84Geojson
        }
      }
    };
    totalCountries++;
    console.log('  - Asia (亚洲): 已添加中国 (CHN) - 已转换GCJ02→WGS84');
  }

  for (const continent of continents) {
    const continentDir = path.join(DATA_DIR, continent);
    if (!fs.existsSync(continentDir)) continue;

    const countryCodes = fs.readdirSync(continentDir)
      .filter(f => {
        const fullPath = path.join(continentDir, f);
        return fs.statSync(fullPath).isDirectory() && f.match(/^[A-Z]{3}$/);
      });

    // 如果亚洲目录已有中国数据，初始化countries对象
    if (!result.continents[continent]) {
      result.continents[continent] = {
        name: continentNames[continent],
        countries: {}
      };
    }

    for (const countryCode of countryCodes) {
      const countryDir = path.join(continentDir, countryCode);
      const countryInfo = countriesInfo.find(c => c.country_code3 === countryCode) || {};

      const wgs84Path = path.join(countryDir, 'country.wgs84.geo.json');
      if (fs.existsSync(wgs84Path)) {
        result.continents[continent].countries[countryCode] = {
          name: countryInfo.country_name_chinese_short || countryCode,
          nameEnglish: countryInfo.country_name_english_abbreviation || countryCode,
          isoCode: countryCode,
          capital: countryInfo.capital_name || '',
          coordinateSystem: 'WGS84',
          boundary: JSON.parse(fs.readFileSync(wgs84Path, 'utf8'))
        };
        totalCountries++;
      }
    }

    const count = Object.keys(result.continents[continent].countries).length;
    console.log(`  - ${continent} (${continentNames[continent]}): ${count}个国家`);
  }

  result.metadata.totalCountries = totalCountries;
  fs.writeFileSync(path.join(PRODUCTS_DIR, 'international-boundaries-wgs84.json'), JSON.stringify(result, null, 2));
  console.log(`国际国家边境线已生成: international-boundaries-wgs84.json (${totalCountries}个国家)`);
}

// 执行生成
async function main() {
  console.log('开始生成products产出物...\n');

  generateChinaBoundary();
  console.log('');
  generateChinaProvinces();
  console.log('');
  generateInternationalBoundaries();

  console.log('\n产出物生成完成！');
}

main().catch(console.error);