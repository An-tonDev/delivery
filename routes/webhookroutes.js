const express= require('express')
const webhookController= require('../controllers/paystackWebhookController')
const router = express.Router()

router.post('/paystack',webhookController.paystackWebhooks)

module.exports=router