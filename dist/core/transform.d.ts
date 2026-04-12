import type { Coordinate, CoordinateSystem, GeoJSONFeatureCollection } from '../types/index.d.ts';
/**
 * 坐标系转换类
 *
 * 支持WGS84、GCJ02(火星坐标)、BD09(百度坐标)三种坐标系之间的转换
 *
 * - WGS84: 国际标准坐标系，GPS设备使用的坐标系
 * - GCJ02: 中国国家测绘局制定的加密坐标系，高德地图、腾讯地图使用
 * - BD09: 百度地图使用的坐标系，在GCJ02基础上二次加密
 */
export declare class CoordinateTransformer {
    /**
     * WGS84 转 GCJ02（火星坐标）
     *
     * @param lng 经度
     * @param lat 纬度
     * @returns GCJ02坐标 [经度, 纬度]
     */
    static wgs84ToGcj02(lng: number, lat: number): Coordinate;
    /**
     * GCJ02 转 WGS84
     *
     * @param lng 经度
     * @param lat 纬度
     * @returns WGS84坐标 [经度, 纬度]
     */
    static gcj02ToWgs84(lng: number, lat: number): Coordinate;
    /**
     * GCJ02 转 BD09（百度坐标）
     *
     * @param lng 经度
     * @param lat 纬度
     * @returns BD09坐标 [经度, 纬度]
     */
    static gcj02ToBd09(lng: number, lat: number): Coordinate;
    /**
     * BD09 转 GCJ02
     *
     * @param lng 经度
     * @param lat 纬度
     * @returns GCJ02坐标 [经度, 纬度]
     */
    static bd09ToGcj02(lng: number, lat: number): Coordinate;
    /**
     * BD09 转 WGS84
     *
     * @param lng 经度
     * @param lat 纬度
     * @returns WGS84坐标 [经度, 纬度]
     */
    static bd09ToWgs84(lng: number, lat: number): Coordinate;
    /**
     * WGS84 转 BD09
     *
     * @param lng 经度
     * @param lat 纬度
     * @returns BD09坐标 [经度, 纬度]
     */
    static wgs84ToBd09(lng: number, lat: number): Coordinate;
    /**
     * 根据坐标系名称执行转换
     *
     * @param lng 经度
     * @param lat 纬度
     * @param from 源坐标系
     * @param to 目标坐标系
     * @returns 转换后的坐标 [经度, 纬度]
     */
    static convert(lng: number, lat: number, from: CoordinateSystem, to: CoordinateSystem): Coordinate;
    /**
     * 批量转换GeoJSON坐标
     *
     * @param geojson GeoJSON FeatureCollection
     * @param from 源坐标系
     * @param to 目标坐标系
     * @returns 转换后的GeoJSON FeatureCollection
     */
    static transformGeoJSON(geojson: GeoJSONFeatureCollection, from: CoordinateSystem, to: CoordinateSystem): GeoJSONFeatureCollection;
}
//# sourceMappingURL=transform.d.ts.map