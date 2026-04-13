const express = require('express');
const bikeController = require('../controllers/bike.controller');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { bikeCreateSchema, bikeIdParamSchema, bikeSearchSchema } = require('../validators/bike.validators');

const router = express.Router();

router.use(auth);
router.post('/', validate(bikeCreateSchema), bikeController.createBike);
router.get('/', validate(bikeSearchSchema, 'query'), bikeController.searchBikes);
router.get('/:id', validate(bikeIdParamSchema, 'params'), bikeController.getBikeById);

module.exports = router;
