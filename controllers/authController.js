const jwt=require('jsonwebtoken')
const catchAsync= require('../utils/catchAsync')
const RefreshToken=require('../models/refreshTokenModel')
const User=require('../models/userModel')
const {AppError, NotFoundError}=require('../utils/appError')
const crypto=require('crypto')
const Email=require('../utils/email')
const { generateAccessToken,generateRefreshToken,
               verifyAccessToken,verifyRefreshToken,
               saveRefreshToken,revokeRefreshToken}=require('../utils/tokenUtils')

/* const signToken= id =>{
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
 */

const getIpAddress= (req) =>{
    return req.ip || req.remote.connection
}

exports.signup=catchAsync(async(req,res,next)=>{

    const {username,email,password,passwordConfirm,role}=req.body

    const existingUser= await User.findOne({email}) 

    if(existingUser){
        return next(new AppError('user already exists',400))
    }

    const user= await User.create({
        username,
        email,
        password,
        passwordConfirm,
        role: role
    })

    const accessToken= generateAccessToken(user._id)
    const refreshToken=generateRefreshToken(user._id)

    await saveRefreshToken(refreshToken,user._id,getIpAddress(req))

    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV==='production',
        sameSite:'strict',
        maxAge:5*24*60*60*1000
    })

     res.status(200).json({
        status:"success",
        accessToken,
        user:{
            id: user._id,
            name:user.username,
            email:user.email,
            role:user.role
        }
     })
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

    const accessToken=generateAccessToken(user._id)
    const refreshToken=generateRefreshToken(user._id)

    await saveRefreshToken(refreshToken,user._id,getIpAddress(req))

    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:'strict',
        maxAge: 5*24*60*60*1000
    })

    res.status(200).json({
                status:"success",
            accessToken,
            user:{
                id: user._id,
                name:user.username,
                email:user.email,
                role:user.role
            }
    })
})

exports.refreshToken=catchAsync(async(req,res,next)=>{
    const {refreshToken}=req.cookie

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

    const newAccessToken= generateAccessToken(decoded.userId)

    res.status(200).json({
        status:'success',
        accessToken:newAccessToken
    })
      
})


exports.logout=catchAsync(async(req,res,next)=>{
  const {refreshToken}= req.cookie

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