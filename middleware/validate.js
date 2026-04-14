const validate=(schema)=>{
    return(req,res,next)=>{
        const {error,value}=schema.validate(req.body,{
            abortEarly:false,
            stripUnknown:true
        })

        if(error){
            const errors=error.details.map(detail=>detail.message)

            return res.statusCode(400).json({
                status:"fail",
                message: "validation error",
                errors:errors
            })
        }
            req.body=value
            next()
    }
}

module.exports ={validate}