const mongoose=require('mongoose')

const orderSchema = new mongoose.Schema(
    {
    name:{
        type: String,
        required:[true,"order name is required"]
    },
    status:{
        type:String,
        required:true,
        default:"placed_order",
        index:true
    },
    paymentReference: {
        type: String,
        unique: true,
        sparse: true,
        index:true
    },
    sender:{
        type: mongoose.Schema.ObjectId,
        ref:'User'
    },
    destination:{
        type:String,
        required:[true,"an order must have a destination"]
    },
    recipientPhoneNo:{
        type:String,
        required:true,
        match:[/^[0-9]+$/,"phone number should contain only digits"]
    },
    transportPIN:{
        type: String,
        required:true,
        minlength:[4,"pin should be only 4 digits"],
        maxlength:[4,"pin should be only 4 digits"]  
    },
    rider:{
        type: mongoose.Schema.ObjectId,
        ref:'User'
    },
    senderLocation:{
        type:{
            type:String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number], // [longitude, latitude]
            required:true
        }
    },
    dropoffLocation:{
      type:{
        type:String,
        enum:['Point'],
        default:'Point'
     },
     coordinates:{
        type:[Number],
        required:true
     }
    },
    totalPrice:{
        type:Number,
        required:true
    },
    paidAt:{
        type: Date
    },
    deliveredAt:{
        type:Date
    }

},{
    timestamps:true
}
);

orderSchema.index({ senderLocation: '2dsphere' });

const Order = mongoose.model('Order', orderSchema)
module.exports = Order
