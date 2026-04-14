const Order=require('../models/orderModel')
const catchAsync=require('../utils/catchAsync')
const {AppError,NotFoundError}=require('../utils/appError')
const ApiFeatures=require('../utils/apiFeatures')
const paystack= require('../utils/paystack')


exports.getOrders=catchAsync (async(req,res,next)=>{
     console.log("query params",req.query)
    const features=new ApiFeatures(Order.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    const doc= await features.query
        
        res.status(200).json({
            status:"success",
            results: doc.length,
            data:{doc}
        })
})

exports.getOrder=catchAsync (async(req,res,next)=>{
   const order= await Order.findById(req.params.id)

     if(!order){
        return next(new NotFoundError('order'))
     }
        res.status(200).json({
            status:"success",
            data:{order}
        })
})

exports.updateOrder=catchAsync (async(req,res,next)=>{
    const order= await Order.findByIdAndUpdate(req.params.id,req.body)
     if(!order){
        return next(new NotFoundError('order'))
     }
        res.status(200).json({
            status:"success",
            data:{order}
        })
})

exports.deleteOrder=catchAsync (async(req,res,next)=>{   
    const order= await Order.findByIdAndDelete(req.params.id)

    if(!order){
        return next(new NotFoundError('order'))
     }
     
       res.status(204).json({
            status:"success",
            data: null
        })
})

exports.createOrder = catchAsync(async(req, res, next) => {
    const { senderLocation,dropoffCoords,totalPrice, ...orderData } = req.body;
    
    if (!senderLocation || !senderLocation.coordinates) {
        return next(new AppError('Sender location is required', 400));
    }
    if (!dropoffCoords) {
        return next(new AppError('Sender location is required', 400));
    }
      
    if(!totalPrice){
      return next(new AppError('totalprice is needed',400))
    }
    
    const order = await Order.create({
      ...orderData,
      senderLocation,
      dropoffLocation:{
        type:'Point',
        coordinates:[dropoffCoords.lng,dropoffCoords.lat]
      },
      totalPrice,
      status: 'pending'
    });
    const paymentReference=`order_${order._id}_${Date.now()}`
    order.paymentReference=paymentReference
    await order.save()

    const paystackResponse= await paystack.post('/transaction/initialize/',{
      email: orderData.email,
      amount: totalPrice*100,
      reference: paymentReference,
      callback_url:'http://localhost:5500/public/success.html'
    })

    res.status(201).json({
      status:'success',
      data:{
        order,
        paymentUrl: paystackResponse.data.data.authorization_url
      }
    })

});


exports.calculateDeliveryPrice = catchAsync (async (req, res, next) => {
    const { pickupCoords,dropoffAddress } = req.body;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(dropoffAddress + ", Nigeria")}` +
      `&format=json` +`&limit=1` +`&countrycodes=ng`,
      {headers: {'User-Agent': 'delivery-app' },
      signal: AbortSignal.timeout(7000)
    }
    );

    const data = await response.json();
    if (!data.length) {
      res.status(200).json({
        status:'fallback',
        message:'destination not found redirecting to lagos center',
        data:{
          distanceInKm:7,
          totalPrice:1200,
          dropoffCoords: { lat: 6.5244, lng: 3.3792 } 
        }
      })
    }

   const dropoffCoords={  
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }

    const R = 6371;
    const dLat = (dropoffCoords.lat - pickupCoords.lat) * Math.PI / 180;
    const dLng = (dropoffCoords.lng - pickupCoords.lng) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickupCoords.lat * Math.PI / 180) *
        Math.cos(dropoffCoords.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c;

     const basePrice=400
     const pricePerKm=100
     const totalPrice= Math.round(basePrice + (pricePerKm * distanceInKm))

     res.status(200).json({
      status:'success',
      data:{
        distanceInKm: distanceInKm.toFixed(2),
        totalPrice,
        dropoffCoords
      }
     })
})

