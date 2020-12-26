import * as express from 'express'
import {PlayerModel} from "../src/db/PlayerModel";
import {CLAZZES, WARLORDS} from "../src/static/Warlords";
import {redis} from "../app";

const router = express.Router();

const CACHE_TIME = 24 * 60 * 60; // 24 hours

/* GET home page. */
router.get('/*', async function(req, res, next) {
    try{

        const url = req.baseUrl.split("/");

        const clazz = url[2] && CLAZZES.indexOf(url[2].toLowerCase()) >= 0 ? url[2].toLowerCase() : null;
        const specsOfClazz = clazz ? WARLORDS[CLAZZES.indexOf(clazz)].specs : null;
        const spec = clazz && url[3] && specsOfClazz && specsOfClazz.indexOf(url[3].toLowerCase()) >= 0 ? url[3].toLowerCase() : null;

        async function loadLb(sortBy : string) {
            const cacheResult = await redis.get(`wsr:lb:${sortBy}`)

            if(cacheResult){
                console.info(`[WarlordsSR|LbCache] hit for ${sortBy}`)
                return JSON.parse(cacheResult);
            }

            const lb = await PlayerModel.find({[sortBy] : {$exists : true}}, {name : 1, uuid : 1, warlords_sr : 1}).sort("-" + sortBy).limit(1000).lean(true);
            await redis.set(`wsr:lb:${sortBy}`, JSON.stringify(lb), ["EX", CACHE_TIME])
            return lb;
        }

        const players = await loadLb("warlords_sr." + (clazz ? (spec ? clazz + "." + spec + "." : clazz + ".") : "") + "SR");

        res.render('lb', {
            PAGE_TITLE: "LB | " + capitalizeFirstLetter(clazz ? (spec ? spec : clazz) : "General"),
            CLAZZ : clazz,
            CLAZZES : CLAZZES,
            SPEC : spec,
            SPECS : specsOfClazz,
            PLAYERS : players
        });
    }catch (err){
        next(err);
        console.error(err);
    }
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;
