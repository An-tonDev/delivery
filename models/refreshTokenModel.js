const mongoose=require('mongoose')

const refreshTokenSchema= new mongoose.Schema({
     user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
     },
      token:{
        type:String,
        required:true,
        unique:true
    },
    expiresAt:{
        type: Date,
        required:true
    },
    createdByIP:{
        type:String
    },
    revokedAt:{
        type: Date,
    },
    revokedByIp:{
      type:String
    },
    replacedByToken:{
        type:String
    }
},{timestamps:true})


refreshTokenSchema.index({expiresAt:1},{expireAfterSeconds:0})

refreshTokenSchema.virtual('isExpired').get(function(){
    return Date.now() >= this.expiresAt
})

refreshTokenSchema.virtual('isActive').get(function(){
    return !this.isExpired && !this.revokedAt
})


const RefreshToken=mongoose.model('RefreshToken', refreshTokenSchema)

module.exports=RefreshToken