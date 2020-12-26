import * as scheduler from 'node-schedule';
import {PlayerModel} from "../db/PlayerModel";
import UUID from "hypixel-api-typescript/src/UUID";
import {redis} from "../../app";
import Player from "../Player";



export function init() {
    scheduler.scheduleJob("0 0 * * *", removeAllZeNons);
    console.info("Scheduler | started!")
    removeAllZeNons().catch(console.error)
    startRandomReloadInterval()
}

async function removeAllZeNons(){
    try {
        const result = await PlayerModel.deleteMany({"warlords_sr.plays" : { $lt : 10}});
        console.info("Scheduler | " + result.deletedCount + " Nons have been deleted :)")
    } catch (e) {
        console.error(e)
    }
}

function startRandomReloadInterval(){

    const INTERVAL_TIME = 10 * 1000; //10 sec

    setInterval(async () => {
        try {
            if (process.env.NO_AUTO_UPDATE) return

            const uuid = UUID.fromShortString(((await PlayerModel.aggregate([
                {$match : {"warlords_sr.SR" : {$exists : true, $ne: null}}},
                {$sample: {size: 1}},
                {$project: {_id: 0, uuid: 1}}
            ]).exec())[0]).uuid);

            const cacheResult = await redis.get(`wsr:${uuid.toShortString()}`)
            if (cacheResult){
                console.log("[PlayerCache|RandomReload] " + uuid.toString() + " -> ALREADY_IN_CACHE");
                return;
            }

            const player = await Player.init(uuid);

            console.log("[PlayerCache|RandomReload] " + uuid.toString() + " -> " + player.data.warlords_sr.SR + " SR");

        } catch (err) {
            console.error("[PlayerCache] something went wrong while reloading a random player: " + err);
        }
    }, INTERVAL_TIME)

}




