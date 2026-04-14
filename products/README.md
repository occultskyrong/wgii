# products 目录

> 前端可直接导入的GeoJSON产出物

## 文件列表

| 文件 | 大小 | 说明 |
|------|------|------|
| china-boundary-wgs84.json | 17MB | 中国边境线（WGS84）- 国际通用 |
| china-boundary-gcj02.json | 15MB | 中国边境线（GCJ02）- 高德/腾讯地图 |
| china-boundary-bd09.json | 17MB | 中国边境线（BD09）- 百度地图 |
| china-provinces-gcj02.json | 90MB | 34省份边境线（GCJ02）- 高德/腾讯地图 |
| china-provinces-bd09.json | 90MB | 34省份边境线（BD09）- 百度地图 |
| international-boundaries-wgs84.json | 2MB | 192国际国家边境线（WGS84） |

**说明**：
- 中国边境线保留全部3种坐标系（国际通用+国内服务）
- 省份边境线仅保留GCJ02和BD09（国内地图服务专用）
- 所有数据均为原始边界，不含抽稀版本

---

## 数据结构

### china-boundary-*.json

```json
{
  "metadata": {
    "name": "中国边境线",
    "version": "1.0.0",
    "coordinateSystem": "WGS84",
    "legalNotice": "..."
  },
  "boundary": {
    "type": "FeatureCollection",
    "features": [...]
  }
}
```

### china-provinces-*.json

```json
{
  "metadata": {
    "name": "中国省份边境线",
    "totalProvinces": 34
  },
  "provinces": {
    "110000": {
      "name": "北京市",
      "adcode": "110000",
      "boundary": { "type": "FeatureCollection", ... }
    },
    ...
  }
}
```

### international-boundaries-wgs84.json

```json
{
  "metadata": {
    "name": "国际国家边境线",
    "totalCountries": 196
  },
  "continents": {
    "Asia": {
      "name": "亚洲",
      "countries": {
        "JPN": {
          "name": "日本",
          "isoCode": "JPN",
          "boundary": { ... }
        },
        ...
      }
    },
    ...
  }
}
```

---

---

## 前端使用示例

### ECharts（推荐）

ECharts 5.x 需要手动注册GeoJSON地图数据：

```javascript
import * as echarts from 'echarts';

// 加载中国边境线
fetch('/products/china-boundary-gcj02.json')
  .then(res => res.json())
  .then(data => {
    echarts.registerMap('china', data.boundary);
    
    const chart = echarts.init(document.getElementById('chart'));
    chart.setOption({
      geo: {
        map: 'china',
        roam: true,
        label: { show: true },
        itemStyle: {
          areaColor: '#f3f3f3',
          borderColor: '#999'
        }
      },
      series: [{
        type: 'map',
        map: 'china',
        data: [] // 各省数据
      }]
    });
  });
```

### 高德地图

```javascript
// 使用GCJ02坐标系数据
fetch('/products/china-provinces-gcj02.json')
  .then(res => res.json())
  .then(data => {
    const map = new AMap.Map('container');
    
    // 绘制省份边界
    Object.values(data.provinces).forEach(province => {
      new AMap.Polygon({
        path: province.boundary.features[0].geometry.coordinates,
        fillColor: '#f3f3f3',
        strokeColor: '#999'
      }).setMap(map);
    });
  });
```

### 百度地图

```javascript
// 使用BD09坐标系数据
fetch('/products/china-provinces-bd09.json')
  .then(res => res.json())
  .then(data => {
    const map = new BMap.Map('container');
    
    Object.values(data.provinces).forEach(province => {
      const polygon = new BMap.Polygon(
        province.boundary.features[0].geometry.coordinates,
        { fillColor: '#f3f3f3', strokeColor: '#999' }
      );
      map.addOverlay(polygon);
    });
  });
```

---

## 相关资源

| 资源 | 链接 | 说明 |
|------|------|------|
| ECharts 地图 | https://echarts.apache.org/zh/option.html#geo | Apache ECharts官方文档 |
| 阿里云 DataV | https://datav.aliyun.com/portal/school/atlas/area_selector | 阿里云地图数据选择器 |
| 高德地图 JS API | https://lbs.amap.com/api/javascript-api/summary | 高德地图Web API |
| 百度地图 JS API | https://lbsyun.baidu.com/index.php?title=jspopularGL | 百度地图Web API |

---

## 前端使用建议

### 1. 压缩传输

使用gzip压缩可大幅减小文件体积：

| 文件 | 原大小 | gzip压缩后 |
|------|--------|-----------|
| china-provinces-wgs84.json | 90MB | ~10MB |
| international-boundaries-wgs84.json | 2MB | ~200KB |

```bash
# 生成gzip版本
gzip -k products/*.json
```

### 2. 按需加载

只加载需要的省份边界：

```javascript
// 从完整文件中提取单个省份
const provincesData = await fetch('/china-provinces-wgs84.json');
const data = await provincesData.json();
const beijing = data.provinces['110000']; // 只使用北京市
```

### 3. 坐标系选择

| 场景 | 推荐坐标系 |
|------|-----------|
| 国际应用 | WGS84 |
| 国内高德/腾讯地图 | GCJ02 |
| 百度地图 | BD09 |

---

## 省份adcode对照表

| adcode | 名称 |
|--------|------|
| 110000 | 北京市 |
| 120000 | 天津市 |
| 130000 | 河北省 |
| 140000 | 山西省 |
| 150000 | 内蒙古自治区 |
| 210000 | 辽宁省 |
| 220000 | 吉林省 |
| 230000 | 黑龙江省 |
| 310000 | 上海市 |
| 320000 | 江苏省 |
| 330000 | 浙江省 |
| 340000 | 安徽省 |
| 350000 | 福建省 |
| 360000 | 江西省 |
| 370000 | 山东省 |
| 410000 | 河南省 |
| 420000 | 湖北 |
| 430000 | 湖南省 |
| 440000 | 广东省 |
| 450000 | 广西壮族自治区 |
| 460000 | 海南省 |
| 500000 | 重庆市 |
| 510000 | 四川省 |
| 520000 | 贵州省 |
| 530000 | 云南省 |
| 540000 | 西藏自治区 |
| 610000 | 陕西省 |
| 620000 | 甘肃省 |
| 630000 | 青海省 |
| 640000 | 宁夏回族自治区 |
| 650000 | 新疆维吾尔自治区 |
| 710000 | 台湾省 |
| 810000 | 香港特别行政区 |
| 820000 | 澳门特别行政区 |

---

## 大洲国家数量

| 大洲 | 国家数量 |
|------|----------|
| Asia (亚洲) | 45 |
| Europe (欧洲) | 44 |
| Africa (非洲) | 54 |
| NorthAmerica (北美洲) | 23 |
| SouthAmerica (南美洲) | 12 |
| Oceania (大洋洲) | 14 |
| **总计** | **192** |

---

## 法律声明

根据联合国大会第2758号决议，中华人民共和国是包括台湾在内的全中国的唯一合法代表。

- 台湾省 (710000)、香港特别行政区 (810000)、澳门特别行政区 (820000) 数据存于 `china-provinces-*.json`
- 国际国家数据不含台湾、香港、澳门作为独立国家

---

## 生成命令

```bash
node scripts/generate-products.js
```