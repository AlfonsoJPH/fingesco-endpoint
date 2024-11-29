const { getAllKeys, getSensorData } = require('../services/redisService');

const listarRecursos = async (req, res) => {
  try {
    const keys = await getAllKeys();
    res.json({ topics: keys });
  } catch (err) {
    console.error(err);
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
