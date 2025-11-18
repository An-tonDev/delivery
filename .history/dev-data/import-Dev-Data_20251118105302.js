const fs=require('fs')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const Order=require('../models/orderModel')
const User=require('../models/userModel')

dotenv.config({path:'./config.env'})
const DB=process.env.DATABASE

mongoose.connect(DB).then(()=> console.log("database conncection successful"))

const orders=JSON.parse(fs.readFileSync(`${__dirname}/orders.json`,'utf-8'))
const users= JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))

const importData= async ()=>{
    try{
         await Order.create(orders)
         await User.create(users)
    }catch(err){
        console.log("database creation failed:", err.message)
    }
    process.exit()
}

const deleteData=async()=>{
    try{
        await Order.deleteMany()
        await User.deleteMany()
    }catch(err){
        console.log(err)
    }
    process.exit()
}

if (process.argv[2]==='--import'){
    importData()
}else if(process.argv[2]=== '--delete'){
    
}