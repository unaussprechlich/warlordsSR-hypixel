import * as express from "express"
import * as path from "path"
import * as logger from 'morgan'
import * as mongoose from "mongoose"
require("mongoose").Promise = global.Promise;
import {PlayerModel} from "./src/PlayerDB"

import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

import player = require('./routes/player');
import lb = require('./routes/lb');

export const app = express();
const debug = require('debug')('warlordssr-hypixel:server');
import http = require('http');

if(!process.env.MONGO_DB) throw "Missing MongoDB connection string, please provide it with the environment variable 'MONGO_DB'!";
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser : true});

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

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
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

async function reloadSR(){
    console.log("Reloading SR ...");
    const players = await PlayerModel.find({});
    players.forEach(value => {
        value.save().catch(err => console.log(err))
    })
}

//reloadSR().catch(err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// @ts-ignore
app.use('/player/*', player);
// @ts-ignore
app.use('/lb*', lb);

app.get("/impressum", function (req, res) {
   res.render("impressum", {PAGE_TITLE : "Impressum"});
});

app.get("/about", function (req, res) {
    res.render("about", {PAGE_TITLE : "About"});
});

app.get("/", function (req, res) {
    res.redirect("/lb");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next({
        status : 404
    });
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;
    res.locals.PAGE_TITLE = "Error | " + err.status || 500;

    // render the error page
    res.status(err.status|| 500);
    if(err.status === 404){
        res.render('errors/404.pug');
    } else {
        res.render("errors/500.pug")
    }
});
