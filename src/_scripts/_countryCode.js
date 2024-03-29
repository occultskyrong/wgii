/* eslint-disable import/no-dynamic-require,camelcase */
/**
 * country code 转换
 */

const fs = require('fs');
const path = require('path');

const countriesFilepath = path.join(__dirname, '../../dist/countries.info.json');

const countries = require(countriesFilepath);

const codes = require('../../resource/original/ISO3166.json');

const codesList = codes.reduce((obj, code) => {
  obj[code.code2] = code;
  return obj;
}, {});

const results = countries.map((country) => {
  const { country_code2 } = country;
  country.country_code2 = country_code2;
  country.phone_code = country_code2 in codesList ? codesList[country_code2].phoneCode : '';
  delete country.country_name_english_short;
  return country;
});

fs.writeFileSync(path.join(__dirname, '../../dist/countries.info.1.json'), JSON.stringify(results).replace(/","/g, '",\n"').replace(/},{/g, '},\n{'));
