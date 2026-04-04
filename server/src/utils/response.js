const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Request successful',
    data = null,
    pagination = null,
    extras = {},
  } = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
    ...extras,
  });
};

const sendError = (
  res,
  {
    statusCode = 500,
    message = 'Internal Server Error',
    data = null,
    pagination = null,
    extras = {},
  } = {}
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
    pagination,
    ...extras,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};