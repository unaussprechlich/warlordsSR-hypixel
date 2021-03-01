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
const MinecraftApiCached = require("./../src/utils/MinecraftApiRedisCached");
const Player_1 = require("../src/Player");
const http_status_codes_1 = require("http-status-codes");
const UUID_1 = require("../src/utils/UUID");
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();
router.get('/*', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = req.baseUrl.split("/");
            if (!url[2])
                throw {
                    message: "You did not Provide a UUID or Username!",
                    status: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    apiError: true
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
            const player = yield Player_1.default.init(uuid, false, true);
            if (player == null) {
                throw {
                    message: "Player with UUID:" + uuid.toString() + " not found!",
                    status: http_status_codes_1.StatusCodes.NOT_FOUND
                };
            }
            const [ranking, nameHistory] = yield Promise.all([
                player.getRanking(),
                player.getNameHistory()
            ]);
            res.status(200).json({
                success: true,
                data: {
                    playername: player.data.name,
                    uuid: player.data.uuid,
                    warlords_sr: player.data.warlords_sr,
                    warlords_hypixel: player.data.warlords,
                    ranking: ranking,
                    name_history: nameHistory,
                    isInactive: player.isInactive
                }
            });
        }
        catch (err) {
            if (err.apiError || err.status === http_status_codes_1.StatusCodes.BAD_REQUEST || err.status === http_status_codes_1.StatusCodes.NOT_FOUND) {
                err.apiError = true;
                next(err);
            }
            else {
                console.error(err);
                next({
                    message: "Internal Server Error!",
                    status: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                    apiError: true
                });
            }
        }
    });
});
module.exports = router;
//# sourceMappingURL=api.js.map