# WGII

Geographic Information Integration of World，世界地理信息集成

## 1. 目录

<!-- TOC depthFrom:2 -->

- [1. 目录](#1-目录)
- [2. 说明](#2-说明)
    - [2.1. 项目说明](#21-项目说明)
    - [2.2. GeoJSON](#22-geojson)
    - [2.3. 坐标系](#23-坐标系)
    - [2.4. 行政区划](#24-行政区划)
    - [2.5. 数据修正](#25-数据修正)
    - [2.6. 数据结构](#26-数据结构)
- [3. 目录结构](#3-目录结构)
    - [3.1. 说明](#31-说明)
    - [3.2. 生成](#32-生成)
    - [3.3. 目录树](#33-目录树)
- [4. 运行](#4-运行)
- [5. 更新历史](#5-更新历史)
    - [5.1. Todo list](#51-todo-list)
- [6. 参考](#6-参考)
    - [6.1. 基于`LICENSE`开源引用](#61-基于license开源引用)
    - [6.2. 参考文档](#62-参考文档)
        - [6.2.1. 算法](#621-算法)
    - [6.3. 工具](#63-工具)
    - [6.4. 数据来源](#64-数据来源)
        - [6.4.1. `Geo.json`数据源](#641-geojson数据源)
        - [6.4.2. 高德开放平台](#642-高德开放平台)

<!-- /TOC -->

## 2. 说明

### 2.1. 项目说明

整合世界主要国家或地区的地理信息，包括但不限于以下内容：

- 国名
    - 中文名称，包括官方名称、联合国名称、缩写名称
    - 英文名称，包括官方名称、联合国名称、缩写名称
- 国家代码
- 简称
- 首都

### 2.2. GeoJSON

> [GeoJSON][]

### 2.3. 坐标系

- 关于坐标系的说明，参见[坐标系说明书][]

> - `WGS84`：为一种大地坐标系，也是目前广泛使用的 `GPS` 全球卫星定位系统使用的坐标系。
> - `GCJ02`：又称火星坐标系，是由中国国家测绘局制定的地理坐标系统，是由 `WGS84` 加密后得到的坐标系。
> - `BD09`：为百度坐标系，在 `GCJ02` 坐标系基础上再次加密。其中 `bd09ll` 表示百度经纬度坐标，`bd09mc` 表示百度墨卡托米制坐标。

- 坐标系转换方法，参见[wandergis/coordtransform][GitHub - wandergis/coordtransform]
- 法律法规
    - **根据[《中华人民共和国测绘法》][中华人民共和国测绘法]** 第十条、第十一条、第三十八条、第五十二条、第六十二条 之规定
    - 国内必须使用基于 `GCJ02` 的坐标系，`BD09` 坐标系为基于 `GCJ02` 加密的坐标系，可以直接使用
    - **请务必遵循国家法律法规，否则带来的一切问题，本人不承担任何责任**

### 2.4. 行政区划

- 不涉及政治区域的划分和地区与国家的讨论，及各种纠纷
- 仅处理被“中华人民共和国”承认的主权国家和地区
    - 具体有关国家的说明参见 » [百度百科 - 国家][]
        - 国家类型 `country type` 的说明
            - `Member State` 联合国会员国，来源于 [United Nations » Member States][]
            - `Non-member State` 联合国非会员国，即观察员国，来源于 [United Nations » Non-member States][]
            - `Sovereign State` 主权国家，来源于 [Google翻译 » 主权国家][]
    - 具体有关地区的说明参见 » [百度百科 - 地区][]
- 关于“中华人民共和国”有争议地区
    - “台湾”，大陆和台湾同属一个中国，台湾是中国领土不可分割的一部分。
    - “南沙群岛”，中国对南沙群岛及其附近海域拥有无可争辩的主权。
    - “藏南地区”，藏南地区是是中华人民共和国固有的主权领土。[百度百科 - 藏南地区][]
- 主权国家（截至2017年），共计198个
    - 联合国会员国：193个，具体名单参见 [United Nations » Member States][]
    - 联合国观察员国：2个
        - 梵蒂冈，联合国称其为（罗马）教廷
        - 巴勒斯坦，法定首都为耶路撒冷，实际控制首都为拉姆安拉；采用拉姆安拉(`Ramallah`)
    - 国际普遍承认：3个，
        - 纽埃
        - 库克群岛
        - *马耳他骑士团*
- 地区，?个
- 国家政体不同，及组织形式不同，
    - 可能导致国家名称翻译不同；
    - 同时国家内下级行政区别不同，诸如州(state)、省(province)，具体两者的区别，此处不展开
        - 对统一标注，使用`region_name`/`region_code`标记省州级行政区划的名称和编码
        - 国内使用省级（自治区、直辖市）、地级（市、州、盟）、县级（区、市、旗）、乡级（镇、街道）四级区划
            - 国内四级行政区别见[中华人民共和国民政部 > 行政区划统计表][]
            - 具体区划内容参见[中华人民共和国民政部 > 行政区划代码][]
            - 具体区划编码可参见[中华人民共和国统计局 > 统计用区划和城乡划分代码][]
            - 国内省级区划整理数据见[中华人民共和国 > 省级行政区划][]
            - 备注
                - `宁夏回族自治区`英文名为`Ningxia Hui Autonomous Region`，但有使用`Ningsia Hui Autonomous Region`，如[GeoLite2免费可下载数据库][];
                - `台湾省`行政编码为`71`，但根据[国务院办公厅关于印发《港澳台居民居住证申领发放办法》的通知][]，台湾身份号码地址码使用`830000`，此处暂使用`7100000`;
                    - > 公民身份号码由公安机关按照公民身份号码国家标准编制。香港居民公民身份号码地址码使用810000，澳门居民公民身份号码地址码使用820000，台湾居民公民身份号码地址码使用830000。
                - `陕西`的英文名为`Shaanxi`，`山西`的英文名`Shanxi`，注意区分；

### 2.5. 数据修正

- 修改部分国家中文名称

### 2.6. 数据结构

见[数据字典][]

## 3. 目录结构

### 3.1. 说明

- 数据分为基础信息和`GEO`数据
    - 标记为`*.info.json`为 基础信息（国家名称、编码、首都信息等）
    - 标记为`*.geo.json`为 结构化`GEO`数据，具体字段见说明[数据字典][]
    - 标记为`*.all.json`为 基于`geo.json`数据格式，整合`info.json`数据的结构化数据体

### 3.2. 生成

```shell
tree -a -L 2 -I "node_modules|*.json|.*|.vscode|LICENSE"
```

### 3.3. 目录树

```tree
.
├── README.md                                           # 说明文档
├── build                                               # 构建脚本
│   ├── index.js                                            # 执行文件
│   └── sparse.js                                           # 抽稀脚本
├── config                                              # 配置文件
├── dist                                                # 输出结果
│   └── CHN                                                 # 国家数据
│   │   ├── country.bd09.geo.json                               # BD09坐标系 - 原始数据，来源于坐标系转换，适配百度地图
│   │   ├── country.bd09.sparse.1.geo.json                      # BD09坐标系 - 按1km抽稀后结果数据
│   │   ├── country.gcj02.geo.json                              # GCJ02坐标系 - 原始数据，来源于高德开放平台，适配高德、腾讯等国内主流地图
│   │   ├── country.gcj02.sparse.1.geo.json                     # GCJ02坐标系 - 按1km抽稀后结果数据
│   │   ├── country.wgs84.geo.json                              # WGS84坐标系 - 原始数据，来源于坐标系转换，适配Google地图
│   │   ├── country.wgs84.sparse.1.geo.json                     # WGS84坐标系 - 按1km抽稀后结果数据
│   │   └── provinces
├── resource                                            # 源数据
│   ├── original                                            # 原始数据，已加工
│   ├── raw                                                 # 原始数据，未加工
│   └── sql                                                 # SQL数据
├── src                                                 # 源码
│   ├── common
│   ├── crawler
│   ├── index.js
│   ├── model.js
│   ├── models
│   └── sync.js
├── test
└── yarn.lock
```

## 4. 运行

```shell
# 下载项目
git clone https://github.com/occultskyrong/wgii.git
# 安装依赖
yarn install

# 自动生成数据
npm run build

# 使用sequelize-auto导出model
sequelize-auto -o './models' -h localhost -p 3306 -u root -x root -d test
```

## 5. 更新历史

| version | date       | desc                                                           |
| ------- | ---------- | -------------------------------------------------------------- |
| 0.0.1   | 2018-12-09 | 完成联合国会员国国家信息数据整理                               |
| 0.0.1   | 2018-12-13 | 完成中华人民共和国国家`GeoJSON`数据整理                        |
| 0.0.1   | 2019-01-11 | 完成联合国会员国国家信息数据输出，见`dist/countries_info.json` |
| 0.0.1   | 2019-01-14 | 完成中华人民共和国省级信息数据整理                             |

### 5.1. Todo list

- [ ] 整理数据来源
- [ ] 整理国内省份和城市对应关系，及中英文对照
- [ ] 对比`ISO3166`整理国家和地区信息
- [ ] 测试对比[wandergis/coordtransform][GitHub - wandergis/coordtransform]提供转换和百度官方转换结果偏差量

## 6. 参考

### 6.1. 基于`LICENSE`的开源引用

- `GeoLite2`

> This product includes GeoLite2 data created by MaxMind, available from
<a href="http://www.maxmind.com">http://www.maxmind.com</a>.

### 6.2. 参考文档

> - [CSDN - echarts世界地图各个国家及中国城市的经纬度数组][]
> - [CSDN - echarts世界国家中英文对照][]

#### 6.2.1. 算法

> - [DouglasPeucker][GitHub - LiuTangLei/Douglas-Peucker-js] 道格拉斯-普克算法，是将曲线近似表示为一系列点，并减少点的数量的一种算法

### 6.3. 工具

> - [geojson.io](http://geojson.io) 一个可以测试边界在`Google`地图展示效果的在线应用
> - [wandergis/coordtransform][GitHub - wandergis/coordtransform] 提供了百度坐标（`BD09`）、国测局坐标（火星坐标，`GCJ0`2）、和`WGS84`坐标系之间的转换

### 6.4. 数据来源

> - [中华人民共和国外交部 > 国家和组织][]
> - [Highmaps 地图数据集][]
> - [【 地图系列 】 世界地图和主要国家的 JSON 文件][]
> - [GitHub - pissang/starbucks][]
> - [World Capital Cities][]
> - [Wiki - List of national capitals][]
> - [GitHub - johan/world.geo.json][]

#### 6.4.1. `Geo.json`数据源

> - 马尔代夫 [GitHub - jawish/maldives-geo][]

#### 6.4.2. 高德开放平台

> - [开发 > Web服务 API > 开发指南 > API文档 > 行政区域查询][]

<!-- 国家机关 -->
[中华人民共和国外交部 > 国家和组织]: https://www.fmprc.gov.cn/web/gjhdq_676201/gj_676203/yz_676205/
[中华人民共和国测绘法]: http://www.npc.gov.cn/npc/xinwen/2017-04/27/content_2020927.htm
[中华人民共和国统计局 > 统计用区划和城乡划分代码]: http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/
[中华人民共和国民政部 > 行政区划代码]: http://www.mca.gov.cn/article/sj/xzqh/2018/
[中华人民共和国民政部 > 行政区划统计表]: http://xzqh.mca.gov.cn/statistics
[国务院办公厅关于印发《港澳台居民居住证申领发放办法》的通知]: http://www.gov.cn/zhengce/content/2018-08/19/content_5314865.htm
<!-- 百度 -->
[百度百科 - 国家]: https://baike.baidu.com/item/%E5%9B%BD%E5%AE%B6/17205
[百度百科 - 地区]: https://baike.baidu.com/item/%E5%9C%B0%E5%8C%BA/13841495#viewPageContent
[百度百科 - 藏南地区]: https://baike.baidu.com/item/%E8%97%8F%E5%8D%97%E5%9C%B0%E5%8C%BA/5372008?fr=aladdin
[坐标系说明书]: http://lbsyun.baidu.com/index.php?title=coordinate
<!-- 高德 -->
[开发 > Web服务 API > 开发指南 > API文档 > 行政区域查询]: https://lbs.amap.com/api/webservice/guide/api/district
<!-- Google -->
[Google翻译 » 主权国家]: https://translate.google.com/#view=home&op=translate&sl=zh-CN&tl=en&text=%E4%B8%BB%E6%9D%83%E5%9B%BD%E5%AE%B6
<!-- 联合国 -->
[United Nations » Member States]: http://www.un.org/en/member-states/index.html
[United Nations » Non-member States]: http://www.un.org/en/sections/member-states/non-member-states/index.html
<!-- Wiki -->
[Wiki - List of national capitals]: https://en.wikipedia.org/wiki/List_of_national_capitals
<!-- GitHub -->
[GitHub - pissang/starbucks]: https://github.com/pissang/starbucks
[GitHub - wandergis/coordtransform]: https://github.com/wandergis/coordtransform
[GitHub - johan/world.geo.json]: https://github.com/johan/world.geo.json
[GitHub - mledoze/countries]: https://github.com/mledoze/countries
[GitHub - LiuTangLei/Douglas-Peucker-js]: https://github.com/LiuTangLei/Douglas-Peucker-js/blob/master/douglas.js
[GitHub - jawish/maldives-geo]: https://github.com/jawish/maldives-geo/blob/master/administrative_atolls.geojson
<!-- CSDN -->
[CSDN - echarts世界地图各个国家及中国城市的经纬度数组]: https://blog.csdn.net/xiaozhi_free/article/details/79654529
[CSDN - echarts世界国家中英文对照]: https://blog.csdn.net/u012557538/article/details/78490267
<!-- 输出文档 -->
[中华人民共和国 > 省级行政区划]: ./dist/CHN/region.info.json
[中华人民共和国 > 地级行政区划]: ./dist/CHN/cities.info.json
[数据字典]: ./config/data-dictionary.json
<!-- 其他 -->
[GeoJSON]: http://geojson.org/
[Highmaps 地图数据集]: https://img.hcharts.cn/mapdata/
[World Capital Cities]: https://geographyfieldwork.com/WorldCapitalCities.htm
[【 地图系列 】 世界地图和主要国家的 JSON 文件]: http://www.ourd3js.com/wordpress/668/

<!-- 待归档 -->

[1]: https://stackoverflow.com/questions/9542834/geojson-world-database
[2]: https://github.com/AshKyd/geojson-regions
[3]: http://httphobo.com/all/world-country-and-state-boundaries-in-geojson/
[4]: http://mbostock.github.io/protovis/ex/countries.js
[5]: ftp://ftp.fu-berlin.de/doc/iso/iso3166-countrycodes.txt
[GeoLite2免费可下载数据库]: https://dev.maxmind.com/zh-hans/geoip/geoip2/geolite2/