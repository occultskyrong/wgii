// src/types/country.d.ts

import type { Coordinate } from './geojson.d.ts';

/**
 * 国家信息
 */
export interface CountryInfo {
  id?: number;
  /** ISO3166-1 三位字母码 */
  countryCode: string;
  /** 国家类型: Sovereign country, Member State 等 */
  countryType: string;
  /** 中文名称 */
  nameChinese: string;
  /** 中文简称 */
  nameChineseAbbreviation?: string;
  /** 联合国用中文名 */
  nameChineseUN?: string;
  /** 英文简称 */
  nameEnglishAbbreviation: string;
  /** 英文正式名称 */
  nameEnglishFormal: string;
  /** ISO3166-1 二位字母码 */
  nameEnglishShort: string;
  /** 联合国用英文名 */
  nameEnglishUN?: string;
  /** 所属大洲 */
  continent: string;
  /** 所属区域 */
  subregion: string;
  /** 首都中文名 */
  capitalNameChinese?: string;
  /** 首都英文名 */
  capitalNameEnglish?: string;
  /** 首都坐标点 */
  capitalPoint?: Coordinate;
  /** 国家中心坐标点 */
  countryCenterPoint?: Coordinate;
}

/**
 * 国家信息列表
 */
export interface CountryInfoList {
  countries: CountryInfo[];
  total: number;
}