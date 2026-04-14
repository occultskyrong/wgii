#!/usr/bin/env node
// scripts/organize-data-by-continent.js
// 按大洲整理data目录结构

import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';
const countriesInfo = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'countries.info.json'), 'utf8'));

// 大洲目录映射
const continentDirs = {
  'Asia': 'Asia',
  'Africa': 'Africa',
  'Europe': 'Europe',
  'North America': 'NorthAmerica',
  'South America': 'SouthAmerica',
  'Oceania': 'Oceania',
  'Antarctica': 'Antarctica'
};

// 创建大洲目录
Object.values(continentDirs).forEach(dir => {
  const fullPath = path.join(DATA_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`创建目录: ${dir}`);
  }
});

// 移动国家数据到大洲目录
countriesInfo.forEach(country => {
  const continent = country.continent_name;
  const countryCode = country.country_code3;
  const continentDir = continentDirs[continent] || 'Unknown';

  const sourceDir = path.join(DATA_DIR, countryCode);
  const targetDir = path.join(DATA_DIR, continentDir, countryCode);

  if (fs.existsSync(sourceDir) && fs.statSync(sourceDir).isDirectory()) {
    // 移动目录
    if (!fs.existsSync(targetDir)) {
      fs.renameSync(sourceDir, targetDir);
      console.log(`${countryCode} (${country.country_name_chinese_short}) -> ${continentDir}`);
    }
  }
});

// 保留CHN在data根目录（中国单独处理）
console.log('\n中国(CHN)数据保持在data/CHN/目录');

// 移动info文件到data根目录保留
console.log('\ninfo文件保持在data根目录');

console.log('\n整理完成！');