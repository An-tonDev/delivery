const express = require('express');
const {login, refreshToken, logout, signup,
forgotPassword,resetPassword,updatePassword } = require('../controllers/authController');
const {validate} = require('../middleware/validate');
const protect=require('../middleware/protect')
const { registerSchema, loginSchema } = require('../validators/authValidator');
const router = express.Router();

router.post('/register', validate(registerSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword/:token',resetPassword)
router.post('/updatePassword',protect,updatePassword)


module.exports = router;