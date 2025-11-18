const mongoose= require('mongoose')

const userSchema= new mongoose.Schema(
    {
    username:{
        type:String,
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

const User=  mongoose.model('User', userSchema)

module.exports=User