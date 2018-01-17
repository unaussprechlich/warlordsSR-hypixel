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
const router = express.Router();
const Player_1 = require("../src/Player");
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
router.get('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.query.uuid == null)
                throw "No UUID provided!";
            if (!uuidShortPattern.test(req.query.uuid))
                throw "Misformatted UUID!";
            const players = yield Player_1.Player.find({ uuid: req.query.uuid }).limit(1).lean(true);
            if (players == null || players[0] == null)
                throw "Player with UUID:" + req.query.uuid + " not found!";
            res.render('player', { PAGE_TITLE: players[0].name + '|WarlordsSR', PLAYER: players[0] });
        }
        catch (err) {
            next(err);
        }
    });
});
module.exports = router;
