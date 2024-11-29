const express = require('express');
const { listarSensores } = require('../controllers/sensoresController');

const router = express.Router();
router.get('/', listarSensores);

module.exports = router;
