// src/types/geojson.d.ts

/**
 * 坐标点 - [经度, 纬度]
 */
export type Coordinate = [number, number];

/**
 * 坐标系类型
 */
export type CoordinateSystem = 'WGS84' | 'GCJ02' | 'BD09';

/**
 * GeoJSON属性
 */
export interface GeoJSONProperties {
  name: string;
  code: string;
  coordinatesSystem?: CoordinateSystem;
  [key: string]: unknown;
}

/**
 * GeoJSON几何形状
 */
export interface GeoJSONGeometry {
  type: 'Point' | 'MultiPolygon' | 'Polygon' | 'LineString' | 'MultiLineString';
  coordinates: Coordinate | Coordinate[][] | Coordinate[][][] | Coordinate[][][][];
}

/**
 * GeoJSON Feature
 */
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: GeoJSONProperties;
  id?: string | number;
}

/**
 * GeoJSON FeatureCollection
 */
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}