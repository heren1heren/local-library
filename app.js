import './mongoose.js';
import createError from 'http-errors';
import express from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import catalogRouter from './routes/catalog.js';
import compression from 'compression';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Set up rate limiter: maximum of twenty requests per minute
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);
// add helmet to middleware chain
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ["'self'", 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
);
// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use(compression());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
