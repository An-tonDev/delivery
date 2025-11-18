const Order=require('../models/orderModel')
const catchAsync=require('../utils/catchAsync')
const throwNotFound=require('../controllers/errorController')


exports.getOrders=catchAsync (async(req,res,next)=>{
        
    const orders= await Order.find()
     
        res.status(200).json({
            status:"success",
            results: orders.length,
            data:{orders}
        })
})

exports.getOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.findById(req.params.id)

     if(!order){
        throwNotFound("order",req.params.id)
     }
        res.status(200).json({
            status:"success",
            data:{order}
        })
})

exports.updateOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.findByIdAndUpdate(req.params.id,req.body)
     if(!order){
        throwNotFound('order',req.params.id)
     }
        res.status(200).json({
            status:"success",
            data:{order}
        })
})

exports.deleteOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.findByIdAndDelete(req.params.id)

    if(!order){
        throwNotFound('order',req.params.id)
     }
     
        res.status(204).json({
            status:"success",
            data: null
        })
})

exports.createOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.create(req.body)
        res.status(201).json({
            status:"success",
            data:{order}
        })
})