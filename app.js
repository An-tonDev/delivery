const express=require('express')
const morgan =require('morgan')
const cors=require('cors')
const {globalErrorHandler}=require('./controllers/errorController')
const app=express()
const userRouter=require('./routes/userRoutes')
const orderRouter=require('./routes/orderRoutes')
const socketIO=require('socket.io')
const http=require('http')

app.use(express.json())

app.use(cors())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}



const server= http.createServer(app)
const io= socketIO(server)


app.use('/api/v1/users',userRouter)
app.use('/api/v1/orders',orderRouter)

server.listen(6400,()=>{
  console.log("socket is axtive on 6400")
})

const catchAllHandler = (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found on this server!`
  });
};


app.use(catchAllHandler);
app.use(globalErrorHandler);


module.exports=app