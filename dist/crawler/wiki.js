// src/crawler/wiki.ts
import * as cheerio from 'cheerio';
import { fetchText } from '../utils/http.js';
import JsonStore from '../storage/json-store.js';
import { logger } from '../utils/logger.js';
/**
 * 维基百科爬虫
 * 用于获取国家与首都对应关系
 */
export class WikiCrawler {
    /**
     * 维基百科国家首都列表页面URL
     */
    static WIKI_CAPITALS_URL = 'https://en.wikipedia.org/wiki/List_of_national_capitals';
    /**
     * 获取首都数据
     * 从维基百科爬取国家与首都对应关系
     * @returns 首都数据映射
     */
    async getCapitals() {
        logger.info('开始获取首都数据...');
        logger.debug(`请求URL: ${WikiCrawler.WIKI_CAPITALS_URL}`);
        try {
            const html = await fetchText(WikiCrawler.WIKI_CAPITALS_URL);
            const capitals = this.parseCapitalsTable(html);
            logger.info(`成功获取 ${Object.keys(capitals).length} 个国家的首都数据`);
            return capitals;
        }
        catch (error) {
            logger.error('获取首都数据失败', error);
            throw error;
        }
    }
    /**
     * 解析首都表格HTML
     * @param html HTML内容
     * @returns 首都数据映射
     */
    parseCapitalsTable(html) {
        const capitals = {};
        const $ = cheerio.load(html);
        // 解析维基百科表格中的首都数据
        const rows = $('#mw-content-text table > tbody > tr');
        logger.debug(`找到 ${rows.length} 行数据`);
        rows.each((index, element) => {
            const cells = $(element).find('td');
            const { length } = cells;
            // 表格结构: [首都名称, 国家名称, 备注]
            // 需要恰好3列的行才是有效数据
            if (length === 3) {
                try {
                    const capitalCell = cells.eq(0);
                    const countryCell = cells.eq(1);
                    // 获取首都名称（取第一个链接的文本）
                    const capitalLink = capitalCell.find('a').first();
                    const capital = capitalLink.text().trim() || capitalCell.text().trim();
                    // 获取国家名称（优先取加粗链接）
                    const boldLink = countryCell.find('b > a').first();
                    const country = boldLink.text().trim() || countryCell.find('a').first().text().trim();
                    if (capital && country) {
                        capitals[country] = capital;
                    }
                }
                catch (e) {
                    // 解析单行失败时跳过，不影响整体数据
                    logger.debug(`第 ${index} 行解析失败，跳过`);
                }
            }
        });
        return capitals;
    }
    /**
     * 保存首都数据到JSON文件
     * @param capitals 首都数据映射
     */
    async saveCapitals(capitals) {
        const filePath = JsonStore.getResourcePath('raw/_countries_capitals.json');
        logger.debug(`保存首都数据到: ${filePath}`);
        // 按国家名称排序
        const sortedCapitals = this.sortCapitals(capitals);
        await JsonStore.write(filePath, sortedCapitals);
        logger.info(`首都数据已保存，共 ${Object.keys(sortedCapitals).length} 条记录`);
    }
    /**
     * 对首都数据按国家名称排序
     * @param capitals 首都数据映射
     * @returns 排序后的首都数据
     */
    sortCapitals(capitals) {
        const sorted = {};
        const keys = Object.keys(capitals).sort();
        for (const key of keys) {
            sorted[key] = capitals[key];
        }
        return sorted;
    }
    /**
     * 同步首都数据
     * 获取数据并保存到文件
     */
    async sync() {
        logger.info('开始同步首都数据...');
        try {
            const capitals = await this.getCapitals();
            await this.saveCapitals(capitals);
            logger.info('首都数据同步完成');
        }
        catch (error) {
            logger.error('同步首都数据失败', error);
            throw error;
        }
    }
}
export default WikiCrawler;
//# sourceMappingURL=wiki.js.map