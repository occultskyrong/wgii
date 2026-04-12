// src/cli.ts
import { Command } from 'commander';
import { logger, setLogLevel } from './utils/logger.js';
import { GeoJSONProcessor } from './core/geojson.js';
import { CountryManager } from './core/country.js';
import { CoordinateTransformer } from './core/transform.js';
import { JsonStore } from './storage/json-store.js';
/**
 * CLI入口 - WGII命令行工具
 */
const program = new Command();
program
    .name('wgii')
    .version('1.0.0')
    .description('World Geographic Information Integration - 世界地理信息集成工具')
    .option('-v, --verbose', '启用详细日志输出', () => setLogLevel('debug'))
    .option('-q, --quiet', '静默模式，仅输出错误', () => setLogLevel('error'));
/**
 * sync命令 - 同步数据源
 */
program
    .command('sync')
    .description('从数据源同步地理数据')
    .option('--amap', '从高德地图同步数据')
    .option('--wiki', '从维基百科同步数据')
    .action(async (options) => {
    logger.info('开始同步数据...');
    if (options.amap) {
        logger.info('从高德地图同步数据');
        // TODO: 实现高德地图数据同步
        logger.warn('高德地图同步功能待实现');
    }
    if (options.wiki) {
        logger.info('从维基百科同步数据');
        // TODO: 实现维基百科数据同步
        logger.warn('维基百科同步功能待实现');
    }
    if (!options.amap && !options.wiki) {
        logger.warn('未指定数据源，请使用 --amap 或 --wiki 选项');
        program.help();
    }
    logger.info('同步完成');
});
/**
 * sparse命令 - 生成抽稀版本
 */
program
    .command('sparse')
    .description('生成GeoJSON抽稀版本')
    .option('-d, --distance <meters>', '抽稀距离（米），支持多个值用逗号分隔', '100,500,1000')
    .option('-c, --country <code>', '指定国家代码（ISO3166-1三位字母码），不指定则处理所有国家')
    .action(async (options) => {
    logger.info('开始生成抽稀版本...');
    const distances = options.distance.split(',').map((d) => parseInt(d.trim(), 10));
    logger.debug(`抽稀距离: ${distances.join(', ')}米`);
    if (options.country) {
        const countryCode = options.country.toUpperCase();
        logger.info(`处理国家: ${countryCode}`);
        const count = await GeoJSONProcessor.generateSparseVersions(countryCode, distances);
        logger.info(`生成 ${count} 个抽稀版本`);
    }
    else {
        logger.info('处理所有国家...');
        const result = await GeoJSONProcessor.processAllCountries(distances);
        logger.info(`处理完成: 成功 ${result.success}, 失败 ${result.failed}, 总计 ${result.total}`);
    }
});
/**
 * info命令 - 查询国家信息
 */
program
    .command('info')
    .description('查询国家地理信息')
    .option('-c, --code <code>', '国家代码（ISO3166-1三位字母码）')
    .action(async (options) => {
    if (!options.code) {
        logger.warn('请指定国家代码，使用 --code <code> 选项');
        // 列出所有可用国家
        const codes = await CountryManager.getAllCodes();
        logger.info(`可用国家代码: ${codes.join(', ')}`);
        return;
    }
    const countryCode = options.code.toUpperCase();
    logger.info(`查询国家: ${countryCode}`);
    const country = await CountryManager.findByCode(countryCode);
    if (country) {
        console.log(JSON.stringify(country, null, 2));
    }
    else {
        logger.warn(`未找到国家: ${countryCode}`);
    }
});
/**
 * transform命令 - 坐标系转换
 */
program
    .command('transform')
    .description('转换GeoJSON坐标系')
    .requiredOption('-f, --from <system>', '源坐标系 (WGS84/GCJ02/BD09)')
    .requiredOption('-t, --to <system>', '目标坐标系 (WGS84/GCJ02/BD09)')
    .requiredOption('-i, --input <file>', '输入GeoJSON文件路径')
    .option('-o, --output <file>', '输出文件路径（默认覆盖输入文件）')
    .action(async (options) => {
    const from = options.from.toUpperCase();
    const to = options.to.toUpperCase();
    // 验证坐标系
    const validSystems = ['WGS84', 'GCJ02', 'BD09'];
    if (!validSystems.includes(from)) {
        logger.error(`无效的源坐标系: ${from}`);
        process.exit(1);
    }
    if (!validSystems.includes(to)) {
        logger.error(`无效的目标坐标系: ${to}`);
        process.exit(1);
    }
    logger.info(`坐标系转换: ${from} -> ${to}`);
    logger.debug(`输入文件: ${options.input}`);
    // 读取GeoJSON文件
    const geojson = await JsonStore.read(options.input);
    if (!geojson) {
        logger.error(`无法读取文件: ${options.input}`);
        process.exit(1);
    }
    // 执行转换
    const transformed = CoordinateTransformer.transformGeoJSON(geojson, from, to);
    // 输出文件
    const outputPath = options.output || options.input;
    await JsonStore.write(outputPath, transformed);
    logger.info(`转换完成，输出到: ${outputPath}`);
});
/**
 * list命令 - 列出可用数据
 */
program
    .command('list')
    .description('列出可用的地理数据')
    .action(async () => {
    logger.info('列出可用数据...');
    // 列出国家
    const countries = await CountryManager.loadAll();
    console.log('\n=== 国家列表 ===');
    console.log(`总计: ${countries.length} 个国家`);
    console.log('\n按大洲统计:');
    const continentCounts = await CountryManager.countByContinent();
    for (const [continent, count] of Object.entries(continentCounts)) {
        console.log(`  ${continent}: ${count} 个国家`);
    }
    // 列出可用的GeoJSON
    console.log('\n=== GeoJSON数据 ===');
    const geojsonCountries = await GeoJSONProcessor.getAvailableCountryCodes('WGS84');
    console.log(`WGS84坐标系: ${geojsonCountries.length} 个国家的GeoJSON`);
    if (geojsonCountries.length > 0) {
        console.log(`国家代码: ${geojsonCountries.slice(0, 10).join(', ')}${geojsonCountries.length > 10 ? '...' : ''}`);
    }
});
/**
 * 处理未知命令
 */
program.on('command:*', (operands) => {
    logger.error(`未知命令: ${operands[0]}`);
    logger.info('可用命令: sync, sparse, info, transform, list');
    program.help();
});
// 解析命令行参数
program.parse();
//# sourceMappingURL=cli.js.map