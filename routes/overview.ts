import * as express from 'express'
import {PlayerModel} from "../src/PlayerDB";
const router = express.Router();


/* GET home page. */
router.get('/', async function(req, res, next) {
    try{
        const players = await PlayerModel.find({}, {name : 1, uuid : 1, warlords_sr : 1}).sort({"warlords_sr.SR" : -1}).limit(1000).lean(true);
        res.render('overview', { PAGE_TITLE: 'Overview|WarlordsSR', PLAYERS : players });
    }catch (err){
        next(err)
    }
});

module.exports = router;
