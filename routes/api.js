var express = require('express');
var router = express.Router();

var usersRouter = require('./users');
var uploadVideoRouter = require('./uploadVideo');

// Mount API routes
router.use('/users', usersRouter);
router.use('/upload-video', uploadVideoRouter);

module.exports = router;

