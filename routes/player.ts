import * as express from 'express'
const router = express.Router();
import Player from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";
import {StatusCodes} from "http-status-codes"
import * as MinecraftApiCached from "../src/utils/MinecraftApiRedisCached";
import {stringToUuid} from "../src/utils/UUID";

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

        const player = await Player.init(uuid)

        if(player == null) throw {
            message : "Player with UUID:" + uuid.toString() + " not found!",
            status : StatusCodes.NOT_FOUND
        };

        const [ranking, nameHistory] = await Promise.all([
            player.getRanking(),
            player.getNameHistoryString()
        ]);

        res.render('player', {
            PAGE_TITLE: "Player | " +  player.data.name ,
            PLAYER : player.data,
            RANKING : ranking,
            NAME_HISTORY : nameHistory
        });

    } catch (err){
        next(err);
    }
});

module.exports = router;
