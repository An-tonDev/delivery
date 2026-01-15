const express=require('express')
const morgan =require('morgan')
const cors=require('cors')
const {globalErrorHandler}=require('./controllers/errorController')
const app=express()
const userRoutes=require('./routes/userRoutes')
const orderRoutes=require('./routes/orderRoutes')
const webhookRoutes= require('./routes/webhookroutes')


app.use('api/v1/webhook/paystack',express.raw({type:'application/json'}))
app.use(express.json())

app.use(cors())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}



app.use('/api/v1/users',userRoutes)
app.use('/api/v1/orders',orderRoutes)
app.use('/api/v1/webhook',webhookRoutes)

const catchAllHandler = (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found on this server!`
  });
};


app.use(catchAllHandler);
app.use(globalErrorHandler);


module.exports=app