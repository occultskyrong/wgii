import type { CountryInfo, Coordinate } from '../types/index.d.ts';
/**
 * 国家信息管理类
 * 提供国家信息的加载、查询、保存等功能
 */
export declare class CountryManager {
    /**
     * 国家信息缓存
     */
    private static countries;
    /**
     * 国家信息文件路径
     */
    private static readonly COUNTRIES_INFO_FILE;
    /**
     * 加载所有国家信息
     * @returns 国家信息数组
     */
    static loadAll(): Promise<CountryInfo[]>;
    /**
     * 根据ISO3166-1三位字母码查找国家
     * @param code 国家代码（三位字母码）
     * @returns 国家信息，未找到返回null
     */
    static findByCode(code: string): Promise<CountryInfo | null>;
    /**
     * 根据国家名称查找国家（支持中英文名称）
     * @param name 国家名称（中文或英文）
     * @returns 国家信息，未找到返回null
     */
    static findByName(name: string): Promise<CountryInfo | null>;
    /**
     * 根据大洲查找国家列表
     * @param continent 大洲名称
     * @returns 国家信息数组
     */
    static findByContinent(continent: string): Promise<CountryInfo[]>;
    /**
     * 保存单个国家信息
     * @param country 国家信息
     */
    static save(country: CountryInfo): Promise<void>;
    /**
     * 保存所有国家信息
     * @param countries 国家信息数组
     */
    static saveAll(countries: CountryInfo[]): Promise<void>;
    /**
     * 更新国家首都信息
     * @param countryCode 国家代码
     * @param capitalChinese 首都中文名
     * @param capitalEnglish 首都英文名
     * @param capitalPoint 首都坐标
     * @returns 是否更新成功
     */
    static updateCapital(countryCode: string, capitalChinese: string, capitalEnglish: string, capitalPoint?: Coordinate): Promise<boolean>;
    /**
     * 获取所有国家代码
     * @returns 国家代码数组
     */
    static getAllCodes(): Promise<string[]>;
    /**
     * 按大洲统计国家数量
     * @returns 大洲到国家数量的映射
     */
    static countByContinent(): Promise<Record<string, number>>;
    /**
     * 清除缓存
     */
    static clearCache(): void;
}
export default CountryManager;
//# sourceMappingURL=country.d.ts.map