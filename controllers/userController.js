const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const {AppError,NotFoundError}=require('../utils/appError')


exports.getUsers=catchAsync (async(req,res,next)=>{
        
    const users= await User.find()

    if(!users){
        return next(new NotFoundError(`user database is empty`,404))
    }
     
        res.status(200).json({
            status:"success",
            results: users.length,
            data:{users}
        })
})

exports.getUser=catchAsync (async(req,res,next)=>{
        
    const user= await User.findById(req.params.id)

     if(!user){
    return next(new NotFoundError(`user ${req.params.id}`,404))
     }
        res.status(200).json({
            status:"success",
            data:{user}
        })
})

exports.updateuser=catchAsync (async(req,res,next)=>{
        
    const user= await user.findByIdAndUpdate(req.params.id,req.body)
     if(!user){
      return next(new NotFoundError(`user ${req.params.id}`,404))
     }
        res.status(200).json({
            status:"success",
            data:{user}
        })
})

exports.deleteUser=catchAsync (async(req,res,next)=>{
        
    const user= await User.findByIdAndDelete(req.params.id)

    if(!user){
        return next(new NotFoundError(`user ${req.params.id}`,404))
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

exports.getRiderLocation = catchAsync(async (req, res, next) => {
  const rider = await User.findById(req.params.id).select('location');

  if (!rider || !rider.location) {
    return res.status(404).json({
      status: 'fail',
      message: 'Rider location not available'
    });
  }

  res.json({
    lat: rider.location.coordinates[1],
    lng: rider.location.coordinates[0]
  });
});
