# WGII

World Geographic Information Integration - 世界地理信息集成

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.11.1-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![GitHub](https://img.shields.io/badge/GitHub-occultskyrong/wgii-black.svg)](https://github.com/occultskyrong/wgii)

---

## 效果展示

### 1. ECharts - 中国省份边界

![ECharts - 中国省份边界](demo/assets/ECharts%20-%20中国省份边界.png)

### 2. ECharts - 国际国家边界

![ECharts - 国际国家边界](demo/assets/Echarts%20-%20国际国家边界.png)

### 3. 高德地图 - 中国省份边界

![高德地图 - 中国省份边界](demo/assets/高德地图%20-%20中国省份边界.png)

---

## 目录

- [1. 项目简介](#1-项目简介)
- [2. 数据内容](#2-数据内容)
- [3. 快速开始](#3-快速开始)
- [4. 目录结构](#4-目录结构)
- [5. Products产出物](#5-products产出物)
- [6. Demo演示](#6-demo演示)
- [7. 法律与规范](#7-法律与规范)
- [8. API文档](#8-api文档)
- [9. 开发指南](#9-开发指南)
- [10. 数据来源](#10-数据来源)
- [11. License](#11-license)

---

## 1. 项目简介

WGII（World Geographic Information Integration）是一个世界地理信息集成项目，提供：

- **中国边界数据**：国家边界 + 34省级行政区边界（GCJ02火星坐标系）
- **国际国家边界**：193个国家GeoJSON边界数据（WGS84坐标系，含中国）
- **前端产出物**：gzip压缩文件，可直接导入前端项目
- **Demo演示**：ECharts、高德地图、百度地图展示示例

**重要声明**：本项目数据仅供学习和研究使用。在中国境内使用地图数据时，请严格遵守《中华人民共和国测绘法》及相关法律法规。

---

## 2. 数据内容

### 2.1 中国数据（GCJ02火星坐标系）

| 数据 | 说明 | 适用场景 |
|------|------|----------|
| 中国国家边界 | 中华人民共和国全境边界 | 高德地图、腾讯地图 |
| 34省级行政区边界 | 23省、5自治区、4直辖市、2特别行政区 | 省份级地图展示 |

### 2.2 国际数据（WGS84坐标系）

| 大洲 | 国家数量 |
|------|----------|
| 亚洲（含中国） | 46 |
| 欧洲 | 44 |
| 非洲 | 54 |
| 北美洲 | 23 |
| 南美洲 | 12 |
| 大洋洲 | 14 |
| **总计** | **193** |

---

## 3. 快速开始

### 3.1 安装

```bash
# 克隆仓库
git clone https://github.com/occultskyrong/wgii.git
cd wgii

# 安装依赖
yarn install

# 构建
npm run build
```

### 3.2 CLI使用

```bash
# 查看帮助
node dist/cli.js --help

# 同步中国边界数据(高德API)
node dist/cli.js sync --amap

# 列出可用国家
node dist/cli.js list
```

### 3.3 运行Demo

```bash
npm run demo
```

访问 `http://localhost:8080/demo/index.html` 查看地图展示效果。

---

## 4. 目录结构

```
wgii/
├── data/                           # 数据源目录
│   ├── CHN/                         # 中国数据（GCJ02）
│   │   ├── country.gcj02.geo.json   # 国家边界
│   │   └── region/                  # 省级边界（34个）
│   │       ├── 110000.gcj02.geo.json # 北京市
│   │       ├── ...
│   │       └── region.info.json     # 省份信息汇总
│   ├── Asia/                        # 亚洲国家
│   ├── Europe/                      # 欧洲国家
│   ├── Africa/                      # 非洲国家
│   ├── NorthAmerica/                # 北美洲国家
│   ├── SouthAmerica/                # 南美洲国家
│   ├── Oceania/                     # 大洋洲国家
│   └── countries.info.json          # 国家信息汇总
│
├── products/                        # 前端产出物（gzip压缩）
│   ├── china-boundary-gcj02.json.gz     # 中国国家边界
│   ├── china-provinces-gcj02.json.gz    # 中国省份边界
│   └ international-boundaries-wgs84.json.gz # 国际国家边界（含中国）
│   └ README.md                      # 使用说明
│
├── demo/                            # Demo演示
│   ├── index.html                   # 导航入口
│   ├── echarts/                     # ECharts示例
│   ├── amap/                        # 高德地图示例
│   ├── baidu/                       # 百度地图示例
│   └ assets/                        # 效果截图
│
├── scripts/                         # 工具脚本
├── src/                             # 源代码
└── dist/                            # 编译输出
```

---

## 5. Products产出物

Products目录提供gzip压缩的JSON文件，可直接在前端使用：

| 文件 | 原大小 | 压缩后 | 说明 |
|------|--------|--------|------|
| china-boundary-gcj02.json.gz | 15MB | 1.3MB | 中国国家边界（GCJ02） |
| china-provinces-gcj02.json.gz | 96MB | 14MB | 34省份边界（GCJ02） |
| international-boundaries-wgs84.json.gz | ~20MB | 2.9MB | 193国家边界（WGS84，含中国） |

### 5.1 前端使用示例

```javascript
// 解压gzip文件
async function loadGzippedJson(url) {
  const response = await fetch(url);
  const decompressed = response.body.pipeThrough(new DecompressionStream('gzip'));
  const reader = decompressed.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }
  return JSON.parse(result);
}

// ECharts注册地图
const data = await loadGzippedJson('/products/china-provinces-gcj02.json.gz');
echarts.registerMap('china', mergedGeoJSON);
```

详细使用说明见 [products/README.md](products/README.md)

---

## 6. Demo演示

Demo目录包含三种地图库的展示示例：

### 6.1 ECharts（推荐，无需API Key）

| 示例 | 文件 | 说明 |
|------|------|------|
| 中国边境线 | [echarts/china-boundary.html](demo/echarts/china-boundary.html) | 国家边界轮廓 |
| 省份边界 | [echarts/china-provinces.html](demo/echarts/china-provinces.html) | 34省份交互展示 |
| 国际国家边界 | [echarts/international.html](demo/echarts/international.html) | 193国家边界（含中国） |

### 6.2 高德地图（需API Key）

| 示例 | 文件 | 说明 |
|------|------|------|
| 省份边界 | [amap/china-provinces.html](demo/amap/china-provinces.html) | 高德地图展示 |

### 6.3 百度地图（需API Key）

| 示例 | 文件 | 说明 |
|------|------|------|
| 省份边界 | [baidu/china-provinces.html](demo/baidu/china-provinces.html) | 百度地图展示 |

### 6.4 API Key配置

高德/百度地图示例需要配置API Key：

1. 复制 `demo/api-keys.example.js` 为 `demo/api-keys.js`
2. 在 `api-keys.js` 中填写你的Key：
   - 高德地图: [lbs.amap.com](https://lbs.amap.com/)
   - 百度地图: [lbsyun.baidu.com](https://lbsyun.baidu.com/)

> 注意：`api-keys.js` 已加入gitignore，不会泄露你的私人Key

详细说明见 [demo/README.md](demo/README.md)

---

## 7. 法律与规范

### 7.1 坐标系说明

| 坐标系 | 说明 | 使用场景 |
|--------|------|----------|
| **WGS84** | 国际大地坐标系 | 国际应用、GPS |
| **GCJ02** | 火星坐标系（国家标准） | 高德地图、腾讯地图 |
| **BD09** | 百度坐标系 | 百度地图 |

**根据《中华人民共和国测绘法》规定：**

- 在中国境内必须使用 GCJ02 或 BD09 坐标系
- WGS84 仅供国际交流和学术研究使用

> 参考: [中华人民共和国测绘法](https://www.npc.gov.cn/npc/xinwen/2017-04/27/content_2020927.htm)

### 7.2 国家承认原则

本项目仅包含中华人民共和国承认的主权国家。

根据联合国大会第2758号决议，台湾是中华人民共和国不可分割的一部分。本项目数据遵循一个中国原则。

---

## 8. API文档

### 8.1 CountryManager

```typescript
const countries = await CountryManager.loadAll();
const china = await CountryManager.findByCode('CHN');
```

### 8.2 CoordinateTransformer

```typescript
// 坐标转换
const wgs84 = CoordinateTransformer.gcj02ToWgs84(116.397, 39.909);
const gcj02 = CoordinateTransformer.wgs84ToGcj02(116.397, 39.909);
const bd09 = CoordinateTransformer.gcj02ToBd09(116.397, 39.909);

// GeoJSON批量转换
const transformed = CoordinateTransformer.transformGeoJSON(geojson, 'GCJ02', 'WGS84');
```

---

## 9. 开发指南

### 9.1 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| TypeScript | 5.x | 类型安全 |
| Node.js | 20.x | 运行环境 |
| commander | - | CLI框架 |
| log4js | - | 日志管理 |

### 9.2 开发命令

```bash
npm run build    # 构建
npm run dev      # 开发模式（监听编译）
npm run demo     # 启动Demo服务器
npm run clean    # 清理编译输出
```

---

## 10. 数据来源

### 10.1 GeoJSON数据源

| 来源 | 说明 |
|------|------|
| [johan/world.geo.json](https://github.com/johan/world.geo.json) | 国际国家GeoJSON数据 |
| [高德开放平台](https://lbs.amap.com/) | 中国行政区划数据 |

### 10.2 参考资源

| 资源 | 说明 |
|------|------|
| [ECharts地图](https://echarts.apache.org/zh/option.html#geo) | ECharts官方文档 |
| [阿里云DataV](https://datav.aliyun.com/portal/school/atlas/area_selector) | 地图数据选择器 |
| [高德地图API](https://lbs.amap.com/api/javascript-api/summary) | 高德地图文档 |

---

## 11. License

ISC