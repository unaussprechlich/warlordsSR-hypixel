import * as express from "express"
import * as path from "path"
import * as logger from 'morgan'
import * as mongoose from "mongoose"
require("mongoose").Promise = global.Promise;
import {PlayerModel} from "./src/PlayerDB"

import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

import index = require('./routes/index');
import player = require('./routes/player');
import overview = require('./routes/overview');
import paladin = require('./routes/paladin');
import mage = require('./routes/mage');
import warrior = require('./routes/warrior');
import shaman = require('./routes/shaman');
import * as MinecraftAPI from "minecraft-api";
import * as Player from "./src/Player";
import UUID from "hypixel-api-typescript/src/UUID";

export const app = express();

mongoose.connect('mongodb://localhost/hypixel');
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();

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

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/overview', overview);
app.use('/paladin', paladin);
app.use('/mage', mage);
app.use('/warrior', warrior);
app.use('/shaman', shaman);
app.use("/player", player);

app.get("/api", async (req, res, next) => {
    try{
        if(req.query.uuid == null && req.query.name == null) throw "No query provided!";

        let uuid;

        if(req.query.uuid == null && req.query.name != null){
            if(!minecraftPlayernamePattern.test(req.query.name)) throw "Misformatted NAME!";
            try{
                uuid = await MinecraftAPI.uuidForName(req.query.name);
            }catch (e) {
                throw {message : "PLAYER NOT FOUND!", error : {code : 404}};
            }
        } else if(req.query.uuid != null){
            if(!uuidShortPattern.test(req.query.uuid)) throw "Misformatted UUID!";
            uuid = req.query.uuid;
        } else {
            throw "Your query has to contain a name or uuid field!"
        }

        const player = await Player.defaultCache.get(UUID.fromShortString(uuid));
        const ranking = await player.getRanking();

        if(player == null) throw "Player with UUID:" + req.query.uuid + " not found!";

        res.json({
            success : true,
            player : player.data,
            ranking : ranking
        });

    }catch (err){
        res.json({
            success : false,
            error : err
        })
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(404);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status|| 500);
    res.render('error.pug');
});
