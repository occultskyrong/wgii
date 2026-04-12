// src/crawler/amap.ts

import type { GeoJSONFeatureCollection, GeoJSONFeature, GeoJSONGeometry, Coordinate } from '../types/index.d.ts';
import { fetchJson } from '../utils/http.js';
import { getConfig } from '../utils/config.js';
import { CoordinateTransformer } from '../core/transform.js';
import JsonStore from '../storage/json-store.js';
import { logger } from '../utils/logger.js';

/**
 * 高德地图行政区划API响应
 */
interface AmapDistrictResponse {
  status: string;
  info: string;
  infocode: string;
  districts: AmapDistrict[];
}

/**
 * 高德地图行政区划数据
 */
interface AmapDistrict {
  adcode: string;
  name: string;
  center: string;
  level: string;
  polyline: string | string[];
  districts: AmapDistrict[];
}

/**
 * 高德地图API爬虫
 *
 * 用于获取中国行政区划边界数据并生成GeoJSON格式
 */
export class AmapCrawler {
  private apiKey: string;
  private readonly baseUrl = 'https://restapi.amap.com/v3/config/district';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  /**
   * 初始化，从配置文件加载API Key
   */
  async init(): Promise<void> {
    if (!this.apiKey) {
      const configKey = await getConfig('amap.apiKey');
      if (!configKey) {
        throw new Error('Amap API Key未配置，请在config/default.js中设置amap.apiKey');
      }
      this.apiKey = configKey;
    }
    logger.info('AmapCrawler初始化完成');
  }

  /**
   * 获取行政区划数据
   * @param adcode 行政区划代码
   * @param extensions 返回数据扩展项，默认返回基础信息
   */
  async getDistrict(adcode: string = '100000', extensions: 'base' | 'all' = 'all'): Promise<AmapDistrictResponse> {
    if (!this.apiKey) {
      await this.init();
    }

    const url = `${this.baseUrl}?key=${this.apiKey}&keywords=${adcode}&subdistrict=3&extensions=${extensions}&output=JSON`;
    logger.debug(`请求高德API: ${adcode}`);

    const response = await fetchJson<AmapDistrictResponse>(url);

    if (response.status !== '1') {
      throw new Error(`高德API请求失败: ${response.info} (code: ${response.infocode})`);
    }

    return response;
  }

  /**
   * 解析高德polyline字符串为坐标数组
   * 高德返回的polyline格式: "lng1,lat1;lng2,lat2;..."
   * @param polyline polyline字符串或字符串数组
   * @returns 坐标数组
   */
  private parsePolyline(polyline: string | string[]): Coordinate[][] {
    if (!polyline) {
      return [];
    }

    const parseSinglePolyline = (str: string): Coordinate[] => {
      const coordinates: Coordinate[] = [];
      const points = str.split(';');

      for (const point of points) {
        const trimmed = point.trim();
        if (!trimmed) continue;

        const [lngStr, latStr] = trimmed.split(',');
        const lng = parseFloat(lngStr);
        const lat = parseFloat(latStr);

        if (!isNaN(lng) && !isNaN(lat)) {
          // 高德坐标是GCJ02，转换为WGS84
          const wgs84Coord = CoordinateTransformer.gcj02ToWgs84(lng, lat);
          coordinates.push(wgs84Coord);
        }
      }

      return coordinates;
    };

    if (Array.isArray(polyline)) {
      // 多个polygon
      return polyline.map(p => parseSinglePolyline(p));
    } else {
      // 单个polygon
      return [parseSinglePolyline(polyline)];
    }
  }

  /**
   * 将行政区划数据转换为GeoJSON Feature
   * @param district 行政区划数据
   */
  private districtToFeature(district: AmapDistrict): GeoJSONFeature | null {
    if (!district.polyline) {
      logger.warn(`行政区划 ${district.name}(${district.adcode}) 没有边界数据`);
      return null;
    }

    const coordinates = this.parsePolyline(district.polyline);

    if (coordinates.length === 0 || coordinates[0].length < 3) {
      logger.warn(`行政区划 ${district.name}(${district.adcode}) 边界数据无效`);
      return null;
    }

    const geometry: GeoJSONGeometry = {
      type: coordinates.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: coordinates.length === 1 ? [coordinates[0]] : coordinates.map(c => [c]),
    };

    // 解析中心点
    let center: Coordinate | undefined;
    if (district.center) {
      const [lngStr, latStr] = district.center.split(',');
      const lng = parseFloat(lngStr);
      const lat = parseFloat(latStr);
      if (!isNaN(lng) && !isNaN(lat)) {
        center = CoordinateTransformer.gcj02ToWgs84(lng, lat);
      }
    }

    return {
      type: 'Feature',
      geometry,
      properties: {
        name: district.name,
        code: district.adcode,
        level: district.level,
        center: center ? `${center[0]},${center[1]}` : district.center,
        coordinatesSystem: 'WGS84',
      },
      id: district.adcode,
    };
  }

  /**
   * 递归处理行政区划数据
   * @param district 行政区划数据
   * @param features Feature数组
   */
  private processDistrictRecursive(district: AmapDistrict, features: GeoJSONFeature[]): void {
    const feature = this.districtToFeature(district);
    if (feature) {
      features.push(feature);
    }

    // 递归处理下级行政区
    if (district.districts && district.districts.length > 0) {
      for (const child of district.districts) {
        this.processDistrictRecursive(child, features);
      }
    }
  }

  /**
   * 生成中国行政区划GeoJSON
   * @param adcode 起始行政区划代码，默认为中国(100000)
   * @param subdistricts 子级深度，默认3级(省-市-区县)
   */
  async generateChinaGeoJSON(
    adcode: string = '100000',
    subdistricts: number = 3
  ): Promise<GeoJSONFeatureCollection> {
    logger.info(`开始生成中国行政区划GeoJSON，起始代码: ${adcode}，子级深度: ${subdistricts}`);

    if (!this.apiKey) {
      await this.init();
    }

    const response = await this.getDistrict(adcode, 'all');

    if (!response.districts || response.districts.length === 0) {
      throw new Error('未获取到行政区划数据');
    }

    const features: GeoJSONFeature[] = [];
    this.processDistrictRecursive(response.districts[0], features);

    logger.info(`GeoJSON生成完成，共 ${features.length} 个行政区划`);

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * 获取省级行政区列表
   */
  async getProvinces(): Promise<AmapDistrict[]> {
    logger.info('获取省级行政区列表');

    if (!this.apiKey) {
      await this.init();
    }

    const response = await this.getDistrict('100000', 'base');

    if (!response.districts || response.districts.length === 0) {
      return [];
    }

    // 中国行政区划数据的第一层是国家级，第二层是省级
    const china = response.districts[0];
    return china.districts || [];
  }

  /**
   * 同步行政区划数据到本地存储
   * @param outputDir 输出目录，默认为dist/geo
   */
  async sync(outputDir?: string): Promise<string> {
    logger.info('开始同步行政区划数据');

    const geojson = await this.generateChinaGeoJSON();

    const distPath = outputDir || JsonStore.getDistPath('geo');
    const filePath = `${distPath}/china_admin_divisions.json`;

    await JsonStore.write(filePath, geojson);

    logger.info(`行政区划数据已同步到: ${filePath}`);

    return filePath;
  }

  /**
   * 获取单个省份的详细边界数据
   * @param adcode 省份行政区划代码
   */
  async getProvinceDetail(adcode: string): Promise<GeoJSONFeatureCollection> {
    logger.info(`获取省份详细数据: ${adcode}`);

    const response = await this.getDistrict(adcode, 'all');

    if (!response.districts || response.districts.length === 0) {
      throw new Error(`未找到行政区划: ${adcode}`);
    }

    const features: GeoJSONFeature[] = [];
    this.processDistrictRecursive(response.districts[0], features);

    return {
      type: 'FeatureCollection',
      features,
    };
  }
}

export default AmapCrawler;