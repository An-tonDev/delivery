const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const throwNotFound=require('../controllers/errorController')


exports.getUsers=catchAsync (async(req,res,next)=>{
        
    const users= await User.find()
     
        res.status(200).json({
            status:"success",
            results: users.length,
            data:{users}
        })
})

exports.getUser=catchAsync (async(req,res,next)=>{
        
    const user= await User.findById(req.params.id)

     if(!user){
        throwNotFound("user",req.params.id)
     }
        res.status(200).json({
            status:"success",
            data:{user}
        })
})

exports.updateuser=catchAsync (async(req,res,next)=>{
        
    const user= await user.findByIdAndUpdate(req.params.id,req.body)
     if(!user){
        throwNotFound('user',req.params.id)
     }
        res.status(200).json({
            status:"success",
            data:{user}
        })
})

exports.deleteUser=catchAsync (async(req,res,next)=>{
        
    const user= await User.findByIdAndDelete(req.params.id)

    if(!user){
        throwNotFound('user',req.params.id)
     }
     
        res.status(204).json({
            status:"success",
            data: null
        })
})

exports.createUser=catchAsync (async(req,res,next)=>{
        
    const user= await User.create(req.body)
        res.status(201).json({
            status:"success",
            data:{user}
        })
})