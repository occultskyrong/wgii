// src/core/sparse.ts
/**
 * Douglas-Peucker 抽稀算法模块
 * 用于简化折线路径，减少点数同时保持形状特征
 */
export class Sparse {
    /**
     * 计算球面距离（Haversine公式）
     * @param point1 第一个坐标点 [经度, 纬度]
     * @param point2 第二个坐标点 [经度, 纬度]
     * @returns 两点之间的球面距离（米）
     */
    static calcDistance(point1, point2) {
        const [lon1, lat1] = point1;
        const [lon2, lat2] = point2;
        const R = 6371000; // 地球半径（米）
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * 角度转弧度
     * @param degrees 角度值
     * @returns 弧度值
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * 计算点到弦的垂直距离（高度）
     * 使用向量叉积计算点到线段的垂直距离
     * @param point 目标点 [经度, 纬度]
     * @param start 弦的起点 [经度, 纬度]
     * @param end 弦的终点 [经度, 纬度]
     * @returns 点到弦的垂直距离
     */
    static calcHeight(point, start, end) {
        const [px, py] = point;
        const [x1, y1] = start;
        const [x2, y2] = end;
        // 如果起点和终点重合，直接返回点到该点的距离
        if (x1 === x2 && y1 === y2) {
            return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        }
        // 使用向量叉积计算点到线段的垂直距离
        // |AB × AP| / |AB|
        const dx = x2 - x1;
        const dy = y2 - y1;
        const crossProduct = Math.abs(dx * (py - y1) - dy * (px - x1));
        const lineLength = Math.sqrt(dx * dx + dy * dy);
        return crossProduct / lineLength;
    }
    /**
     * Douglas-Peucker 抽稀算法主函数
     * 递归简化折线路径，保留关键特征点
     * @param points 原始坐标点数组
     * @param tolerance 容差阈值（距离单位与坐标相同）
     * @returns 简化后的坐标点数组
     */
    static simplify(points, tolerance) {
        if (points.length <= 2) {
            return points.slice();
        }
        // 找到距离首尾连线最远的点
        let maxDistance = 0;
        let maxIndex = 0;
        const start = points[0];
        const end = points[points.length - 1];
        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.calcHeight(points[i], start, end);
            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = i;
            }
        }
        // 如果最大距离大于容差，递归简化
        if (maxDistance > tolerance) {
            // 递归处理左右两部分
            const left = this.simplify(points.slice(0, maxIndex + 1), tolerance);
            const right = this.simplify(points.slice(maxIndex), tolerance);
            // 合并结果（去掉重复的中间点）
            return [...left.slice(0, -1), ...right];
        }
        // 所有中间点都在容差范围内，只保留首尾
        return [start, end];
    }
    /**
     * 对 GeoJSON 几何图形坐标进行批量抽稀
     * 支持处理 Polygon、MultiPolygon、LineString、MultiLineString 类型
     * @param geometry GeoJSON 几何图形对象
     * @param tolerance 抽稀容差阈值
     * @returns 抽稀后的几何图形对象
     */
    static simplifyGeoJSONCoordinates(geometry, tolerance) {
        const { type, coordinates } = geometry;
        switch (type) {
            case 'Point':
                // 点类型无需简化
                return { type, coordinates };
            case 'LineString':
                // 线类型，直接简化
                return {
                    type,
                    coordinates: this.simplify(coordinates, tolerance),
                };
            case 'Polygon':
                // 多边形，简化每个环（外环和内环/孔洞）
                return {
                    type,
                    coordinates: coordinates.map((ring) => this.simplifyPolygonRing(ring, tolerance)),
                };
            case 'MultiLineString':
                // 多线，简化每条线
                return {
                    type,
                    coordinates: coordinates.map((line) => this.simplify(line, tolerance)),
                };
            case 'MultiPolygon':
                // 多多边形，简化每个多边形的每个环
                return {
                    type,
                    coordinates: coordinates.map((polygon) => polygon.map((ring) => this.simplifyPolygonRing(ring, tolerance))),
                };
            default:
                return geometry;
        }
    }
    /**
     * 简化多边形环（保持首尾闭合）
     * @param ring 多边形环坐标数组
     * @param tolerance 抽稀容差阈值
     * @returns 简化后的环坐标数组（保持闭合）
     */
    static simplifyPolygonRing(ring, tolerance) {
        if (ring.length <= 3) {
            return ring.slice();
        }
        // 检查是否闭合（首尾相同）
        const isClosed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
        let simplified;
        if (isClosed) {
            // 对于闭合环，暂时移除最后一个点，简化后再添加
            const openRing = ring.slice(0, -1);
            simplified = this.simplify(openRing, tolerance);
            // 确保首尾闭合
            simplified.push([simplified[0][0], simplified[0][1]]);
        }
        else {
            simplified = this.simplify(ring, tolerance);
        }
        // 确保多边形至少有4个点（3个不同的点 + 闭合点）
        if (simplified.length < 4) {
            return ring.slice();
        }
        return simplified;
    }
}
export default Sparse;
//# sourceMappingURL=sparse.js.map