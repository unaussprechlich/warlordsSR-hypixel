import * as express from 'express'
const router = express.Router();
import * as MinecraftApiCached from "./../src/utils/MinecraftApiRedisCached";
import Player from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";
import {StatusCodes} from "http-status-codes";
import {stringToUuid} from "../src/utils/UUID";

const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();


/* GET home page. */
router.get('/*', async function(req, res, next) {
    try{

        const url = req.baseUrl.split("/");

        if(!url[2]) throw {
            message : "You did not Provide a UUID or Username!",
            status : StatusCodes.BAD_REQUEST,
            apiError : true
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

        const player = await Player.init(uuid, false, true);

        if(player == null) {
            throw {
                message : "Player with UUID:" + uuid.toString() + " not found!",
                status : StatusCodes.NOT_FOUND
            }
        }

        const [ranking, nameHistory] = await Promise.all([
            player.getRanking(),
            player.getNameHistory()
        ]);



        res.status(200).json({
            success : true,
            data : {
                playername : player.data.name,
                uuid : player.data.uuid,
                warlords_sr : player.data.warlords_sr,
                warlords_hypixel : player.data.warlords,
                ranking : ranking,
                name_history : nameHistory
            }
        })

    }catch (err){
        if(err.apiError || err.status === StatusCodes.BAD_REQUEST || err.status === StatusCodes.NOT_FOUND){
            err.apiError = true
            next(err)
        } else {
            console.error(err)
            next({
                message : "Internal Server Error!",
                status : StatusCodes.INTERNAL_SERVER_ERROR,
                apiError : true
            })
        }
    }
});

module.exports = router;
