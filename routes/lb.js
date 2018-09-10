"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const PlayerDB_1 = require("../src/PlayerDB");
const SrCalculator_1 = require("../src/SrCalculator");
const router = express.Router();
router.get('/*', async function (req, res, next) {
    try {
        const url = req.baseUrl.split("/");
        const clazz = url[2] && SrCalculator_1.CLAZZES.indexOf(url[2].toLowerCase()) >= 0 ? url[2].toLowerCase() : null;
        const specsOfClazz = clazz ? SrCalculator_1.WARLORDS[SrCalculator_1.CLAZZES.indexOf(clazz)].specs : null;
        const spec = clazz && url[3] && specsOfClazz && specsOfClazz.indexOf(url[3].toLowerCase()) >= 0 ? url[3].toLowerCase() : null;
        const sortBY = "warlords_sr." + (clazz ? (spec ? clazz + "." + spec + "." : clazz + ".") : "") + "SR";
        console.log(sortBY);
        const players = await PlayerDB_1.PlayerModel.find({}, { name: 1, uuid: 1, warlords_sr: 1 }).sort("-" + sortBY).limit(1000).lean(true);
        res.render('lb', {
            PAGE_TITLE: "LB | " + capitalizeFirstLetter(clazz ? (spec ? spec : clazz) : "General"),
            CLAZZ: clazz,
            CLAZZES: SrCalculator_1.CLAZZES,
            SPEC: spec,
            SPECS: specsOfClazz,
            PLAYERS: players
        });
    }
    catch (err) {
        next(err);
    }
});
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
module.exports = router;
