const express = require('express');
const clientController = require('../controllers/client.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { clientCreateSchema, clientIdParamSchema, clientSearchSchema } = require('../validators/client.validators');

const router = express.Router();

router.use(auth);
router.post('/', validate(clientCreateSchema), clientController.createClient);
router.get('/', validate(clientSearchSchema, 'query'), clientController.searchClients);
router.get('/:id', validate(clientIdParamSchema, 'params'), clientController.getClientById);
router.put('/:id', validate(clientIdParamSchema, 'params'), clientController.updateClient);

module.exports = router;
