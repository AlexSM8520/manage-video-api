// API Key middleware for protecting endpoints
function validateApiKey(req, res, next) {
  // Get API key from header (x-api-key or authorization)
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Get the valid API key from environment variable or use a default
  const validApiKey = process.env.API_KEY || 'your-secret-api-key-change-this';
  
  if (!apiKey) {
    return res.status(401).json({
      status: 401,
      message: 'API key is required. Please provide it in the x-api-key header or Authorization header.'
    });
  }
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      status: 403,
      message: 'Invalid API key'
    });
  }
  
  next();
}

module.exports = validateApiKey;

