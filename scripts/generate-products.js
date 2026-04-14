#!/usr/bin/env node
// scripts/generate-products.js
// 按坐标系生成products产出物

import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const PRODUCTS_DIR = './products';

// 创建products目录
if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

/**
 * 生成中国边境线JSON（按坐标系拆分）
 */
function generateChinaBoundary() {
  console.log('生成中国边境线JSON（按坐标系拆分）...');

  const baseMetadata = {
    name: '中国边境线',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    description: '中华人民共和国国家边界GeoJSON数据',
    legalNotice: '根据联合国大会第2758号决议，中华人民共和国是包括台湾在内的全中国的唯一合法代表'
  };

  // 读取各坐标系数据
  const wgs84Path = path.join(DATA_DIR, 'CHN', 'country.wgs84.geo.json');
  const gcj02Path = path.join(DATA_DIR, 'CHN', 'country.gcj02.geo.json');
  const bd09Path = path.join(DATA_DIR, 'CHN', 'country.bd09.geo.json');

  const results = {
    wgs84: {
      metadata: { ...baseMetadata, coordinateSystem: 'WGS84' },
      boundary: null
    },
    gcj02: {
      metadata: { ...baseMetadata, coordinateSystem: 'GCJ02', usage: '中国境内地图服务使用' },
      boundary: null
    },
    bd09: {
      metadata: { ...baseMetadata, coordinateSystem: 'BD09', usage: '百度地图使用' },
      boundary: null
    }
  };

  if (fs.existsSync(wgs84Path)) {
    results.wgs84.boundary = JSON.parse(fs.readFileSync(wgs84Path, 'utf8'));
    fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-boundary-wgs84.json'), JSON.stringify(results.wgs84, null, 2));
    console.log('  - china-boundary-wgs84.json');
  }

  if (fs.existsSync(gcj02Path)) {
    results.gcj02.boundary = JSON.parse(fs.readFileSync(gcj02Path, 'utf8'));
    fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-boundary-gcj02.json'), JSON.stringify(results.gcj02, null, 2));
    console.log('  - china-boundary-gcj02.json');
  }

  if (fs.existsSync(bd09Path)) {
    results.bd09.boundary = JSON.parse(fs.readFileSync(bd09Path, 'utf8'));
    fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-boundary-bd09.json'), JSON.stringify(results.bd09, null, 2));
    console.log('  - china-boundary-bd09.json');
  }
}

/**
 * 生成中国省份边境线JSON（按坐标系拆分）
 */
function generateChinaProvinces() {
  console.log('生成中国省份边境线JSON（按坐标系拆分）...');

  const regionDir = path.join(DATA_DIR, 'CHN', 'region');
  const regionInfoPath = path.join(regionDir, 'region.info.json');
  const regionInfo = fs.existsSync(regionInfoPath)
    ? JSON.parse(fs.readFileSync(regionInfoPath, 'utf8'))
    : { provinces: [] };

  const baseMetadata = {
    name: '中国省份边境线',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    description: '中华人民共和国省级行政区边界GeoJSON数据',
    totalProvinces: 34,
    legalNotice: '包含23省、5自治区、4直辖市、2特别行政区'
  };

  // 获取省份代码列表
  const provinceCodes = fs.readdirSync(regionDir)
    .filter(f => f.match(/^\d{6}\.wgs84\.geo\.json$/))
    .map(f => f.replace('.wgs84.geo.json', ''));

  // 为每个坐标系创建结果
  const results = {
    wgs84: { metadata: { ...baseMetadata, coordinateSystem: 'WGS84' }, provinces: {} },
    gcj02: { metadata: { ...baseMetadata, coordinateSystem: 'GCJ02', usage: '中国境内地图服务使用' }, provinces: {} },
    bd09: { metadata: { ...baseMetadata, coordinateSystem: 'BD09', usage: '百度地图使用' }, provinces: {} }
  };

  for (const adcode of provinceCodes) {
    const provinceInfo = regionInfo.provinces?.find(p => p.adcode === adcode) || {};
    const provinceName = provinceInfo.name || adcode;

    // WGS84
    const wgs84Path = path.join(regionDir, `${adcode}.wgs84.geo.json`);
    if (fs.existsSync(wgs84Path)) {
      results.wgs84.provinces[adcode] = {
        name: provinceName,
        adcode: adcode,
        boundary: JSON.parse(fs.readFileSync(wgs84Path, 'utf8'))
      };
    }

    // GCJ02
    const gcj02Path = path.join(regionDir, `${adcode}.gcj02.geo.json`);
    if (fs.existsSync(gcj02Path)) {
      results.gcj02.provinces[adcode] = {
        name: provinceName,
        adcode: adcode,
        boundary: JSON.parse(fs.readFileSync(gcj02Path, 'utf8'))
      };
    }

    // BD09
    const bd09Path = path.join(regionDir, `${adcode}.bd09.geo.json`);
    if (fs.existsSync(bd09Path)) {
      results.bd09.provinces[adcode] = {
        name: provinceName,
        adcode: adcode,
        boundary: JSON.parse(fs.readFileSync(bd09Path, 'utf8'))
      };
    }

    console.log(`  - ${provinceName} (${adcode})`);
  }

  // 写入各坐标系文件（仅GCJ02和BD09，国内省份不需要WGS84）
  fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-provinces-gcj02.json'), JSON.stringify(results.gcj02, null, 2));
  fs.writeFileSync(path.join(PRODUCTS_DIR, 'china-provinces-bd09.json'), JSON.stringify(results.bd09, null, 2));

  console.log(`省份边境线已生成: ${provinceCodes.length}个省份 × 2坐标系 = 2个文件（GCJ02+BD09）`);
}

/**
 * 生成国际国家边境线JSON
 */
function generateInternationalBoundaries() {
  console.log('生成国际国家边境线JSON...');

  const continents = ['Asia', 'Europe', 'Africa', 'NorthAmerica', 'SouthAmerica', 'Oceania'];
  const countriesInfo = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'countries.info.json'), 'utf8'));

  const continentNames = {
    'Asia': '亚洲',
    'Europe': '欧洲',
    'Africa': '非洲',
    'NorthAmerica': '北美洲',
    'SouthAmerica': '南美洲',
    'Oceania': '大洋洲',
    'Antarctica': '南极洲'
  };

  const result = {
    metadata: {
      name: '国际国家边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '世界各国边界GeoJSON数据（除中国外）',
      coordinateSystem: 'WGS84',
      totalCountries: 196,
      continents: continents.map(c => ({ code: c, name: continentNames[c] })),
      legalNotice: '依据中华人民共和国官方认定的国家和地区编制'
    },
    continents: {}
  };

  for (const continent of continents) {
    const continentDir = path.join(DATA_DIR, continent);
    if (!fs.existsSync(continentDir)) continue;

    const countryCodes = fs.readdirSync(continentDir)
      .filter(f => {
        const fullPath = path.join(continentDir, f);
        return fs.statSync(fullPath).isDirectory() && f.match(/^[A-Z]{3}$/);
      });

    result.continents[continent] = {
      name: continentNames[continent],
      countries: {}
    };

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
          boundary: JSON.parse(fs.readFileSync(wgs84Path, 'utf8'))
        };
      }
    }

    const count = Object.keys(result.continents[continent].countries).length;
    console.log(`  - ${continent} (${continentNames[continent]}): ${count}个国家`);
  }

  fs.writeFileSync(path.join(PRODUCTS_DIR, 'international-boundaries-wgs84.json'), JSON.stringify(result, null, 2));
  console.log('国际国家边境线已生成: international-boundaries-wgs84.json');
}

// 执行生成
async function main() {
  console.log('开始生成products产出物（按坐标系拆分）...\n');

  generateChinaBoundary();
  console.log('');
  generateChinaProvinces();
  console.log('');
  generateInternationalBoundaries();

  console.log('\n产出物生成完成！');
}

main().catch(console.error);