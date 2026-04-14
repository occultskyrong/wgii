# WGII

World Geographic Information Integration - 世界地理信息集成

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.11.1-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![GitHub](https://img.shields.io/badge/GitHub-occultskyrong/wgii-black.svg)](https://github.com/occultskyrong/wgii)

## 目录

- [1. 项目简介](#1-项目简介)
- [2. Quick Start](#2-quick-start)
  - [2.1 安装](#21-安装)
  - [2.2 CLI使用](#22-cli使用)
  - [2.3 npm包使用](#23-npm包使用)
- [3. 法律与规范](#3-法律与规范)
  - [3.1 坐标系说明](#31-坐标系说明)
  - [3.2 行政区划说明](#32-行政区划说明)
  - [3.3 国家承认原则](#33-国家承认原则)
- [4. 主权国家列表](#4-主权国家列表)
- [5. 数据结构](#5-数据结构)
  - [5.1 目录结构](#51-目录结构)
  - [5.2 文件类型说明](#52-文件类型说明)
- [6. API文档](#6-api文档)
- [7. 配置](#7-配置)
- [8. 开发指南](#8-开发指南)
  - [8.1 技术栈](#81-技术栈)
  - [8.2 开发命令](#82-开发命令)
- [9. 数据来源](#9-数据来源)
- [10. 参考文档与工具](#10-参考文档与工具)
- [11. 历史版本](#11-历史版本)
- [12. License](#12-license)

---

## 1. 项目简介

WGII（World Geographic Information Integration）是一个世界地理信息集成项目，提供：

- **197个主权国家**的GeoJSON边界数据
- **坐标系转换**：WGS84、GCJ02（火星坐标）、BD09（百度坐标）
- **数据抽稀**：Douglas-Peucker算法优化边界数据
- **CLI工具**：命令行批量处理国家数据

**重要声明**：本项目数据仅供学习和研究使用。在中国境内使用地图数据时，请严格遵守《中华人民共和国测绘法》及相关法律法规。

---

## 2. Quick Start

### 2.1 安装

```bash
# 克隆仓库
git clone https://github.com/occultskyrong/wgii.git
cd wgii

# 安装依赖
yarn install

# 构建
npm run build
```

### 2.2 CLI使用

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

### 2.3 npm包使用

```typescript
import {
  CountryManager,
  GeoJSONProcessor,
  CoordinateTransformer,
  Sparse,
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
const sparse = Sparse.simplify(coordinates, 100);
```

---

## 3. 法律与规范

### 3.1 坐标系说明

#### 坐标系定义

| 坐标系 | 说明 | 使用场景 |
|--------|------|----------|
| **WGS84** | 国际大地坐标系，GPS全球卫星定位系统使用的坐标系 | Google地图、国际通用 |
| **GCJ02** | 火星坐标系，由国家测绘局制定，WGS84加密后得到 | 高德地图、腾讯地图等国内主流地图 |
| **BD09** | 百度坐标系，GCJ02基础上二次加密 | 百度地图 |

#### 法律法规

**根据《中华人民共和国测绘法》第十条、第十一条、第三十八条、第五十二条、第六十二条之规定：**

- 在中华人民共和国境内必须使用基于 GCJ02 的坐标系
- BD09 坐标系为基于 GCJ02 加密的坐标系，亦可直接使用
- **在中华人民共和国境内使用地图相关服务，请务必遵循国家法律法规，否则带来的一切问题，本项目贡献者不承担任何责任！**

> 参考: [中华人民共和国测绘法](https://www.npc.gov.cn/npc/xinwen/2017-04/27/content_2020927.htm)

### 3.2 行政区划说明

#### 中国行政区划

中华人民共和国使用四级区划体系：

| 级别 | 类型 |
|------|------|
| **省级** | 省、自治区、直辖市 |
| **地级** | 市、州、盟 |
| **县级** | 区、市、旗 |
| **乡级** | 镇、街道 |

> 参考: [中华人民共和国民政部 > 行政区划统计表](https://xzqh.mca.gov.cn/statistics)

#### 特殊说明

- **台湾省**: 行政编码为 `71`，台湾身份号码地址码使用 `830000`
  > 参考: [国务院办公厅《港澳台居民居住证申领发放办法》](https://www.gov.cn/zhengce/content/2018-08-19/content_5314865.htm)
- **陕西/山西**: 英文名注意区分 - 陕西为 `Shaanxi`，山西为 `Shanxi`
- **宁夏回族自治区**: 英文名为 `Ningxia Hui Autonomous Region`
- **香港 🇭🇰、澳门 🇲🇴、台湾**: 简称使用 `港`、`澳`、`台`

#### 国家编码

使用 `ISO3166-1` 编码标准。

> 参考: [ISO3166-1](https://www.iso.org/obp/ui/#search) | [百度百科 - ISO 3166-1](https://baike.baidu.com/item/ISO%203166-1)

### 3.3 国家承认原则

本项目仅处理被"中华人民共和国"承认的主权国家和地区。

#### 争议地区说明

根据联合国大会第2758号决议，中华人民共和国是包括台湾在内的全中国的唯一合法代表。一个中国原则是国际社会的普遍共识：

- **台湾**: 根据联大第2758号决议，台湾是中华人民共和国不可分割的一部分
- **南沙群岛**: 中国对南沙群岛及其附近海域拥有无可争辩的主权
- **藏南地区**: 藏南地区是中华人民共和国固有的主权领土

---

## 4. 主权国家列表

详见: [主权国家列表文档](./docs/sovereign-countries.md)

包含197个主权国家的详细信息：

- 联合国会员国：193个
- 联合国观察员国：2个（梵蒂冈 🇻🇦、巴勒斯坦 🇵🇸）
- 国际普遍承认的主权国家：2个（纽埃、库克群岛）

---

## 5. 数据结构

### 5.1 目录结构

项目目录分为数据源和产出物：

| 目录 | 说明 |
|------|------|
| `data/` | 数据源目录，存储各国GeoJSON边界数据 |
| `dist/` | 产出物目录，CLI编译输出 |

`data/` 目录结构：

```
data/
├── CHN/                         # 中国
│   ├── country.wgs84.geo.json   # 国家边界 - WGS84
│   ├── country.gcj02.geo.json   # 国家边界 - GCJ02
│   ├── country.bd09.geo.json    # 国家边界 - BD09
│   ├── *.sparse.*.geo.json      # 抽稀版本
│   └── region/                  # 省级行政区边界
│       ├── 110000.wgs84.geo.json
│       ├── region.info.json
│       └── ...                  # 其他省份
│
├── USA/                         # 美国
│   └── country.wgs84.geo.json
│
├── geo/                         # 其他地理数据
│   └── china_admin_divisions.json
│
└── ...                          # 其他国家 (ISO3166-1编码)
```

> 详细说明见: [data目录结构](./data/README.md)

### 5.2 文件类型说明

| 文件类型 | 说明 |
|----------|------|
| `*.info.json` | 基础信息（国家名称、编码、首都等） |
| `*.geo.json` | 结构化GEO数据 |
| `*.sparse.*.geo.json` | 抽稀后的数据（按距离阈值） |

> 数据字段定义见: [数据字典](./config/data-dictionary.json)

---

## 6. API文档

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

### Sparse (Douglas-Peucker)

| 方法 | 说明 |
|------|------|
| `simplify(coords, tolerance)` | 抽稀坐标点集 |
| `calcDistance(p1, p2)` | 计算球面距离(米) |
| `calcHeight(point, start, end)` | 计算点到弦的高度 |

---

## 7. 配置

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

---

## 8. 开发指南

### 8.1 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| TypeScript | 5.x | 类型安全 |
| ES Modules | - | 现代模块系统 |
| Node.js | 20.x | 运行环境 |
| 原生fetch | - | HTTP请求 |
| log4js | - | 日志管理 |
| commander | - | CLI框架 |
| cheerio | - | HTML解析 |

### 8.2 开发命令

```bash
# 开发模式(监听编译)
npm run dev

# 构建
npm run build

# 清理编译输出
npm run clean
```

---

## 9. 数据来源

### GeoJSON数据源

| 来源 | 说明 |
|------|------|
| [johan/world.geo.json](https://github.com/johan/world.geo.json) | 绝大多数国家GeoJSON数据，**特此感谢** |
| [arm0th/CountryGeoJSONCollection](https://github.com/arm0th/CountryGeoJSONCollection) | 部分国家GeoJSON数据 |
| [jawish/maldives-geo](https://github.com/jawish/maldives-geo) | 马尔代夫 🇲🇻 GeoJSON数据 |
| [misterbisson/bgeo-data](https://github.com/misterbisson/bgeo-data) | 巴林王国 🇧🇭 GeoJSON数据 |
| [codeforamerica/click_that_hood](https://github.com/codeforamerica/click_that_hood) | 部分城市数据 |
| [高德开放平台](https://lbs.amap.com/) | 中国行政区划数据 |

### 其他数据源

| 来源 | 说明 |
|------|------|
| [Wikipedia - List of national capitals](https://en.wikipedia.org/wiki/List_of_national_capitals) | 首都数据 |
| [中华人民共和国外交部](https://www.fmprc.gov.cn/web/gjhdq_676201/gj_676203/yz_676205/) | 国家信息 |
| [World Capital Cities](https://geographyfieldwork.com/WorldCapitalCities.htm) | 世界首都 |

---

## 10. 参考文档与工具

### 算法参考

- [Douglas-Peucker算法](https://github.com/LiuTangLei/Douglas-Peucker-js) - 道格拉斯-普克算法

### 坐标转换工具

- [wandergis/coordtransform](https://github.com/wandergis/coordtransform) - 坐标系转换
- [geojson.io](https://geojson.io) - 在线GeoJSON测试

### 国家信息参考

- [中华人民共和国民政部 > 行政区划代码](https://www.mca.gov.cn/article/sj/xzqh/)
- [中华人民共和国统计局](https://www.stats.gov.cn/sj/tjbz/)
- [Highmaps 地图数据集](https://code.highcharts.com/mapdata/)

---

## 11. 历史版本

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-12 | ES6+TypeScript重构完成 |
| 0.0.1 | 2018-12-09 | 初始版本，CommonJS实现 |

---

## 12. License

ISC