const fs=require('fs')
const dotenv=require('dotenv')
const Order=require('../models/orderModel')
const { default: mongoose } = require('mongoose')

dotenv.config({path:`${__dirname}/../.env`})

const DB=process.env.DATABASE

mongoose.connect(DB).then(async()=>{
    const orders= await Order.find()
    fs.writeFileSync(`${__dirname}/orders.json`,JSON.stringify(orders,null,2))
    console.log('orders.json has been corrected')
    process.exit()
}).catch(err => console.log(err))
    
