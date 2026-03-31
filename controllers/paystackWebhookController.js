const crypto=require('crypto')
const Order= require('../models/orderModel')
const User=require('../models/userModel')

exports.paystackWebhooks= async(req,res)=>{

  console.log("webhook hit")

    const hash= crypto
    .createHmac('sha512',process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex')

    if(hash !== req.headers['x-paystack-signature']){
        return res.status(401).send('invalid signature')
    }

    const event=req.body
    console.log("webhook received:", event.event)

    if(event.event === 'charge.success'){

        const reference= event.data.reference
         console.log("reference:", reference)

        const amount= event.data.amount/100
         console.log("amount paid", amount)
         
       
      const order= await Order.findOne({paymentReference : reference})

      if(!order){
        console.log("order not found for reference:",reference)
        return res.sendStatus(200)
      }

      if( Math.abs(amount-order.totalPrice)>1){
          console.log("payment mismatch")
          return res.sendStatus(200)
        }


      if(order.status=="paid" || order.status=="order_assigned"){
        console.log("order already processed",reference)
         return res.sendStatus(200)
      }

      order.status="paid"
      order.paidAt= Date.now()
 
      const nearbyRiders= await User.find({
        role:'rider',
        isAvailable: true,
        location:{
             $near:{
                $geometry:{
                    type: 'Point',
                    coordinates: order.senderLocation.coordinates
                },
                $maxDistance: 12000
             }
        }
      }).sort({rating:-1}).limit(1)

      if(nearbyRiders.length >0){
        const rider= nearbyRiders[0]
        order.rider=rider._id
        order.status='order_assigned'
          
        await order.save()
        
      console.log(`rider ${rider.username} has been assigned to order ${order._id}`)

        global.io.to(`order_${order._id}`).emit('order_assigned',{
            orderId: order._id,
            riderid: rider._id
         })

      }else{
         console.log('no riders are available to deliver your order')
          await order.save()
       } 
    }
         
       

   res.sendStatus(200)

}