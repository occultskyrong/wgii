export { GeoJSONProcessor } from './core/geojson.js';
export { CoordinateTransformer } from './core/transform.js';
export { Sparse, Sparse as DouglasPeucker } from './core/sparse.js';
export { CountryManager } from './core/country.js';
export { AmapCrawler } from './crawler/amap.js';
export { WikiCrawler, CapitalsData } from './crawler/wiki.js';
export { JsonStore } from './storage/json-store.js';
export { Resource, Resource as ResourceManager } from './storage/resource.js';
export { fetchJson, fetchText, fetchWithRetry, FetchOptions } from './utils/http.js';
export { loadConfig, getConfig, getDistDir, clearConfigCache, WgiiConfig } from './utils/config.js';
export { getLogger, logger, setLogLevel } from './utils/logger.js';
export type { Coordinate, CoordinateSystem, GeoJSONProperties, GeoJSONGeometry, GeoJSONFeature, GeoJSONFeatureCollection, CountryInfo, CountryInfoList, } from './types/index.d.ts';
export { GeoJSONProcessor as default } from './core/geojson.js';
//# sourceMappingURL=index.d.ts.map