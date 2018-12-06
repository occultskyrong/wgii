/**
 * 爬取国家与首都对应关系
 * @from https://en.wikipedia.org/wiki/List_of_national_capitals
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const baseUri = 'https://en.wikipedia.org/wiki/List_of_national_capitals';

async function getCapitalsList() {
  const countries = {};
  const html = await request(baseUri);
  const $ = cheerio.load(html);
  const eles = $('#mw-content-text table > tbody > tr');
  eles.each((index, element) => {
    const ele = $(element).find('td');
    const { length } = ele;
    if (length === 3) {
      const capital = ele.get(0).children[0].children[0].data;
      const country = ele.find('b > a').get(0).children[0].data;
      countries[country] = capital;
      //   console.info(country, capital);
    }
  });
  return countries;
}

async function resort(countries) {
  const result = {};
  const keys = Object.keys(countries);
  keys.sort().map((country) => {
    result[country] = countries[country];
    return false;
  });
  return result;
}

async function save(data) {
  await fs.writeFileSync(path.join(__dirname, '../../resource/raw/_countries_capitals.json'), JSON.stringify(data));
}

async function run() {
  const result = await getCapitalsList();
  const data = resort(result);
  await save(data);
}


run()
  .then(() => console.info('--- √ 爬取完成 ---'))
  .catch(console.error)
  .then(() => process.exit(1));
