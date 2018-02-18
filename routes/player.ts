import * as express from 'express'
const router = express.Router();
import * as MinecraftAPI from "minecraft-api";
import * as Player from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";

const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();

router.get('/', async function(req, res, next) {
    try{
        if(req.query.uuid == null && req.query.name == null) throw "No query provided!";

        let uuid;

        if(req.query.uuid == null && req.query.name != null){
            if(!minecraftPlayernamePattern.test(req.query.name)) throw "Misformatted NAME!";
            uuid = await MinecraftAPI.uuidForName(req.query.name);
        } else if(req.query.uuid != null){
            if(!uuidShortPattern.test(req.query.uuid)) throw "Misformatted UUID!";
            uuid = req.query.uuid;
        } else {
            throw "Your query has to contain a name or uuid field!"
        }

        const player = await Player.defaultCache.get(UUID.fromShortString(uuid));
        const ranking = await player.getRanking();

        if(player == null) throw "Player with UUID:" + req.query.uuid + " not found!";

        res.render('player', {
            PAGE_TITLE: player.data.name + '|WarlordsSR',
            PLAYER : player.data,
            RANKING : ranking
        });

    }catch (err){
        next(err)
    }
});

module.exports = router;
