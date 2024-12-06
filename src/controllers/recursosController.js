const { getAllKeys, getSensorData } = require('../services/redisService');
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

const listarRecursos = async (req, res) => {
  try {
    const keys = await getAllKeys();
    res.json({ topics: keys });
  } catch (err) {
    logger.error(`Error al obtener los recursos: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener los recursos' });
  }
};

const obtenerDatosRecurso = async (req, res) => {
  const { sensorId, campo } = req.body;

  if (!sensorId) {
    return res.status(400).json({ message: 'El sensorId es obligatorio' });
  }

  try {
    const data = await getSensorData(sensorId, campo);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { listarRecursos, obtenerDatosRecurso };
