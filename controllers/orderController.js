const Order=require('../models/orderModel')
const catchAsync=require('../utils/catchAsync')
const throwNotFound=require('../controllers/errorController')

//example declaration sake
const socket=require('socket')


exports.getOrders=catchAsync (async(req,res,next)=>{
        
    const orders= await Order.find()
     
        res.status(200).json({
            status:"success",
            results: orders.length,
            data:{orders}
        })
})

exports.getOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.findById(req.params.id)

     if(!order){
        throwNotFound("order",req.params.id)
     }
        res.status(200).json({
            status:"success",
            data:{order}
        })
})

exports.updateOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.findByIdAndUpdate(req.params.id,req.body)
     if(!order){
        throwNotFound('order',req.params.id)
     }
        res.status(200).json({
            status:"success",
            data:{order}
        })
})

exports.deleteOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.findByIdAndDelete(req.params.id)

    if(!order){
        throwNotFound('order',req.params.id)
     }
     
        res.status(204).json({
            status:"success",
            data: null
        })
})

exports.createOrder=catchAsync (async(req,res,next)=>{
        
    const order= await Order.create(req.body)
        res.status(201).json({
            status:"success",
            data:{order}
        })
})

//examples for learning about socket.io

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
});