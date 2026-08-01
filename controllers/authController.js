const catchAsync= require('../utils/catchAsync')
const RefreshToken=require('../models/refreshTokenModel')
const User=require('../models/userModel')
const {AppError, NotFoundError}=require('../utils/appError')
const crypto=require('crypto')
const Email=require('../utils/email')
const { generateAccessToken,generateRefreshToken,verifyRefreshToken,
               saveRefreshToken,revokeRefreshToken}=require('../utils/tokenUtils')


const createSendTokens= async(user,statusCode,req,res)=>{
    const accessToken= generateAccessToken(user._id,)
    const refreshToken= generateRefreshToken(user._id)

    await saveRefreshToken(refreshToken,user._id,getIpAddress(req))

    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV=='production',
        sameSite:'strict',
        maxAge: 5*24*60*60*1000  
    })

 res.status(statusCode).json({
    status:"success",
    accessToken
   })
}

const getIpAddress= (req) =>{
    return req.ip || req.remote.connection
}

exports.signup=catchAsync(async(req,res,next)=>{

    const {username,email,password,passwordConfirm,role}=req.body

    const existingUser= await User.findOne({email}) 

    if(existingUser){
        return next(new AppError('user already exists',400))
    }

     if(password !== passwordConfirm){
    return next(new appError('passwords do not match',400))
  }

    const user= await User.create({
        username,
        email,
        password,
        role: role
    })

    createSendTokens(user,201,req,res)
})

exports.login= catchAsync( async(req,res,next)=>{

    const {username,password}=req.body

    if(!username || !password){
       return next(new AppError("please provide your username or password",400))
    }

 const user = await User.findOne({ username }).select('+password');

if (!user) {
    return next(new AppError('incorrect username or password', 401));
}

const isCorrect = await user.correctPassword(password, user.password);

if (!isCorrect) {
    return next(new AppError('incorrect username or password', 401));
}

    createSendTokens(user,200,req,res)
})

exports.refreshToken=catchAsync(async(req,res,next)=>{
    const {refreshToken}=req.cookies

    if(!refreshToken){
        return next(new AppError('No refresh token found',401))
    }
 
    //verify refreshToken
    const decoded= verifyRefreshToken(refreshToken)

    if(!decoded){
        return next(new AppError('invalid token',401))
    }

    const storedToken= await RefreshToken.findOne({token:refreshToken})
    
    if(!storedToken || !storedToken.isActive){
        return next(new AppError('token has already expired',401))
    }
       //refresh token rotation
      await revokeRefreshToken(refreshToken,getIpAddress(req))

      createSendTokens(decoded,200,req,res)
      
})


exports.logout=catchAsync(async(req,res)=>{
  const {refreshToken}= req.cookies

  //revoke refreshToken
  if(refreshToken){
     await revokeRefreshToken(refreshToken,getIpAddress(req))
  }

  //clear cookie
  res.clearCookie('refreshToken')

    res.status(200).json({
        status:"success",
        message: "refresh token has been cleared succesfully"
    })
})


exports.restrict=(...roles)=>{
    return(req,next)=>{
    if(!roles.includes(req.user.role)){
      return next(new AppError("you do not have permission to access this route",400))
    }
    next()
}    
}

exports.resetPassword= catchAsync(async(req,res,next)=>{
    const hashedToken= crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex')
    
    const user= await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires: {$gt:Date.now()}
    })
   
    if(!user){
       return next(new AppError("token is invalid or expired",400))
    }
      if(req.body.password !== req.body.passwordConfirm){
        return next(new AppError("passwords do not match",400))
      }

     user.password=req.body.password
     user.passwordResetToken=undefined
     user.passwordResetExpires=undefined

        await user.save()
       createSendTokens(user,200,req,res)
    })

exports.forgotPassword=catchAsync( async (req,res,next)=>{

    const user= await User.findOne({email:req.body.email})

    if(!user){
       return next(new NotFoundError("user with this email "))
    }

    const resetToken= await user.sendResetToken()

    await user.save({validateBeforeSave:false})

       try{
           resetUrl=`${req.protocol}://
           ${req.get('host')}/api/v1/user/resetPassword/${resetToken}`
           await new Email(user,resetUrl).sendPasswordReset(resetToken)
           res.status(200).json({
            status:"success",
           message:"token sent to mail"
       })
       }catch(err){
           console.log("EMAIL",err)
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
     if(!newPassword || newPassword.length<5){
       return next(new AppError('password must be more than 5 characters',400))
     }

     if(passwordCurrent == newPassword){
       return next(new AppError('new password should not be the same as current password',400))
     }

     user.password=newPassword
     
     await user.save()
      createSendTokens(user,200,req,res)
    })  