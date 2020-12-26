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
exports.init = void 0;
const scheduler = require("node-schedule");
const PlayerModel_1 = require("../db/PlayerModel");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const app_1 = require("../../app");
const Player_1 = require("../Player");
function init() {
    scheduler.scheduleJob("0 0 * * *", removeAllZeNons);
    console.info("Scheduler | started!");
    removeAllZeNons().catch(console.error);
    startRandomReloadInterval();
}
exports.init = init;
function removeAllZeNons() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield PlayerModel_1.PlayerModel.deleteMany({ "warlords_sr.plays": { $lt: 10 } });
            console.info("Scheduler | " + result.deletedCount + " Nons have been deleted :)");
        }
        catch (e) {
            console.error(e);
        }
    });
}
function startRandomReloadInterval() {
    const INTERVAL_TIME = 10 * 1000;
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        try {
            if (process.env.NO_AUTO_UPDATE)
                return;
            const uuid = UUID_1.default.fromShortString(((yield PlayerModel_1.PlayerModel.aggregate([
                { $match: { "warlords_sr.SR": { $exists: true, $ne: null } } },
                { $sample: { size: 1 } },
                { $project: { _id: 0, uuid: 1 } }
            ]).exec())[0]).uuid);
            const cacheResult = yield app_1.redis.get(`wsr:${uuid.toShortString()}`);
            if (cacheResult) {
                console.log("[PlayerCache|RandomReload] " + uuid.toString() + " -> ALREADY_IN_CACHE");
                return;
            }
            const player = yield Player_1.default.init(uuid);
            console.log("[PlayerCache|RandomReload] " + uuid.toString() + " -> " + player.data.warlords_sr.SR + " SR");
        }
        catch (err) {
            console.error("[PlayerCache] something went wrong while reloading a random player: " + err);
        }
    }), INTERVAL_TIME);
}
//# sourceMappingURL=Scheduler.js.map