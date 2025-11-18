const express=require('express')
const morgan =require('morgan')
const {notFound,globalErrorHandler}=require('./controllers/errorController')
const app=express()

app.use(express.json())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.all('*',notFound)
app.use(globalErrorHandler)

module.exports=app