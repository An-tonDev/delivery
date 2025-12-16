const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

// Public routes
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword)
router.post('/login', authController.login)
router.post('/signUp', authController.signup)
router.get('/logout', authController.logout)

router.get('/rider-location/:id', userController.getRiderLocation);

// Admin protected routes (apply middleware directly)
router
.route('/')
.get(authController.protect, authController.restrict('admin'), userController.getUsers)
.post(authController.protect, authController.restrict('admin'), userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.delete(authController.protect, authController.restrict('admin'), userController.deleteUser)
.patch(authController.protect, authController.restrict('admin'), userController.updateuser)

module.exports = router