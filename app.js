"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const HttpStatusCodes = require("http-status-codes");
require("mongoose").Promise = global.Promise;
exports.app = express();
const SrCalculator_1 = require("./src/SrCalculator");
const PlayerDB_1 = require("./src/PlayerDB");
if (!process.env.MONGO_DB)
    throw "Missing MongoDB connection string, please provide it with the environment variable 'MONGO_DB'!";
mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true }).then(value => console.log("Connected!"));
const port = normalizePort(process.env.PORT || '3000');
exports.app.set('port', port);
const server = require('http').createServer(exports.app);
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
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.info('Listening on ' + bind);
}
function reloadSR() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Reloading SR ...");
        const players = yield PlayerDB_1.PlayerModel.find({});
        console.log("Players found:" + players.length);
        players.forEach(value => {
            SrCalculator_1.calculateSR(value).save().catch(err => console.log(err));
            console.log("[Reloading] " + value.name + " -> " + value.warlords_sr.SR + " SR");
        });
    });
}
exports.app.set('views', path.join(__dirname, 'views'));
exports.app.set('view engine', 'pug');
exports.app.use(logger('dev'));
exports.app.use(express.json());
exports.app.use(express.urlencoded({ extended: false }));
exports.app.use(require("cookie-parser")());
exports.app.use(express.static(path.join(__dirname, 'public')));
exports.app.use('/player/*', require('./routes/player'));
exports.app.use('/lb*', require('./routes/lb'));
exports.app.use('/api/*', require('./routes/api'));
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
        status: HttpStatusCodes.NOT_FOUND
    });
});
exports.app.use(function (err, req, res, next) {
    if (err.apiError) {
        res.status(err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.message
        });
    }
    else {
        res.locals.message = err.message;
        res.locals.error = err;
        res.locals.PAGE_TITLE = "Error | " + err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR;
        res.status(err.status || HttpStatusCodes.INTERNAL_SERVER_ERROR);
        console.error(err);
        if (err.status === HttpStatusCodes.NOT_FOUND) {
            res.render('errors/404.pug');
        }
        else if (err.status === HttpStatusCodes.BAD_REQUEST) {
            res.render("errors/400.pug");
        }
        else {
            res.render("errors/500.pug");
        }
    }
    console.error(err);
    next();
});
//# sourceMappingURL=app.js.map