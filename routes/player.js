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
const router = express.Router();
const Player_1 = require("../src/Player");
const http_status_codes_1 = require("http-status-codes");
const MinecraftApiCached = require("../src/utils/MinecraftApiRedisCached");
const UUID_1 = require("../src/utils/UUID");
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();
router.get('/*', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = req.baseUrl.split("/");
            if (!url[2])
                throw {
                    message: "You did not Provide a UUID or Username!",
                    status: http_status_codes_1.StatusCodes.BAD_REQUEST
                };
            let uuid;
            if (url[2] === "uuid" && url[3]) {
                uuid = UUID_1.stringToUuid(url[3]);
            }
            else if (minecraftPlayernamePattern.test(url[2])) {
                uuid = yield MinecraftApiCached.uuidForName(url[2]);
            }
            else {
                throw {
                    message: "The requested path is no Username or UUID!",
                    status: http_status_codes_1.StatusCodes.BAD_REQUEST
                };
            }
            const player = yield Player_1.default.init(uuid, false, req.query.reload === "true");
            if (player == null)
                throw {
                    message: "Player with UUID:" + uuid.toString() + " not found!",
                    status: http_status_codes_1.StatusCodes.NOT_FOUND
                };
            const [ranking, nameHistory, reloadCooldown] = yield Promise.all([
                player.getRanking(),
                player.getNameHistoryString(),
                player.getManualReloadCooldown()
            ]);
            if (req.query.reload === "true") {
                res.redirect(req.baseUrl);
            }
            else {
                res.render('player', {
                    PAGE_TITLE: "Player | " + player.data.name,
                    PLAYER: player.data,
                    RANKING: ranking,
                    NAME_HISTORY: nameHistory,
                    RELOAD_COOLDOWN: reloadCooldown,
                    MANUAL_RELOAD_COOLDOWN_TIME: Player_1.MANUAL_RELOAD_COOLDOWN_TIME
                });
            }
        }
        catch (err) {
            next(err);
        }
    });
});
module.exports = router;
//# sourceMappingURL=player.js.map