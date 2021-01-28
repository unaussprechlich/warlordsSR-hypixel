import * as express from 'express'
const router = express.Router();
import Player, {MANUAL_RELOAD_COOLDOWN_TIME} from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";
import {StatusCodes} from "http-status-codes"
import * as MinecraftApiCached from "../src/utils/MinecraftApiRedisCached";
import {stringToUuid} from "../src/utils/UUID";
import * as Url from "url"

const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();

router.get('/*', async function(req, res, next) {
    try{

        const url = req.baseUrl.split("/");

        if(!url[2]) throw {
            message : "You did not Provide a UUID or Username!",
            status : StatusCodes.BAD_REQUEST
        };

        let uuid : UUID;

        if(url[2] === "uuid" && url[3]){
            uuid = stringToUuid(url[3])
        } else if(minecraftPlayernamePattern.test(url[2])){
            uuid = await MinecraftApiCached.uuidForName(url[2])
        } else {
            throw {
                message : "The requested path is no Username or UUID!",
                status : StatusCodes.BAD_REQUEST
            }
        }

        //await redis.del(`wsr:reloadcooldown:${uuid.toShortString()}`)

        const player = await Player.init(uuid, false, req.query.reload === "true")

        if(player == null) throw {
            message : "Player with UUID:" + uuid.toString() + " not found!",
            status : StatusCodes.NOT_FOUND
        };

        const [ranking, nameHistory, reloadCooldown] = await Promise.all([
            player.getRanking(),
            player.getNameHistoryString(),
            player.getManualReloadCooldown()
        ]);

        if(req.query.reload === "true"){
            res.redirect(req.baseUrl)
        } else {
            res.render('player', {
                PAGE_TITLE: "Player | " +  player.data.name ,
                PLAYER : player.data,
                IS_INACTIVE : player.isInactive,
                RANKING : ranking,
                NAME_HISTORY : nameHistory,
                RELOAD_COOLDOWN : reloadCooldown,
                MANUAL_RELOAD_COOLDOWN_TIME : MANUAL_RELOAD_COOLDOWN_TIME
            });
        }

    } catch (err){
        next(err);
    }
});

module.exports = router;
