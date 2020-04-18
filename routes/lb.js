"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const PlayerDB_1 = require("../src/PlayerDB");
const Warlords_1 = require("../src/Warlords");
const Cache = require("cache");
const router = express.Router();
const cache = new Cache(5 * 60 * 1000);
router.get('/*', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = req.baseUrl.split("/");
            const clazz = url[2] && Warlords_1.CLAZZES.indexOf(url[2].toLowerCase()) >= 0 ? url[2].toLowerCase() : null;
            const specsOfClazz = clazz ? Warlords_1.WARLORDS[Warlords_1.CLAZZES.indexOf(clazz)].specs : null;
            const spec = clazz && url[3] && specsOfClazz && specsOfClazz.indexOf(url[3].toLowerCase()) >= 0 ? url[3].toLowerCase() : null;
            function loadLb(sortBy) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (cache.get(sortBy))
                        return cache.get(sortBy);
                    const lb = yield PlayerDB_1.PlayerModel.find({ [sortBy]: { $exists: true } }, { name: 1, uuid: 1, warlords_sr: 1 }).sort("-" + sortBy).limit(1000).lean(true);
                    cache.put(sortBy, lb);
                    return lb;
                });
            }
            const players = yield loadLb("warlords_sr." + (clazz ? (spec ? clazz + "." + spec + "." : clazz + ".") : "") + "SR");
            res.render('lb', {
                PAGE_TITLE: "LB | " + capitalizeFirstLetter(clazz ? (spec ? spec : clazz) : "General"),
                CLAZZ: clazz,
                CLAZZES: Warlords_1.CLAZZES,
                SPEC: spec,
                SPECS: specsOfClazz,
                PLAYERS: players
            });
        }
        catch (err) {
            next(err);
            console.error(err);
        }
    });
});
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
module.exports = router;
//# sourceMappingURL=lb.js.map