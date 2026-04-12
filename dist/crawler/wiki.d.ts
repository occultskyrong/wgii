/**
 * 首都数据类型
 * 国家名称 -> 首都名称
 */
export type CapitalsData = Record<string, string>;
/**
 * 维基百科爬虫
 * 用于获取国家与首都对应关系
 */
export declare class WikiCrawler {
    /**
     * 维基百科国家首都列表页面URL
     */
    private static readonly WIKI_CAPITALS_URL;
    /**
     * 获取首都数据
     * 从维基百科爬取国家与首都对应关系
     * @returns 首都数据映射
     */
    getCapitals(): Promise<CapitalsData>;
    /**
     * 解析首都表格HTML
     * @param html HTML内容
     * @returns 首都数据映射
     */
    private parseCapitalsTable;
    /**
     * 保存首都数据到JSON文件
     * @param capitals 首都数据映射
     */
    saveCapitals(capitals: CapitalsData): Promise<void>;
    /**
     * 对首都数据按国家名称排序
     * @param capitals 首都数据映射
     * @returns 排序后的首都数据
     */
    private sortCapitals;
    /**
     * 同步首都数据
     * 获取数据并保存到文件
     */
    sync(): Promise<void>;
}
export default WikiCrawler;
//# sourceMappingURL=wiki.d.ts.map