const express = require('express');
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { loginRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema } = require('../validators/auth.validators');

const router = express.Router();

router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/register', auth, authorize(['ADMIN']), validate(registerSchema), authController.register);
router.get('/me', auth, authController.me);

module.exports = router;
