import * as express from 'express'
const router = express.Router();
import {Player} from "../src/Player";

/* GET home page. */
router.get('/', async function(req, res, next) {
    try{
        res.render('index', { PAGE_TITLE: 'WarlordsSR'});
    }catch (err){
        next(err)
    }
});

module.exports = router;
