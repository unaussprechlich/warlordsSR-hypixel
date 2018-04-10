import * as express from 'express'
const router = express.Router();
import * as MinecraftAPI from "minecraft-api";
import * as Player from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";
import {PlayerModel} from "../src/PlayerDB";
import {UserModel} from "../src/UserDB";
import * as bcrypt from "bcryptjs"

const SALT = "(?2/F4)*(82_!xy^;Ur'#9DAhTiN";

const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();



router.post('/', async function(req , res , next) {
    try{

        if(req.body.username == null || req.body.password == null)
            throw "No Username or password provided";

        if(!minecraftPlayernamePattern.test(req.body.username))
            throw "Invalid Username!";

        const user = await UserModel.findOne({name : req.body.username}).exec();

        if(user == null)
            throw "User nor found!";

        if(!bcrypt.compareSync(req.body.password, user.password.toString()))
            throw "Wrong password!";

        if(req.session)
        req.session.authenticated = true;
        res.redirect('/rateme');

    }catch (err){
        next(err)
    }
});

router.get("/",function (req, res, next) {
    res.render('login' );
});

module.exports = router;
