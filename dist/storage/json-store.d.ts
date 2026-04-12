/**
 * JSON文件存储模块
 * 提供JSON文件的读写、删除、列表等操作
 */
export declare class JsonStore {
    /**
     * 确保目录存在，不存在则创建
     * @param dirPath 目录路径
     */
    static ensureDir(dirPath: string): Promise<void>;
    /**
     * 读取JSON文件并解析为指定类型
     * @param filePath JSON文件路径
     * @returns 解析后的对象，文件不存在时返回null
     */
    static read<T>(filePath: string): Promise<T | null>;
    /**
     * 将对象写入JSON文件
     * @param filePath JSON文件路径
     * @param data 要写入的对象
     * @param pretty 是否格式化输出，默认true
     */
    static write(filePath: string, data: unknown, pretty?: boolean): Promise<void>;
    /**
     * 删除JSON文件
     * @param filePath JSON文件路径
     * @returns 是否成功删除（文件不存在时返回false）
     */
    static delete(filePath: string): Promise<boolean>;
    /**
     * 检查文件是否存在
     * @param filePath 文件路径
     */
    static exists(filePath: string): Promise<boolean>;
    /**
     * 列出目录中所有JSON文件
     * @param dirPath 目录路径
     * @returns JSON文件名数组（不含路径）
     */
    static listJsonFiles(dirPath: string): Promise<string[]>;
    /**
     * 获取dist目录下的路径
     * @param relativePath 相对于dist目录的路径
     * @returns 完整路径
     */
    static getDistPath(relativePath?: string): string;
    /**
     * 获取resource目录下的路径
     * @param relativePath 相对于resource目录的路径
     * @returns 完整路径
     */
    static getResourcePath(relativePath?: string): string;
}
export default JsonStore;
//# sourceMappingURL=json-store.d.ts.map