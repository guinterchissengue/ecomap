// central error handling middleware to format responses and manage status codes
export const errorhandler = (err, req, res, next) => {
    let statuscode = err.statusCode || 500;
    let message = err.message || 'internal server error';

    // handle mongoose duplicate key error (e.g., unique email)
    if (err.code === 11000) {
        statuscode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `duplicate value entered for ${field} field, please choose another value`;
    }

    // handle mongoose validation error
    if (err.name === 'ValidationError') {
        statuscode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // handle mongoose cast error (malformed objectid not caught by middleware)
    if (err.name === 'CastError') {
        statuscode = 400;
        message = `resource not found with id of ${err.value}`;
    }

    // do not leak stack traces in production
    const stack = process.env.NODE_ENV === 'production' ? null : err.stack;

    res.status(statuscode).json({
        success: false,
        message: message,
        stack: stack
    });
};