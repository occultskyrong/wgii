# WGII ES6+TypeScript 重构设计文档

## 1. 概述

### 1.1 项目背景

WGII（World Geographic Information Integration）是一个世界地理信息集成工具，用于生成和整理各国GeoJSON数据。当前版本0.0.1使用CommonJS和老旧依赖，需要现代化重构。

### 1.2 重构目标

| 目标 | 描述 |
|------|------|
| 类型安全 | 使用TypeScript严格模式，提供完整类型定义 |
| 依赖升级 | 替换废弃库（request-promise、bluebird），升级到现代版本 |
| 代码现代化 | ES Modules、async/await、原生Promise、原生fetch |
| 架构简化 | 移除MySQL依赖，使用纯JSON文件存储 |
| 灵活使用 | 支持CLI工具、npm包引用、数据源三种使用方式 |

### 1.3 约束条件

| 约束 | 值 |
|------|-----|
| Node.js版本 | ≥20.11.1 |
| 项目仓库 | 保持独立GitHub仓库 |
| 数据兼容 | 输出数据格式保持不变（dist/目录结构） |
| 功能保持 | 不改变核心功能，只重构实现方式 |

---

## 2. 项目结构

### 2.1 新目录结构

```
wgii/
├── src/
│   ├── index.ts              # npm包入口，导出核心API
│   ├── cli.ts                # CLI入口
│   ├── core/
│   │   ├── geojson.ts        # GeoJSON数据处理
│   │   ├── sparse.ts         # Douglas-Peucker抽稀算法
│   │   ├── transform.ts      # 坐标系转换（GCJ02/WGS84/BD09）
│   │   └── country.ts        # 国家信息管理
│   ├── crawler/
│   │   ├── amap.ts           # 高德API（中国行政区划）
│   │   └── wiki.ts           # 维基百科爬虫（首都数据）
│   ├── storage/
│   │   ├── json-store.ts     # JSON文件读写
│   │   └── resource.ts       # 源数据管理
│   ├── types/
│   │   ├── geojson.d.ts      # GeoJSON类型定义
│   │   ├── country.d.ts      # 国家数据类型
│   │   └── index.d.ts        # 公共类型导出
│   └── utils/
│       ├── logger.ts         # 日志工具
│       ├── config.ts         # 配置管理
│       └── http.ts           # HTTP请求封装（fetch wrapper）
├── dist/                     # 输出数据（GeoJSON），结构不变
├── resource/                 # 源数据，保持不变
├── config/                   # 配置文件
├── docs/                     # 文档
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

### 2.2 文件映射

| 当前文件 | 重构后文件 | 说明 |
|----------|------------|------|
| `build/index.js` | `src/cli.ts` | CLI入口 |
| `build/sparse.js` | `src/core/sparse.ts` | 抽稀算法 |
| `src/common/mysql.js` | 移除 | 不再使用MySQL |
| `src/common/logger.js` | `src/utils/logger.ts` | 日志工具 |
| `src/common/map/douglas-peucker.js` | `src/core/sparse.ts` | 抽稀算法合并 |
| `src/common/gaode/district.js` | `src/crawler/amap.ts` | 高德爬虫 |
| `src/crawler/capitals.js` | `src/crawler/wiki.ts` | 维基爬虫 |
| `src/model.js` | `src/core/country.ts` | 国家数据模型 |
| `src/sync.js` | `src/core/geojson.ts` | 数据同步逻辑 |

---

## 3. 依赖管理

### 3.1 依赖变更清单

**移除的依赖**：

| 包名 | 移除原因 |
|------|----------|
| `request` | 已废弃，使用原生fetch替代 |
| `request-promise` | 已废弃，使用原生fetch替代 |
| `bluebird` | Node原生Promise已足够 |
| `sequelize` | 移除MySQL，使用JSON存储 |
| `mysql2` | 移除MySQL |
| `lodash` | 原生方法足够，减少依赖 |
| `coordtransform` | 内置实现坐标系转换 |

**保留/升级的依赖**：

| 包名 | 当前版本 | 新版本 | 说明 |
|------|----------|--------|------|
| `cheerio` | 1.0.0-rc.3 | 最新版 | HTML解析 |
| `log4js` | 4.1.0 | 最新版 | 日志（可选简化） |

**新增依赖**：

| 包名 | 用途 |
|------|------|
| `typescript` | TypeScript编译 |
| `@types/node` | Node类型定义 |
| `commander` | CLI框架 |

### 3.2 最终依赖清单

```json
{
  "dependencies": {
    "cheerio": "^1.0.0",
    "log4js": "^6.0.0",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

依赖数量从10个减少到约6个。

---

## 4. 核心模块设计

### 4.1 类型定义

```typescript
// src/types/geojson.d.ts

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: GeoJSONProperties;
}

export interface GeoJSONGeometry {
  type: 'Point' | 'MultiPolygon' | 'Polygon';
  coordinates: Coordinate | Coordinate[][][];
}

export type Coordinate = [number, number]; // [longitude, latitude]

export interface GeoJSONProperties {
  name: string;
  code: string;
  coordinatesSystem?: 'WGS84' | 'GCJ02' | 'BD09';
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
```

```typescript
// src/types/country.d.ts

export interface CountryInfo {
  id?: number;
  countryCode: string;           // ISO3166-1 三位字母码
  countryType: string;           // 国家类型
  nameChinese: string;           // 中文名称
  nameChineseAbbreviation?: string;
  nameChineseUN?: string;        // 联合国用中文名
  nameEnglishAbbreviation: string;
  nameEnglishFormal: string;
  nameEnglishShort: string;      // ISO3166-1 二位字母码
  nameEnglishUN?: string;        // 联合国用英文名
  continent: string;             // 所属大洲
  subregion: string;             // 所属区域
  capitalNameChinese?: string;
  capitalNameEnglish?: string;
  capitalPoint?: Coordinate;
  countryCenterPoint?: Coordinate;
}
```

### 4.2 坐标系转换模块

```typescript
// src/core/transform.ts

export type CoordinateSystem = 'WGS84' | 'GCJ02' | 'BD09';

export class CoordinateTransformer {
  /**
   * GCJ02 转 WGS84
   */
  static gcj02ToWgs84(lng: number, lat: number): Coordinate;

  /**
   * WGS84 转 GCJ02
   */
  static wgs84ToGcj02(lng: number, lat: number): Coordinate;

  /**
   * GCJ02 转 BD09
   */
  static gcj02ToBd09(lng: number, lat: number): Coordinate;

  /**
   * BD09 转 GCJ02
   */
  static bd09ToGcj02(lng: number, lat: number): Coordinate;

  /**
   * 批量转换GeoJSON坐标
   */
  static transformGeoJSON(
    geojson: GeoJSONFeatureCollection,
    from: CoordinateSystem,
    to: CoordinateSystem
  ): GeoJSONFeatureCollection;
}
```

内置实现坐标系转换算法，移除外部依赖 `coordtransform`。

### 4.3 抽稀算法模块

```typescript
// src/core/sparse.ts

export class DouglasPeucker {
  /**
   * 对坐标点集进行抽稀
   * @param coordinates 原始坐标点集
   * @param maxDistance 阈值（单位km）
   * @returns 抽稀后的坐标点集
   */
  static simplify(coordinates: Coordinate[], maxDistance: number): Coordinate[];

  /**
   * 计算两点之间的球面距离（km）
   */
  static calcDistance(p1: Coordinate, p2: Coordinate): number;

  /**
   * 计算点到弦的高度
   */
  static calcHeight(pA: Coordinate, pB: Coordinate, pX: Coordinate): number;
}
```

### 4.4 国家数据管理模块

```typescript
// src/core/country.ts

export class CountryManager {
  /**
   * 加载所有国家信息
   */
  static async loadAll(): Promise<CountryInfo[]>;

  /**
   * 根据国家代码查询
   */
  static async findByCode(code: string): Promise<CountryInfo | null>;

  /**
   * 保存国家信息到JSON
   */
  static async save(country: CountryInfo): Promise<void>;

  /**
   * 批量保存
   */
  static async saveAll(countries: CountryInfo[]): Promise<void>;
}
```

### 4.5 GeoJSON处理模块

```typescript
// src/core/geojson.ts

export class GeoJSONProcessor {
  /**
   * 加载国家GeoJSON数据
   */
  static async load(countryCode: string, system?: CoordinateSystem): Promise<GeoJSONFeatureCollection>;

  /**
   * 保存GeoJSON数据
   */
  static async save(countryCode: string, geojson: GeoJSONFeatureCollection, system: CoordinateSystem): Promise<void>;

  /**
   * 合并多个国家的GeoJSON
   */
  static async merge(countryCodes: string[]): Promise<GeoJSONFeatureCollection>;

  /**
   * 生成抽稀版本
   */
  static async generateSparseVersions(countryCode: string, distances: number[]): Promise<void>;
}
```

---

## 5. 爬虫模块设计

### 5.1 高德API爬虫

```typescript
// src/crawler/amap.ts

export class AmapCrawler {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://restapi.amap.com/v3/config/district';

  constructor(apiKey: string);

  /**
   * 获取中国省级行政区划
   */
  async getProvinces(): Promise<GeoJSONFeatureCollection>;

  /**
   * 获取指定行政区划边界
   */
  async getDistrict(adcode: number): Promise<GeoJSONFeatureCollection>;

  /**
   * 生成中国完整GeoJSON（GCJ02和WGS84）
   */
  async generateChinaGeoJSON(): Promise<void>;
}
```

使用原生fetch替代request-promise：

```typescript
// src/utils/http.ts

export async function fetchJson<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
```

### 5.2 维基百科爬虫

```typescript
// src/crawler/wiki.ts

export class WikiCrawler {
  private readonly baseUrl = 'https://en.wikipedia.org/wiki/List_of_national_capitals';

  /**
   * 获取国家与首都对应关系
   */
  async getCapitals(): Promise<Record<string, string>>;

  /**
   * 解析HTML页面
   */
  private parseCapitalsTable(html: string): Record<string, string>;
}
```

---

## 6. CLI设计

### 6.1 命令定义

```typescript
// src/cli.ts

import { Command } from 'commander';

const program = new Command();

program
  .name('wgii')
  .description('World Geographic Information Integration')
  .version('1.0.0');

// 同步数据
program.command('sync')
  .description('Sync and generate GeoJSON data')
  .option('-c, --country <code>', 'Specific country code')
  .action(async (options) => {
    await syncData(options.country);
  });

// 抽稀处理
program.command('sparse')
  .description('Sparse GeoJSON coordinates')
  .requiredOption('-d, --distance <km>', 'Sparse distance in km')
  .option('-c, --country <code>', 'Specific country code', 'CHN')
  .action(async (options) => {
    await sparseGeoJSON(options.country, parseFloat(options.distance));
  });

// 查看国家信息
program.command('info')
  .description('Show country information')
  .requiredOption('-c, --code <code>', 'Country code (ISO3166-1)')
  .action(async (options) => {
    const country = await CountryManager.findByCode(options.code);
    console.log(JSON.stringify(country, null, 2));
  });

// 坐标转换
program.command('transform')
  .description('Transform coordinate system')
  .requiredOption('-f, --from <system>', 'Source system: WGS84/GCJ02/BD09')
  .requiredOption('-t, --to <system>', 'Target system: WGS84/GCJ02/BD09')
  .requiredOption('-i, --input <file>', 'Input GeoJSON file')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    await transformCoordinates(options);
  });

program.parse();
```

### 6.2 命令使用示例

```bash
# 同步所有国家数据
wgii sync

# 同步指定国家
wgii sync --country CHN

# 抽稀中国边界（1km阈值）
wgii sparse --distance 1 --country CHN

# 查看国家信息
wgii info --code CHN

# 坐标转换
wgii transform --from GCJ02 --to WGS84 --input china.json
```

---

## 7. npm包API设计

### 7.1 入口导出

```typescript
// src/index.ts

// 核心类
export { GeoJSONProcessor } from './core/geojson';
export { CoordinateTransformer } from './core/transform';
export { DouglasPeucker } from './core/sparse';
export { CountryManager } from './core/country';

// 爬虫类
export { AmapCrawler } from './crawler/amap';
export { WikiCrawler } from './crawler/wiki';

// 工具函数
export { fetchJson } from './utils/http';

// 类型导出
export type {
  Coordinate,
  CoordinateSystem,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  GeoJSONGeometry,
  GeoJSONProperties,
  CountryInfo
} from './types';
```

### 7.2 使用示例

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

---

## 8. 配置管理

### 8.1 配置文件结构

```typescript
// src/utils/config.ts

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

export function loadConfig(): WgiiConfig;
export function getConfig(key: string): any;
```

### 8.2 配置文件示例

```javascript
// config/default.js (保持JS格式便于用户修改)

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

---

## 9. 输出数据兼容性

### 9.1 dist目录结构（保持不变）

```
dist/
├── countries.info.json        # 国家基础信息
├── CHN/
│   ├── country.wgs84.geo.json
│   ├── country.gcj02.geo.json
│   ├── country.bd09.geo.json
│   ├── country.wgs84.sparse.1.geo.json
│   └── region/
│       └── region.info.json
├── USA/
│   ├── country.resource.geo.json
│   └── country.wgs84.geo.json
└── ...                        # 其他国家
```

### 9.2 数据格式（保持不变）

国家信息JSON格式保持与现有 `countries.info.json` 兼容。

---

## 10. 构建与发布

### 10.1 package.json

```json
{
  "name": "wgii",
  "version": "1.0.0",
  "description": "World Geographic Information Integration",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "wgii": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "sync": "node dist/cli.js sync",
    "sparse": "node dist/cli.js sparse",
    "test": "node --test",
    "lint": "eslint src/"
  },
  "engines": {
    "node": ">=20.11.1"
  },
  "files": [
    "dist/",
    "resource/",
    "README.md",
    "LICENSE"
  ]
}
```

### 10.2 tsconfig.json

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
  "exclude": ["node_modules", "dist"]
}
```

---

## 11. 实施计划概要

重构分为以下阶段（详细计划将在 writing-plans 阶段制定）：

| 阶段 | 内容 | 预估工作量 |
|------|------|------------|
| 1 | 项目初始化：tsconfig、package.json、目录结构 | 小 |
| 2 | 类型定义：geojson.d.ts、country.d.ts | 小 |
| 3 | 工具模块：logger、config、http | 小 |
| 4 | 核心模块：transform、sparse、country、geojson | 中 |
| 5 | 存储模块：json-store | 小 |
| 6 | 爬虫模块：amap、wiki | 中 |
| 7 | CLI入口：cli.ts | 小 |
| 8 | npm包入口：index.ts | 小 |
| 9 | 测试与验证 | 中 |
| 10 | 文档更新：README.md | 小 |

---

## 12. 风险与决策记录

| 决策项 | 选择 | 原因 |
|--------|------|------|
| MySQL依赖 | 移除 | 最终输出为JSON，MySQL只是中间存储，可简化 |
| coordtransform包 | 内置实现 | 减少依赖，算法简单可直接实现 |
| lodash | 移除 | 当前使用量少，原生方法足够 |
| 日志库 | 保留log4js | 保持日志功能，可后续简化为console |
| 模块系统 | ES Modules | Node 20原生支持，符合现代标准 |

---

*设计文档版本: 1.0*
*创建日期: 2026-04-12*