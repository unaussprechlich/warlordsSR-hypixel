import * as express from 'express'
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    try{
        res.render('index', { PAGE_TITLE: 'WarlordsSR'});
    }catch (err){
        next(err)
    }
});

module.exports = router;
