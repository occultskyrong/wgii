#!/usr/bin/env node
// scripts/sync-china-regions.js
// 同步中国省级行政区边界数据

import { AmapCrawler } from '../dist/crawler/amap.js';
import { CoordinateTransformer } from '../dist/core/transform.js';
import JsonStore from '../dist/storage/json-store.js';
import { logger } from '../dist/utils/logger.js';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.AMAP_API_KEY;
if (!API_KEY) {
  console.error('请设置环境变量 AMAP_API_KEY');
  process.exit(1);
}

const OUTPUT_DIR = './dist/CHN/region';

async function syncProvinceRegions() {
  logger.info('开始同步中国省级行政区边界数据');

  const crawler = new AmapCrawler(API_KEY);
  await crawler.init();

  // 获取省级行政区列表
  const provinces = await crawler.getProvinces();
  logger.info(`获取到 ${provinces.length} 个省级行政区`);

  // 创建输出目录
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = {
    provinces: [],
    success: 0,
    failed: 0,
    startTime: new Date().toISOString()
  };

  for (const province of provinces) {
    try {
      logger.info(`同步: ${province.name} (${province.adcode})`);

      // 获取省份详细边界
      const geojson = await crawler.getProvinceDetail(province.adcode);

      // 只保留省级边界（过滤掉没有边界数据的区县）
      const validFeatures = geojson.features.filter(f =>
        f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0
      );

      if (validFeatures.length === 0) {
        logger.warn(`${province.name} 没有有效边界数据`);
        results.failed++;
        continue;
      }

      // 保存省级GeoJSON
      const provinceData = {
        type: 'FeatureCollection',
        features: validFeatures
      };

      const fileName = `${province.adcode}.wgs84.geo.json`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      await JsonStore.write(filePath, provinceData);

      // 生成GCJ02版本
      const gcj02Features = validFeatures.map(f => {
        if (f.geometry.type === 'Polygon') {
          return {
            ...f,
            geometry: {
              ...f.geometry,
              coordinates: f.geometry.coordinates.map(ring =>
                ring.map(coord => CoordinateTransformer.wgs84ToGcj02(coord[0], coord[1]))
              )
            },
            properties: {
              ...f.properties,
              coordinatesSystem: 'GCJ02'
            }
          };
        } else if (f.geometry.type === 'MultiPolygon') {
          return {
            ...f,
            geometry: {
              ...f.geometry,
              coordinates: f.geometry.coordinates.map(polygon =>
                polygon.map(ring =>
                  ring.map(coord => CoordinateTransformer.wgs84ToGcj02(coord[0], coord[1]))
                )
              )
            },
            properties: {
              ...f.properties,
              coordinatesSystem: 'GCJ02'
            }
          };
        }
        return f;
      });

      const gcj02Data = { type: 'FeatureCollection', features: gcj02Features };
      const gcj02Path = path.join(OUTPUT_DIR, `${province.adcode}.gcj02.geo.json`);
      await JsonStore.write(gcj02Path, gcj02Data);

      // 生成BD09版本
      const bd09Features = gcj02Features.map(f => {
        if (f.geometry.type === 'Polygon') {
          return {
            ...f,
            geometry: {
              ...f.geometry,
              coordinates: f.geometry.coordinates.map(ring =>
                ring.map(coord => CoordinateTransformer.gcj02ToBd09(coord[0], coord[1]))
              )
            },
            properties: {
              ...f.properties,
              coordinatesSystem: 'BD09'
            }
          };
        } else if (f.geometry.type === 'MultiPolygon') {
          return {
            ...f,
            geometry: {
              ...f.geometry,
              coordinates: f.geometry.coordinates.map(polygon =>
                polygon.map(ring =>
                  ring.map(coord => CoordinateTransformer.gcj02ToBd09(coord[0], coord[1]))
                )
              )
            },
            properties: {
              ...f.properties,
              coordinatesSystem: 'BD09'
            }
          };
        }
        return f;
      });

      const bd09Data = { type: 'FeatureCollection', features: bd09Features };
      const bd09Path = path.join(OUTPUT_DIR, `${province.adcode}.bd09.geo.json`);
      await JsonStore.write(bd09Path, bd09Data);

      // 记录省份信息
      results.provinces.push({
        name: province.name,
        adcode: province.adcode,
        featuresCount: validFeatures.length,
        levels: validFeatures.reduce((acc, f) => {
          const level = f.properties?.level || 'unknown';
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {})
      });

      results.success++;
      logger.info(`${province.name} 同步完成，${validFeatures.length} 个有效边界`);

    } catch (error) {
      logger.error(`${province.name} 同步失败: ${error.message}`);
      results.failed++;
    }

    // 避免API频率限制，每个省份间隔200ms
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  results.endTime = new Date().toISOString();

  // 保存汇总信息
  const infoPath = path.join(OUTPUT_DIR, 'region.info.json');
  await JsonStore.write(infoPath, results);

  logger.info(`同步完成: 成功 ${results.success}, 失败 ${results.failed}`);
  logger.info(`汇总信息已保存到: ${infoPath}`);

  return results;
}

syncProvinceRegions().catch(console.error);