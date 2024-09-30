import * as express from 'express';
import * as path from 'path'
import * as favicon from 'serve-favicon';
import * as logger from 'morgan'
import * as cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'
import * as moment from 'moment'
import * as compression from 'compression'
import {logger as Logger} from "./services/logger";
import {LangMiddleware} from './utils/Lang';
const appRoot = require('app-root-path').path;
import {router as index} from './routes/index';
import {router as users} from './routes/users';
import {router as admin} from './routes/admin';
import {router as questions} from './routes/questions';
import {router as quiz} from './routes/quiz';

import {router as categories} from './routes/categories';
import {router as languages} from './routes/languages';
import {router as program} from './routes/program';
import {router as program_users} from './routes_program/users';
import {router as channels} from './routes_program/channels';

import {router as support} from './routes_program/support';

import {router as program_devices} from './routes_program/devices';
import {logsRouter} from './routes/logs'
import {router as notification} from './routes_program/notifications';
import {router as actors} from './routes_program/actors';

const app = express();
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,x-access-token');
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};

app.locals.ANALYTICS_ENBALED = process.env.ANALYTICS_ENABLED === 'true';

app.use(compression({filter: shouldCompress}));
app.use(LangMiddleware);

function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false
    }
    // fallback to standard filter function
    return compression.filter(req, res)
}

app.use(allowCrossDomain);
// view engine setup
const staticPath = __dirname.replace('dist', 'src');

app.set('views', path.join(staticPath, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(staticPath, 'public', 'favicon.ico')));
app.use(cookieParser());
app.use('/', logsRouter);

app.use(
    logger(function (tokens, req, res) {

            let str = [
                tokens.method(req, res),
                tokens.url(req, res),
                tokens.status(req, res),
                tokens.res(req, res, 'content-length'), '-',
                tokens['response-time'](req, res), 'ms'
            ].join(' ');
            Logger.info(str);
            return undefined;
        }
    )
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(staticPath, 'public')));

app.use("/uploads", express.static(appRoot + "/uploads"));

app.use('/', index);
app.use('/', users);
app.use('/', admin);
app.use('/', questions);
app.use('/', categories);
app.use('/', languages);
app.use('/', program);
app.use('/', notification);
app.use('/', program_users);
app.use('/', program_devices);
app.use('/', actors);
app.use('/', support);
app.use('/', quiz);
app.use('/', channels);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err: any = {message: 'Not found' + req.originalUrl};
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    Logger.error(err);

    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const hbs = require('hbs');
hbs.registerHelper('date_f', function (str) {
    let date = new Date(str);
    return moment(date).format("MMMM DD, YYYY");
});
hbs.registerHelper('date_year', function (str) {
    let date = new Date(str);
    return moment(date).format('YYYY-MM-DD');
});

module.exports = app;
