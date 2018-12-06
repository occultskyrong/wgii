/**
 * Created on 2018-05-17.
 * @description
 * @author occultskyrong
 * @copyright© 2018-2020
 * @see {@link https://github.com/occultskyrong/blog2}
 * @version 0.0.1
 * @todo
 */

// 引入工具集
const crypto = require('./index');

const PASSWORD = '123456';

console.info(`密码明文：${PASSWORD}`);
crypto.getSalt(32)
  .then((salt32) => {
    console.info(`32位盐秘钥：${salt32}`);
    return crypto.setPassword(PASSWORD, salt32);
  })
  .then(password => console.info(`密码密文：${password}`))
  .catch(console.error);
