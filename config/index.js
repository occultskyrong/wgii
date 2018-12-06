// 配置文件
const development = require('./development');

const ENV = process.env.NODE_ENV || 'development';

const envConfig = {
  development,
};

const config = envConfig[ENV];

Object.assign(config, require('./_secretKey')); // 合并秘钥；FIXME:替换为 './secretKey'即可

module.exports = config;
