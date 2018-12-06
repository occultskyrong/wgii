/**
 * Created on 2018-05-17.
 * @description 加盐加密工具方法
 * @author occultskyrong
 * @copyright© 2018-2020
 * @see {@link https://github.com/occultskyrong/blog2}
 * @version 0.0.1
 * @todo
 */

/**
 * 引入加密方法集
 * crypto@9.0.0
 * @see {@link http://blog.fens.me/nodejs-crypto/}
 */
const crypto = require('crypto');

/**
 * 生成随机盐
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback}
 * @param {int} size 盐长度
 * @return {Promise} promise 随机盐
 */
const getSalt = (size = 32) => new Promise((resolve, reject) => {
  crypto.randomBytes(size, (err, buf) => (err ? reject(err) : resolve(buf.toString('hex'))));
});

/**
 * 生成随机密码
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback}
 * @param {string} text 明文
 * @param {string} salt 盐
 * @return {Promise} promise 密文
 */
const setPassword = (text, salt) => new Promise((resolve, reject) => {
  crypto.pbkdf2(text, salt, 4096, 64, 'sha512', (err, derivedKey) => {
    if (err) {
      reject(err);
    } else {
      const pwd = derivedKey.toString('hex');
      resolve(pwd);
    }
  });
});

/**
 * 生成md5值
 * @param str
 */
const md5 = str => crypto.createHash('md5').update(str).digest('hex');

/**
 * 生成随机盐和随机密码
 * @param {string} text 明文
 * @param {int} size 盐长度
 * @return {Promise} promise 随机盐和密文
 */
const getPassword = (text, size = 32) => new Promise((resolve, reject) => {
  let salt = '';
  getSalt(size)
    .then((_salt) => {
      salt = _salt;
      return setPassword(text, _salt);
    })
    .then(pwd => resolve({ pwd, salt }))
    .catch(reject);
});

module.exports = {
  getSalt, // 生成随机盐
  getPassword, // 生成随机盐和密文
  md5, // 生成md5值
  setPassword, // 生成随机密码
};
