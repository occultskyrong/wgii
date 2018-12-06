/**
 * 从百度云获取翻译结果
 * @see https://fanyi-api.baidu.com/api/trans/product/apidoc
 */

const request = require('request-promise');

const baseUri = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

const { baidu: { api: { fanyi: { appId, secretKey } } } } = require('../../../config');

const { md5 } = require('../crypto');


/**
 * 中文 » 英语 翻译
 * @param {*} q 需要翻译的词
 */
async function translateEn2Zh(q) {
  if (!q) { throw new Error('未获取到原文'); }
  const salt = new Date().getTime();
  const sign = md5(`${appId}${q}${salt}${secretKey}`);
  const form = {
    q,
    from: 'en',
    to: 'zh',
    appid: appId,
    salt,
    sign,
  };
  const result = await request.post({
    form,
    method: 'POST',
    uri: baseUri,
    json: true, // 返回值使用json解析
  });
  const { trans_result: results } = result;
  if (results && results instanceof Array && results.length > 0) {
    console.debug(results);
    return results[0].dst;
  }
  console.error(new Error('翻译失败'), result, form);
  return '';
}

module.exports = {
  translateEn2Zh,
};
