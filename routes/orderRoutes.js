const express=require('express')
const orderController=require('../controllers/orderController')
const authController=require('../controllers/authController')
const router=express.Router()

//router.use('/',authController.protect)

router
.route('/')
.get(authController.restrict('admin'),orderController.getOrders)
.post(orderController.createOrder)

router
.route('/:id')
.get(orderController.getOrder)
.delete(orderController.deleteOrder)
.patch(orderController.updateOrder)

module.exports=router