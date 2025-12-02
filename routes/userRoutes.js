const express=require('express')
const userController=require('../controllers/userController')
const authController=require('../controllers/authController')

const router=express.Router()

router.post('/forgotPassword',authController.forgotPassword).
router.post('/resetPassword',authController.resetPassword).
router.post('/login',authController.login).
router.post('/signUp',authController.signup).
router.get('/logout',authController.logout)

router.use(authController.protect,authController.restrict('admin'))
router
.route('/')
.get(userController.getUsers)
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.delete(userController.deleteUser)
.patch(userController.updateuser)

module.exports=router