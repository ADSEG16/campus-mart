const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  return sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    extras: {
      ...(process.env.NODE_ENV !== 'production' && { error: err.stack }),
    },
  });
};

module.exports = errorHandler;