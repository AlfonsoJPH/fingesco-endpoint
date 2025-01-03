const express = require('express');
const { redisClient } = require('./services/redisService');
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
app.use(express.json());

// Conexión a Redis
redisClient.connect().catch((err) => {
  logger.error(`Error al conectar a Redis: ${err.message}`);
});

// Rutas
app.use('/health', healthRoutes);
app.use(apiKeyMiddleware); // Aplicar a todas las rutas siguientes
app.use('/recursos', recursosRoutes);
app.use('/sensores', sensoresRoutes);

module.exports = app;
