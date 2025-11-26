var express = require('express');
var router = express.Router();
const validateApiKey = require('../middleware/apiKey');

var usersRouter = require('./users');
var uploadVideoRouter = require('./uploadVideo');

// Apply API key validation to all routes
// router.use(validateApiKey);

// Mount API routes
router.use('/users', usersRouter);
router.use('/upload-video', uploadVideoRouter);

module.exports = router;

