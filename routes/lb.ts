import * as express from 'express'
import {PlayerModel} from "../src/PlayerDB";
import {CLAZZES, WARLORDS} from "../src/Warlords";
const Cache = require("cache");

const router = express.Router();

const cache = new Cache(5 * 60 * 1000);



/* GET home page. */
router.get('/*', async function(req, res, next) {
    try{

        const url = req.baseUrl.split("/");

        const clazz = url[2] && CLAZZES.indexOf(url[2].toLowerCase()) >= 0 ? url[2].toLowerCase() : null;
        const specsOfClazz = clazz ? WARLORDS[CLAZZES.indexOf(clazz)].specs : null;
        const spec = clazz && url[3] && specsOfClazz && specsOfClazz.indexOf(url[3].toLowerCase()) >= 0 ? url[3].toLowerCase() : null;

        async function loadLb(sortBy : string) {
            if(cache.get(sortBy)) return cache.get(sortBy);

            const lb = await PlayerModel.find({[sortBy] : {$exists : true}}, {name : 1, uuid : 1, warlords_sr : 1}).sort("-" + sortBy).limit(1000).lean(true);
            cache.put(sortBy, lb);
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
