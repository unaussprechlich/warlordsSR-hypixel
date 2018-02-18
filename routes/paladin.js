"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const PlayerDB_1 = require("../src/PlayerDB");
const router = express.Router();
router.get('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const players = yield PlayerDB_1.PlayerModel.find({}, { name: 1, uuid: 1, warlords_sr: 1 }).sort({ "warlords_sr.paladin.SR": -1 }).limit(1000).lean(true);
            res.render('paladin', { PAGE_TITLE: 'Paladin|WarlordsSR', PLAYERS: players });
        }
        catch (err) {
            next(err);
        }
    });
});
module.exports = router;
