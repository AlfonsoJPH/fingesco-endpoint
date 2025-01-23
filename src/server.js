const app = require('./app');
const config = require('./config');
const winston = require('winston');

// Configurar winston
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

const server = app.listen(config.serverPort, () => {
  logger.info(`Microservicio Redis corriendo en el puerto ${config.serverPort}`);
});

// Manejar cierre del servidor
const closeServer = () => {
  server.close(() => {
    logger.info('Servidor cerrado');
  });
};

module.exports = { app, server, closeServer };