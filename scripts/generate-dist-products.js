#!/usr/bin/env node
// scripts/generate-dist-products.js
// 生成dist产出物：中国边境线、省份边境线、国际国家边境线

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
 * 生成中国边境线JSON
 * 包含WGS84、GCJ02、BD09三种坐标系
 */
async function generateChinaBoundary() {
  console.log('生成中国边境线JSON...');

  const result = {
    metadata: {
      name: '中国边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '中华人民共和国国家边界GeoJSON数据',
      coordinateSystems: ['WGS84', 'GCJ02', 'BD09'],
      legalNotice: '根据联合国大会第2758号决议，中华人民共和国是包括台湾在内的全中国的唯一合法代表'
    },
    boundary: {
      wgs84: null,
      gcj02: null,
      bd09: null
    }
  };

  // 读取各坐标系数据
  const wgs84Path = path.join(DATA_DIR, 'CHN', 'country.wgs84.geo.json');
  const gcj02Path = path.join(DATA_DIR, 'CHN', 'country.gcj02.geo.json');
  const bd09Path = path.join(DATA_DIR, 'CHN', 'country.bd09.geo.json');

  if (fs.existsSync(wgs84Path)) {
    result.boundary.wgs84 = JSON.parse(fs.readFileSync(wgs84Path, 'utf8'));
  }
  if (fs.existsSync(gcj02Path)) {
    result.boundary.gcj02 = JSON.parse(fs.readFileSync(gcj02Path, 'utf8'));
  }
  if (fs.existsSync(bd09Path)) {
    result.boundary.bd09 = JSON.parse(fs.readFileSync(bd09Path, 'utf8'));
  }

  // 写入文件
  const outputPath = path.join(PRODUCTS_DIR, 'china-boundary.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`中国边境线已生成: ${outputPath}`);

  return result;
}

/**
 * 生成中国省份边境线JSON
 * 包含34个省级行政区边界
 */
async function generateChinaProvinces() {
  console.log('生成中国省份边境线JSON...');

  const regionDir = path.join(DATA_DIR, 'CHN', 'region');
  const regionInfoPath = path.join(regionDir, 'region.info.json');

  // 读取省级汇总信息
  const regionInfo = fs.existsSync(regionInfoPath)
    ? JSON.parse(fs.readFileSync(regionInfoPath, 'utf8'))
    : { provinces: [] };

  const result = {
    metadata: {
      name: '中国省份边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '中华人民共和国省级行政区边界GeoJSON数据',
      totalProvinces: regionInfo.provinces?.length || 34,
      coordinateSystems: ['WGS84', 'GCJ02', 'BD09'],
      legalNotice: '包含23省、5自治区、4直辖市、2特别行政区'
    },
    provinces: {}
  };

  // 读取各省数据
  const provinceCodes = fs.readdirSync(regionDir)
    .filter(f => f.match(/^\d{6}\.wgs84\.geo\.json$/))
    .map(f => f.replace('.wgs84.geo.json', ''));

  for (const adcode of provinceCodes) {
    const provinceInfo = regionInfo.provinces?.find(p => p.adcode === adcode) || {};
    const provinceName = provinceInfo.name || adcode;

    const provinceData = {
      name: provinceName,
      adcode: adcode,
      boundary: {
        wgs84: null,
        gcj02: null,
        bd09: null
      }
    };

    const wgs84Path = path.join(regionDir, `${adcode}.wgs84.geo.json`);
    const gcj02Path = path.join(regionDir, `${adcode}.gcj02.geo.json`);
    const bd09Path = path.join(regionDir, `${adcode}.bd09.geo.json`);

    if (fs.existsSync(wgs84Path)) {
      provinceData.boundary.wgs84 = JSON.parse(fs.readFileSync(wgs84Path, 'utf8'));
    }
    if (fs.existsSync(gcj02Path)) {
      provinceData.boundary.gcj02 = JSON.parse(fs.readFileSync(gcj02Path, 'utf8'));
    }
    if (fs.existsSync(bd09Path)) {
      provinceData.boundary.bd09 = JSON.parse(fs.readFileSync(bd09Path, 'utf8'));
    }

    result.provinces[adcode] = provinceData;
    console.log(`  - ${provinceName} (${adcode})`);
  }

  // 写入文件
  const outputPath = path.join(PRODUCTS_DIR, 'china-provinces.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`中国省份边境线已生成: ${outputPath} (${provinceCodes.length}个省份)`);
}

/**
 * 生成国际国家边境线JSON
 * 按大洲组织，包含197个主权国家
 */
async function generateInternationalBoundaries() {
  console.log('生成国际国家边境线JSON...');

  const continents = ['Asia', 'Europe', 'Africa', 'NorthAmerica', 'SouthAmerica', 'Oceania'];
  const countriesInfo = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'countries.info.json'), 'utf8'));

  const result = {
    metadata: {
      name: '国际国家边境线',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      description: '世界各国边界GeoJSON数据（除中国外）',
      totalCountries: 197,
      coordinateSystems: ['WGS84'],
      continents: continents.map(c => ({
        code: c,
        name: getContinentChineseName(c)
      })),
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
      name: getContinentChineseName(continent),
      countries: {}
    };

    for (const countryCode of countryCodes) {
      const countryDir = path.join(continentDir, countryCode);
      const countryInfo = countriesInfo.find(c => c.country_code3 === countryCode) || {};

      const countryData = {
        name: countryInfo.country_name_chinese_short || countryCode,
        nameEnglish: countryInfo.country_name_english_abbreviation || countryCode,
        isoCode: countryCode,
        capital: countryInfo.capital_name || '',
        boundary: null
      };

      const wgs84Path = path.join(countryDir, 'country.wgs84.geo.json');
      if (fs.existsSync(wgs84Path)) {
        countryData.boundary = JSON.parse(fs.readFileSync(wgs84Path, 'utf8'));
      }

      result.continents[continent].countries[countryCode] = countryData;
    }

    const count = Object.keys(result.continents[continent].countries).length;
    console.log(`  - ${continent} (${getContinentChineseName(continent)}): ${count}个国家`);
  }

  // 写入文件
  const outputPath = path.join(PRODUCTS_DIR, 'international-boundaries.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`国际国家边境线已生成: ${outputPath}`);
}

function getContinentChineseName(code) {
  const names = {
    'Asia': '亚洲',
    'Europe': '欧洲',
    'Africa': '非洲',
    'NorthAmerica': '北美洲',
    'SouthAmerica': '南美洲',
    'Oceania': '大洋洲',
    'Antarctica': '南极洲'
  };
  return names[code] || code;
}

// 执行生成
async function main() {
  console.log('开始生成dist产出物...\n');

  await generateChinaBoundary();
  console.log('');
  await generateChinaProvinces();
  console.log('');
  await generateInternationalBoundaries();

  console.log('\n产出物生成完成！');
}

main().catch(console.error);