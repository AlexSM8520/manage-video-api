const { createClient } = require('@supabase/supabase-js');

// Lazy initialization of Supabase client
// Only create it when needed to avoid errors if env vars are not set
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    console.log(SUPABASE_URL);
    const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    console.log(SUPABASE_ANON_KEY);

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in environment variables');
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

/**
 * Middleware to validate Supabase JWT tokens
 * Extracts token from Authorization header and validates it with Supabase
 * Attaches user information to req.user if token is valid
 */
async function validateSupabaseToken(req, res, next) {
  try {
    // Check if Supabase is configured
    let supabaseClient;
    try {
      supabaseClient = getSupabaseClient();
    } catch (configError) {
      return res.status(500).json({
        status: 500,
        message: 'Supabase configuration error',
        error: configError.message
      });
    }

    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        status: 401,
        message: 'Authorization header is required. Please provide a Bearer token.'
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 401,
        message: 'Invalid authorization format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Token is required in Authorization header'
      });
    }

    // Validate token with Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid or expired token',
        error: error?.message || 'User not found'
      });
    }

    // Attach user information to request object
    req.user = user;
    req.supabaseToken = token;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Error validating Supabase token:', error);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error during token validation',
      error: error.message
    });
  }
}

/**
 * Optional middleware that validates token but doesn't require it
 * Useful for routes where authentication is optional
 * Attaches user to req.user if token is valid, but continues even if not
 */
async function optionalSupabaseToken(req, res, next) {
  try {
    // Check if Supabase is configured
    let supabaseClient;
    try {
      supabaseClient = getSupabaseClient();
    } catch (configError) {
      // For optional auth, just continue without user if config is missing
      console.warn('Supabase not configured, skipping optional token validation:', configError.message);
      return next();
    }

    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return next(); // Continue without user
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(); // Continue without user
    }

    const token = parts[1];

    if (!token) {
      return next(); // Continue without user
    }

    // Try to validate token
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (!error && user) {
      req.user = user;
      req.supabaseToken = token;
    }

    next();
  } catch (error) {
    // On error, continue without user (optional auth)
    console.error('Error validating optional Supabase token:', error);
    next();
  }
}

module.exports = {
  validateSupabaseToken,
  optionalSupabaseToken
};

