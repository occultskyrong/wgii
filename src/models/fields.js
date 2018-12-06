const properties = {
  capital_name_chinese: { comment: '首都中文名称', source_field: '' },
  capital_name_english: { comment: '首都英文名称', source_field: '' },
  capital_point: { comment: '首都中心坐标点', source_field: '' },
  country_center_point: { comment: '国家中心坐标点', source_field: '' },
  country_code: { comment: '国家代码', source_field: 'ISO_A3' },
  country_type: { comment: '国家类型', source_field: 'TYPE' },
  name_chinese: { comment: '中文名称', source_field: '' },
  name_chinese_short: { comment: '中文简写名称', source_field: '' },
  name_english_formal: { comment: '英文正式名称', source_field: 'FORMAL_EN' },
  name_english_abbreviation: { comment: '英文缩写名称', source_field: 'NAME_SORT' },
  name_english_short: { comment: '英文简写名称', source_field: 'ISO_A2' },
  political_institutions: { comment: '政治制度', source_field: '' },
  continent: { comment: '所属大陆', source_field: 'CONTINENT' },
  subregion: { comment: '子区域', source_field: 'SUBREGION' },
  time_zone: { comment: '时区', source_field: '' },
  geometry_type: { comment: '几何形状', source_field: '' },
  geometry_points: { comment: '国界坐标点', source_field: '' },
};

const countryTypes = {
  Country: '地区',
  'Sovereign country': '主权国家',
  Dependency: '附属国',
  Indeterminate: '不确定',
  Lease: '租界',
  Disputed: '有争议',
};

module.exports = {
  countryTypes,
  properties,
};
