const mongoose= require('mongoose')
const dotenv=require('dotenv')
dotenv.config({path:'./.env'})

const  app= require('./app')
const port= process.env.PORT||6400

const DB= process.env.DATABASE
mongoose.connect(DB).then(()=>{console.log("db connection successful")})

app.listen(port,()=>{
    console.log("app is running on " +port)
})