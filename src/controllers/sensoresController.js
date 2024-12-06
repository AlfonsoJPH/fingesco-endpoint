const { getAllKeys, getAllSensorData } = require('../services/redisService');
const winston = require('winston');
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

const listarSensores = async (req, res) => {
  try {
    const keys = await getAllKeys();
    const sensores = await getAllSensorData(keys);
    res.json(sensores);
  } catch (err) {
    logger.error(`Error al obtener los sensores: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener los sensores' });
  }
};

module.exports = { listarSensores };
