const express = require('express');
const redis = require('redis');
const config = require('./config');
const timestampFormat = 'MMM-DD-YYYY HH:mm:ss';
const winston = require('winston')
const { combine, timestamp, json, printf } = winston.format;

const logger = winston.createLogger({
  format: combine(
    timestamp({ format: timestampFormat }),
    json(),
    printf(({ timestamp, level, message, ...data }) => {
      const response = {
        level,
        message,
        data, // metadata
      };

      return JSON.stringify(response);
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/endpoint-logs.log',
    }),
  ],
});

const app = express();
app.use(express.json());

// Conexión a Redis usando variables de entorno
const redisClient = redis.createClient({
  url: `redis://${config.redisHost}:${config.redisPort}`
});
redisClient.connect().catch(logger.error);

// Middleware para verificar API Key
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== config.API_KEY) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
  logger.info('Comprobado el estado del sistema.');
});

// Aplicar middleware a todas las rutas
app.use(apiKeyMiddleware);

// 1. Pedir una lista con los recursos disponibles (todos los topics y subtopics)
app.get('/recursos', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    res.json({ topics: keys });
    logger.info('Solicitud de todos los requisitos del sistema');
  } catch (err) {
    logger.error('Error al obtener los recursos', err);
    res.status(500).json({ message: 'Error al obtener los recursos' });
  }
});

// 2. Solicitar la información actual de un campo de un sensor
// 3. Solicitar la información de todos los campos de un sensor
app.post('/recursos', async (req, res) => {
  const { sensorId, campo } = req.body;

  // Verificar que `sensorId` esté presente en la solicitud
  if (!sensorId) {
    const err = `El sensorId es no está presente en la solicitud`;
    logger.error(err);
    return res.status(400).json({ message: 'El sensorId es obligatorio' });
  }

  try {
    // Verificar si el sensor existe
    const sensorExists = await redisClient.exists(sensorId);
    if (!sensorExists) {
        const err = `El sensor con ID ${sensorId} no fue encontrado`;
        logger.error(err);
        return res.status(404).json({ message: err });
    }

    // Si se especifica un campo, devolver solo ese campo
    if (campo) {
      const data = await redisClient.hGet(sensorId, campo);
      if (data === null) {
        const err = `El campo ${campo} no fue encontrado para el sensor ${sensorId}`;
        logger.error(err);
        return res.status(404).json({ message: err });
      }
      logger.info(`Devolviendo el campo ${campo} del sensor ${sensorId}`);
      return res.json({ [campo]: data });
    }

    // Si no se especifica un campo, devolver todos los campos del sensor
    const data = await redisClient.hGetAll(sensorId);
    logger.info(`Devolviendo todos los campos del sensor ${sensorId}`);
    res.json(data);

  } catch (err) {
    logger.error('Error al obtener la información del recurso', err);
    res.status(500).json({ message: 'Error al obtener la información del recurso' });
  }
});


// 4. Solicitar la información de todos los sensores en un endpoint
app.get('/sensores', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    const sensores = {};

    for (const key of keys) {
      const data = await redisClient.hGetAll(key);
      sensores[key] = data;
    }

    res.json(sensores);
    logger.info('Devolviendo la información de todos los sensores de un endpoint');
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Error al obtener la información de los sensores' });
  }
});


// Exportar la aplicación y el cliente Redis
const server = app.listen(config.serverPort, () => {
  logger.info(`Microservicio Redis corriendo en el puerto ${config.serverPort}`);
});


// Añadir esta función para cerrar el servidor
const closeServer = () => {
  server.close();
};

module.exports = { app, redisClient, closeServer };
