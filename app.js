const express=require('express')
const morgan =require('morgan')
const {notFound,globalErrorHandler}=require('./controllers/errorController')
const app=express()
const userRouter=require('./routes/userRoutes')
const orderRouter=require('./routes/orderRoutes')

app.use(express.json())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use('api/v1/user/',userRouter)

app.use('api/v1/order/',orderRouter)

app.all('*',notFound)
app.use(globalErrorHandler)

module.exports=app