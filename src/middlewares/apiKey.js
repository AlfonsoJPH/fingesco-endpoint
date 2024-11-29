const config = require('../config');

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== config.API_KEY) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = apiKeyMiddleware;
