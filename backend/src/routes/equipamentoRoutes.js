const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');

const validate = require('../middlewares/validateSchema');
const { createEquipamentoSchema, updateEquipamentoSchema } = require('../validators/schemas');

router.post('/', validate(createEquipamentoSchema), equipamentoController.criar);
router.get('/', equipamentoController.listarAtivos);
router.get('/:id', equipamentoController.buscarPorId);
router.put('/:id', validate(updateEquipamentoSchema), equipamentoController.atualizar);
router.delete('/:id', equipamentoController.descartar);

module.exports = router;