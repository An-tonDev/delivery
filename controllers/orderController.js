const Order=require('../models/orderModel')
const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const {AppError,NotFoundError}=require('../utils/appError')
const ApiFeatures=require('../utils/apiFeatures')



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
        return next(new NotFoundError("No riders available near your location", 404));
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








/* //examples for learning about socket.io

socket.emit('rider_moved',{position:[6.5280,3.3794]})

socket.on('rider_moved',(data)=>{
    updateMap(data.position)
})

//rooms
socket.join('rider-123')

//code for creating an order room for a customer to monitor in real time
socket.join('order_45')
io.to('order_45').emit('locationUpdated',newPosition)


// On rider's phone
function sendLocationUpdate(position) {
    socket.emit('rider_location_update', {
        riderId: 'rider_123',
        orderId: 'order_456',
        position: position,
        timestamp: new Date()
    });
}

// Send every 5 seconds when moving
setInterval(() => {
    if (isDelivering) {
        navigator.geolocation.getCurrentPosition(sendLocationUpdate);
    }
}, 5000);

socket.on('rider_location_update', (data) => {
    //  Update rider's location in database
    updateRiderLocation(data.riderId, data.position);
    
    // Tell everyone tracking this order
    io.to(`order_${data.orderId}`).emit('rider_moved', {
        position: data.position,
        riderId: data.riderId,
        timestamp: data.timestamp
    });
    
    // Check if rider is close to destination
    checkDeliveryProximity(data.orderId, data.position);
});

// On customer's phone/computer
socket.on('rider_moved', (data) => {
    // Update the map in real-time!
    riderMarker.setLatLng(data.position);
    map.panTo(data.position);
    
    // Update ETA
    updateETA(data.position);
}); */