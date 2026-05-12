const express=require('express')
const orderController=require('../controllers/orderController')
const {orderSchema,calculatePriceSchema}=require('../validators/orderValidator')
const validate=require('../middleware/validate')
const router=express.Router()

//router.use('/',authController.protect)


router.post('/calculate-price',validate(calculatePriceSchema),orderController.calculateDeliveryPrice)

router
.route('/')
.get(orderController.getOrders)
.post(validate(orderSchema),orderController.createOrder)

router
.route('/:id')
.get(orderController.getOrder)
.delete(orderController.deleteOrder)
.patch(orderController.updateOrder)

module.exports=router