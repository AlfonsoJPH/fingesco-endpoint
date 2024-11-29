const { getAllKeys, getAllSensorData } = require('../services/redisService');

const listarSensores = async (req, res) => {
  try {
    const keys = await getAllKeys();
    const sensores = await getAllSensorData(keys);
    res.json(sensores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los sensores' });
  }
};

module.exports = { listarSensores };
