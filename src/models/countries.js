/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('countries', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    capital_name_chinese: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    capital_name_english: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    capital_point: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_center_point: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_chinese: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_chinese_short: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_chinese_UN: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_english_abbreviation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_english_formal: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_english_short: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_english_UN: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    political_institutions: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    continent: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    subregion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    time_zone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    geometry_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    geometry_points: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'countries'
  });
};
