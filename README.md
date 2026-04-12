# WGII

World Geographic Information Integration - 世界地理信息集成

[![Node.js Version](https://img.shields.io/node/v/wgii.svg)](https://nodejs.org)

## Quick Start

### 安装

```bash
# 克隆仓库
git clone https://github.com/occultskyrong/wgii.git
cd wgii

# 安装依赖
yarn install

# 构建
npm run build
```

### CLI使用

```bash
# 查看帮助
node dist/cli.js --help

# 同步中国边界数据(高德API)
node dist/cli.js sync --amap

# 同步首都数据(维基百科)
node dist/cli.js sync --wiki

# 抽稀处理
node dist/cli.js sparse --distance 100,500 --country CHN

# 查看国家信息
node dist/cli.js info --code CHN

# 坐标转换
node dist/cli.js transform --from GCJ02 --to WGS84 --input china.json

# 列出可用国家
node dist/cli.js list
```

### npm包使用

```typescript
import {
  CountryManager,
  GeoJSONProcessor,
  CoordinateTransformer,
  DouglasPeucker,
  logger
} from './dist/index.js';

// 加载国家信息
const countries = await CountryManager.loadAll();
const china = await CountryManager.findByCode('CHN');

// 加载GeoJSON
const geojson = await GeoJSONProcessor.load('CHN', 'WGS84');

// 坐标转换
const wgs84 = CoordinateTransformer.gcj02ToWgs84(116.397, 39.909);
const transformed = CoordinateTransformer.transformGeoJSON(geojson, 'GCJ02', 'WGS84');

// 抽稀
const sparse = DouglasPeucker.simplify(coordinates, 100);
```

## 数据结构

`dist/` 目录包含生成的GeoJSON数据：

```
dist/
├── AFG/                         # 阿富汗
│   ├── country.resource.geo.json
│   └── country.wgs84.geo.json
├── CHN/                         # 中国
│   ├── country.wgs84.geo.json
│   ├── country.gcj02.geo.json
│   └── ...
├── USA/                         # 美国
│   └── country.wgs84.geo.json
└── ...                          # 其他国家
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

### DouglasPeucker (Sparse)

| 方法 | 说明 |
|------|------|
| `simplify(coords, tolerance)` | 抽稀坐标点集 |
| `calcDistance(p1, p2)` | 计算球面距离(米) |
| `calcHeight(point, start, end)` | 计算点到弦的高度 |

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

## 技术栈

- **TypeScript 5.x** - 类型安全
- **ES Modules** - 现代模块系统
- **Node.js 20.x** - 运行环境
- **原生fetch** - HTTP请求
- **log4js** - 日志管理
- **commander** - CLI框架
- **cheerio** - HTML解析

## 开发

```bash
# 开发模式(监听编译)
npm run dev

# 构建
npm run build

# 清理编译输出
npm run clean
```

## 数据来源

- [johan/world.geo.json](https://github.com/johan/world.geo.json) - 大多数国家GeoJSON数据
- [高德开放平台](https://lbs.amap.com/) - 中国行政区划数据
- [Wikipedia](https://en.wikipedia.org/wiki/List_of_national_capitals) - 首都数据

## 历史版本

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-12 | ES6+TypeScript重构完成 |
| 0.0.1 | 2018-12-09 | 初始版本，CommonJS实现 |

## License

ISC