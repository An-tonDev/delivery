const jwt=require('jsonwebtoken')
const catchAsync= require('../utils/catchAsync')
const User=require('../models/userModel')
const {AppError, NotFoundError}=require('../utils/appError')
const crypto=require('crypto')
const Email=require('../utils/catchAsync')

const signToken= id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWTEXPIRESIN
    })
}

const createSendToken= (user,statusCode,res)=>{
    const token=signToken(user._id)
 
    res.cookie('jwt',token,{
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*60*60*24*1000),
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production'
    })

    password=undefined

    res.status(statusCode).json({
        status:"success",
        token,
        data:{user}
    })
}

exports.signup=catchAsync(async(req,res,next)=>{

   const user= await User.create({ ...req.body})

   if(!user){
     return next(new AppError('profile was not created',400))
   }
   createSendToken(user,201,res)

})

exports.login= catchAsync( async(req,res,next)=>{

    const {username,password}=req.body
    if(!username || !password){
       return next(new AppError("please provide your username or password",400))
    }

    const user= await User.findOne(username).select('+password')
    if(!user || user.correctPassword(password,user.password)){
       return next(new AppError("incorrect email or password",401))
    }

    createSendToken(user,200,res)

})

exports.logout=(res)=>{
    res.cookie('jwt','loggedout',{
        expires: Date.now()+10*1000,
        httpOnly:true,
        secure: process.env.NODE_ENV==='production'
    })

    res.status(200).json({
        status:"success"
    })
}

exports.protect=catchAsync( async (req,res,next)=>{

 let token
 if(req.headers.authorization && token.headers.authorization.startswith('Bearer')){
    token=req.headers.authorization.splits('')[1]
 }
 if(req.cookie.jwt){
    token=req.cookie.jwt
 }

 if(!token){
    return next(new AppError('please login to gain access',400))
 }

 const decoded= await promisify(jwt.verify(token,process.env.JWT_SECRET))

const currentUser= await User.findById(decoded.id)

if(!currentUser){
    return next(new AppError('user belonging to this token does not exist',400))
}

 req.user=currentUser
 res.locals.user= currentUser
 next()

})

exports.restrict=(...roles)=>{
    return(req,res,next)=>{
    if(!roles.includes[req.user.role]){
      return next(new AppError("you do not have permission to access this route",400))
    }
    next()
}    
}

exports.resetPassword= catchAsync(async(req,res)=>{
    const hashedToken= crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex')

    const user= await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires: {$gt:Date.now()}
    })

    if(!user){
       return next(new AppError("token is invalid or expired"))
    }
      
    req.body.password=user.password
    req.body.paasswordConfirm=user.passwordConfirm
     user.passwordResetToken=undefined
     user.passwordResetExpires=undefined

     await user.save()
     createSendToken(user,200,res)
})

exports.forgotPassword=catchAsync( async (req,res,next)=>{
    const user= await User.findOne(req.body.email)
    if(!user){
       return next(new NotFoundError("user with this email "))
    }

    const resetToken= user.sendResetToken()
    await user.save({validateBeforeSave:false})
       try{
           resetUrl=`${req.protocol}://
           ${req.get('host')}//api/v1/user/resetPassword/${resetToken}`
           await new Email(user,resetUrl).sendPasswordReset()
       }catch(err){

           user.passwordResetExpires=undefined
           user.passwordResetToken=undefined
           await user.save({validateBeforeSave:false})

         return next (new AppError('email could not be sent',500))
       }
})

exports.updatePassword= catchAsync(async(req,res,next)=>{

    const {passwordCurrent,newPassword}=req.body
    
    const user= await User.findById(req.user.id).select('+password')
    
    if(!(await user.correctPassword(passwordCurrent,user.password))){
       return next(new AppError('cuurent password is not correct',400))
    }
     if(!newPassword && newPassword.length<5){
       return next(new AppError('password must be more than 5 characters',400))
     }

     if(passwordCurrent===newPassword){
       return next(new AppError('new password should not be the same as current password',400))
     }

     user.password=newPassword
     user.passwordConfirm=newPassword
     await user.save()
     createSendToken(user,200,res)
})