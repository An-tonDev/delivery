const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const protect=require('../middleware/protect')

const router = express.Router()



router.get('/rider-location/:id', userController.getRiderLocation);

// Admin protected routes (apply middleware directly)
router
.route('/')
.get(protect, authController.restrict('admin'), userController.getUsers)
.post(protect, authController.restrict('admin'), userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.delete(protect, authController.restrict('admin'), userController.deleteUser)
.patch(protect, authController.restrict('admin'), userController.updateuser)

module.exports = router