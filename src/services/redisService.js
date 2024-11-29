const redis = require('redis');
const config = require('../config');

const redisClient = redis.createClient({
  url: `redis://${config.redisHost}:${config.redisPort}`,
});

const getAllKeys = async () => await redisClient.keys('*');

const getSensorData = async (sensorId, campo) => {
  const sensorExists = await redisClient.exists(sensorId);
  if (!sensorExists) {
    throw { status: 404, message: `El sensor con ID ${sensorId} no fue encontrado` };
  }

  if (campo) {
    const data = await redisClient.hGet(sensorId, campo);
    if (data === null) {
      throw { status: 404, message: `El campo ${campo} no fue encontrado para el sensor ${sensorId}` };
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

module.exports = { redisClient, getAllKeys, getSensorData, getAllSensorData };
