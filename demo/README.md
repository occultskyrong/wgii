# Demo 目录

> 地图边界展示示例

本目录包含使用 `products/` 产出物在地图上展示边界的示例代码。

## 目录结构

```
demo/
├── README.md                    # 本文档
├── index.html                   # 导航入口页面
├── echarts/                     # ECharts示例（无需API Key）
│   ├── china-boundary.html      # 中国边境线
│   ├── china-provinces.html     # 省份边界
│   └── international.html       # 国际国家边界
├── amap/                        # 高德地图示例（需API Key）
│   ├── README.md                # 配置说明
│   └── china-provinces.html     # 省份边界
└── baidu/                       # 百度地图示例（需API Key）
    ├── README.md                # 配置说明
    └── china-provinces.html     # 省份边界
```

## 运行方式

由于浏览器 `fetch` 需要HTTP协议，需要启动本地服务器：

### 方式1: npm命令（推荐）

```bash
npm run demo
```

启动后访问: `http://localhost:8080/demo/index.html`

### 方式2: Python

```bash
python -m http.server 8080
```

### 方式3: VS Code Live Server

使用VS Code的Live Server插件，右键 `index.html` 选择 "Open with Live Server"。

## API Key 配置

高德地图和百度地图示例需要API Key：

1. 复制 `demo/api-keys.example.js` 为 `demo/api-keys.js`
2. 在 `api-keys.js` 中填写你的API Key：
   - 高德地图 Key: 从 [lbs.amap.com](https://lbs.amap.com/) 获取
   - 百度地图 AK: 从 [lbsyun.baidu.com](https://lbsyun.baidu.com/) 获取

> 注意：`api-keys.js` 已添加到 gitignore，不会上传到 Git

## 示例说明

### ECharts（推荐）

ECharts示例无需API Key，可直接运行：

| 示例 | 数据文件 | 说明 |
|------|----------|------|
| china-boundary.html | china-boundary-gcj02.json | 中国国家边界 |
| china-provinces.html | china-provinces-gcj02.json | 34省级行政区边界 |
| international.html | international-boundaries-wgs84.json | 192国际国家边界 |

### 高德地图

需要配置API Key，详见 [amap/README.md](amap/README.md)

### 百度地图

需要配置API Key，详见 [baidu/README.md](baidu/README.md)

## 坐标系说明

| 地图库 | 推荐坐标系 | 数据文件 |
|--------|-----------|----------|
| ECharts | GCJ02/WGS84 | *-gcj02.json 或 *-wgs84.json |
| 高德地图 | GCJ02 | *-gcj02.json |
| 百度地图 | BD09 | *-bd09.json |

## 法律声明

在中国境内使用地图数据时，请遵守《中华人民共和国测绘法》相关规定。