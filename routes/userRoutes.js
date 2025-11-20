const express=require('express')
const userController=require('../controllers/userController')

const router=express.Router()

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