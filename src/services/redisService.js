const { createClient } = require('redis');
const config = require('../config');
const winston = require('winston');

const redisClient = createClient({
  url: `redis://${config.redisHost}:${config.redisPort}`,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err.message}`);
  logger.error(err);
});

const connectRedis = async () => {
  await redisClient.connect();
};

const getAllKeys = async () => await redisClient.keys('*');

const getSensorData = async (sensorId, campo) => {
  const sensorExists = await redisClient.exists(sensorId);
  if (!sensorExists) {
    const errorMessage = `El sensor con ID ${sensorId} no fue encontrado`;
    logger.error(errorMessage);
    throw { status: 404, message: errorMessage };
  }

  if (campo) {
    const data = await redisClient.hGet(sensorId, campo);
    if (data === null) {
      const errorMessage = `El campo ${campo} no fue encontrado para el sensor ${sensorId}`;
      logger.error(errorMessage);
      throw { status: 404, message: errorMessage };
    }
    return { [campo]: data };
  }

  return await redisClient.hGetAll(sensorId);
};

const getAllSensorData = async (keys) => {
  const sensores = {};
  for (const key of keys) {
    sensores[key] = await redisClient.hGetAll(key);
  }
  return sensores;
};

module.exports = { redisClient, connectRedis, getAllKeys, getSensorData, getAllSensorData };