import * as express from 'express'
const router = express.Router();
import * as MinecraftAPI from "minecraft-api";
import * as Player from "../src/Player";
import UUID from "hypixel-api-typescript/src/UUID";
import * as HttpStatusCodes from "http-status-codes";

const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const uuidLongPatter = RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();

/* GET home page. */
router.get('/*', async function(req, res, next) {
    try{
        const url = req.baseUrl.split("/");

        if(!url[2]) throw {
            message : "You did not Provide a UUID or Username!",
            status : HttpStatusCodes.BAD_REQUEST,
            apiError : true
        };

        let uuid : UUID;

        if(url[2] === "uuid" && url[3]){
            if(uuidShortPattern.test(url[3])){
                uuid = UUID.fromShortString(url[3])
            } else if(uuidLongPatter.test(url[3])) {
                uuid = UUID.fromString(url[3])
            } else {
                return next({
                    message : "Can't parse UUID!",
                    status : HttpStatusCodes.BAD_REQUEST,
                    apiError : true
                });
            }
        } else if(minecraftPlayernamePattern.test(url[2])){
            const uuid_string = await MinecraftAPI.uuidForName(url[2]);
            if(!uuid_string) throw {
                message : "Player with NAME:" + url[2].toString() + " not found!",
                status : HttpStatusCodes.NOT_FOUND,
                apiError : true
            }
            uuid = UUID.fromString(uuid_string);
        } else {
            throw {
                message : "The requested path is no Username or UUID!",
                status : HttpStatusCodes.BAD_REQUEST,
                apiError : true
            }
        }

        const player = await Player.defaultCache.get(uuid);

        if(player == null) {
            throw {
                message : "Player with UUID:" + uuid.toString() + " not found!",
                status : HttpStatusCodes.NOT_FOUND,
                apiError : true
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
        if(err.apiError){
            next(err)
        } else {
            next({
                message : "Internal Server Error!",
                status : HttpStatusCodes.INTERNAL_SERVER_ERROR,
                apiError : true
            })
        }
    }
});

module.exports = router;
