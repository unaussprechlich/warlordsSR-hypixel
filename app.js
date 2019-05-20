"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
require("mongoose").Promise = global.Promise;
const PlayerDB_1 = require("./src/PlayerDB");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const player = require("./routes/player");
const lb = require("./routes/lb");
exports.app = express();
const debug = require('debug')('warlordssr-hypixel:server');
const http = require("http");
const SrCalculator_1 = require("./src/SrCalculator");
if (!process.env.MONGO_DB)
    throw "Missing MongoDB connection string, please provide it with the environment variable 'MONGO_DB'!";
mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true });
const port = normalizePort(process.env.PORT || '3000');
exports.app.set('port', port);
const server = http.createServer(exports.app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port))
        return val;
    if (port >= 0)
        return port;
    return false;
}
function onError(error) {
    if (error.syscall !== 'listen')
        throw error;
    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
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
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
async function reloadSR() {
    console.log("Reloading SR ...");
    const players = await PlayerDB_1.PlayerModel.find({});
    players.forEach(value => {
        SrCalculator_1.calculateSR(value).save().catch(err => console.log(err));
        console.log("[Reloading] " + value.name + " -> " + value.warlords_sr.SR + " SR");
    });
}
exports.app.set('views', path.join(__dirname, 'views'));
exports.app.set('view engine', 'pug');
exports.app.use(logger('dev'));
exports.app.use(bodyParser.json());
exports.app.use(bodyParser.urlencoded({ extended: false }));
exports.app.use(cookieParser());
exports.app.use(express.static(path.join(__dirname, 'public')));
exports.app.use('/player/*', player);
exports.app.use('/lb*', lb);
exports.app.get("/impressum", function (req, res) {
    res.render("impressum", { PAGE_TITLE: "Impressum" });
});
exports.app.get("/about", function (req, res) {
    res.render("about", { PAGE_TITLE: "About" });
});
exports.app.get("/", function (req, res) {
    res.redirect("/lb");
});
exports.app.use(function (req, res, next) {
    next({
        status: 404
    });
});
exports.app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = err;
    res.locals.PAGE_TITLE = "Error | " + err.status || 500;
    res.status(err.status || 500);
    console.error(err);
    if (err.status === 404) {
        res.render('errors/404.pug');
    }
    else {
        res.render("errors/500.pug");
    }
});
