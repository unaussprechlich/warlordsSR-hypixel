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
const MinecraftAPI = require("minecraft-api");
const Player = require("../src/Player");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const HttpStatusCodes = require("http-status-codes");
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const uuidLongPatter = RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();
router.get('/*', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = req.baseUrl.split("/");
            if (!url[2])
                throw {
                    message: "You did not Provide a UUID or Username!",
                    status: HttpStatusCodes.BAD_REQUEST,
                    apiError: true
                };
            let uuid;
            if (url[2] === "uuid" && url[3]) {
                if (uuidShortPattern.test(url[3])) {
                    uuid = UUID_1.default.fromShortString(url[3]);
                }
                else if (uuidLongPatter.test(url[3])) {
                    uuid = UUID_1.default.fromString(url[3]);
                }
                else {
                    return next({
                        message: "Can't parse UUID!",
                        status: HttpStatusCodes.BAD_REQUEST,
                        apiError: true
                    });
                }
            }
            else if (minecraftPlayernamePattern.test(url[2])) {
                const uuid_string = yield MinecraftAPI.uuidForName(url[2]);
                if (!uuid_string)
                    throw {
                        message: "Player with NAME:" + url[2].toString() + " not found!",
                        status: HttpStatusCodes.NOT_FOUND,
                        apiError: true
                    };
                uuid = UUID_1.default.fromString(uuid_string);
            }
            else {
                throw {
                    message: "The requested path is no Username or UUID!",
                    status: HttpStatusCodes.BAD_REQUEST,
                    apiError: true
                };
            }
            const player = yield Player.defaultCache.get(uuid);
            if (player == null) {
                throw {
                    message: "Player with UUID:" + uuid.toString() + " not found!",
                    status: HttpStatusCodes.NOT_FOUND,
                    apiError: true
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
                    name_history: nameHistory
                }
            });
        }
        catch (err) {
            if (err.apiError) {
                next(err);
            }
            else {
                next({
                    message: "Internal Server Error!",
                    status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                    apiError: true
                });
            }
        }
    });
});
module.exports = router;
//# sourceMappingURL=api.js.map