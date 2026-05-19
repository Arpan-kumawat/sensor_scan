const { config } = require('../config/env');

const errorHandler = (err, _req, res, _next) => {
  if (config.isProduction) {
    console.error(err.message);
  } else {
    console.error(err);
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: config.isProduction ? 'Internal server error' : err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
