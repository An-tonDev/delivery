
const dotenv=require('dotenv')
dotenv.config({path:`${__dirname}/../.env`})

const  app= require('./app')
const port= process.env.PORT||6400

const server=app.listen(port,()=>{
    console.log("app is running")
})