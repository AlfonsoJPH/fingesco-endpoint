const request = require('supertest');
const { app, redisClient, closeServer } = require('../src/server'); // Asegúrate de exportar correctamente
const config = require('../src/config/index.js');


beforeAll(async () => {
    try {
        const sensores = {
            '03110411': { temperature: '20', humidity: '50' },
            '03110410': { temperature: '22', humidity: '45' }
        };

        // Almacena cada sensor como un hash en Redis
        for (const [sensorId, data] of Object.entries(sensores)) {
            await redisClient.hSet(sensorId, data);
        }

        console.log('Datos de sensores almacenados en Redis');
    } catch (error) {
        console.error('Error al almacenar los datos de sensores en Redis:', error);
    }
});

afterAll(async () => {
    // Cerrar el cliente Redis después de las pruebas
    await redisClient.quit();
    // Cerrar el servidor después de las pruebas
    await closeServer();
});

// Tus pruebas aquí
//Test para verificar que el endpoint de salud esté funcionando
test('GET /health devuelve status UP', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'UP' });
});

// Test para verificar que el middleware de API Key esté funcionando
test('GET /recursos devuelve error 403 si no se envía API Key', async () => {
    const response = await request(app).get('/recursos');
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden' });
});

// Test para verificar que el middleware de API Key esté funcionando
test('GET /recursos devuelve error 403 si se envía API Key incorrecta', async () => {
    const response = await request(app)
        .get('/recursos')
        .set('x-api-key', 'incorrecta');
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden' });
});

// Test para verificar que el middleware de API Key esté funcionando
test('GET /recursos devuelve lista de recursos si se envía API Key correcta', async () => {
    const response = await request(app)
        .get('/recursos')
        .set('x-api-key', config.API_KEY);
    expect(response.statusCode).toBe(200);
    expect(response.body.topics).toEqual(expect.arrayContaining(['03110411', '03110410']));
});

// Test cuando se especifica sensorId y campo
test('POST /recursos devuelve información de un campo de un sensor', async () => {
    const response = await request(app)
        .post('/recursos')
        .set('x-api-key', config.API_KEY)
        .send({ sensorId: '03110411', campo: 'temperature' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ temperature: '20' });
});

// Test cuando solo se especifica sensorId (todos los campos del sensor)
test('POST /recursos devuelve información de todos los campos de un sensor', async () => {
    const response = await request(app)
        .post('/recursos')
        .set('x-api-key', config.API_KEY)
        .send({ sensorId: '03110411' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ temperature: '20', humidity: '50' });
});

// Test cuando falta el sensorId
test('POST /recursos devuelve error cuando falta el sensorId', async () => {
    const response = await request(app)
        .post('/recursos')
        .set('x-api-key', config.API_KEY)
        .send({ campo: 'temperature' });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: 'El sensorId es obligatorio' });
});

// Test cuando el sensor no existe
test('POST /recursos devuelve error cuando el sensor no existe', async () => {
    const response = await request(app)
        .post('/recursos')
        .set('x-api-key', config.API_KEY)
        .send({ sensorId: '99999999', campo: 'temperature' });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: 'El sensor con ID 99999999 no fue encontrado' });
});

// Test cuando el campo no existe en el sensor
test('POST /recursos devuelve error cuando el campo no existe', async () => {
    const response = await request(app)
        .post('/recursos')
        .set('x-api-key', config.API_KEY)
        .send({ sensorId: '03110411', campo: 'pressure' });
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: 'El campo pressure no fue encontrado para el sensor 03110411' });
});

// Test para obtener información de todos los sensores
test('GET /sensores devuelve información de todos los sensores', async () => {
    const response = await request(app).get('/sensores')
        .set('x-api-key', config.API_KEY);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ '03110411': { temperature: '20', humidity: '50' }, '03110410': { temperature: '22', humidity: '45' } });
});
