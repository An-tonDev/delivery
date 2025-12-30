const mongoose= require('mongoose')
const dotenv=require('dotenv')
const socketIO=require('socket.io')
const http=require('http')


dotenv.config({path:'./.env'})

const  app= require('./app')
const port= process.env.PORT||6400

const DB= process.env.DATABASE
mongoose.connect(DB).then(()=>{console.log("db connection successful")})

const server= http.createServer(app)
const io= socketIO(server,{
    cors:{
        origin:'*'
    }
})

io.on('connection',(socket)=>{
  console.log("scet is running "+socket.id)

  socket.on('join_order', ({orderId,role})=>{
    socket.join(`order ${orderId}`)
    socket.role=role
    console.log(`${role} joined order ${orderId} room`)
  })

  socket.on('rider_location_update',(data)=>{
    console.log(` Rider ${data.riderId} moved`);
    io.to(`order_${data.orderId}`).emit('rider_moved', data);
});

socket.on('delivery_completed', (data) => {
    console.log(` Delivery completed for order ${data.orderId}`);
    io.to(`order_${data.orderId}`).emit('delivery_success', data);
});
  
  socket.on('disconnect',()=>{
    console.log("socket is disconnected "+socket.id)
  })

})



server.listen(port,()=>{
    console.log("socket + app is running on " +port)
})