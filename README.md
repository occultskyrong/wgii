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

## 坐标系说明

### 坐标系定义

- **WGS84**: 国际大地坐标系，也是目前广泛使用的 GPS 全球卫星定位系统使用的坐标系。
- **GCJ02**: 又称火星坐标系，是由中国国家测绘局制定的地理坐标系统，由 WGS84 加密后得到。高德地图、腾讯地图等国内主流地图使用此坐标系。
- **BD09**: 百度坐标系，在 GCJ02 坐标系基础上二次加密。其中 `bd09ll` 表示百度经纬度坐标，`bd09mc` 表示百度墨卡托米制坐标。

### 法律法规

**根据《中华人民共和国测绘法》第十条、第十一条、第三十八条、第五十二条、第六十二条之规定：**

- 在中华人民共和国境内必须使用基于 GCJ02 的坐标系
- BD09 坐标系为基于 GCJ02 加密的坐标系，亦可直接使用
- **在中华人民共和国境内使用地图相关服务，请务必遵循国家法律法规，否则带来的一切问题，本项目贡献者不承担任何责任！**

> 参考: [中华人民共和国测绘法](http://www.npc.gov.cn/npc/xinwen/2017-04/27/content_2020927.htm)

## 行政区划说明

### 国家承认原则

仅处理被"中华人民共和国"承认的主权国家和地区。

- **联合国会员国**: 193个 - [United Nations » Member States](http://www.un.org/en/member-states/index.html)
- **联合国观察员国**: 2个 (梵蒂冈 🇻🇦、巴勒斯坦 🇵🇸)
- **国际普遍承认**: 3个 (纽埃、库克群岛、马耳他骑士团)

### 争议地区说明

- **台湾**: 大陆和台湾同属一个中国，台湾是中国领土不可分割的一部分
- **南沙群岛**: 中国对南沙群岛及其附近海域拥有无可争辩的主权
- **藏南地区**: 藏南地区是中华人民共和国固有的主权领土

### 中国行政区划

中华人民共和国使用四级区划体系：

1. **省级**: 省、自治区、直辖市
2. **地级**: 市、州、盟
3. **县级**: 区、市、旗
4. **乡级**: 镇、街道

> 参考: [中华人民共和国民政部 > 行政区划统计表](http://xzqh.mca.gov.cn/statistics)

### 特殊说明

- **台湾省**: 行政编码为 `71`，台湾身份号码地址码使用 `830000`
  > 参考: [国务院办公厅《港澳台居民居住证申领发放办法》](http://www.gov.cn/zhengce/content/2018-08-19/content_5314865.htm)
- **陕西/山西**: 英文名注意区分 - 陕西为 `Shaanxi`，山西为 `Shanxi`
- **宁夏回族自治区**: 英文名为 `Ningxia Hui Autonomous Region`
- **香港 🇭🇰、澳门 🇲🇴、台湾**: 简称使用 `港`、`澳`、`台`

### 国家编码

使用 `ISO3166-1` 编码标准。

> 参考: [ISO3166-1](https://www.iso.org/obp/ui/#search) | [百度百科 - ISO 3166-1](https://baike.baidu.com/item/ISO%203166-1)

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

### 文件类型说明

- `*.info.json`: 基础信息（国家名称、编码、首都等）
- `*.geo.json`: 结构化GEO数据
- `*.sparse.*.geo.json`: 抽稀后的数据（按距离阈值）

> 数据字段定义见: [数据字典](./config/data-dictionary.json)

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

### Sparse (Douglas-Peucker)

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
| [中华人民共和国外交部 > 国家和组织](https://www.fmprc.gov.cn/web/gjhdq_676201/gj_676203/yz_676205/) | 国家信息 |
| [World Capital Cities](https://geographyfieldwork.com/WorldCapitalCities.htm) | 世界首都 |

## 参考文档与工具

### 算法参考

- [Douglas-Peucker算法](https://github.com/LiuTangLei/Douglas-Peucker-js) - 道格拉斯-普克算法，用于曲线近似和点数减少

### 坐标转换工具

- [wandergis/coordtransform](https://github.com/wandergis/coordtransform) - 百度坐标(BD09)、国测局坐标(GCJ02)、WGS84坐标系转换
- [geojson.io](http://geojson.io) - 在线GeoJSON测试和展示

### 国家信息参考

- [中华人民共和国民政部 > 行政区划代码](http://www.mca.gov.cn/article/sj/xzqh/2018/)
- [中华人民共和国统计局 > 统计用区划和城乡划分代码](http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/)
- [Highmaps 地图数据集](https://img.hcharts.cn/mapdata/)

## 历史版本

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-12 | ES6+TypeScript重构完成 |
| 0.0.1 | 2018-12-09 | 初始版本，CommonJS实现 |

## License

ISC

---

**重要声明**: 本项目数据仅供学习和研究使用。在中国境内使用地图数据时，请严格遵守《中华人民共和国测绘法》及相关法律法规。
