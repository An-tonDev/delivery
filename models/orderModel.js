const mongoose=require('mongoose')

const orderSchema= new mongoose.Schema(
    {
    name:{
      type: String,
      required:[true,"order name is required"]
    },
    status:{
        type:String,
        required:true,
        default:"placed_order"
    },
    sender:{
        type: mongoose.Schema.ObjectId,
        ref:'User'
        //required:[true,"an order must be placed by a user"]
    },
    destination:{
        type:String,
        required:[true,"an order must have a destination"]
    },
    recipientPhoneNo:{
        type:Number,
        required:true
    },
    transportPIN:{
        type: Number,
        required:true,
        maxlength:[4, "a pin should not be more than 4 digits"]
    },
    rider:{
        type: mongoose.Schema.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
}
);

 const Order = mongoose.model('Order', orderSchema)

 module.exports=Order
