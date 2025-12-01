
const globalErrorHandler = (err, req, res, next) => {
  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Development: Full error details
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      ...(err.errors && { errors: err.errors }),
      ...(err.resource && { resource: err.resource })
    });
  } 
  // Production: Clean error messages
  else {
    // Handle MongoDB/operational errors
    if (err.name === 'CastError') {
      err = new AppError(400, `Invalid ${err.path}: ${err.value}`);
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      err = new AppError(400, `${field} already exists`);
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      err = new ValidationError(errors);
    }
    
    // Send response
    const response = {
      status: err.status,
      message: err.message
    };
    
    if (err instanceof ValidationError) {
      response.errors = err.errors;
    }
    if (err instanceof NotFoundError) {
      response.resource = err.resource;
    }
    
    res.status(err.statusCode).json(response);
  }
};

// 404 handler
const notFound = (req, res, next) => {
  next(new NotFoundError(`${req.originalUrl} route`));
};

module.exports = { globalErrorHandler, notFound };