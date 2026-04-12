// src/storage/json-store.ts
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * JSON文件存储模块
 * 提供JSON文件的读写、删除、列表等操作
 */
export class JsonStore {
    /**
     * 确保目录存在，不存在则创建
     * @param dirPath 目录路径
     */
    static async ensureDir(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            logger.debug(`目录已确保存在: ${dirPath}`);
        }
        catch (error) {
            logger.error(`创建目录失败: ${dirPath}`, error);
            throw error;
        }
    }
    /**
     * 读取JSON文件并解析为指定类型
     * @param filePath JSON文件路径
     * @returns 解析后的对象，文件不存在时返回null
     */
    static async read(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            logger.debug(`JSON文件读取成功: ${filePath}`);
            return data;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                logger.debug(`JSON文件不存在: ${filePath}`);
                return null;
            }
            logger.error(`读取JSON文件失败: ${filePath}`, error);
            throw error;
        }
    }
    /**
     * 将对象写入JSON文件
     * @param filePath JSON文件路径
     * @param data 要写入的对象
     * @param pretty 是否格式化输出，默认true
     */
    static async write(filePath, data, pretty = true) {
        try {
            // 确保目录存在
            const dirPath = path.dirname(filePath);
            await this.ensureDir(dirPath);
            const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
            await fs.writeFile(filePath, content, 'utf-8');
            logger.debug(`JSON文件写入成功: ${filePath}`);
        }
        catch (error) {
            logger.error(`写入JSON文件失败: ${filePath}`, error);
            throw error;
        }
    }
    /**
     * 删除JSON文件
     * @param filePath JSON文件路径
     * @returns 是否成功删除（文件不存在时返回false）
     */
    static async delete(filePath) {
        try {
            await fs.unlink(filePath);
            logger.debug(`JSON文件删除成功: ${filePath}`);
            return true;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                logger.debug(`JSON文件不存在，无需删除: ${filePath}`);
                return false;
            }
            logger.error(`删除JSON文件失败: ${filePath}`, error);
            throw error;
        }
    }
    /**
     * 检查文件是否存在
     * @param filePath 文件路径
     */
    static async exists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * 列出目录中所有JSON文件
     * @param dirPath 目录路径
     * @returns JSON文件名数组（不含路径）
     */
    static async listJsonFiles(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            const jsonFiles = files.filter((file) => file.endsWith('.json'));
            logger.debug(`目录 ${dirPath} 中找到 ${jsonFiles.length} 个JSON文件`);
            return jsonFiles;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                logger.debug(`目录不存在: ${dirPath}`);
                return [];
            }
            logger.error(`列出JSON文件失败: ${dirPath}`, error);
            throw error;
        }
    }
    /**
     * 获取dist目录下的路径
     * @param relativePath 相对于dist目录的路径
     * @returns 完整路径
     */
    static getDistPath(relativePath = '') {
        const distDir = path.join(__dirname, '../../dist');
        return relativePath ? path.join(distDir, relativePath) : distDir;
    }
    /**
     * 获取resource目录下的路径
     * @param relativePath 相对于resource目录的路径
     * @returns 完整路径
     */
    static getResourcePath(relativePath = '') {
        const resourceDir = path.join(__dirname, '../../resource');
        return relativePath ? path.join(resourceDir, relativePath) : resourceDir;
    }
}
export default JsonStore;
//# sourceMappingURL=json-store.js.map