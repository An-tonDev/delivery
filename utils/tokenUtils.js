
const RefreshToken = require('../models/refreshTokenModel')
const JWT=require('jsonwebtoken')
const { AppError } = require('./appError')


const generateAccessToken= (userId) =>{
    return JWT.sign({userId},
         process.env.JWT_ACCESS_SECRET,
         {expiresIn: '10m'}
    )
}

const generateRefreshToken= (userId) =>{
    return JWT.sign({userId},process.env.JWT_REFRESH_SECRET,{expiresIn:'5d'})
}

const verifyAccessToken= (token) =>{
    try{
       return JWT.verify(token,process.env.JWT_ACCESS_SECRET)
    }catch(error){
        console.log(error)
        return null
    }
}
const verifyRefreshToken= (token) =>{
    try{
       return JWT.verify(token,process.env.JWT_REFRESH_SECRET)
    }catch(error){
        console.log(error)
        return null
    }
}

const saveRefreshToken= async (token,userId,ipAddress) =>{
    const expiresAt= new Date(Date.now()+5*24*60*60*1000)
    await RefreshToken.create({
         token,
         user:userId,
         expiresAt,
         createdByIP:ipAddress
    })
}

const revokeRefreshToken= async(token,ipAddress) =>{
    const refreshToken= await RefreshToken.findOne({token})

    if(!refreshToken || !refreshToken.isActive){
       throw new AppError('invalid token',400)
    }

    refreshToken.revokedAt= Date.now()
    refreshToken.revokedByIp=ipAddress
     await refreshToken.save()
}

module.exports={
               generateAccessToken,generateRefreshToken,
               verifyAccessToken,verifyRefreshToken,
               saveRefreshToken,revokeRefreshToken
               }