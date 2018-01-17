import * as express from 'express'
const router = express.Router();
import {Player} from "../src/Player";

const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();

/* GET home page. */
router.get('/', async function(req, res, next) {
    try{
        if(req.query.uuid == null) throw "No UUID provided!";
        if(!uuidShortPattern.test(req.query.uuid)) throw "Misformatted UUID!";

        const players = await Player.find({uuid : req.query.uuid}).limit(1).lean(true);
        if(players == null || players[0] == null) throw "Player with UUID:" + req.query.uuid + " not found!";
        res.render('player', { PAGE_TITLE: players[0].name + '|WarlordsSR', PLAYER : players[0] });
    }catch (err){
        next(err)
    }
});

module.exports = router;
