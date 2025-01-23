const express = require('express');
const cors = require('cors');
const { redisClient, connectRedis } = require('./services/redisService');
const apiKeyMiddleware = require('./middlewares/apiKey');
const healthRoutes = require('./routes/healthRoutes');
const recursosRoutes = require('./routes/recursosRoutes');
const sensoresRoutes = require('./routes/sensoresRoutes');
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

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Conexión a Redis
const initializeRedisData = async () => {
  try {
    await connectRedis();
    const sensorsData = {
      '03110410': {
        temperature: 22,
        humidity: 45,
        light: 300,
      },
      '03110411': {
        temperature: 20,
        humidity: 50,
        light: 280,
      },
    };

    for (const [id, data] of Object.entries(sensorsData)) {
      await redisClient.hSet(id, data);
    }
    logger.info('Datos de sensores inicializados en Redis');
  } catch (err) {
    logger.error(`Error al conectar a Redis o inicializar datos: ${err.message}`);
  }
};

initializeRedisData();

// Rutas
app.use('/health', healthRoutes);
app.use(apiKeyMiddleware); // Aplicar a todas las rutas siguientes
app.use('/recursos', recursosRoutes);
app.use('/sensores', sensoresRoutes);

module.exports = app;
