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
const sassMiddleware = require("node-sass-middleware");
const index = require("./routes/index");
const player = require("./routes/player");
const overview = require("./routes/overview");
const paladin = require("./routes/paladin");
const mage = require("./routes/mage");
const warrior = require("./routes/warrior");
const shaman = require("./routes/shaman");
exports.app = express();
mongoose.connect('mongodb://localhost/hypixel');
async function reloadSR() {
    console.log("Reloading SR ...");
    const players = await PlayerDB_1.PlayerModel.find({});
    players.forEach(value => {
        value.save().catch(err => console.log(err));
    });
}
exports.app.set('views', path.join(__dirname, 'views'));
exports.app.set('view engine', 'pug');
exports.app.use(logger('dev'));
exports.app.use(bodyParser.json());
exports.app.use(bodyParser.urlencoded({ extended: false }));
exports.app.use(cookieParser());
exports.app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    outputStyle: 'compressed'
}));
exports.app.use(express.static(path.join(__dirname, 'public')));
exports.app.use('/', index);
exports.app.use('/overview', overview);
exports.app.use('/paladin', paladin);
exports.app.use('/mage', mage);
exports.app.use('/warrior', warrior);
exports.app.use('/shaman', shaman);
exports.app.use("/player", player);
exports.app.use(function (req, res, next) {
    next(404);
});
exports.app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error.pug');
});
