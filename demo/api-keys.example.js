/**
 * API Keys 配置示例文件
 *
 * 请复制此文件为 api-keys.js 并填写你的实际API Key
 *
 * 示例:
 * const AMAP_API_KEY = '你的高德地图Key';
 * const BAIDU_API_KEY = '你的百度地图AK';
 */

// 高德地图 API Key（从 https://lbs.amap.com/ 获取）
const AMAP_API_KEY = '';

// 百度地图 AK（从 https://lbsyun.baidu.com/ 获取）
const BAIDU_API_KEY = '';

// 导出配置（供HTML文件使用）
if (typeof window !== 'undefined') {
  window.MAP_CONFIG = {
    amapKey: AMAP_API_KEY,
    baiduKey: BAIDU_API_KEY
  };
}