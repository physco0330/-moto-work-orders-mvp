const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.use(auth, authorize(['ADMIN']));
router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);

module.exports = router;
