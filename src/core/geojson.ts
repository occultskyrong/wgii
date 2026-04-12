// src/core/geojson.ts

import path from 'path';
import { fileURLToPath } from 'url';
import type { CoordinateSystem, GeoJSONFeatureCollection } from '../types/index.d.ts';
import { JsonStore } from '../storage/json-store.js';
import { CoordinateTransformer } from './transform.js';
import Sparse from './sparse.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GeoJSON处理类
 * 提供GeoJSON数据的加载、保存、合并、坐标转换和抽稀等功能
 *
 * 注意: 此文件与country.ts存在循环依赖
 * 如需使用CountryManager，请在文件底部导入或使用延迟导入模式
 */
export class GeoJSONProcessor {
  /**
   * GeoJSON文件存储路径
   */
  private static readonly PATHS = {
    // 原始GeoJSON目录
    original: 'geojson/original',
    // 按坐标系分类的GeoJSON目录
    systems: 'geojson/systems',
    // 抽稀版本目录
    sparse: 'geojson/sparse',
  };

  /**
   * 加载指定国家和坐标系的GeoJSON数据
   * @param countryCode 国家代码（ISO3166-1 三位字母码）
   * @param system 坐标系类型，默认WGS84
   * @returns GeoJSON FeatureCollection，文件不存在时返回null
   */
  static async load(
    countryCode: string,
    system: CoordinateSystem = 'WGS84'
  ): Promise<GeoJSONFeatureCollection | null> {
    const fileName = this.getGeoJsonFileName(countryCode, system);
    const filePath = JsonStore.getDistPath(fileName);
    logger.debug(`Loading GeoJSON for ${countryCode} (${system}) from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 保存指定国家的GeoJSON数据
   * @param countryCode 国家代码
   * @param geojson GeoJSON数据
   * @param system 坐标系类型，默认WGS84
   */
  static async save(
    countryCode: string,
    geojson: GeoJSONFeatureCollection,
    system: CoordinateSystem = 'WGS84'
  ): Promise<void> {
    const fileName = this.getGeoJsonFileName(countryCode, system);
    const filePath = JsonStore.getDistPath(fileName);
    logger.debug(`Saving GeoJSON for ${countryCode} (${system}) to: ${filePath}`);
    await JsonStore.write(filePath, geojson);
  }

  /**
   * 合并多个国家的GeoJSON数据
   * @param countryCodes 国家代码数组
   * @param system 坐标系类型，默认WGS84
   * @returns 合并后的GeoJSON FeatureCollection
   */
  static async merge(
    countryCodes: string[],
    system: CoordinateSystem = 'WGS84'
  ): Promise<GeoJSONFeatureCollection> {
    logger.info(`Merging GeoJSON for ${countryCodes.length} countries (${system})`);

    const mergedFeatures: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    for (const countryCode of countryCodes) {
      const geojson = await this.load(countryCode, system);
      if (geojson) {
        mergedFeatures.features.push(...geojson.features);
        logger.debug(`Merged ${geojson.features.length} features from ${countryCode}`);
      } else {
        logger.warn(`GeoJSON not found for country: ${countryCode}`);
      }
    }

    logger.info(`Merged ${mergedFeatures.features.length} total features`);
    return mergedFeatures;
  }

  /**
   * 坐标系转换并保存
   * @param countryCode 国家代码
   * @param from 源坐标系
   * @param to 目标坐标系
   * @returns 转换后的GeoJSON，源文件不存在时返回null
   */
  static async transformAndSave(
    countryCode: string,
    from: CoordinateSystem,
    to: CoordinateSystem
  ): Promise<GeoJSONFeatureCollection | null> {
    logger.info(`Transforming GeoJSON for ${countryCode} from ${from} to ${to}`);

    // 加载源坐标系数据
    const sourceGeojson = await this.load(countryCode, from);
    if (!sourceGeojson) {
      logger.warn(`Source GeoJSON not found for ${countryCode} (${from})`);
      return null;
    }

    // 执行坐标转换
    const transformedGeojson = CoordinateTransformer.transformGeoJSON(sourceGeojson, from, to);

    // 保存转换后的数据
    await this.save(countryCode, transformedGeojson, to);

    logger.info(
      `Transformed and saved GeoJSON for ${countryCode}: ` +
        `${sourceGeojson.features.length} features, ` +
        `${to} coordinate system`
    );

    return transformedGeojson;
  }

  /**
   * 生成抽稀版本
   * 对GeoJSON进行不同精度的简化处理，生成多个版本
   * @param countryCode 国家代码
   * @param distances 抽稀距离数组（单位：米），如[100, 500, 1000]
   * @returns 生成的版本数量
   */
  static async generateSparseVersions(
    countryCode: string,
    distances: number[]
  ): Promise<number> {
    logger.info(`Generating sparse versions for ${countryCode} with distances: ${distances.join(', ')}`);

    // 加载原始WGS84数据
    const originalGeojson = await this.load(countryCode, 'WGS84');
    if (!originalGeojson) {
      logger.warn(`Original GeoJSON not found for ${countryCode}`);
      return 0;
    }

    let generatedCount = 0;

    for (const distance of distances) {
      try {
        // 抽稀处理
        const sparseFeatures = originalGeojson.features.map((feature) => ({
          ...feature,
          geometry: Sparse.simplifyGeoJSONCoordinates(feature.geometry, distance),
        }));

        const sparseGeojson: GeoJSONFeatureCollection = {
          type: 'FeatureCollection',
          features: sparseFeatures,
        };

        // 保存抽稀版本
        const fileName = this.getSparseFileName(countryCode, distance);
        const filePath = JsonStore.getDistPath(fileName);
        await JsonStore.write(filePath, sparseGeojson);

        generatedCount++;
        logger.debug(`Generated sparse version for ${countryCode} at ${distance}m`);
      } catch (error) {
        logger.error(`Failed to generate sparse version for ${countryCode} at ${distance}m`, error);
      }
    }

    logger.info(`Generated ${generatedCount} sparse versions for ${countryCode}`);
    return generatedCount;
  }

  /**
   * 获取所有可用的国家代码
   * 扫描GeoJSON存储目录，提取所有存在的国家代码
   * @param system 坐标系类型，默认WGS84
   * @returns 国家代码数组
   */
  static async getAvailableCountryCodes(
    system: CoordinateSystem = 'WGS84'
  ): Promise<string[]> {
    const dirPath = JsonStore.getDistPath(this.PATHS.systems);
    const suffix = `_${system.toLowerCase()}.geojson`;

    try {
      const files = await JsonStore.listJsonFiles(dirPath);
      const countryCodes = files
        .filter((file) => file.endsWith(suffix))
        .map((file) => file.replace(suffix, ''));

      logger.debug(`Found ${countryCodes.length} available country codes for ${system}`);
      return countryCodes;
    } catch (error) {
      logger.error(`Failed to list country codes for ${system}`, error);
      return [];
    }
  }

  /**
   * 处理所有国家的GeoJSON数据
   * 为所有国家生成指定距离的抽稀版本
   * @param distances 抽稀距离数组（单位：米）
   * @returns 处理结果统计
   */
  static async processAllCountries(
    distances: number[]
  ): Promise<{ total: number; success: number; failed: number }> {
    logger.info(`Processing all countries with distances: ${distances.join(', ')}`);

    const countryCodes = await this.getAvailableCountryCodes('WGS84');
    const result = {
      total: countryCodes.length,
      success: 0,
      failed: 0,
    };

    for (const countryCode of countryCodes) {
      try {
        const count = await this.generateSparseVersions(countryCode, distances);
        if (count > 0) {
          result.success++;
        } else {
          result.failed++;
        }
      } catch (error) {
        logger.error(`Failed to process country: ${countryCode}`, error);
        result.failed++;
      }
    }

    logger.info(
      `Processing complete: ${result.success} succeeded, ${result.failed} failed, ` +
        `${result.total} total`
    );

    return result;
  }

  /**
   * 获取GeoJSON文件名
   * @param countryCode 国家代码
   * @param system 坐标系
   * @returns 相对于dist目录的文件路径
   */
  private static getGeoJsonFileName(countryCode: string, system: CoordinateSystem): string {
    return path.join(this.PATHS.systems, `${countryCode}_${system.toLowerCase()}.geojson`);
  }

  /**
   * 获取抽稀版本文件名
   * @param countryCode 国家代码
   * @param distance 抽稀距离
   * @returns 相对于dist目录的文件路径
   */
  private static getSparseFileName(countryCode: string, distance: number): string {
    return path.join(this.PATHS.sparse, countryCode, `${distance}.geojson`);
  }

  /**
   * 加载原始GeoJSON数据（未经坐标转换）
   * @param countryCode 国家代码
   * @returns 原始GeoJSON数据
   */
  static async loadOriginal(countryCode: string): Promise<GeoJSONFeatureCollection | null> {
    const filePath = JsonStore.getDistPath(
      path.join(this.PATHS.original, `${countryCode}.geojson`)
    );
    logger.debug(`Loading original GeoJSON for ${countryCode} from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 保存原始GeoJSON数据
   * @param countryCode 国家代码
   * @param geojson GeoJSON数据
   */
  static async saveOriginal(countryCode: string, geojson: GeoJSONFeatureCollection): Promise<void> {
    const filePath = JsonStore.getDistPath(
      path.join(this.PATHS.original, `${countryCode}.geojson`)
    );
    logger.debug(`Saving original GeoJSON for ${countryCode} to: ${filePath}`);
    await JsonStore.write(filePath, geojson);
  }

  /**
   * 加载抽稀版本
   * @param countryCode 国家代码
   * @param distance 抽稀距离
   * @returns 抽稀后的GeoJSON数据
   */
  static async loadSparse(
    countryCode: string,
    distance: number
  ): Promise<GeoJSONFeatureCollection | null> {
    const fileName = this.getSparseFileName(countryCode, distance);
    const filePath = JsonStore.getDistPath(fileName);
    logger.debug(`Loading sparse GeoJSON for ${countryCode} at ${distance}m from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 检查国家GeoJSON是否存在
   * @param countryCode 国家代码
   * @param system 坐标系类型
   * @returns 是否存在
   */
  static async exists(countryCode: string, system: CoordinateSystem = 'WGS84'): Promise<boolean> {
    const fileName = this.getGeoJsonFileName(countryCode, system);
    const filePath = JsonStore.getDistPath(fileName);
    return await JsonStore.exists(filePath);
  }

  /**
   * 删除国家GeoJSON
   * @param countryCode 国家代码
   * @param system 坐标系类型
   * @returns 是否成功删除
   */
  static async delete(countryCode: string, system: CoordinateSystem = 'WGS84'): Promise<boolean> {
    const fileName = this.getGeoJsonFileName(countryCode, system);
    const filePath = JsonStore.getDistPath(fileName);
    logger.debug(`Deleting GeoJSON for ${countryCode} (${system})`);
    return await JsonStore.delete(filePath);
  }
}

export default GeoJSONProcessor;

/**
 * 循环依赖处理说明:
 *
 * GeoJSONProcessor 与 CountryManager 存在循环依赖:
 * - GeoJSONProcessor 可能需要调用 CountryManager 获取国家信息
 * - CountryManager 可能需要调用 GeoJSONProcessor 加载地理数据
 *
 * 解决方案:
 * 1. 在此文件底部使用延迟导入（lazy import）
 * 2. 或在使用时动态导入:
 *    const { CountryManager } = await import('./country.js');
 *
 * 示例延迟导入（如果需要在静态方法中使用CountryManager）:
 *
 * // 在文件底部添加:
 * // import('./country.js').then(module => {
 * //   GeoJSONProcessor.CountryManager = module.CountryManager;
 * // });
 */