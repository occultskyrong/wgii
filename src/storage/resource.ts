// src/storage/resource.ts

import path from 'path';
import { fileURLToPath } from 'url';
import type { GeoJSONFeatureCollection, CountryInfo, CountryInfoList, Coordinate } from '../types/index.d.ts';
import { JsonStore } from './json-store.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 资源数据管理模块
 * 提供各类地理数据的加载和保存功能
 */
export class Resource {
  /**
   * 资源文件路径常量
   */
  private static readonly PATHS = {
    // 原始数据目录
    original: 'original',
    // 原始GeoJSON文件
    countriesGeoJson: 'original/countries.geojson',
    // 世界国家GeoJSON（详细）
    worldCountryJson: 'original/world-country.json',
    // 世界地图GeoJSON
    worldMapJson: 'original/world-map.json',
    // 国家中心点坐标
    worldCountryCenter: 'original/world-country-center.json',
    // 国家名称翻译
    worldCountryTranslation: 'original/world-country-translation.json',
    // ISO3166国家代码
    iso3166: 'original/ISO3166.json',
    // 原始爬取数据目录
    raw: 'raw',
    // UN国家名称（中文）
    unCountriesChinese: 'raw/_un_countries_chinese.json',
    // UN国家名称（英文）
    unCountriesEnglish: 'raw/_un_countries_english.json',
    // 国家首都（英文）
    countriesCapitals: 'raw/_countries_capitals.json',
    // 国家中心点（爬取）
    countriesCenterPoint: 'raw/_countries_center_point.json',
    // 国家翻译（爬取）
    countriesTranslation: 'raw/_countries_translation.json',
    // 输出目录
    dist: 'dist',
    // 生成的GeoJSON文件
    generatedGeoJson: 'dist/countries.geojson',
    // 国家信息文件
    countriesInfo: 'dist/countries-info.json',
  };

  /**
   * 加载国家GeoJSON数据
   * @returns GeoJSON FeatureCollection
   */
  static async loadCountryGeoJson(): Promise<GeoJSONFeatureCollection | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.countriesGeoJson);
    logger.debug(`Loading country GeoJSON from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 加载详细的国家GeoJSON数据（包含更多属性）
   * @returns GeoJSON FeatureCollection
   */
  static async loadWorldCountryJson(): Promise<GeoJSONFeatureCollection | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.worldCountryJson);
    logger.debug(`Loading world country JSON from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 加载国家信息列表
   * @returns 国家信息列表
   */
  static async loadCountriesInfo(): Promise<CountryInfoList | null> {
    const filePath = JsonStore.getDistPath(this.PATHS.countriesInfo);
    logger.debug(`Loading countries info from: ${filePath}`);
    return await JsonStore.read<CountryInfoList>(filePath);
  }

  /**
   * 保存国家信息列表
   * @param countries 国家信息数组
   */
  static async saveCountriesInfo(countries: CountryInfo[]): Promise<void> {
    const filePath = JsonStore.getDistPath(this.PATHS.countriesInfo);
    const data: CountryInfoList = {
      countries,
      total: countries.length,
    };
    logger.debug(`Saving countries info to: ${filePath}`);
    await JsonStore.write(filePath, data);
  }

  /**
   * 加载联合国国家名称映射（中文）
   * @returns 国家名称映射（英文名 -> 中文名）
   */
  static async loadUNCountries(): Promise<Record<string, string> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.unCountriesChinese);
    logger.debug(`Loading UN countries from: ${filePath}`);
    return await JsonStore.read<Record<string, string>>(filePath);
  }

  /**
   * 加载联合国国家名称（英文）
   * @returns 国家名称映射（英文名 -> 英文名）
   */
  static async loadUNCountriesEnglish(): Promise<Record<string, string> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.unCountriesEnglish);
    logger.debug(`Loading UN countries English from: ${filePath}`);
    return await JsonStore.read<Record<string, string>>(filePath);
  }

  /**
   * 加载国家首都映射
   * @returns 首都映射（国家名 -> 首都名）
   */
  static async loadCapitals(): Promise<Record<string, string> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.countriesCapitals);
    logger.debug(`Loading capitals from: ${filePath}`);
    return await JsonStore.read<Record<string, string>>(filePath);
  }

  /**
   * 加载国家中心点坐标
   * @returns 中心点映射（国家名 -> 坐标）
   */
  static async loadCountryCenterPoints(): Promise<Record<string, Coordinate> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.countriesCenterPoint);
    logger.debug(`Loading country center points from: ${filePath}`);
    return await JsonStore.read<Record<string, Coordinate>>(filePath);
  }

  /**
   * 加载原始的国家中心点坐标（from world-country-center.json）
   * @returns 中心点映射（国家名 -> 坐标）
   */
  static async loadOriginalCountryCenterPoints(): Promise<Record<string, Coordinate> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.worldCountryCenter);
    logger.debug(`Loading original country center points from: ${filePath}`);
    return await JsonStore.read<Record<string, Coordinate>>(filePath);
  }

  /**
   * 加载国家名称翻译映射
   * @returns 翻译映射（英文名 -> 中文名）
   */
  static async loadCountryTranslation(): Promise<Record<string, string> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.countriesTranslation);
    logger.debug(`Loading country translation from: ${filePath}`);
    return await JsonStore.read<Record<string, string>>(filePath);
  }

  /**
   * 加载原始国家名称翻译（from world-country-translation.json）
   * @returns 翻译映射（英文名 -> 中文名）
   */
  static async loadOriginalCountryTranslation(): Promise<Record<string, string> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.worldCountryTranslation);
    logger.debug(`Loading original country translation from: ${filePath}`);
    return await JsonStore.read<Record<string, string>>(filePath);
  }

  /**
   * 加载ISO3166国家代码
   * @returns ISO3166数据数组
   */
  static async loadISO3166(): Promise<Array<{ name: string; code2: string; code3: string; phoneCode: string }> | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.iso3166);
    logger.debug(`Loading ISO3166 from: ${filePath}`);
    return await JsonStore.read<Array<{ name: string; code2: string; code3: string; phoneCode: string }>>(filePath);
  }

  /**
   * 保存国家GeoJSON数据
   * @param data GeoJSON FeatureCollection
   * @param fileName 文件名（默认countries.geojson）
   */
  static async saveCountryGeoJson(data: GeoJSONFeatureCollection, fileName: string = 'countries.geojson'): Promise<void> {
    const filePath = JsonStore.getDistPath(fileName);
    logger.debug(`Saving country GeoJSON to: ${filePath}`);
    await JsonStore.write(filePath, data);
  }

  /**
   * 加载生成的GeoJSON数据
   * @returns GeoJSON FeatureCollection
   */
  static async loadGeneratedGeoJson(): Promise<GeoJSONFeatureCollection | null> {
    const filePath = JsonStore.getDistPath(this.PATHS.generatedGeoJson);
    logger.debug(`Loading generated GeoJSON from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 检查生成的GeoJSON是否存在
   * @returns 是否存在
   */
  static async hasGeneratedGeoJson(): Promise<boolean> {
    const filePath = JsonStore.getDistPath(this.PATHS.generatedGeoJson);
    return await JsonStore.exists(filePath);
  }

  /**
   * 检查国家信息文件是否存在
   * @returns 是否存在
   */
  static async hasCountriesInfo(): Promise<boolean> {
    const filePath = JsonStore.getDistPath(this.PATHS.countriesInfo);
    return await JsonStore.exists(filePath);
  }

  /**
   * 加载世界地图GeoJSON（包含大洲边界等）
   * @returns GeoJSON FeatureCollection
   */
  static async loadWorldMap(): Promise<GeoJSONFeatureCollection | null> {
    const filePath = JsonStore.getResourcePath(this.PATHS.worldMapJson);
    logger.debug(`Loading world map from: ${filePath}`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }
}

export default Resource;