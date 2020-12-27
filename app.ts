import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import * as path from "path"
import * as logger from 'morgan'
import * as mongoose from "mongoose"
import {StatusCodes} from "http-status-codes"
import * as RedisClient from "handy-redis"
import * as Scheduler from "./src/utils/Scheduler"
import {recalculateSR} from "./src/utils/SrRecalculator";

/** MONGODB ###################################################################### */

require("mongoose").Promise = global.Promise;

if(!process.env.MONGO_DB) throw "Missing MongoDB connection string, please provide it with the environment variable 'MONGO_DB'!";
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser : true, useUnifiedTopology : true, poolSize : 10 }).then( _ => {
    console.info("WarlordsSr | Connected to MongoDB!")
    Scheduler.init()
});

/** REDIS ######################################################################## */

if(!process.env.REDIS) throw "Missing Redis connection string, please provide it with the environment variable 'REDIS'!";
export const redis = RedisClient.createNodeRedisClient({url : process.env.REDIS})
redis.set('foo', 'bar').then(() => redis.get('foo'))
    .then( _ => console.info("WarlordsSr | Connected to Redis!"));

/** RECALCULATOR ################################################################## */

//Uncomment if you want to recalculate all players
recalculateSR().catch(reason => console.error(reason))

/** EXPRESS ####################################################################### */

const port = process.env.PORT || '3000'

export const app = express();
app.set('port', port);

const server = require('http').createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


/** EVENT LISTENER ################################################################ */

function onError(error) {
    if (error.syscall !== 'listen') throw error;

    const bind = 'Pipe ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.info('WarlordsSr | Listening on ' + bind);
}

/** ENGINE ###################################################################### */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("cookie-parser")());

app.use(express.static(path.join(__dirname, 'public')));

/** ROUTES ###################################################################### */

app.use('/player/*', require('./routes/player'));
app.use('/lb*', require('./routes/lb'));
app.use('/api/*', require('./routes/api'));

app.get("/impressum", function (req : Request, res : Response) {
   res.render("impressum", {PAGE_TITLE : "Impressum"});
});

app.get("/", function (req : Request, res : Response) {
    res.redirect("/lb");
});

/** ERROR ###################################################################### */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next({
        status : StatusCodes.NOT_FOUND
    });
});

// error handler
app.use(function(err, req : Request, res : Response, next : NextFunction) {
    if(err.apiError){
        res.status(err.status|| StatusCodes.INTERNAL_SERVER_ERROR).json({
            success : false,
            message : err.message
        })
    } else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = err;
        res.locals.PAGE_TITLE = "Error | " + err.status || StatusCodes.INTERNAL_SERVER_ERROR;

        // render the error page
        res.status(err.status|| StatusCodes.INTERNAL_SERVER_ERROR);
        console.error(err);
        if(err.status === StatusCodes.NOT_FOUND){
            res.render('errors/404.pug');
        } else if(err.status === StatusCodes.BAD_REQUEST){
            res.render("errors/400.pug")
        } else {
            res.render("errors/500.pug")
        }
    }
    console.error(err);
    next()
});
