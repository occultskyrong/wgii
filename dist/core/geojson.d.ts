import type { CoordinateSystem, GeoJSONFeatureCollection } from '../types/index.d.ts';
/**
 * GeoJSON处理类
 * 提供GeoJSON数据的加载、保存、合并、坐标转换和抽稀等功能
 *
 * 注意: 此文件与country.ts存在循环依赖
 * 如需使用CountryManager，请在文件底部导入或使用延迟导入模式
 */
export declare class GeoJSONProcessor {
    /**
     * GeoJSON文件存储路径
     */
    private static readonly PATHS;
    /**
     * 加载指定国家和坐标系的GeoJSON数据
     * @param countryCode 国家代码（ISO3166-1 三位字母码）
     * @param system 坐标系类型，默认WGS84
     * @returns GeoJSON FeatureCollection，文件不存在时返回null
     */
    static load(countryCode: string, system?: CoordinateSystem): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 保存指定国家的GeoJSON数据
     * @param countryCode 国家代码
     * @param geojson GeoJSON数据
     * @param system 坐标系类型，默认WGS84
     */
    static save(countryCode: string, geojson: GeoJSONFeatureCollection, system?: CoordinateSystem): Promise<void>;
    /**
     * 合并多个国家的GeoJSON数据
     * @param countryCodes 国家代码数组
     * @param system 坐标系类型，默认WGS84
     * @returns 合并后的GeoJSON FeatureCollection
     */
    static merge(countryCodes: string[], system?: CoordinateSystem): Promise<GeoJSONFeatureCollection>;
    /**
     * 坐标系转换并保存
     * @param countryCode 国家代码
     * @param from 源坐标系
     * @param to 目标坐标系
     * @returns 转换后的GeoJSON，源文件不存在时返回null
     */
    static transformAndSave(countryCode: string, from: CoordinateSystem, to: CoordinateSystem): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 生成抽稀版本
     * 对GeoJSON进行不同精度的简化处理，生成多个版本
     * @param countryCode 国家代码
     * @param distances 抽稀距离数组（单位：米），如[100, 500, 1000]
     * @returns 生成的版本数量
     */
    static generateSparseVersions(countryCode: string, distances: number[]): Promise<number>;
    /**
     * 获取所有可用的国家代码
     * 扫描GeoJSON存储目录，提取所有存在的国家代码
     * @param system 坐标系类型，默认WGS84
     * @returns 国家代码数组
     */
    static getAvailableCountryCodes(system?: CoordinateSystem): Promise<string[]>;
    /**
     * 处理所有国家的GeoJSON数据
     * 为所有国家生成指定距离的抽稀版本
     * @param distances 抽稀距离数组（单位：米）
     * @returns 处理结果统计
     */
    static processAllCountries(distances: number[]): Promise<{
        total: number;
        success: number;
        failed: number;
    }>;
    /**
     * 获取GeoJSON文件名
     * @param countryCode 国家代码
     * @param system 坐标系
     * @returns 相对于dist目录的文件路径
     */
    private static getGeoJsonFileName;
    /**
     * 获取抽稀版本文件名
     * @param countryCode 国家代码
     * @param distance 抽稀距离
     * @returns 相对于dist目录的文件路径
     */
    private static getSparseFileName;
    /**
     * 加载原始GeoJSON数据（未经坐标转换）
     * @param countryCode 国家代码
     * @returns 原始GeoJSON数据
     */
    static loadOriginal(countryCode: string): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 保存原始GeoJSON数据
     * @param countryCode 国家代码
     * @param geojson GeoJSON数据
     */
    static saveOriginal(countryCode: string, geojson: GeoJSONFeatureCollection): Promise<void>;
    /**
     * 加载抽稀版本
     * @param countryCode 国家代码
     * @param distance 抽稀距离
     * @returns 抽稀后的GeoJSON数据
     */
    static loadSparse(countryCode: string, distance: number): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 检查国家GeoJSON是否存在
     * @param countryCode 国家代码
     * @param system 坐标系类型
     * @returns 是否存在
     */
    static exists(countryCode: string, system?: CoordinateSystem): Promise<boolean>;
    /**
     * 删除国家GeoJSON
     * @param countryCode 国家代码
     * @param system 坐标系类型
     * @returns 是否成功删除
     */
    static delete(countryCode: string, system?: CoordinateSystem): Promise<boolean>;
}
export default GeoJSONProcessor;
/**
 * 循环依赖处理说明:
 *
 * GeoJSONProcessor 与 CountryManager 存在循环依赖:
 * - GeoJSONProcessor 可能需要调用 CountryManager 获取国家信息
 * - CountryManager 可能需要调用 GeoJSONProcessor 加载地理数据
 *
 * 解决方案:
 * 1. 在此文件底部使用延迟导入（lazy import）
 * 2. 或在使用时动态导入:
 *    const { CountryManager } = await import('./country.js');
 *
 * 示例延迟导入（如果需要在静态方法中使用CountryManager）:
 *
 * // 在文件底部添加:
 * // import('./country.js').then(module => {
 * //   GeoJSONProcessor.CountryManager = module.CountryManager;
 * // });
 */ 
//# sourceMappingURL=geojson.d.ts.map