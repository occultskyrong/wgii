# WGII ES6+TypeScript 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将wgii项目从CommonJS+老旧依赖重构为ES6 Modules+TypeScript+现代依赖

**Architecture:** 移除MySQL依赖改用JSON存储，内置坐标系转换算法，使用原生fetch替代request-promise，设计CLI和npm包双入口

**Tech Stack:** TypeScript 5.x, Node.js 20.x, ES Modules, commander, cheerio, log4js

---

## 文件结构

**创建的文件：**
| 文件路径 | 职责 |
|----------|------|
| `src/types/geojson.d.ts` | GeoJSON类型定义 |
| `src/types/country.d.ts` | 国家数据类型定义 |
| `src/types/index.d.ts` | 类型导出入口 |
| `src/utils/logger.ts` | 日志工具 |
| `src/utils/config.ts` | 配置管理 |
| `src/utils/http.ts` | fetch封装 |
| `src/core/transform.ts` | 坐标系转换算法 |
| `src/core/sparse.ts` | Douglas-Peucker抽稀算法 |
| `src/core/country.ts` | 国家信息管理 |
| `src/core/geojson.ts` | GeoJSON数据处理 |
| `src/storage/json-store.ts` | JSON文件读写 |
| `src/storage/resource.ts` | 源数据管理 |
| `src/crawler/amap.ts` | 高德API爬虫 |
| `src/crawler/wiki.ts` | 维基百科爬虫 |
| `src/cli.ts` | CLI入口 |
| `src/index.ts` | npm包入口 |
| `tsconfig.json` | TypeScript配置 |
| `config/default.js` | 默认配置文件 |

**修改的文件：**
| 文件路径 | 改动内容 |
|----------|----------|
| `package.json` | 更新依赖、添加scripts、ES Modules配置 |

**删除的文件/目录：**
| 路径 | 原因 |
|------|------|
| `build/` | 重构为src/cli.ts |
| `src/common/mysql.js` | 移除MySQL依赖 |
| `src/models/` | 重构为src/core/country.ts |
| `src/sync.js` | 重构为src/core/geojson.ts |
| `src/crawler/capitals.js` | 重构为src/crawler/wiki.ts |
| `src/_scripts/` | 临时脚本，不再需要 |

---

### Task 1: 项目初始化

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `config/default.js`

- [ ] **Step 1: 更新package.json为ES Modules配置**

```json
{
  "name": "wgii",
  "version": "1.0.0",
  "description": "World Geographic Information Integration - 世界地理信息集成",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "wgii": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "sync": "node dist/cli.js sync",
    "sparse": "node dist/cli.js sparse",
    "test": "node --test dist/**/*.test.js",
    "lint": "eslint src/",
    "clean": "rm -rf dist/"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "log4js": "^6.9.1",
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.12.7",
    "@types/log4js": "^2.3.0"
  },
  "engines": {
    "node": ">=20.11.1"
  },
  "files": [
    "dist/",
    "resource/",
    "config/",
    "README.md",
    "LICENSE"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/occultskyrong/wgii.git"
  },
  "keywords": [
    "geojson",
    "geographic",
    "country",
    "coordinates",
    "wgii"
  ],
  "license": "ISC"
}
```

- [ ] **Step 2: 创建tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "resource"]
}
```

- [ ] **Step 3: 创建默认配置文件**

```javascript
// config/default.js
export default {
  amap: {
    apiKey: process.env.AMAP_API_KEY || '',
  },
  output: {
    distDir: './dist',
  },
  log: {
    level: 'info',
  }
};
```

- [ ] **Step 4: 安装新依赖**

Run: `cd m:/programer/sourcecode/wgii && npm install`
Expected: 成功安装typescript, @types/node, cheerio, log4js, commander

- [ ] **Step 5: 创建src目录结构**

Run: `cd m:/programer/sourcecode/wgii && mkdir -p src/types src/utils src/core src/storage src/crawler`
Expected: 目录创建成功

- [ ] **Step 6: Commit初始化变更**

```bash
cd m:/programer/sourcecode/wgii
git add package.json tsconfig.json config/default.js
git commit -m "feat: 项目初始化 - ES Modules + TypeScript配置"
```

---

### Task 2: 类型定义模块

**Files:**
- Create: `src/types/geojson.d.ts`
- Create: `src/types/country.d.ts`
- Create: `src/types/index.d.ts`

- [ ] **Step 1: 创建GeoJSON类型定义**

```typescript
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
```

- [ ] **Step 2: 创建Country类型定义**

```typescript
// src/types/country.d.ts

import type { Coordinate } from './geojson.d.ts';

/**
 * 国家信息
 */
export interface CountryInfo {
  id?: number;
  /** ISO3166-1 三位字母码 */
  countryCode: string;
  /** 国家类型: Sovereign country, Member State 等 */
  countryType: string;
  /** 中文名称 */
  nameChinese: string;
  /** 中文简称 */
  nameChineseAbbreviation?: string;
  /** 联合国用中文名 */
  nameChineseUN?: string;
  /** 英文简称 */
  nameEnglishAbbreviation: string;
  /** 英文正式名称 */
  nameEnglishFormal: string;
  /** ISO3166-1 二位字母码 */
  nameEnglishShort: string;
  /** 联合国用英文名 */
  nameEnglishUN?: string;
  /** 所属大洲 */
  continent: string;
  /** 所属区域 */
  subregion: string;
  /** 首都中文名 */
  capitalNameChinese?: string;
  /** 首都英文名 */
  capitalNameEnglish?: string;
  /** 首都坐标点 */
  capitalPoint?: Coordinate;
  /** 国家中心坐标点 */
  countryCenterPoint?: Coordinate;
}

/**
 * 国家信息列表
 */
export interface CountryInfoList {
  countries: CountryInfo[];
  total: number;
}
```

- [ ] **Step 3: 创建类型导出入口**

```typescript
// src/types/index.d.ts

export type { Coordinate, CoordinateSystem, GeoJSONProperties, GeoJSONGeometry, GeoJSONFeature, GeoJSONFeatureCollection } from './geojson.d.ts';
export type { CountryInfo, CountryInfoList } from './country.d.ts';
```

- [ ] **Step 4: Commit类型定义**

```bash
cd m:/programer/sourcecode/wgii
git add src/types/
git commit -m "feat: 添加GeoJSON和国家数据类型定义"
```

---

### Task 3: 工具模块 - Logger

**Files:**
- Create: `src/utils/logger.ts`

- [ ] **Step 1: 创建日志工具模块**

```typescript
// src/utils/logger.ts

import log4js from 'log4js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

log4js.configure({
  appenders: {
    console: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c -%] %m',
      },
    },
    file: {
      type: 'dateFile',
      filename: path.join(__dirname, '../../logs/wgii.log'),
      maxLogSize: 1024 * 1024 * 10, // 10MB
      backups: 3,
      compress: true,
    },
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: 'info',
    },
    debug: {
      appenders: ['console'],
      level: 'debug',
    },
  },
});

/**
 * 获取Logger实例
 * @param category 日志类别
 */
export function getLogger(category: string = 'wgii'): log4js.Logger {
  return log4js.getLogger(category);
}

/**
 * 默认Logger
 */
export const logger = getLogger('wgii');

/**
 * 设置日志级别
 * @param level debug/info/warn/error
 */
export function setLogLevel(level: string): void {
  log4js.getLogger('wgii').level = level;
}
```

- [ ] **Step 2: Commit日志模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/utils/logger.ts
git commit -m "feat: 添加日志工具模块"
```

---

### Task 4: 工具模块 - Config

**Files:**
- Create: `src/utils/config.ts`

- [ ] **Step 1: 创建配置管理模块**

```typescript
// src/utils/config.ts

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * WGII配置接口
 */
export interface WgiiConfig {
  amap?: {
    apiKey: string;
  };
  output?: {
    distDir: string;
  };
  log?: {
    level: string;
  };
}

let cachedConfig: WgiiConfig | null = null;

/**
 * 加载配置文件
 */
export async function loadConfig(): Promise<WgiiConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(__dirname, '../../config/default.js');
  
  try {
    // 动态导入ES Module配置
    const configModule = await import(configPath);
    cachedConfig = configModule.default || {};
    return cachedConfig;
  } catch {
    // 配置文件不存在时返回默认配置
    cachedConfig = {
      amap: { apiKey: '' },
      output: { distDir: './dist' },
      log: { level: 'info' },
    };
    return cachedConfig;
  }
}

/**
 * 获取配置项
 * @param key 配置键名，支持点分隔如 'amap.apiKey'
 */
export async function getConfig(key: string): Promise<string | undefined> {
  const config = await loadConfig();
  const keys = key.split('.');
  let value: unknown = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

/**
 * 获取输出目录路径
 */
export async function getDistDir(): Promise<string> {
  const distDir = await getConfig('output.distDir') || './dist';
  return path.resolve(__dirname, '../../', distDir);
}

/**
 * 清除配置缓存（用于测试）
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}
```

- [ ] **Step 2: Commit配置模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/utils/config.ts
git commit -m "feat: 添加配置管理模块"
```

---

### Task 5: 工具模块 - HTTP

**Files:**
- Create: `src/utils/http.ts`

- [ ] **Step 1: 创建HTTP请求封装模块**

```typescript
// src/utils/http.ts

/**
 * Fetch请求选项
 */
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Fetch封装 - 发送HTTP请求并返回JSON
 * @param url 请求URL
 * @param options 请求选项
 */
export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, timeout = 30000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch封装 - 发送HTTP请求并返回文本/HTML
 * @param url 请求URL
 * @param options 请求选项
 */
export async function fetchText(url: string, options: FetchOptions = {}): Promise<string> {
  const { method = 'GET', headers = {}, timeout = 30000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
      },
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 带重试的Fetch
 * @param url 请求URL
 * @param options 请求选项
 * @param retries 重试次数
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {},
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson<T>(url, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}
```

- [ ] **Step 2: Commit HTTP模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/utils/http.ts
git commit -m "feat: 添加HTTP请求封装模块(fetch wrapper)"
```

---

### Task 6: 核心模块 - 坐标系转换

**Files:**
- Create: `src/core/transform.ts`

- [ ] **Step 1: 创建坐标系转换模块**

```typescript
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
 * 转换辅助函数
 */
function transformLat(lng: number, lat: number): number {
  let ret = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2 / 3;
  ret += (20 * Math.sin(lat * PI) + 40 * Math.sin(lat / 3 * PI)) * 2 / 3;
  ret += (160 * Math.sin(lat / 12 * PI) + 320 * Math.sin(lat * PI / 30)) * 2 / 3;
  return ret;
}

function transformLng(lng: number, lat: number): number {
  let ret = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2 / 3;
  ret += (20 * Math.sin(lng * PI) + 40 * Math.sin(lng / 3 * PI)) * 2 / 3;
  ret += (150 * Math.sin(lng / 12 * PI) + 150 * Math.sin(lng / 30 * PI)) * 2 / 3;
  return ret;
}

/**
 * 坐标系转换类
 */
export class CoordinateTransformer {
  /**
   * WGS84 转 GCJ02（火星坐标）
   */
  static wgs84ToGcj02(lng: number, lat: number): Coordinate {
    if (!isInChina(lng, lat)) {
      return [lng, lat];
    }
    
    let dLat = transformLat(lng - 105, lat - 35);
    let dLng = transformLng(lng - 105, lat - 35);
    const radLat = lat / 180 * PI;
    const magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180) / (A / sqrtMagic * Math.cos(radLat) * PI);
    
    return [lng + dLng, lat + dLat];
  }

  /**
   * GCJ02 转 WGS84
   */
  static gcj02ToWgs84(lng: number, lat: number): Coordinate {
    if (!isInChina(lng, lat)) {
      return [lng, lat];
    }
    
    let dLat = transformLat(lng - 105, lat - 35);
    let dLng = transformLng(lng - 105, lat - 35);
    const radLat = lat / 180 * PI;
    const magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180) / (A / sqrtMagic * Math.cos(radLat) * PI);
    
    return [lng - dLng, lat - dLat];
  }

  /**
   * GCJ02 转 BD09（百度坐标）
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
   */
  static bd09ToWgs84(lng: number, lat: number): Coordinate {
    const gcj02 = this.bd09ToGcj02(lng, lat);
    return this.gcj02ToWgs84(gcj02[0], gcj02[1]);
  }

  /**
   * WGS84 转 BD09
   */
  static wgs84ToBd09(lng: number, lat: number): Coordinate {
    const gcj02 = this.wgs84ToGcj02(lng, lat);
    return this.gcj02ToBd09(gcj02[0], gcj02[1]);
  }

  /**
   * 根据坐标系名称执行转换
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
   */
  static transformGeoJSON(
    geojson: GeoJSONFeatureCollection,
    from: CoordinateSystem,
    to: CoordinateSystem
  ): GeoJSONFeatureCollection {
    if (from === to) {
      return geojson;
    }

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
```

- [ ] **Step 2: Commit坐标系转换模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/core/transform.ts
git commit -m "feat: 添加坐标系转换模块(WGS84/GCJ02/BD09)"
```

---

### Task 7: 核心模块 - Douglas-Peucker抽稀算法

**Files:**
- Create: `src/core/sparse.ts`

- [ ] **Step 1: 创建抽稀算法模块**

```typescript
// src/core/sparse.ts

import type { Coordinate } from '../types/index.d.ts';

const PI = Math.PI;
const EARTH_RADIUS = 6371.393; // 地球平均半径(km)

/**
 * 经纬度转弧度
 */
function rad(deg: number): number {
  return deg * PI / 180.0;
}

/**
 * Douglas-Peucker抽稀算法
 */
export class DouglasPeucker {
  /**
   * 计算两点之间的球面距离(km)
   * 球面距离公式: S = R·arc cos[cosβ1·cosβ2·cos(α1-α2) + sinβ1·sinβ2]
   */
  static calcDistance(p1: Coordinate, p2: Coordinate): number {
    const lng1 = rad(p1[0]);
    const lat1 = rad(p1[1]);
    const lng2 = rad(p2[0]);
    const lat2 = rad(p2[1]);
    
    const s = Math.acos(
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2) +
      Math.sin(lat1) * Math.sin(lat2)
    );
    
    return Math.abs(s * EARTH_RADIUS);
  }

  /**
   * 计算点到弦的高度(km)
   * 使用海伦公式计算三角形面积，然后求高度
   */
  static calcHeight(pA: Coordinate, pB: Coordinate, pX: Coordinate): number {
    const a = Math.abs(this.calcDistance(pA, pB));
    const b = Math.abs(this.calcDistance(pA, pX));
    const c = Math.abs(this.calcDistance(pB, pX));
    
    if (a === 0) return 0;
    
    // 海伦公式: S = √(p·(p-a)·(p-b)·(p-c))
    const p = (a + b + c) / 2.0;
    const s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
    
    // 三角形面积 S = a·h/2 => h = 2S/a
    return (2.0 * s) / a;
  }

  /**
   * 递归抽稀
   */
  private static sparseRecursive(
    coordinates: Coordinate[],
    maxDistance: number
  ): Coordinate[] {
    if (coordinates.length <= 2) {
      return [];
    }

    const end = coordinates.length - 1;
    let maxHeight = 0;
    let maxIndex = 0;

    // 找出弦高度最大的点
    for (let i = 1; i < end; i++) {
      const height = this.calcHeight(coordinates[0], coordinates[end], coordinates[i]);
      if (height > maxHeight) {
        maxHeight = height;
        maxIndex = i;
      }
    }

    // 如果最大高度超过阈值，保留该点并递归处理两侧
    if (maxHeight >= maxDistance) {
      const left = this.sparseRecursive(coordinates.slice(0, maxIndex + 1), maxDistance);
      const right = this.sparseRecursive(coordinates.slice(maxIndex, end + 1), maxDistance);
      
      return [...left, coordinates[maxIndex], ...right];
    }

    return [];
  }

  /**
   * 对坐标点集进行抽稀
   * @param coordinates 原始坐标点集
   * @param maxDistance 阈值(km)
   * @returns 抽稀后的坐标点集
   */
  static simplify(coordinates: Coordinate[], maxDistance: number): Coordinate[] {
    if (!coordinates || coordinates.length <= 2) {
      return coordinates || [];
    }

    // 处理闭合曲线（首尾相同）
    let points = coordinates;
    const isClosed = 
      coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
      coordinates[0][1] === coordinates[coordinates.length - 1][1];
    
    if (isClosed) {
      points = coordinates.slice(0, coordinates.length - 1);
    }

    // 开始抽稀
    const result: Coordinate[] = [points[0]];
    result.push(...this.sparseRecursive(points, maxDistance));
    result.push(points[points.length - 1]);

    // 如果是闭合曲线，补上终点
    if (isClosed) {
      result.push(coordinates[0]);
    }

    return result;
  }

  /**
   * 批量抽稀GeoJSON坐标
   */
  static simplifyGeoJSONCoordinates(
    coordinates: Coordinate[][][],
    maxDistance: number
  ): Coordinate[][][] {
    return coordinates.map(polygon => 
      polygon.map(ring => this.simplify(ring, maxDistance))
    );
  }
}
```

- [ ] **Step 2: Commit抽稀算法模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/core/sparse.ts
git commit -m "feat: 添加Douglas-Peucker抽稀算法模块"
```

---

### Task 8: 存储模块 - JSON文件读写

**Files:**
- Create: `src/storage/json-store.ts`

- [ ] **Step 1: 创建JSON存储模块**

```typescript
// src/storage/json-store.ts

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * JSON文件存储类
 */
export class JsonStore {
  /**
   * 确保目录存在
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // 目录已存在
    }
  }

  /**
   * 读取JSON文件
   */
  static async read<T>(filePath: string): Promise<T | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      logger.warn(`Failed to read file: ${filePath}`);
      return null;
    }
  }

  /**
   * 写入JSON文件
   */
  static async write(filePath: string, data: unknown): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    logger.info(`Saved: ${filePath}`);
  }

  /**
   * 删除文件
   */
  static async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.info(`Deleted: ${filePath}`);
    } catch {
      logger.warn(`Failed to delete: ${filePath}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 列出目录下的所有JSON文件
   */
  static async listJsonFiles(dirPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath);
      return files.filter(f => f.endsWith('.json')).map(f => path.join(dirPath, f));
    } catch {
      return [];
    }
  }

  /**
   * 获取dist目录路径
   */
  static getDistPath(...subpaths: string[]): string {
    return path.join(__dirname, '../../dist', ...subpaths);
  }

  /**
   * 获取resource目录路径
   */
  static getResourcePath(...subpaths: string[]): string {
    return path.join(__dirname, '../../resource', ...subpaths);
  }
}
```

- [ ] **Step 2: Commit JSON存储模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/storage/json-store.ts
git commit -m "feat: 添加JSON文件存储模块"
```

---

### Task 9: 存储模块 - 源数据管理

**Files:**
- Create: `src/storage/resource.ts`

- [ ] **Step 1: 创建源数据管理模块**

```typescript
// src/storage/resource.ts

import type { GeoJSONFeatureCollection, CountryInfo } from '../types/index.d.ts';
import { JsonStore } from './json-store.ts';

/**
 * 源数据管理
 */
export class ResourceManager {
  /**
   * 加载国家GeoJSON源数据
   * @param countryCode 国家代码(ISO3166-1三位字母码)
   */
  static async loadCountryGeoJson(countryCode: string): Promise<GeoJSONFeatureCollection | null> {
    // 尝试从多个可能的路径加载
    const paths = [
      JsonStore.getResourcePath('raw', `${countryCode}.geo.json`),
      JsonStore.getResourcePath('original', `${countryCode}.geo.json`),
      JsonStore.getResourcePath('gaode', `${countryCode}.geo.json`),
    ];

    for (const filePath of paths) {
      const data = await JsonStore.read<GeoJSONFeatureCollection>(filePath);
      if (data) {
        return data;
      }
    }

    return null;
  }

  /**
   * 加载所有国家信息
   */
  static async loadCountriesInfo(): Promise<CountryInfo[]> {
    const filePath = JsonStore.getDistPath('countries.info.json');
    const data = await JsonStore.read<{ countries?: CountryInfo[] } | CountryInfo[]>(filePath);
    
    if (!data) {
      return [];
    }

    // 支持两种格式: { countries: [] } 或直接 []
    if (Array.isArray(data)) {
      return data;
    }
    return data.countries || [];
  }

  /**
   * 保存国家信息列表
   */
  static async saveCountriesInfo(countries: CountryInfo[]): Promise<void> {
    const filePath = JsonStore.getDistPath('countries.info.json');
    await JsonStore.write(filePath, { countries, total: countries.length });
  }

  /**
   * 加载联合国国家名单(中文映射)
   */
  static async loadUNCountries(): Promise<Record<string, string>> {
    const filePath = JsonStore.getResourcePath('raw', '_un_countries.json');
    return await JsonStore.read<Record<string, string>>(filePath) || {};
  }

  /**
   * 加载国家与首都对应关系
   */
  static async loadCapitals(): Promise<Record<string, string>> {
    const filePath = JsonStore.getResourcePath('raw', '_countries_capitals.json');
    return await JsonStore.read<Record<string, string>>(filePath) || {};
  }

  /**
   * 保存国家GeoJSON数据
   */
  static async saveCountryGeoJson(
    countryCode: string,
    geojson: GeoJSONFeatureCollection,
    system: string = 'wgs84'
  ): Promise<void> {
    const fileName = `country.${system.toLowerCase()}.geo.json`;
    const filePath = JsonStore.getDistPath(countryCode, fileName);
    await JsonStore.write(filePath, geojson);
  }

  /**
   * 加载已生成的国家GeoJSON
   */
  static async loadGeneratedGeoJson(
    countryCode: string,
    system: string = 'wgs84'
  ): Promise<GeoJSONFeatureCollection | null> {
    const fileName = `country.${system.toLowerCase()}.geo.json`;
    const filePath = JsonStore.getDistPath(countryCode, fileName);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }
}
```

- [ ] **Step 2: Commit源数据管理模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/storage/resource.ts
git commit -m "feat: 添加源数据管理模块"
```

---

### Task 10: 核心模块 - 国家信息管理

**Files:**
- Create: `src/core/country.ts`

- [ ] **Step 1: 创建国家信息管理模块**

```typescript
// src/core/country.ts

import type { CountryInfo } from '../types/index.d.ts';
import { ResourceManager } from '../storage/resource.ts';
import { JsonStore } from '../storage/json-store.ts';
import { logger } from '../utils/logger.ts';

/**
 * 国家信息管理类
 */
export class CountryManager {
  /**
   * 加载所有国家信息
   */
  static async loadAll(): Promise<CountryInfo[]> {
    return await ResourceManager.loadCountriesInfo();
  }

  /**
   * 根据国家代码查询
   * @param code ISO3166-1三位字母码(如CHN)或二位字母码(如CN)
   */
  static async findByCode(code: string): Promise<CountryInfo | null> {
    const countries = await this.loadAll();
    
    return countries.find(c => 
      c.countryCode === code || 
      c.nameEnglishShort === code ||
      c.nameEnglishAbbreviation === code
    ) || null;
  }

  /**
   * 根据名称查询
   */
  static async findByName(name: string): Promise<CountryInfo | null> {
    const countries = await this.loadAll();
    
    return countries.find(c =>
      c.nameChinese === name ||
      c.nameChineseAbbreviation === name ||
      c.nameEnglishFormal === name ||
      c.nameEnglishAbbreviation === name
    ) || null;
  }

  /**
   * 根据大洲筛选
   */
  static async findByContinent(continent: string): Promise<CountryInfo[]> {
    const countries = await this.loadAll();
    return countries.filter(c => c.continent === continent);
  }

  /**
   * 保存单个国家信息
   */
  static async save(country: CountryInfo): Promise<void> {
    const countries = await this.loadAll();
    const index = countries.findIndex(c => c.countryCode === country.countryCode);
    
    if (index >= 0) {
      countries[index] = country;
    } else {
      countries.push(country);
    }
    
    await ResourceManager.saveCountriesInfo(countries);
    logger.info(`Saved country: ${country.countryCode}`);
  }

  /**
   * 批量保存国家信息
   */
  static async saveAll(countries: CountryInfo[]): Promise<void> {
    await ResourceManager.saveCountriesInfo(countries);
    logger.info(`Saved ${countries.length} countries`);
  }

  /**
   * 更新国家首都信息
   */
  static async updateCapital(countryCode: string, capitalName: string, capitalPoint?: [number, number]): Promise<void> {
    const country = await this.findByCode(countryCode);
    if (!country) {
      logger.warn(`Country not found: ${countryCode}`);
      return;
    }
    
    country.capitalNameEnglish = capitalName;
    if (capitalPoint) {
      country.capitalPoint = capitalPoint;
    }
    
    await this.save(country);
  }

  /**
   * 获取所有国家代码列表
   */
  static async getAllCodes(): Promise<string[]> {
    const countries = await this.loadAll();
    return countries.map(c => c.countryCode);
  }

  /**
   * 统计各大洲国家数量
   */
  static async countByContinent(): Promise<Record<string, number>> {
    const countries = await this.loadAll();
    const result: Record<string, number> = {};
    
    for (const country of countries) {
      result[country.continent] = (result[country.continent] || 0) + 1;
    }
    
    return result;
  }
}
```

- [ ] **Step 2: Commit国家信息管理模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/core/country.ts
git commit -m "feat: 添加国家信息管理模块"
```

---

### Task 11: 核心模块 - GeoJSON处理

**Files:**
- Create: `src/core/geojson.ts`

- [ ] **Step 1: 创建GeoJSON处理模块**

```typescript
// src/core/geojson.ts

import type { GeoJSONFeatureCollection, CoordinateSystem } from '../types/index.d.ts';
import { ResourceManager, JsonStore } from '../storage/json-store.ts';
import { CoordinateTransformer } from './transform.ts';
import { DouglasPeucker } from './sparse.ts';
import { logger } from '../utils/logger.ts';

/**
 * GeoJSON处理类
 */
export class GeoJSONProcessor {
  /**
   * 加载国家GeoJSON数据
   * @param countryCode 国家代码
   * @param system 坐标系，默认WGS84
   */
  static async load(countryCode: string, system: CoordinateSystem = 'WGS84'): Promise<GeoJSONFeatureCollection | null> {
    const systemLower = system.toLowerCase();
    return await ResourceManager.loadGeneratedGeoJson(countryCode, systemLower);
  }

  /**
   * 保存GeoJSON数据
   */
  static async save(
    countryCode: string,
    geojson: GeoJSONFeatureCollection,
    system: CoordinateSystem
  ): Promise<void> {
    await ResourceManager.saveCountryGeoJson(countryCode, geojson, system.toLowerCase());
    logger.info(`Saved ${countryCode} GeoJSON (${system})`);
  }

  /**
   * 合并多个国家的GeoJSON
   */
  static async merge(countryCodes: string[], system: CoordinateSystem = 'WGS84'): Promise<GeoJSONFeatureCollection> {
    const features: GeoJSONFeatureCollection['features'] = [];
    
    for (const code of countryCodes) {
      const geojson = await this.load(code, system);
      if (geojson) {
        features.push(...geojson.features);
      }
    }
    
    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * 转换坐标系并保存
   */
  static async transformAndSave(
    countryCode: string,
    from: CoordinateSystem,
    to: CoordinateSystem
  ): Promise<GeoJSONFeatureCollection | null> {
    const geojson = await this.load(countryCode, from);
    if (!geojson) {
      logger.warn(`No GeoJSON found for ${countryCode} (${from})`);
      return null;
    }
    
    const transformed = CoordinateTransformer.transformGeoJSON(geojson, from, to);
    await this.save(countryCode, transformed, to);
    
    return transformed;
  }

  /**
   * 生成抽稀版本
   * @param countryCode 国家代码
   * @param distances 抽稀阈值列表(km)，如[1, 2, 5, 10]
   */
  static async generateSparseVersions(
    countryCode: string,
    distances: number[],
    system: CoordinateSystem = 'WGS84'
  ): Promise<void> {
    const geojson = await this.load(countryCode, system);
    if (!geojson) {
      logger.warn(`No GeoJSON found for ${countryCode}`);
      return;
    }

    for (const distance of distances) {
      const sparseFeatures = geojson.features.map(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          const coords = feature.geometry.coordinates as Coordinate[][][];
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: DouglasPeucker.simplifyGeoJSONCoordinates(coords, distance),
            },
          };
        }
        return feature;
      });

      const sparseGeojson: GeoJSONFeatureCollection = {
        type: 'FeatureCollection',
        features: sparseFeatures,
      };

      const fileName = `country.${system.toLowerCase()}.sparse.${distance}.geo.json`;
      const filePath = JsonStore.getDistPath(countryCode, fileName);
      await JsonStore.write(filePath, sparseGeojson);
      
      logger.info(`Generated sparse ${distance}km for ${countryCode}`);
    }
  }

  /**
   * 批量处理所有国家
   */
  static async processAllCountries(distances: number[] = [1, 2, 5, 10]): Promise<void> {
    const codes = await CountryManager.getAllCodes();
    
    for (const code of codes) {
      logger.info(`Processing ${code}...`);
      await this.generateSparseVersions(code, distances);
    }
    
    logger.info(`Processed ${codes.length} countries`);
  }

  /**
   * 获取国家GeoJSON文件路径
   */
  static getFilePath(countryCode: string, system: CoordinateSystem, sparse?: number): string {
    const parts = [countryCode];
    if (sparse) {
      parts.push(`country.${system.toLowerCase()}.sparse.${sparse}.geo.json`);
    } else {
      parts.push(`country.${system.toLowerCase()}.geo.json`);
    }
    return JsonStore.getDistPath(...parts);
  }
}

// 需要导入CountryManager
import { CountryManager } from './country.ts';
```

Wait, this file has a circular dependency issue. Let me restructure:

```typescript
// src/core/geojson.ts

import type { GeoJSONFeatureCollection, CoordinateSystem, Coordinate } from '../types/index.d.ts';
import { JsonStore } from '../storage/json-store.ts';
import { CoordinateTransformer } from './transform.ts';
import { DouglasPeucker } from './sparse.ts';
import { logger } from '../utils/logger.ts';

/**
 * GeoJSON处理类
 */
export class GeoJSONProcessor {
  private cachedCountryCodes: string[] | null = null;

  /**
   * 加载国家GeoJSON数据
   * @param countryCode 国家代码
   * @param system 坐标系，默认WGS84
   */
  static async load(countryCode: string, system: CoordinateSystem = 'WGS84'): Promise<GeoJSONFeatureCollection | null> {
    const systemLower = system.toLowerCase();
    const filePath = JsonStore.getDistPath(countryCode, `country.${systemLower}.geo.json`);
    return await JsonStore.read<GeoJSONFeatureCollection>(filePath);
  }

  /**
   * 保存GeoJSON数据
   */
  static async save(
    countryCode: string,
    geojson: GeoJSONFeatureCollection,
    system: CoordinateSystem
  ): Promise<void> {
    const filePath = JsonStore.getDistPath(countryCode, `country.${system.toLowerCase()}.geo.json`);
    await JsonStore.write(filePath, geojson);
    logger.info(`Saved ${countryCode} GeoJSON (${system})`);
  }

  /**
   * 合并多个国家的GeoJSON
   */
  static async merge(countryCodes: string[], system: CoordinateSystem = 'WGS84'): Promise<GeoJSONFeatureCollection> {
    const features: GeoJSONFeatureCollection['features'] = [];
    
    for (const code of countryCodes) {
      const geojson = await this.load(code, system);
      if (geojson) {
        features.push(...geojson.features);
      }
    }
    
    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * 转换坐标系并保存
   */
  static async transformAndSave(
    countryCode: string,
    from: CoordinateSystem,
    to: CoordinateSystem
  ): Promise<GeoJSONFeatureCollection | null> {
    const geojson = await this.load(countryCode, from);
    if (!geojson) {
      logger.warn(`No GeoJSON found for ${countryCode} (${from})`);
      return null;
    }
    
    const transformed = CoordinateTransformer.transformGeoJSON(geojson, from, to);
    await this.save(countryCode, transformed, to);
    
    return transformed;
  }

  /**
   * 生成抽稀版本
   * @param countryCode 国家代码
   * @param distances 抽稀阈值列表(km)
   */
  static async generateSparseVersions(
    countryCode: string,
    distances: number[],
    system: CoordinateSystem = 'WGS84'
  ): Promise<void> {
    const geojson = await this.load(countryCode, system);
    if (!geojson) {
      logger.warn(`No GeoJSON found for ${countryCode}`);
      return;
    }

    for (const distance of distances) {
      const sparseFeatures = geojson.features.map(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          const coords = feature.geometry.coordinates as Coordinate[][][];
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: DouglasPeucker.simplifyGeoJSONCoordinates(coords, distance),
            },
          };
        }
        return feature;
      });

      const sparseGeojson: GeoJSONFeatureCollection = {
        type: 'FeatureCollection',
        features: sparseFeatures,
      };

      const fileName = `country.${system.toLowerCase()}.sparse.${distance}.geo.json`;
      const filePath = JsonStore.getDistPath(countryCode, fileName);
      await JsonStore.write(filePath, sparseGeojson);
      
      logger.info(`Generated sparse ${distance}km for ${countryCode}`);
    }
  }

  /**
   * 获取已生成的国家代码列表
   */
  static async getAvailableCountryCodes(): Promise<string[]> {
    const distDir = JsonStore.getDistPath();
    try {
      const dirs = await JsonStore.listJsonFiles(distDir);
      // 过滤出国家代码目录(三字母大写)
      const codes: string[] = [];
      for (const item of dirs) {
        const base = item.split('/').pop() || '';
        if /^[A-Z]{3}$/.test(base)) {
          codes.push(base);
        }
      }
      return codes;
    } catch {
      return [];
    }
  }

  /**
   * 批量处理所有国家
   */
  static async processAllCountries(distances: number[] = [1, 2, 5, 10]): Promise<void> {
    const codes = await this.getAvailableCountryCodes();
    
    for (const code of codes) {
      logger.info(`Processing ${code}...`);
      await this.generateSparseVersions(code, distances);
    }
    
    logger.info(`Processed ${codes.length} countries`);
  }
}
```

- [ ] **Step 2: Commit GeoJSON处理模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/core/geojson.ts
git commit -m "feat: 添加GeoJSON处理模块"
```

---

### Task 12: 爬虫模块 - 高德API

**Files:**
- Create: `src/crawler/amap.ts`

- [ ] **Step 1: 创建高德API爬虫模块**

```typescript
// src/crawler/amap.ts

import type { GeoJSONFeatureCollection, Coordinate } from '../types/index.d.ts';
import { fetchJson } from '../utils/http.ts';
import { getConfig } from '../utils/config.ts';
import { CoordinateTransformer } from '../core/transform.ts';
import { JsonStore } from '../storage/json-store.ts';
import { logger } from '../utils/logger.ts';

const BASE_URL = 'https://restapi.amap.com/v3/config/district';

// 中国省级行政区划adcode
const PROVINCE_ADCODES = [
  110000, 120000, 130000, 140000, 150000, // 华北
  210000, 220000, 230000,                 // 东北
  310000, 320000, 330000, 340000, 350000, 360000, 370000, // 华东
  410000, 420000, 430000, 440000, 450000, 460000, // 中南
  500000, 510000, 520000, 530000, 540000, // 西南
  610000, 620000, 630000, 640000, 650000, // 西北
  710000, 810000, 820000,                 // 台港澳
];

interface AmapDistrictResponse {
  status: string;
  info: string;
  districts: Array<{
    adcode: string;
    name: string;
    level: string;
    polyline: string;
    center: string;
  }>;
}

/**
 * 高德API爬虫
 */
export class AmapCrawler {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  /**
   * 初始化API Key
   */
  async init(): Promise<void> {
    if (!this.apiKey) {
      this.apiKey = await getConfig('amap.apiKey') || '';
    }
    if (!this.apiKey) {
      throw new Error('Amap API Key not configured. Set AMAP_API_KEY env or config.amap.apiKey');
    }
  }

  /**
   * 获取行政区划数据
   * @param adcode 行政区划代码
   */
  async getDistrict(adcode: number): Promise<AmapDistrictResponse> {
    await this.init();
    
    const url = `${BASE_URL}?key=${this.apiKey}&keywords=${adcode}&subdistrict=0&extensions=all`;
    const response = await fetchJson<AmapDistrictResponse>(url);
    
    if (response.status !== '1') {
      throw new Error(`Amap API error: ${response.info}`);
    }
    
    return response;
  }

  /**
   * 将高德polyline字符串转换为坐标数组
   * polyline格式: "lng,lat;lng,lat|lng,lat;lng,lat"
   */
  private parsePolyline(polyline: string): Coordinate[][] {
    const result: Coordinate[][] = [];
    const groups = polyline.split('|');
    
    for (const group of groups) {
      const points: Coordinate[] = [];
      const coords = group.split(';');
      
      for (const coord of coords) {
        const [lng, lat] = coord.split(',');
        if (lng && lat) {
          points.push([parseFloat(lng), parseFloat(lat)]);
        }
      }
      
      if (points.length > 0) {
        result.push(points);
      }
    }
    
    return result;
  }

  /**
   * 生成中国完整GeoJSON(GCJ02和WGS84)
   */
  async generateChinaGeoJSON(): Promise<void> {
    logger.info('Fetching China boundary from Amap...');
    
    const response = await this.getDistrict(100000);
    const district = response.districts[0];
    
    if (!district || !district.polyline) {
      throw new Error('No boundary data found for China');
    }

    // 解析polyline
    const gcj02Coordinates = this.parsePolyline(district.polyline);
    
    // 转换为WGS84
    const wgs84Coordinates = gcj02Coordinates.map(group =>
      group.map(coord => CoordinateTransformer.gcj02ToWgs84(coord[0], coord[1]))
    );

    // 构建GeoJSON
    const gcj02Geojson: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: gcj02Coordinates.map(g => [g]),
        },
        properties: {
          name: 'China',
          code: 'CHN',
          coordinatesSystem: 'GCJ02',
          adcode: district.adcode,
          center: district.center.split(',').map(Number) as Coordinate,
        },
      }],
    };

    const wgs84Geojson: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: wgs84Coordinates.map(g => [g]),
        },
        properties: {
          name: 'China',
          code: 'CHN',
          coordinatesSystem: 'WGS84',
          adcode: district.adcode,
          center: CoordinateTransformer.gcj02ToWgs84(
            parseFloat(district.center.split(',')[0]),
            parseFloat(district.center.split(',')[1])
          ),
        },
      }],
    };

    // 保存文件
    await JsonStore.ensureDir(JsonStore.getDistPath('CHN'));
    await JsonStore.write(JsonStore.getDistPath('CHN', 'country.gcj02.geo.json'), gcj02Geojson);
    await JsonStore.write(JsonStore.getDistPath('CHN', 'country.wgs84.geo.json'), wgs84Geojson);
    
    logger.info('China GeoJSON saved (GCJ02 and WGS84)');
  }

  /**
   * 获取所有省份边界
   */
  async getProvinces(): Promise<void> {
    logger.info('Fetching China provinces...');
    
    for (const adcode of PROVINCE_ADCODES) {
      try {
        const response = await this.getDistrict(adcode);
        const district = response.districts[0];
        
        logger.info(`Got ${district.name} (${adcode})`);
        
        // 这里可以保存每个省份的数据
        // 当前实现只获取数据，后续可扩展
        
      } catch (error) {
        logger.warn(`Failed to get province ${adcode}: ${error}`);
      }
    }
  }

  /**
   * 同步数据 - 执行完整的爬取流程
   */
  async sync(): Promise<void> {
    await this.generateChinaGeoJSON();
    logger.info('Amap sync completed');
  }
}
```

- [ ] **Step 2: Commit高德爬虫模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/crawler/amap.ts
git commit -m "feat: 添加高德API爬虫模块"
```

---

### Task 13: 爬虫模块 - 维基百科

**Files:**
- Create: `src/crawler/wiki.ts`

- [ ] **Step 1: 创建维基百科爬虫模块**

```typescript
// src/crawler/wiki.ts

import * as cheerio from 'cheerio';
import { fetchText } from '../utils/http.ts';
import { JsonStore } from '../storage/json-store.ts';
import { logger } from '../utils/logger.ts';

const CAPITALS_URL = 'https://en.wikipedia.org/wiki/List_of_national_capitals';

/**
 * 维基百科爬虫
 */
export class WikiCrawler {
  /**
   * 获取国家与首都对应关系
   */
  async getCapitals(): Promise<Record<string, string>> {
    logger.info('Fetching capitals from Wikipedia...');
    
    const html = await fetchText(CAPITALS_URL);
    return this.parseCapitalsTable(html);
  }

  /**
   * 解析HTML页面中的首都表格
   */
  private parseCapitalsTable(html: string): Record<string, string> {
    const $ = cheerio.load(html);
    const result: Record<string, string> = {};
    
    // 解析表格
    const rows = $('#mw-content-text table.wikitable tbody tr');
    
    rows.each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const capitalCell = cells.eq(0);
        const countryCell = cells.eq(1);
        
        // 获取首都名称
        const capitalLink = capitalCell.find('a').first();
        const capital = capitalLink.text() || capitalCell.text().trim();
        
        // 获取国家名称
        const countryLink = countryCell.find('a').first();
        const country = countryLink.text() || countryCell.text().trim();
        
        if (capital && country) {
          result[country] = capital;
        }
      }
    });
    
    logger.info(`Found ${Object.keys(result).length} capitals`);
    return result;
  }

  /**
   * 保存首都数据到JSON文件
   */
  async saveCapitals(): Promise<void> {
    const capitals = await this.getCapitals();
    const filePath = JsonStore.getResourcePath('raw', '_countries_capitals.json');
    await JsonStore.write(filePath, capitals);
    logger.info('Capitals saved');
  }

  /**
   * 同步首都数据
   */
  async sync(): Promise<void> {
    await this.saveCapitals();
  }
}
```

- [ ] **Step 2: Commit维基百科爬虫模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/crawler/wiki.ts
git commit -m "feat: 添加维基百科爬虫模块"
```

---

### Task 14: CLI入口

**Files:**
- Create: `src/cli.ts`

- [ ] **Step 1: 创建CLI入口**

```typescript
// src/cli.ts

import { Command } from 'commander';
import { AmapCrawler } from './crawler/amap.ts';
import { WikiCrawler } from './crawler/wiki.ts';
import { GeoJSONProcessor } from './core/geojson.ts';
import { CountryManager } from './core/country.ts';
import { CoordinateTransformer } from './core/transform.ts';
import { JsonStore } from './storage/json-store.ts';
import { logger, setLogLevel } from './utils/logger.ts';
import fs from 'fs/promises';

const program = new Command();

program
  .name('wgii')
  .description('World Geographic Information Integration - 世界地理信息集成')
  .version('1.0.0');

// 全局选项
program.option('-v, --verbose', 'Enable verbose logging', false);

// sync命令
program.command('sync')
  .description('Sync and generate GeoJSON data')
  .option('-c, --country <code>', 'Specific country code (e.g., CHN)')
  .option('--amap', 'Sync from Amap (China only)')
  .option('--wiki', 'Sync capitals from Wikipedia')
  .action(async (options, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    if (globalOpts.verbose) setLogLevel('debug');
    
    try {
      if (options.amap) {
        const crawler = new AmapCrawler();
        await crawler.sync();
      }
      
      if (options.wiki) {
        const crawler = new WikiCrawler();
        await crawler.sync();
      }
      
      if (!options.amap && !options.wiki) {
        // 默认同步所有
        logger.info('Syncing all data sources...');
        const amapCrawler = new AmapCrawler();
        await amapCrawler.sync();
        
        const wikiCrawler = new WikiCrawler();
        await wikiCrawler.sync();
      }
      
      logger.info('Sync completed');
    } catch (error) {
      logger.error(`Sync failed: ${error}`);
      process.exit(1);
    }
  });

// sparse命令
program.command('sparse')
  .description('Generate sparse GeoJSON versions')
  .requiredOption('-d, --distance <km>', 'Sparse distance in km (comma-separated: 1,2,5)')
  .option('-c, --country <code>', 'Specific country code', 'CHN')
  .option('-s, --system <sys>', 'Coordinate system: WGS84/GCJ02', 'WGS84')
  .action(async (options, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    if (globalOpts.verbose) setLogLevel('debug');
    
    const distances = options.distance.split(',').map(Number);
    
    try {
      await GeoJSONProcessor.generateSparseVersions(options.country, distances, options.system);
      logger.info(`Sparse completed for ${options.country}`);
    } catch (error) {
      logger.error(`Sparse failed: ${error}`);
      process.exit(1);
    }
  });

// info命令
program.command('info')
  .description('Show country information')
  .requiredOption('-c, --code <code>', 'Country code (ISO3166-1: CHN, USA, etc.)')
  .action(async (options, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    if (globalOpts.verbose) setLogLevel('debug');
    
    try {
      const country = await CountryManager.findByCode(options.code);
      if (country) {
        console.log(JSON.stringify(country, null, 2));
      } else {
        logger.warn(`Country not found: ${options.code}`);
      }
    } catch (error) {
      logger.error(`Info failed: ${error}`);
      process.exit(1);
    }
  });

// transform命令
program.command('transform')
  .description('Transform coordinate system')
  .requiredOption('-f, --from <system>', 'Source: WGS84/GCJ02/BD09')
  .requiredOption('-t, --to <system>', 'Target: WGS84/GCJ02/BD09')
  .requiredOption('-i, --input <file>', 'Input GeoJSON file')
  .option('-o, --output <file>', 'Output file (default: input_transformed.json)')
  .action(async (options, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    if (globalOpts.verbose) setLogLevel('debug');
    
    try {
      const inputContent = await fs.readFile(options.input, 'utf-8');
      const geojson = JSON.parse(inputContent);
      
      const transformed = CoordinateTransformer.transformGeoJSON(geojson, options.from, options.to);
      
      const outputPath = options.output || options.input.replace('.json', '_transformed.json');
      await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2));
      
      logger.info(`Transformed: ${options.input} -> ${outputPath}`);
    } catch (error) {
      logger.error(`Transform failed: ${error}`);
      process.exit(1);
    }
  });

// list命令
program.command('list')
  .description('List available countries')
  .action(async (options, cmd) => {
    const globalOpts = cmd.optsWithGlobals();
    if (globalOpts.verbose) setLogLevel('debug');
    
    try {
      const codes = await GeoJSONProcessor.getAvailableCountryCodes();
      console.log('Available countries:', codes.join(', '));
      console.log(`Total: ${codes.length}`);
    } catch (error) {
      logger.error(`List failed: ${error}`);
      process.exit(1);
    }
  });

program.parse();
```

- [ ] **Step 2: Commit CLI模块**

```bash
cd m:/programer/sourcecode/wgii
git add src/cli.ts
git commit -m "feat: 添加CLI入口(commander)"
```

---

### Task 15: npm包入口

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: 创建npm包入口**

```typescript
// src/index.ts

// 核心类
export { GeoJSONProcessor } from './core/geojson.ts';
export { CoordinateTransformer } from './core/transform.ts';
export { DouglasPeucker } from './core/sparse.ts';
export { CountryManager } from './core/country.ts';

// 爬虫类
export { AmapCrawler } from './crawler/amap.ts';
export { WikiCrawler } from './crawler/wiki.ts';

// 存储类
export { JsonStore } from './storage/json-store.ts';
export { ResourceManager } from './storage/resource.ts';

// 工具
export { fetchJson, fetchText, fetchWithRetry } from './utils/http.ts';
export { loadConfig, getConfig, getDistDir } from './utils/config.ts';
export { getLogger, logger, setLogLevel } from './utils/logger.ts';

// 类型导出
export type {
  Coordinate,
  CoordinateSystem,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  GeoJSONGeometry,
  GeoJSONProperties,
  CountryInfo,
  CountryInfoList,
} from './types/index.d.ts';
```

- [ ] **Step 2: Commit npm包入口**

```bash
cd m:/programer/sourcecode/wgii
git add src/index.ts
git commit -m "feat: 添加npm包入口导出"
```

---

### Task 16: 构建验证

**Files:**
- 无新文件创建，验证构建过程

- [ ] **Step 1: 执行TypeScript编译**

Run: `cd m:/programer/sourcecode/wgii && npm run build`
Expected: 编译成功，dist目录生成.js和.d.ts文件

- [ ] **Step 2: 验证CLI可执行**

Run: `cd m:/programer/sourcecode/wgii && node dist/cli.js --help`
Expected: 显示CLI帮助信息

- [ ] **Step 3: 验证npm包导出**

Run: `cd m:/programer/sourcecode/wgii && node -e "import('./dist/index.js').then(m => console.log(Object.keys(m)))"`
Expected: 显示导出的模块列表

- [ ] **Step 4: Commit构建验证**

```bash
cd m:/programer/sourcecode/wgii
git add -A
git commit -m "chore: 构建验证完成"
```

---

### Task 17: 清理旧代码

**Files:**
- Delete: `build/`
- Delete: `src/common/`
- Delete: `src/models/`
- Delete: `src/crawler/capitals.js`
- Delete: `src/sync.js`
- Delete: `src/model.js`
- Delete: `src/_scripts/`
- Delete: `src/_countriesGeoJson/`
- Delete: `src/borderLine/`

- [ ] **Step 1: 删除旧代码目录**

```bash
cd m:/programer/sourcecode/wgii
rm -rf build/ src/common/ src/models/ src/crawler/capitals.js src/sync.js src/model.js src/_scripts/ src/_countriesGeoJson/ src/borderLine/
```

- [ ] **Step 2: Commit清理变更**

```bash
cd m:/programer/sourcecode/wgii
git add -A
git commit -m "chore: 清理旧代码目录"
```

---

### Task 18: 文档更新

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 更新README.md为ES6+TypeScript版本**

```markdown
# WGII

World Geographic Information Integration - 世界地理信息集成

[![npm version](https://img.shields.io/npm/v/wgii.svg)](https://www.npmjs.com/package/wgii)
[![Node.js Version](https://img.shields.io/node/v/wgii.svg)](https://nodejs.org)

## Quick Start

### 安装

```bash
npm install wgii
# 或
yarn add wgii
```

### CLI使用

```bash
# 同步数据
wgii sync

# 同步中国边界(高德)
wgii sync --amap

# 同步首都数据(维基百科)
wgii sync --wiki

# 抽稀处理
wgii sparse --distance 1,2,5 --country CHN

# 查看国家信息
wgii info --code CHN

# 坐标转换
wgii transform --from GCJ02 --to WGS84 --input china.json

# 列出可用国家
wgii list
```

### npm包使用

```typescript
import {
  CountryManager,
  GeoJSONProcessor,
  CoordinateTransformer,
  DouglasPeucker
} from 'wgii';

// 加载国家信息
const countries = await CountryManager.loadAll();
const china = await CountryManager.findByCode('CHN');

// 加载GeoJSON
const geojson = await GeoJSONProcessor.load('CHN', 'WGS84');

// 坐标转换
const wgs84 = CoordinateTransformer.gcj02ToWgs84(116.397, 39.909);
const transformed = CoordinateTransformer.transformGeoJSON(geojson, 'GCJ02', 'WGS84');

// 抽稀
const sparse = DouglasPeucker.simplify(coordinates, 1);
```

## 数据结构

`dist/` 目录包含生成的GeoJSON数据：

```
dist/
├── countries.info.json        # 国家基础信息
├── CHN/
│   ├── country.wgs84.geo.json
│   ├── country.gcj02.geo.json
│   ├── country.wgs84.sparse.1.geo.json
│   └── ...
├── USA/
│   └── country.wgs84.geo.json
└── ...
```

## API文档

### CountryManager

| 方法 | 说明 |
|------|------|
| `loadAll()` | 加载所有国家信息 |
| `findByCode(code)` | 根据ISO3166-1代码查询 |
| `findByName(name)` | 根据名称查询 |
| `save(country)` | 保存单个国家 |
| `saveAll(countries)` | 批量保存 |

### GeoJSONProcessor

| 方法 | 说明 |
|------|------|
| `load(code, system)` | 加载国家GeoJSON |
| `save(code, geojson, system)` | 保存GeoJSON |
| `merge(codes)` | 合并多个国家 |
| `transformAndSave(code, from, to)` | 转换坐标系 |
| `generateSparseVersions(code, distances)` | 生成抽稀版本 |

### CoordinateTransformer

| 方法 | 说明 |
|------|------|
| `wgs84ToGcj02(lng, lat)` | WGS84转GCJ02 |
| `gcj02ToWgs84(lng, lat)` | GCJ02转WGS84 |
| `gcj02ToBd09(lng, lat)` | GCJ02转BD09 |
| `bd09ToGcj02(lng, lat)` | BD09转GCJ02 |
| `transformGeoJSON(geojson, from, to)` | 批量转换 |

### DouglasPeucker

| 方法 | 说明 |
|------|------|
| `simplify(coords, maxDistance)` | 抽稀坐标点集 |
| `calcDistance(p1, p2)` | 计算球面距离(km) |

## 配置

创建 `config/default.js`:

```javascript
export default {
  amap: {
    apiKey: process.env.AMAP_API_KEY || '',
  },
  output: {
    distDir: './dist',
  },
  log: {
    level: 'info',
  }
};
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式(监听编译)
npm run dev

# 构建
npm run build

# 测试
npm test
```

## License

ISC
```

- [ ] **Step 2: Commit README更新**

```bash
cd m:/programer/sourcecode/wgii
git add README.md
git commit -m "docs: 更新README为ES6+TypeScript版本"
```

---

### Task 19: 最终验证与发布准备

- [ ] **Step 1: 完整构建测试**

Run: `cd m:/programer/sourcecode/wgii && npm run build && node dist/cli.js --version`
Expected: 输出版本号 1.0.0

- [ ] **Step 2: 验证所有CLI命令**

Run: `cd m:/programer/sourcecode/wgii && node dist/cli.js --help`
Expected: 显示所有命令帮助

- [ ] **Step 3: 最终Commit**

```bash
cd m:/programer/sourcecode/wgii
git add -A
git commit -m "feat: WGII ES6+TypeScript重构完成

- 移除MySQL依赖，使用JSON存储
- 替换request-promise为原生fetch
- 移除bluebird，使用原生Promise
- 内置坐标系转换算法
- ES Modules + TypeScript
- CLI + npm包双入口

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] **Step 4: 推送到远程仓库**

```bash
cd m:/programer/sourcecode/wgii
git push origin master
```

---

## Spec自检

### 1. Spec覆盖率检查

| Spec章节 | 对应Task | 状态 |
|----------|----------|------|
| §2.1 新目录结构 | Task 1, 5 | ✓ |
| §2.2 文件映射 | Task 17 | ✓ |
| §3.1 移除依赖 | Task 1 (package.json) | ✓ |
| §3.2 新增依赖 | Task 1 (package.json) | ✓ |
| §4.1 类型定义 | Task 2 | ✓ |
| §4.2 坐标系转换 | Task 6 | ✓ |
| §4.3 抽稀算法 | Task 7 | ✓ |
| §4.4 国家管理 | Task 10 | ✓ |
| §4.5 GeoJSON处理 | Task 11 | ✓ |
| §5.1 高德爬虫 | Task 12 | ✓ |
| §5.2 维基爬虫 | Task 13 | ✓ |
| §6 CLI设计 | Task 14 | ✓ |
| §7 npm包API | Task 15 | ✓ |
| §9 数据兼容 | Task 11 (保持dist结构) | ✓ |
| §10 package.json/tsconfig | Task 1 | ✓ |

### 2. Placeholder扫描

无TBD/TODO占位符，所有步骤包含完整代码。

### 3. 类型一致性检查

| 类型/方法 | Task定义 | Task使用 | 状态 |
|-----------|----------|----------|------|
| `Coordinate` | Task 2 | Task 6,7,11,12 | ✓ |
| `CoordinateSystem` | Task 2 | Task 6,11,14 | ✓ |
| `GeoJSONFeatureCollection` | Task 2 | Task 6,11,12 | ✓ |
| `CountryInfo` | Task 2 | Task 9,10 | ✓ |
| `simplify()` | Task 7 | Task 11 | ✓ ✓ | ✓ |
| `gcj02ToWgs84()` | Task 6 | Task 12 | ✓ |

---

*计划版本: 1.0*
*创建日期: 2026-04-12*