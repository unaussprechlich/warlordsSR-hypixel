import * as express from 'express'
const router = express.Router();
import {Player} from "../src/Player";

/* GET home page. */
router.get('/', async function(req, res, next) {
    try{
        const players = await Player.find({}, {name : 1, warlords_sr : 1}).sort({"warlords_sr.shaman.SR" : -1}).lean(true);
        res.render('shaman', { PAGE_TITLE: 'Shaman|WarlordsSR', PLAYERS : players });
    }catch (err){
        next(err)
    }
});

module.exports = router;
