require('dotenv').config();

const config = {
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379,
  serverPort: process.env.SERVER_PORT || 3001,
  API_KEY: process.env.API_KEY || 'pcldETTDtJ4CQVz9FqlJYHgIvdYP1iXU'
};

module.exports = config;
