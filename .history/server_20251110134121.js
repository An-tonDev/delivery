
const dotenv=require('dotenv')
dotenv.config({path:'./config'})

const  app= require('./app')
const port= process.env.PORT||6400

const server=app.listen(port,()=>{
    console.log("app is running")
})