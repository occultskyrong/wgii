#!/usr/bin/env node
// scripts/generate-region-sparse.js
// 为所有省级行政区生成抽稀版本

import { Sparse } from '../dist/core/sparse.js';
import { logger } from '../dist/utils/logger.js';
import JsonStore from '../dist/storage/json-store.js';
import fs from 'fs';
import path from 'path';

const REGION_DIR = './dist/CHN/region';
const DISTANCES = [1, 2, 5, 10, 20]; // 抽稀距离（米）

async function generateSparseVersions() {
  logger.info('开始生成省级行政区抽稀版本');

  // 获取所有省份文件
  const files = fs.readdirSync(REGION_DIR)
    .filter(f => f.endsWith('.wgs84.geo.json'));

  logger.info(`找到 ${files.length} 个省份文件`);

  const results = {
    total: files.length,
    processed: 0,
    failed: 0
  };

  for (const file of files) {
    try {
      const adcode = file.replace('.wgs84.geo.json', '');
      logger.info(`处理: ${adcode}`);

      // 读取WGS84数据
      const wgs84Path = path.join(REGION_DIR, file);
      const geojson = await JsonStore.read(wgs84Path);

      if (!geojson) {
        logger.warn(`${adcode} 无法读取数据`);
        results.failed++;
        continue;
      }

      // 为每个抽稀距离生成版本
      for (const distance of DISTANCES) {
        const sparseFeatures = geojson.features.map(feature => ({
          ...feature,
          geometry: Sparse.simplifyGeoJSONCoordinates(feature.geometry, distance)
        }));
        const sparseGeojson = { type: 'FeatureCollection', features: sparseFeatures };
        const sparsePath = path.join(REGION_DIR, `${adcode}.wgs84.sparse.${distance}.geo.json`);
        await JsonStore.write(sparsePath, sparseGeojson);
        logger.debug(`${adcode} sparse.${distance} 完成`);
      }

      // 同样为GCJ02和BD09生成抽稀版本
      const gcj02Path = path.join(REGION_DIR, `${adcode}.gcj02.geo.json`);
      const gcj02Data = await JsonStore.read(gcj02Path);
      if (gcj02Data) {
        for (const distance of DISTANCES) {
          const sparseFeatures = gcj02Data.features.map(feature => ({
            ...feature,
            geometry: Sparse.simplifyGeoJSONCoordinates(feature.geometry, distance)
          }));
          const sparseGeojson = { type: 'FeatureCollection', features: sparseFeatures };
          const sparsePath = path.join(REGION_DIR, `${adcode}.gcj02.sparse.${distance}.geo.json`);
          await JsonStore.write(sparsePath, sparseGeojson);
        }
      }

      const bd09Path = path.join(REGION_DIR, `${adcode}.bd09.geo.json`);
      const bd09Data = await JsonStore.read(bd09Path);
      if (bd09Data) {
        for (const distance of DISTANCES) {
          const sparseFeatures = bd09Data.features.map(feature => ({
            ...feature,
            geometry: Sparse.simplifyGeoJSONCoordinates(feature.geometry, distance)
          }));
          const sparseGeojson = { type: 'FeatureCollection', features: sparseFeatures };
          const sparsePath = path.join(REGION_DIR, `${adcode}.bd09.sparse.${distance}.geo.json`);
          await JsonStore.write(sparsePath, sparseGeojson);
        }
      }

      results.processed++;
      logger.info(`${adcode} 抽稀版本生成完成`);

    } catch (error) {
      logger.error(`${file} 处理失败: ${error.message}`);
      results.failed++;
    }
  }

  logger.info(`抽稀版本生成完成: 处理 ${results.processed}, 失败 ${results.failed}`);
  return results;
}

generateSparseVersions().catch(console.error);