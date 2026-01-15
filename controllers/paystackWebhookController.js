const crypto=require('crypto')

exports.paystackWebhooks= async(req,res)=>{
    const hash= crypto
    .createHmac('sha512',process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex')

    if(hash !== req.headers['x-paystack-signature']){
        return res.status(401).send('invalid signature')
    }

    const event=req.body
    if(event.event === 'charge.success'){
        const reference= event.data.reference
        const amount= event.data.amount/100

        console.log("payment verified: ", reference,amount)

    }

   res.sendStatus(200)

}