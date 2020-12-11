import * as scheduler from 'node-schedule';
import {PlayerModel} from "./PlayerDB";

export function init() {
    scheduler.scheduleJob("0 0 * * *", removeAllZeNons);
    console.info("Scheduler | started!")
    removeAllZeNons().catch(console.error)
}

async function removeAllZeNons(){
    try {
        const result = await PlayerModel.deleteMany({"warlords_sr.plays" : { $lt : 10}});
        console.info("Scheduler | " + result.deletedCount + " Nons have been deleted :)")
    } catch (e) {
        console.error(e)
    }
}
