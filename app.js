// Load environment variables first
const dotenv = require('dotenv');
dotenv.config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var cron = require('node-cron');
var { cleanupOldVideos } = require('./utils/cleanupVideos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

// CORS configuration to allow requests from www.primeia.app
const allowedOrigins = [
  'https://www.primeia.app',
  'http://www.primeia.app',
  'https://primeia.app',
  'http://primeia.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiRouter);

// Ruta estática correcta para servir videos desde /videos en la url
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// Setup cron job to clean up old videos (runs every hour)
// Cron pattern: '0 * * * *' means "at minute 0 of every hour"
cron.schedule('0 * * * *', async () => {
  console.log('[Cron] Starting scheduled video cleanup...');
  await cleanupOldVideos();
}, {
  scheduled: true,
  timezone: "America/Mexico_City" // Adjust timezone as needed
});

// Run cleanup once on startup
cleanupOldVideos().then(result => {
  console.log(`[Startup] Initial cleanup completed: ${result.deleted} files deleted, ${result.errors} errors`);
}).catch(err => {
  console.error('[Startup] Error during initial cleanup:', err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      status: 403, 
      message: 'CORS: Origin not allowed' 
    });
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // For API routes, return JSON instead of rendering error page
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      status: err.status || 500,
      message: err.message || 'Internal Server Error'
    });
  }

  // render the error page for non-API routes
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
