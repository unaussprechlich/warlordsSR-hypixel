import * as express from 'express'
const router = express.Router();
import * as MinecraftAPI from "minecraft-api";
import * as Player from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";
import {PlayerModel} from "../src/PlayerDB";

const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();

router.use(checkAuth);

function checkAuth (req, res, next) {
    console.log('checkAuth ' + req.url);

    if (!req.session || !req.session.authenticated) {
        res.render('unauthorised', { status: 403 });
        return;
    }

    next();
}

router.get('/', async function(req, res, next) {
    try{

        const playerExample = await PlayerModel.aggregate([
            { $sample: { size: 1 } }
        ]).exec() ;

        if(playerExample[0] == null) throw "Player with UUID:" + req.query.uuid + " not found!";

        const player = await Player.defaultCache.get(UUID.fromShortString(playerExample[0].uuid));
        const ranking = await player.getRanking();

        if(player == null) throw "Player with UUID:" + req.query.uuid + " not found!";

        res.render('rateme', {
            PAGE_TITLE: player.data.name + '|WarlordsSR',
            PLAYER : player.data,
            RANKING : ranking
        });

    }catch (err){
        next(err)
    }
});

module.exports = router;
