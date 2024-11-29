const express = require('express');
const { redisClient } = require('./services/redisService');
const apiKeyMiddleware = require('./middlewares/apiKey');
const healthRoutes = require('./routes/healthRoutes');
const recursosRoutes = require('./routes/recursosRoutes');
const sensoresRoutes = require('./routes/sensoresRoutes');

const app = express();
app.use(express.json());

// Conexión a Redis
redisClient.connect().catch(console.error);

// Rutas
app.use('/health', healthRoutes);
app.use(apiKeyMiddleware); // Aplicar a todas las rutas siguientes
app.use('/recursos', recursosRoutes);
app.use('/sensores', sensoresRoutes);

module.exports = app;
