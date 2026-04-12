import type { GeoJSONFeatureCollection, CountryInfo, CountryInfoList, Coordinate } from '../types/index.d.ts';
/**
 * 资源数据管理模块
 * 提供各类地理数据的加载和保存功能
 */
export declare class Resource {
    /**
     * 资源文件路径常量
     */
    private static readonly PATHS;
    /**
     * 加载国家GeoJSON数据
     * @returns GeoJSON FeatureCollection
     */
    static loadCountryGeoJson(): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 加载详细的国家GeoJSON数据（包含更多属性）
     * @returns GeoJSON FeatureCollection
     */
    static loadWorldCountryJson(): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 加载国家信息列表
     * @returns 国家信息列表
     */
    static loadCountriesInfo(): Promise<CountryInfoList | null>;
    /**
     * 保存国家信息列表
     * @param countries 国家信息数组
     */
    static saveCountriesInfo(countries: CountryInfo[]): Promise<void>;
    /**
     * 加载联合国国家名称映射（中文）
     * @returns 国家名称映射（英文名 -> 中文名）
     */
    static loadUNCountries(): Promise<Record<string, string> | null>;
    /**
     * 加载联合国国家名称（英文）
     * @returns 国家名称映射（英文名 -> 英文名）
     */
    static loadUNCountriesEnglish(): Promise<Record<string, string> | null>;
    /**
     * 加载国家首都映射
     * @returns 首都映射（国家名 -> 首都名）
     */
    static loadCapitals(): Promise<Record<string, string> | null>;
    /**
     * 加载国家中心点坐标
     * @returns 中心点映射（国家名 -> 坐标）
     */
    static loadCountryCenterPoints(): Promise<Record<string, Coordinate> | null>;
    /**
     * 加载原始的国家中心点坐标（from world-country-center.json）
     * @returns 中心点映射（国家名 -> 坐标）
     */
    static loadOriginalCountryCenterPoints(): Promise<Record<string, Coordinate> | null>;
    /**
     * 加载国家名称翻译映射
     * @returns 翻译映射（英文名 -> 中文名）
     */
    static loadCountryTranslation(): Promise<Record<string, string> | null>;
    /**
     * 加载原始国家名称翻译（from world-country-translation.json）
     * @returns 翻译映射（英文名 -> 中文名）
     */
    static loadOriginalCountryTranslation(): Promise<Record<string, string> | null>;
    /**
     * 加载ISO3166国家代码
     * @returns ISO3166数据数组
     */
    static loadISO3166(): Promise<Array<{
        name: string;
        code2: string;
        code3: string;
        phoneCode: string;
    }> | null>;
    /**
     * 保存国家GeoJSON数据
     * @param data GeoJSON FeatureCollection
     * @param fileName 文件名（默认countries.geojson）
     */
    static saveCountryGeoJson(data: GeoJSONFeatureCollection, fileName?: string): Promise<void>;
    /**
     * 加载生成的GeoJSON数据
     * @returns GeoJSON FeatureCollection
     */
    static loadGeneratedGeoJson(): Promise<GeoJSONFeatureCollection | null>;
    /**
     * 检查生成的GeoJSON是否存在
     * @returns 是否存在
     */
    static hasGeneratedGeoJson(): Promise<boolean>;
    /**
     * 检查国家信息文件是否存在
     * @returns 是否存在
     */
    static hasCountriesInfo(): Promise<boolean>;
    /**
     * 加载世界地图GeoJSON（包含大洲边界等）
     * @returns GeoJSON FeatureCollection
     */
    static loadWorldMap(): Promise<GeoJSONFeatureCollection | null>;
}
export default Resource;
//# sourceMappingURL=resource.d.ts.map