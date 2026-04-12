// src/index.ts
// WGII - World GeoJSON Index Interface
// npm包入口文件

// =============================================================================
// Core Classes
// =============================================================================

// GeoJSON处理类 - 提供加载、保存、合并、坐标转换和抽稀功能
export { GeoJSONProcessor } from './core/geojson.js';

// 坐标系转换类 - 支持WGS84/GCJ02/BD09坐标系转换
export { CoordinateTransformer } from './core/transform.js';

// Douglas-Peucker抽稀算法类 (原名Sparse)
export { Sparse, Sparse as DouglasPeucker } from './core/sparse.js';

// 国家信息管理类
export { CountryManager } from './core/country.js';

// =============================================================================
// Crawler Classes
// =============================================================================

// 高德地图API爬虫 - 获取中国行政区划边界数据
export { AmapCrawler } from './crawler/amap.js';

// 维基百科爬虫 - 获取国家与首都对应关系
export { WikiCrawler, CapitalsData } from './crawler/wiki.js';

// =============================================================================
// Storage Classes
// =============================================================================

// JSON文件存储类
export { JsonStore } from './storage/json-store.js';

// 资源数据管理类 (别名ResourceManager)
export { Resource, Resource as ResourceManager } from './storage/resource.js';

// =============================================================================
// HTTP Utilities
// =============================================================================

export { fetchJson, fetchText, fetchWithRetry, FetchOptions } from './utils/http.js';

// =============================================================================
// Config Utilities
// =============================================================================

export { loadConfig, getConfig, getDistDir, clearConfigCache, WgiiConfig } from './utils/config.js';

// =============================================================================
// Logger Utilities
// =============================================================================

export { getLogger, logger, setLogLevel } from './utils/logger.js';

// =============================================================================
// Type Exports
// =============================================================================

export type {
  // GeoJSON Types
  Coordinate,
  CoordinateSystem,
  GeoJSONProperties,
  GeoJSONGeometry,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  // Country Types
  CountryInfo,
  CountryInfoList,
} from './types/index.d.ts';

// =============================================================================
// Default Exports
// =============================================================================

// 默认导出主处理类
export { GeoJSONProcessor as default } from './core/geojson.js';