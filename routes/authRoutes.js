const express = require('express');
const {login, refreshToken, logout, signup } = require('../controllers/authController');
const {validate} = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const router = express.Router();

router.post('/register', validate(registerSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;