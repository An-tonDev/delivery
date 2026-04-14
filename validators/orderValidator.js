const Joi=require('joi')

const orderSchema= Joi.object({
    name: Joi.string()
    .min(3)
    .required()
    .messages({
        'string.min':'order name cannot be less than 3 characters',
        'any.required':'order name is required'
}),

   destination: Joi.string()
   .min(5)
   .required()
   .message({
    'any.required':'the order destination is required'
}),

   recipientPhoneNo: Joi.string()
   .pattern(/^[0-9]{10-11}$/)
   .required()
   .messages({
    'string.pattern.base':"phone number should contain 10-11 digits",
    'any.required':'phone number of recipient is required'
   }),

    transportPIN: Joi.string()
    .length(4)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
        'string.length': 'pin should be exactly four digits',
        'string.pattern.base':'pin should contain only digits',
       'any.required' : 'transport pin is required'
    }),

    totalPrice: Joi.number()
    .required(),

    senderLocation: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().length(2).items(Joi.number()).required()
    }),

    dropoffCoords: Joi.object({
      type: Joi.string()
      .valid('Point')
      .required(),
      coordinates: Joi.array()
      .length(2)
      .items(Joi.number())
      .required()
    }).required()
})

const calculatePriceSchema=Joi.object({
    pickupCoords:Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }).required(),

    dropoffAddress: Joi.string()
    .min(5)
    .required()
})

module.exports={calculatePriceSchema,orderSchema}