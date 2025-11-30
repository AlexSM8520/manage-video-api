var express = require('express');
var router = express.Router();
const {validateSupabaseToken, optionalSupabaseToken} = require('../middleware/supabaseAuth');

var usersRouter = require('./users');
var uploadVideoRouter = require('./uploadVideo');


router.use(optionalSupabaseToken);
// Mount API routes
router.use('/users', usersRouter);
router.use('/upload-video', uploadVideoRouter);

module.exports = router;

