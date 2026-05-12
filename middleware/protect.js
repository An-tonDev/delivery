const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const {AppError}= require('../utils/appError')
const {verifyAccessToken}=require('../utils/tokenUtils')


const protect=catchAsync( async (req,res,next)=>{

 let token

 //get token from header

 if(req.headers.authorization && token.headers.authorization.startswith('Bearer')){
    token=req.headers.authorization.splits('')[1]
 }
 if(req.cookie.jwt){
    token=req.cookie.jwt
 }

 if(!token){
    return next(new AppError('you are not logged in,please login to gain access',401))
 }

 //verify token
 const decoded= verifyAccessToken(token)

 //check if the token is valid
 if(!decoded){
    return next(new AppError("invalid or expired token, please log in again",401))
 }

const currentUser= await User.findById(decoded.id)

//check if user exists
if(!currentUser){
    return next(new AppError('user no longer exists',401))
}

//grant access
 req.user=currentUser
 next()

})

module.exports= protect