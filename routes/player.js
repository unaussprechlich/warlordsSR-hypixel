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
const MinecraftAPI = require("minecraft-api");
const Player = require("../src/Player");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();
router.get('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.query.uuid == null && req.query.name == null)
                throw "No query provided!";
            let uuid;
            if (req.query.uuid == null && req.query.name != null) {
                if (!minecraftPlayernamePattern.test(req.query.name))
                    throw "Misformatted NAME!";
                uuid = yield MinecraftAPI.uuidForName(req.query.name);
            }
            else if (req.query.uuid != null) {
                if (!uuidShortPattern.test(req.query.uuid))
                    throw "Misformatted UUID!";
                uuid = req.query.uuid;
            }
            else {
                throw "Your query has to contain a name or uuid field!";
            }
            const player = yield Player.defaultCache.get(UUID_1.default.fromShortString(uuid));
            const ranking = yield player.getRanking();
            if (player == null)
                throw "Player with UUID:" + req.query.uuid + " not found!";
            res.render('player', {
                PAGE_TITLE: player.data.name + '|WarlordsSR',
                PLAYER: player.data,
                RANKING: ranking
            });
        }
        catch (err) {
            next(err);
        }
    });
});
module.exports = router;
