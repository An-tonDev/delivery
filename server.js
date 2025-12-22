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

  socket.on('disconnect',()=>{
    console.log("socket is disconnected")
  })

})



server.listen(port,()=>{
    console.log("socket + app is running on " +port)
})