const { AppError, NotFoundError, ValidationError } = require('./errorTypes');


const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', err);
    sendErrorDev(err, res);
  } else {
    // Production environment
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

/* Development error response*/
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/* Production error response*/
const sendErrorProd = (err, res) => {

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(err.resource && { resource: err.resource })
    });
  } else {
    // Programming or other unknown error
    console.error('ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

/* Database error handlers*/

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(400, message);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(400, message);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new ValidationError(errors);
};

const handleJWTError = () =>
  new AppError(401, 'Invalid token. Please log in again!');

const handleJWTExpiredError = () =>
  new AppError(401, 'Your token has expired! Please log in again.');


/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  next(new NotFoundError(`${req.originalUrl} route`));
};

/**
 * Custom error throwers for consistent error handling
 */
const throwNotFound = (resource, id) => {
  throw new NotFoundError(`${resource} with ID: ${id} not found`);
};

const throwValidationError = (errors) => {
  throw new ValidationError(errors);
};

const throwAppError = (message, statusCode) => {
  throw new AppError(statusCode, message);
};

/**
 * Error types checker utilities
 */
const isNotFoundError = (err) => err instanceof NotFoundError;
const isValidationError = (err) => err instanceof ValidationError;
const isAppError = (err) => err instanceof AppError;

module.exports = {
  globalErrorHandler,
  notFound,
  throwNotFound,
  throwValidationError,
  throwAppError,
  isNotFoundError,
  isValidationError,
  isAppError,
  handleJWTError,
  handleJWTExpiredError
};