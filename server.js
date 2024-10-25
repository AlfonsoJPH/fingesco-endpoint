const express = require('express');
const redis = require('redis');
const config = require('./config');

const app = express();
app.use(express.json());

// Conexión a Redis usando variables de entorno
const redisClient = redis.createClient({
  url: `redis://${config.redisHost}:${config.redisPort}`
});
redisClient.connect().catch(console.error);

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
});

// Aplicar middleware a todas las rutas
app.use(apiKeyMiddleware);

// 1. Pedir una lista con los recursos disponibles (todos los topics y subtopics)
app.get('/recursos', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    res.json({ topics: keys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los recursos' });
  }
});

// 2. Solicitar la información actual de un campo de un sensor
// 3. Solicitar la información de todos los campos de un sensor
app.post('/recursos', async (req, res) => {
  const { sensorId, campo } = req.body;

  // Verificar que `sensorId` esté presente en la solicitud
  if (!sensorId) {
    return res.status(400).json({ message: 'El sensorId es obligatorio' });
  }

  try {
    // Verificar si el sensor existe
    const sensorExists = await redisClient.exists(sensorId);
    if (!sensorExists) {
      return res.status(404).json({ message: `El sensor con ID ${sensorId} no fue encontrado` });
    }

    // Si se especifica un campo, devolver solo ese campo
    if (campo) {
      const data = await redisClient.hGet(sensorId, campo);
      if (data === null) {
        return res.status(404).json({ message: `El campo ${campo} no fue encontrado para el sensor ${sensorId}` });
      }
      return res.json({ [campo]: data });
    }

    // Si no se especifica un campo, devolver todos los campos del sensor
    const data = await redisClient.hGetAll(sensorId);
    console.log(data);
    res.json(data);

  } catch (err) {
    console.error(err);
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener la información de los sensores' });
  }
});


// Exportar la aplicación y el cliente Redis
const server = app.listen(config.serverPort, () => {
  console.log(`Microservicio Redis corriendo en el puerto ${config.serverPort}`);
});


// Añadir esta función para cerrar el servidor
const closeServer = () => {
  server.close();
};

module.exports = { app, redisClient, closeServer };
