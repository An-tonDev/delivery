const Order=require('../models/orderModel')
const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const {AppError,NotFoundError}=require('../utils/appError')
const ApiFeatures=require('../utils/apiFeatures')
const paystack= require('../utils/paystack')


exports.getOrders=catchAsync (async(req,res,next)=>{

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
    
    const { senderLocation, ...orderData } = req.body;
    
    if (!senderLocation || !senderLocation.coordinates) {
        return next(new AppError('Sender location is required', 400));
    }
    
    // Get coordinates from GeoJSON object
    const [lng, lat] = senderLocation.coordinates;
    
     //Create GeoJSON point for query
    const customerLocation = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] 
    };
    

    const order = await Order.create(orderData);
    
     
    const nearByRiders = await User.find({
        role: 'rider',
        isAvailable: true,
        location: {
            $near: {
                $geometry: customerLocation,
                $maxDistance: 12000
            }
        }
    }).sort({ rating: -1 }).limit(3);
    
   
    if (!nearByRiders || nearByRiders.length === 0) {
        return next(new NotFoundError(" available riders near your location", 404));
    }
    
    //Assign rider
    const rider = nearByRiders[0];
    order.rider = rider._id;
    order.status = "order_assigned";
    await order.save();
    
 
    res.status(201).json({
        status: "success",
        message: `Rider ${rider.username} assigned to your order`,
        data: { order}
    });
});


exports.geocodeAddress = catchAsync (async (req, res, next) => {
  try {
    const { address } = req.query;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(address)}` +
      `&format=json` +
      `&limit=1` +
      `&countrycodes=ng`,
      {
        headers: {
          'User-Agent': 'delivery-app'
        }
      }
    );

    const data = await response.json();

    if (!data.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Address not found'
      });
    }

    res.status(200).json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    });

  } catch (err) {
    next(err);
  }
})

exports.initializePayment= catchAsync(async(req,res)=>{

    const {email,amount,orderId} =req.body

    const response= await paystack.post('/transaction/initialize',{
        email,
        amount: amount*100,
        reference: `order_${orderId}_${Date.now()}`
    })

    res.status(200).json({
        status: "success",
        data: response.data.data
    })

})