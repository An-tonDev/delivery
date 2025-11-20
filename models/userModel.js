const mongoose= require('mongoose')
const bcrypt= require('bcrypt')
const crypto= require('crypto')

const userSchema= new mongoose.Schema(
    {
    username:{
        type:String,
        unique:true,
         required: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lower:true,
        validate:{
          validator: function(v) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
             },
           message: props => `${props.value} is not a valid email!`
        }
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[5,"password cannot be lower than 5 characters"],
        maxlength:[20,"password should not be more than 20 characters "],
        select:false
    },
    passwordConfirm:{
       type:String,
       required:[true,"please confirm your password"],
       validate:{
         validator: function(el){
            return el === this.password
         },
         message:"passwords do not match"
       }
    },
     role:{
       type:String,
       enum:['user','admin','rider'],
       default: 'user'
     },
     passwordResetToken: String,
     passwordResetExpires: Date
})


userSchema.pre('save',async function(next){
  if(!this.isModified('password')) return next
  this.password= bcrypt.hash(this.password,12)
})

userSchema.methods.correctPassword= async function(canditatePassword,password){
  return await bcrypt.compare(canditatePassword,password)
}

userSchema.methods.sendResetToken= async function(){
  const resetToken= crypto.randomBytes(32).toString('hex')

  this.passwordResetToken= crypto.createHash('sha256')
  .update(resetToken)
  .digest('hex')

  this.passwordResetExpires= Date.now()+10*60*1000

  return resetToken
}

const User=  mongoose.model('User', userSchema)

module.exports=User