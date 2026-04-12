import type { GeoJSONFeatureCollection } from '../types/index.d.ts';
/**
 * 高德地图行政区划API响应
 */
interface AmapDistrictResponse {
    status: string;
    info: string;
    infocode: string;
    districts: AmapDistrict[];
}
/**
 * 高德地图行政区划数据
 */
interface AmapDistrict {
    adcode: string;
    name: string;
    center: string;
    level: string;
    polyline: string | string[];
    districts: AmapDistrict[];
}
/**
 * 高德地图API爬虫
 *
 * 用于获取中国行政区划边界数据并生成GeoJSON格式
 */
export declare class AmapCrawler {
    private apiKey;
    private readonly baseUrl;
    constructor(apiKey?: string);
    /**
     * 初始化，从配置文件加载API Key
     */
    init(): Promise<void>;
    /**
     * 获取行政区划数据
     * @param adcode 行政区划代码
     * @param extensions 返回数据扩展项，默认返回基础信息
     */
    getDistrict(adcode?: string, extensions?: 'base' | 'all'): Promise<AmapDistrictResponse>;
    /**
     * 解析高德polyline字符串为坐标数组
     * 高德返回的polyline格式: "lng1,lat1;lng2,lat2;..."
     * @param polyline polyline字符串或字符串数组
     * @returns 坐标数组
     */
    private parsePolyline;
    /**
     * 将行政区划数据转换为GeoJSON Feature
     * @param district 行政区划数据
     */
    private districtToFeature;
    /**
     * 递归处理行政区划数据
     * @param district 行政区划数据
     * @param features Feature数组
     */
    private processDistrictRecursive;
    /**
     * 生成中国行政区划GeoJSON
     * @param adcode 起始行政区划代码，默认为中国(100000)
     * @param subdistricts 子级深度，默认3级(省-市-区县)
     */
    generateChinaGeoJSON(adcode?: string, subdistricts?: number): Promise<GeoJSONFeatureCollection>;
    /**
     * 获取省级行政区列表
     */
    getProvinces(): Promise<AmapDistrict[]>;
    /**
     * 同步行政区划数据到本地存储
     * @param outputDir 输出目录，默认为dist/geo
     */
    sync(outputDir?: string): Promise<string>;
    /**
     * 获取单个省份的详细边界数据
     * @param adcode 省份行政区划代码
     */
    getProvinceDetail(adcode: string): Promise<GeoJSONFeatureCollection>;
}
export default AmapCrawler;
//# sourceMappingURL=amap.d.ts.map