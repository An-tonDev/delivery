const notFound = (req, res, next) => {
  // Simple 404 handler without importing AppError
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`
  });
};

const globalErrorHandler = (err, req, res, next) => {
 
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Development: Full error details
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Production: Clean error messages
  else {
  
    let message = err.message;
    
    if (err.name === 'CastError') {
      message = `Invalid ${err.path}: ${err.value}`;
      err.statusCode = 400;
      err.status = 'fail';
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      message = `${field} already exists`;
      err.statusCode = 400;
      err.status = 'fail';
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      message = 'Validation failed';
      err.statusCode = 400;
      err.status = 'fail';
    

      res.status(err.statusCode).json({
        status: err.status,
        message: message,
        errors: errors
      });
      return;
    }
    
   
    res.status(err.statusCode).json({
      status: err.status,
      message: message
    });
  }
};

module.exports = { globalErrorHandler, notFound };