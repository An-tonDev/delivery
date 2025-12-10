class AppError extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode=statusCode
        this.status= `${statusCode}`.startsWith('4') ? 'fail' :'error'
        this.isOperational=true
        Error.captureStackTrace(this,this.constructor)
    }
}

class NotFoundError extends AppError{
    constructor(resource){
        super(`${resource} not found`,404)
        this.resource=resource
    }
}

class ValidationError extends AppError{
    constructor(errors){
        super("validation failed",400)
        this.errors=errors
    }
}

module.exports={AppError,NotFoundError,ValidationError}