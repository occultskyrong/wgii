// src/core/transform.ts

import type { Coordinate, CoordinateSystem, GeoJSONFeatureCollection } from '../types/index.d.ts';

/**
 * 坐标系转换常量
 */
const PI = Math.PI;
const X_PI = PI * 3000 / 180;
const A = 6378245; // 长半轴
const EE = 0.00669342162296594323; // 偏心率平方

/**
 * 判断坐标是否在中国境内
 */
function isInChina(lng: number, lat: number): boolean {
  return lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55;
}

/**
 * 转换辅助函数 - 经度偏移量
 */
function transformLat(lng: number, lat: number): number {
  let ret = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2 / 3;
  ret += (20 * Math.sin(lat * PI) + 40 * Math.sin(lat / 3 * PI)) * 2 / 3;
  ret += (160 * Math.sin(lat / 12 * PI) + 320 * Math.sin(lat * PI / 30)) * 2 / 3;
  return ret;
}

/**
 * 转换辅助函数 - 纬度偏移量
 */
function transformLng(lng: number, lat: number): number {
  let ret = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2 / 3;
  ret += (20 * Math.sin(lng * PI) + 40 * Math.sin(lng / 3 * PI)) * 2 / 3;
  ret += (150 * Math.sin(lng / 12 * PI) + 150 * Math.sin(lng / 30 * PI)) * 2 / 3;
  return ret;
}

/**
 * 坐标系转换类
 *
 * 支持WGS84、GCJ02(火星坐标)、BD09(百度坐标)三种坐标系之间的转换
 *
 * - WGS84: 国际标准坐标系，GPS设备使用的坐标系
 * - GCJ02: 中国国家测绘局制定的加密坐标系，高德地图、腾讯地图使用
 * - BD09: 百度地图使用的坐标系，在GCJ02基础上二次加密
 */
export class CoordinateTransformer {
  /**
   * WGS84 转 GCJ02（火星坐标）
   *
   * @param lng 经度
   * @param lat 纬度
   * @returns GCJ02坐标 [经度, 纬度]
   */
  static wgs84ToGcj02(lng: number, lat: number): Coordinate {
    if (!isInChina(lng, lat)) {
      return [lng, lat];
    }

    let dLat = transformLat(lng - 105, lat - 35);
    let dLng = transformLng(lng - 105, lat - 35);
    const radLat = lat / 180 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180) / (A / sqrtMagic * Math.cos(radLat) * PI);

    return [lng + dLng, lat + dLat];
  }

  /**
   * GCJ02 转 WGS84
   *
   * @param lng 经度
   * @param lat 纬度
   * @returns WGS84坐标 [经度, 纬度]
   */
  static gcj02ToWgs84(lng: number, lat: number): Coordinate {
    if (!isInChina(lng, lat)) {
      return [lng, lat];
    }

    let dLat = transformLat(lng - 105, lat - 35);
    let dLng = transformLng(lng - 105, lat - 35);
    const radLat = lat / 180 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180) / (A / sqrtMagic * Math.cos(radLat) * PI);

    return [lng - dLng, lat - dLat];
  }

  /**
   * GCJ02 转 BD09（百度坐标）
   *
   * @param lng 经度
   * @param lat 纬度
   * @returns BD09坐标 [经度, 纬度]
   */
  static gcj02ToBd09(lng: number, lat: number): Coordinate {
    const x = lng;
    const y = lat;
    const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
    const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
    return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
  }

  /**
   * BD09 转 GCJ02
   *
   * @param lng 经度
   * @param lat 纬度
   * @returns GCJ02坐标 [经度, 纬度]
   */
  static bd09ToGcj02(lng: number, lat: number): Coordinate {
    const x = lng - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
    return [z * Math.cos(theta), z * Math.sin(theta)];
  }

  /**
   * BD09 转 WGS84
   *
   * @param lng 经度
   * @param lat 纬度
   * @returns WGS84坐标 [经度, 纬度]
   */
  static bd09ToWgs84(lng: number, lat: number): Coordinate {
    const gcj02 = this.bd09ToGcj02(lng, lat);
    return this.gcj02ToWgs84(gcj02[0], gcj02[1]);
  }

  /**
   * WGS84 转 BD09
   *
   * @param lng 经度
   * @param lat 纬度
   * @returns BD09坐标 [经度, 纬度]
   */
  static wgs84ToBd09(lng: number, lat: number): Coordinate {
    const gcj02 = this.wgs84ToGcj02(lng, lat);
    return this.gcj02ToBd09(gcj02[0], gcj02[1]);
  }

  /**
   * 根据坐标系名称执行转换
   *
   * @param lng 经度
   * @param lat 纬度
   * @param from 源坐标系
   * @param to 目标坐标系
   * @returns 转换后的坐标 [经度, 纬度]
   */
  static convert(lng: number, lat: number, from: CoordinateSystem, to: CoordinateSystem): Coordinate {
    // 相同坐标系无需转换
    if (from === to) {
      return [lng, lat];
    }

    // 先转换到WGS84作为中间坐标系
    let wgs84: Coordinate;
    switch (from) {
      case 'WGS84':
        wgs84 = [lng, lat];
        break;
      case 'GCJ02':
        wgs84 = this.gcj02ToWgs84(lng, lat);
        break;
      case 'BD09':
        wgs84 = this.bd09ToWgs84(lng, lat);
        break;
      default:
        throw new Error(`Unknown coordinate system: ${from}`);
    }

    // 从WGS84转换到目标坐标系
    switch (to) {
      case 'WGS84':
        return wgs84;
      case 'GCJ02':
        return this.wgs84ToGcj02(wgs84[0], wgs84[1]);
      case 'BD09':
        return this.wgs84ToBd09(wgs84[0], wgs84[1]);
      default:
        throw new Error(`Unknown coordinate system: ${to}`);
    }
  }

  /**
   * 批量转换GeoJSON坐标
   *
   * @param geojson GeoJSON FeatureCollection
   * @param from 源坐标系
   * @param to 目标坐标系
   * @returns 转换后的GeoJSON FeatureCollection
   */
  static transformGeoJSON(
    geojson: GeoJSONFeatureCollection,
    from: CoordinateSystem,
    to: CoordinateSystem
  ): GeoJSONFeatureCollection {
    if (from === to) {
      return geojson;
    }

    /**
     * 递归转换坐标数组
     */
    const transformCoordinateArray = (coords: number[] | number[][] | number[][][]): unknown => {
      if (typeof coords[0] === 'number') {
        // 单个坐标点 [lng, lat]
        return this.convert(coords[0], coords[1], from, to);
      }
      // 坐标数组，递归处理
      return (coords as unknown[]).map(c => transformCoordinateArray(c as number[] | number[][] | number[][][]));
    };

    const features = geojson.features.map(feature => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: transformCoordinateArray(feature.geometry.coordinates) as typeof feature.geometry.coordinates,
      },
      properties: {
        ...feature.properties,
        coordinatesSystem: to,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }
}