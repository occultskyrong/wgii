module.exports = {
  mysql: {
    database: 'test',
    dialect: 'mysql',
    host: 'localhost',
    logging: true,
    password: 'root',
    port: '3306',
    username: 'root',
  },
  redis: {
    db: 3,
    host: 'localhost',
    key: 'blog2',
    port: 6379,
    secret: 'blog2',
    ttl: 86000,
  },
};
