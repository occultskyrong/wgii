# 高德地图 Demo

## 配置说明

高德地图示例需要API Key才能运行。

### 1. 获取API Key

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并登录
3. 进入"应用管理" -> "我的应用"
4. 创建新应用，添加Key
5. 选择"Web服务"类型

### 2. 配置API Key

打开 `china-provinces.html`，找到以下代码：

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_API_KEY"></script>
```

将 `YOUR_API_KEY` 替换为你的实际API Key：

```html
<script src="https://webapi.amap.com/maps?v=2.0&key=你的Key"></script>
```

### 3. 安全配置

为了安全，建议：

- 在高德平台设置IP白名单
- 仅允许本地开发IP访问
- 生产环境使用独立Key

## 相关资源

- [高德地图 JS API文档](https://lbs.amap.com/api/javascript-api/summary)
- [高德地图示例中心](https://lbs.amap.com/demo/javascript-api)