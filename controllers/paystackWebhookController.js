const crypto=require('crypto')
const Order= require('../models/orderModel')
const User=require('../models/userModel')
const {io} =require('../server')

exports.paystackWebhooks= async(req,res)=>{
    const hash= crypto
    .createHmac('sha512',process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex')

    if(hash !== req.headers['x-paystack-signature']){
        return res.status(401).send('invalid signature')
    }

    const event=req.body

    if(event.event === 'charge.success'){

        const reference= event.data.reference
        const amount= event.data.amount/100

      const order= await Order.findOne({paymentReference : reference})

      if(!order){
        console.log("order not found for reference:",reference)
        return res.sendStatus(200)
      }

      if(order.status=="paid" || order.status=="order_assigned"){
        console.log("order already processed",reference)
         return res.sendStatus(200)
      }

      order.status="paid"
      order.paidAt= Date.now()
      await order.save()

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

         console.log(`rider ${rider.username} has been assigned to your order ${order._id}`)

         io.to(`order_${order._id}`).emit('order_assigned',{
            orderId: order._id,
            riderid: rider._id
         })

      }else{
         console.log('no riders are available to deliver your order')
       }
    }

   res.sendStatus(200)

}