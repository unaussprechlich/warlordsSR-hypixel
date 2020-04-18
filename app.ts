import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import * as path from "path"
import * as logger from 'morgan'
import * as mongoose from "mongoose"
import * as HttpStatusCodes from "http-status-codes"

require("mongoose").Promise = global.Promise;

export const app = express();

import {calculateSR} from "./src/SrCalculator";
import {PlayerModel} from "./src/PlayerDB";

if(!process.env.MONGO_DB) throw "Missing MongoDB connection string, please provide it with the environment variable 'MONGO_DB'!";
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser : true}).then(value => console.log("Connected!"));

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = require('http').createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) return val;
    if (port >= 0) return port;

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') throw error;

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

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
    // @ts-ignore
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.info('Listening on ' + bind);
}

async function reloadSR(){
    console.log("Reloading SR ...");
    const players = await PlayerModel.find({});
    console.log("Players found:" + players.length);

    players.forEach(value => {
        calculateSR(value).save().catch(err => console.log(err));
        console.log("[Reloading] " + value.name + " -> " + value.warlords_sr.SR + " SR");
    })
}

//reloadSR().catch(err => console.log(err));

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

app.get("/about", function (req : Request, res : Response) {
    res.render("about", {PAGE_TITLE : "About"});
});

app.get("/", function (req : Request, res : Response) {
    res.redirect("/lb");
});

/** ERROR ###################################################################### */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next({
        status : HttpStatusCodes.NOT_FOUND
    });
});

// error handler
app.use(function(err, req : Request, res : Response, next : NextFunction) {
    if(err.apiError){
        res.status(err.status|| HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success : false,
            message : err.message
        })
    } else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = err;
        res.locals.PAGE_TITLE = "Error | " + err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR;

        // render the error page
        res.status(err.status|| HttpStatusCodes.INTERNAL_SERVER_ERROR);
        console.error(err);
        if(err.status === HttpStatusCodes.NOT_FOUND){
            res.render('errors/404.pug');
        } else if(err.status === HttpStatusCodes.BAD_REQUEST){
            res.render("errors/400.pug")
        } else {
            res.render("errors/500.pug")
        }
    }
    console.error(err);
    next()
});
