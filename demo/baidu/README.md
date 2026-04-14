# 百度地图 Demo

## 配置说明

百度地图示例需要API Key才能运行。

### 1. 获取API Key

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册账号并登录
3. 进入"应用管理" -> "我的应用"
4. 创建新应用，获取AK
5. 选择"浏览器端"类型

### 2. 配置API Key

打开 `china-provinces.html`，找到以下代码：

```html
<script src="https://api.map.baidu.com/api?v=3.0&ak=YOUR_API_KEY"></script>
```

将 `YOUR_API_KEY` 替换为你的实际AK：

```html
<script src="https://api.map.baidu.com/api?v=3.0&ak=你的AK"></script>
```

### 3. 安全配置

为了安全，建议：

- 在百度平台设置域名白名单
- 仅允许本地开发域名访问
- 生产环境使用独立AK

## 相关资源

- [百度地图 JS API文档](https://lbsyun.baidu.com/index.php?title=jspopularGL)
- [百度地图示例中心](https://lbsyun.baidu.com/index.php?title=jspopularGL/guide)