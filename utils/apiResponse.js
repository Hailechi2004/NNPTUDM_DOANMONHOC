function sendSuccess(res, data, status = 200, message = 'OK') {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, status, message, details = null) {
  const payload = {
    success: false,
    message,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendError,
  sendSuccess,
};
