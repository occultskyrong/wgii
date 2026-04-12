import type { Coordinate, GeoJSONGeometry } from '../types/index.d.ts';
/**
 * Douglas-Peucker 抽稀算法模块
 * 用于简化折线路径，减少点数同时保持形状特征
 */
export declare class Sparse {
    /**
     * 计算球面距离（Haversine公式）
     * @param point1 第一个坐标点 [经度, 纬度]
     * @param point2 第二个坐标点 [经度, 纬度]
     * @returns 两点之间的球面距离（米）
     */
    static calcDistance(point1: Coordinate, point2: Coordinate): number;
    /**
     * 角度转弧度
     * @param degrees 角度值
     * @returns 弧度值
     */
    private static toRadians;
    /**
     * 计算点到弦的垂直距离（高度）
     * 使用向量叉积计算点到线段的垂直距离
     * @param point 目标点 [经度, 纬度]
     * @param start 弦的起点 [经度, 纬度]
     * @param end 弦的终点 [经度, 纬度]
     * @returns 点到弦的垂直距离
     */
    static calcHeight(point: Coordinate, start: Coordinate, end: Coordinate): number;
    /**
     * Douglas-Peucker 抽稀算法主函数
     * 递归简化折线路径，保留关键特征点
     * @param points 原始坐标点数组
     * @param tolerance 容差阈值（距离单位与坐标相同）
     * @returns 简化后的坐标点数组
     */
    static simplify(points: Coordinate[], tolerance: number): Coordinate[];
    /**
     * 对 GeoJSON 几何图形坐标进行批量抽稀
     * 支持处理 Polygon、MultiPolygon、LineString、MultiLineString 类型
     * @param geometry GeoJSON 几何图形对象
     * @param tolerance 抽稀容差阈值
     * @returns 抽稀后的几何图形对象
     */
    static simplifyGeoJSONCoordinates(geometry: GeoJSONGeometry, tolerance: number): GeoJSONGeometry;
    /**
     * 简化多边形环（保持首尾闭合）
     * @param ring 多边形环坐标数组
     * @param tolerance 抽稀容差阈值
     * @returns 简化后的环坐标数组（保持闭合）
     */
    private static simplifyPolygonRing;
}
export default Sparse;
//# sourceMappingURL=sparse.d.ts.map