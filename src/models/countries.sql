
SET NAMES utf8mb4;

DROP TABLE IF EXISTS `countries`;

CREATE TABLE `countries` (
  `id` INT(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `capital_name_chinese` VARCHAR(255) DEFAULT NULL COMMENT '首都中文名称',
  `capital_name_english` VARCHAR(255) DEFAULT NULL COMMENT '首都英文名称',
  `capital_point` VARCHAR(255) DEFAULT NULL COMMENT '首都中心坐标点',
  `country_center_point` VARCHAR(255) DEFAULT NULL COMMENT '国家中心坐标点',
  `country_code` VARCHAR(255) DEFAULT NULL COMMENT '国家代码',
  `country_type` VARCHAR(255) DEFAULT NULL COMMENT '国家类型',
  `name_chinese` VARCHAR(255) DEFAULT NULL COMMENT '中文名称',
  `name_chinese_short` VARCHAR(255) DEFAULT NULL COMMENT '中文简写名称',
  `name_chinese_UN` VARCHAR(255) DEFAULT NULL COMMENT '联合国使用国家中文名称',
  `name_english_abbreviation` VARCHAR(255) DEFAULT NULL COMMENT '英文缩写名称',
  `name_english_formal` VARCHAR(255) DEFAULT NULL COMMENT '英文正式名称',
  `name_english_short` VARCHAR(255) DEFAULT NULL COMMENT '英文简写名称',
  `name_english_UN` VARCHAR(255) DEFAULT NULL COMMENT '联合国使用国家英文名称',
  `political_institutions` VARCHAR(255) DEFAULT NULL COMMENT '政治制度',
  `continent` VARCHAR(255) DEFAULT NULL COMMENT '所属大陆',
  `subregion` VARCHAR(255) DEFAULT NULL COMMENT '子区域',
  `time_zone` VARCHAR(255) DEFAULT NULL COMMENT '时区',
  `geometry_type` VARCHAR(255) DEFAULT NULL COMMENT '几何形状',
  `geometry_points` TEXT DEFAULT NULL COMMENT '国界坐标点',
  `created_at` DATETIME NOT NULL COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='国家信息表';
