const Joi=require('joi')

const registerSchema=Joi.object({
    username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.min':'character cannot be less than 3 characters',
        'string.max':'character cannot be more than 50 characters',
        'any.required':'username is required'
    }),
    email: Joi.string()
    .email()
    .required()
    .messages({
        'string.email':'please provide a valid email',
        'any.required':'email is required'    
    }),
    password: Joi.string()
    .min(6)
    .required()
    .messages({
        'string.min' :'çharacters cannot be less than 6',
        'any.required' : 'password is required'
    })
})

const loginSchema= Joi.object({
    email:Joi.string()
    .email()
    .required(),

    password:Joi.string()
    .required()
})

module.exports={registerSchema,loginSchema}