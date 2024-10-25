// seedRedis.js
const Redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = Redis.createClient({ host: redisHost, port: redisPort });

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

const seedData = async () => {
    try {
        await redisClient.connect();

        // Ejemplo de datos de sensores
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
            // Agrega más datos según sea necesario
        };

        for (const [id, data] of Object.entries(sensorsData)) {
            await redisClient.hSet(id, data);
        }

        console.log('Datos de prueba insertados en Redis');

    } catch (error) {
        console.error('Error al insertar datos en Redis:', error);
    } finally {
        await redisClient.quit();
    }
};

seedData();
