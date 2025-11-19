const express=require('express')
const orderController=require('../controllers/orderController')

const router=express.Router()

router
.route('/')
.get(orderController.getOrders)
.post(orderController.createOrder)

router
.route('/:id')
.get(orderController.getOrder)
.delete(orderController.deleteOrder)
.patch(orderController.updateOrder)