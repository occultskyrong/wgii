// src/core/country.ts
import { Resource } from '../storage/resource.js';
import { logger } from '../utils/logger.js';
/**
 * 国家信息管理类
 * 提供国家信息的加载、查询、保存等功能
 */
export class CountryManager {
    /**
     * 国家信息缓存
     */
    static countries = null;
    /**
     * 国家信息文件路径
     */
    static COUNTRIES_INFO_FILE = 'dist/countries-info.json';
    /**
     * 加载所有国家信息
     * @returns 国家信息数组
     */
    static async loadAll() {
        if (this.countries !== null) {
            return this.countries;
        }
        const data = await Resource.loadCountriesInfo();
        if (data && data.countries) {
            this.countries = data.countries;
            logger.info(`Loaded ${this.countries.length} countries from cache`);
            return this.countries;
        }
        logger.warn('No countries info found, returning empty array');
        this.countries = [];
        return this.countries;
    }
    /**
     * 根据ISO3166-1三位字母码查找国家
     * @param code 国家代码（三位字母码）
     * @returns 国家信息，未找到返回null
     */
    static async findByCode(code) {
        const countries = await this.loadAll();
        const upperCode = code.toUpperCase();
        const country = countries.find((c) => c.countryCode === upperCode);
        return country || null;
    }
    /**
     * 根据国家名称查找国家（支持中英文名称）
     * @param name 国家名称（中文或英文）
     * @returns 国家信息，未找到返回null
     */
    static async findByName(name) {
        const countries = await this.loadAll();
        const lowerName = name.toLowerCase();
        const country = countries.find((c) => c.nameChinese === name ||
            c.nameChineseAbbreviation === name ||
            c.nameChineseUN === name ||
            c.nameEnglishAbbreviation.toLowerCase() === lowerName ||
            c.nameEnglishFormal.toLowerCase() === lowerName ||
            c.nameEnglishShort.toLowerCase() === lowerName ||
            c.nameEnglishUN?.toLowerCase() === lowerName);
        return country || null;
    }
    /**
     * 根据大洲查找国家列表
     * @param continent 大洲名称
     * @returns 国家信息数组
     */
    static async findByContinent(continent) {
        const countries = await this.loadAll();
        return countries.filter((c) => c.continent === continent);
    }
    /**
     * 保存单个国家信息
     * @param country 国家信息
     */
    static async save(country) {
        const countries = await this.loadAll();
        // 查找是否已存在
        const index = countries.findIndex((c) => c.countryCode === country.countryCode);
        if (index >= 0) {
            // 更新已存在的国家
            countries[index] = { ...countries[index], ...country };
            logger.debug(`Updated country: ${country.countryCode}`);
        }
        else {
            // 添加新国家
            countries.push(country);
            logger.debug(`Added country: ${country.countryCode}`);
        }
        // 保存到文件
        await this.saveAll(countries);
    }
    /**
     * 保存所有国家信息
     * @param countries 国家信息数组
     */
    static async saveAll(countries) {
        // 更新缓存
        this.countries = countries;
        // 保存到文件
        await Resource.saveCountriesInfo(countries);
        logger.info(`Saved ${countries.length} countries`);
    }
    /**
     * 更新国家首都信息
     * @param countryCode 国家代码
     * @param capitalChinese 首都中文名
     * @param capitalEnglish 首都英文名
     * @param capitalPoint 首都坐标
     * @returns 是否更新成功
     */
    static async updateCapital(countryCode, capitalChinese, capitalEnglish, capitalPoint) {
        const countries = await this.loadAll();
        const index = countries.findIndex((c) => c.countryCode === countryCode.toUpperCase());
        if (index < 0) {
            logger.warn(`Country not found: ${countryCode}`);
            return false;
        }
        countries[index].capitalNameChinese = capitalChinese;
        countries[index].capitalNameEnglish = capitalEnglish;
        if (capitalPoint) {
            countries[index].capitalPoint = capitalPoint;
        }
        await this.saveAll(countries);
        logger.info(`Updated capital for ${countryCode}: ${capitalChinese} / ${capitalEnglish}`);
        return true;
    }
    /**
     * 获取所有国家代码
     * @returns 国家代码数组
     */
    static async getAllCodes() {
        const countries = await this.loadAll();
        return countries.map((c) => c.countryCode);
    }
    /**
     * 按大洲统计国家数量
     * @returns 大洲到国家数量的映射
     */
    static async countByContinent() {
        const countries = await this.loadAll();
        const result = {};
        for (const country of countries) {
            const continent = country.continent;
            result[continent] = (result[continent] || 0) + 1;
        }
        return result;
    }
    /**
     * 清除缓存
     */
    static clearCache() {
        this.countries = null;
        logger.debug('Country cache cleared');
    }
}
export default CountryManager;
//# sourceMappingURL=country.js.map