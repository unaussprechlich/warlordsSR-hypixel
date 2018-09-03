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
const index = require("./routes/index");
const player = require("./routes/player");
const overview = require("./routes/overview");
const paladin = require("./routes/paladin");
const mage = require("./routes/mage");
const warrior = require("./routes/warrior");
const shaman = require("./routes/shaman");
const MinecraftAPI = require("minecraft-api");
const Player = require("./src/Player");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
exports.app = express();
mongoose.connect('mongodb://localhost/hypixel');
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();
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
exports.app.use(express.static(path.join(__dirname, 'public')));
exports.app.use('/', index);
exports.app.use('/overview', overview);
exports.app.use('/paladin', paladin);
exports.app.use('/mage', mage);
exports.app.use('/warrior', warrior);
exports.app.use('/shaman', shaman);
exports.app.use("/player", player);
exports.app.get("/api", async (req, res, next) => {
    try {
        if (req.query.uuid == null && req.query.name == null)
            throw "No query provided!";
        let uuid;
        if (req.query.uuid == null && req.query.name != null) {
            if (!minecraftPlayernamePattern.test(req.query.name))
                throw "Misformatted NAME!";
            try {
                uuid = await MinecraftAPI.uuidForName(req.query.name);
            }
            catch (e) {
                throw { message: "PLAYER NOT FOUND!", error: { code: 404 } };
            }
        }
        else if (req.query.uuid != null) {
            if (!uuidShortPattern.test(req.query.uuid))
                throw "Misformatted UUID!";
            uuid = req.query.uuid;
        }
        else {
            throw "Your query has to contain a name or uuid field!";
        }
        const player = await Player.defaultCache.get(UUID_1.default.fromShortString(uuid));
        const ranking = await player.getRanking();
        if (player == null)
            throw "Player with UUID:" + req.query.uuid + " not found!";
        res.json({
            success: true,
            player: player.data,
            ranking: ranking
        });
    }
    catch (err) {
        res.json({
            success: false,
            error: err
        });
    }
});
exports.app.use(function (req, res, next) {
    next(404);
});
exports.app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error.pug');
});
