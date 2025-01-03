const express = require('express');
const { listarRecursos, obtenerDatosRecurso } = require('../controllers/recursosController');

const router = express.Router();
router.get('/', listarRecursos);
router.post('/', obtenerDatosRecurso);

module.exports = router;
