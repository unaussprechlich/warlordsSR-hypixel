import * as express from "express"
import * as path from "path"
import * as logger from 'morgan'
import * as mongoose from "mongoose"
require("mongoose").Promise = global.Promise;
import {IPlayer, Player} from "./src/Player"

import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import * as sassMiddleware from 'node-sass-middleware'

import index = require('./routes/index');
import player = require('./routes/player');
import overview = require('./routes/overview');
import paladin = require('./routes/paladin');
import mage = require('./routes/mage');
import warrior = require('./routes/warrior');
import shaman = require('./routes/shaman');

export const app = express();

mongoose.connect('mongodb://localhost/hypixel', { useMongoClient: true });

async function reloadSR(){
    console.log("Reloading SR ...");
    const players = await Player.find({});
    players.forEach(value => {
        value.save().catch(err => console.log(err))
    })
}

reloadSR().catch(err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    outputStyle: 'compressed'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/overview', overview);
app.use('/paladin', paladin);
app.use('/mage', mage);
app.use('/warrior', warrior);
app.use('/shaman', shaman);
app.use("/player", player);

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
