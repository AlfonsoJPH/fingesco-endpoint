const app = require('./app');
const config = require('./config');

const server = app.listen(config.serverPort, () => {
  console.log(`Microservicio Redis corriendo en el puerto ${config.serverPort}`);
});

// Manejar cierre del servidor
const closeServer = () => {
  server.close(() => {
    console.log('Servidor cerrado');
  });
};

module.exports = { server, closeServer };
