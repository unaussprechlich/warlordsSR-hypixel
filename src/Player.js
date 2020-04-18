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
const PlayerDB_1 = require("./PlayerDB");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const HypixelAPI = require("hypixel-api-typescript");
const Ranking = require("./Ranking");
const Cache = require("cache");
const Queue_1 = require("./Queue");
const Exceptions_1 = require("hypixel-api-typescript/src/Exceptions");
const SrCalculator_1 = require("./SrCalculator");
const MinecraftAPI = require("minecraft-api/index");
if (!process.env.API_KEY)
    throw "Missing Hypixel API-KEY, please provide it with the environment variable 'API_KEY'!";
const API_KEY = UUID_1.default.fromString(process.env.API_KEY);
const q = new Queue_1.Queue();
const INTERVAL_TIME = 5 * 1000;
const CACHE_TIME = 10 * 60 * 1000;
class PlayerCache {
    constructor() {
        this._cache = new Cache(CACHE_TIME);
        this._interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const playerDB = yield PlayerDB_1.PlayerModel.aggregate([
                    { $sample: { size: 1 } },
                    { $project: { _id: 0, uuid: 1 } }
                ]).exec();
                const uuid = UUID_1.default.fromShortString(playerDB[0].uuid);
                const player = yield this.get(uuid, false);
                console.log("[PlayerCache|RandomReload] " + player.data.uuid + " -> " + player.data.warlords_sr.SR + " SR");
            }
            catch (err) {
                console.error("[PlayerCache] something went wrong while reloading a random player: " + err);
            }
        }), INTERVAL_TIME);
    }
    get(uuid, isHighPriority = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._cache.get(uuid))
                return this._cache.get(uuid);
            else {
                const result = yield Player.init(uuid, isHighPriority);
                this._cache.put(uuid, result);
                return result;
            }
        });
    }
    getDirect(uuid) {
        return this._cache.get(uuid);
    }
    contains(uuid) {
        return this._cache.get(uuid) != null;
    }
}
exports.PlayerCache = PlayerCache;
class Player {
    constructor(data) {
        this._data = data;
    }
    static init(uuid, isHighPriority = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (exports.defaultCache.contains(uuid))
                return exports.defaultCache.getDirect(uuid);
            const data = yield PlayerDB_1.PlayerModel.findOne({ uuid: uuid.toShortString() }).exec();
            if (data && data.uuid == uuid.toShortString()) {
                const player = new Player(data);
                yield player.reloadHypixelStats(isHighPriority);
                return player;
            }
            else {
                const hypixelPlayer = yield Player.loadHypixelStats(uuid, isHighPriority);
                let model = new PlayerDB_1.PlayerModel({
                    uuid: hypixelPlayer.uuid,
                    name: hypixelPlayer.displayname,
                    warlords: this.getWarlordsStatsFromHypixelStats(hypixelPlayer)
                });
                model = yield SrCalculator_1.calculateSR(model);
                yield model.save();
                return new Player(model);
            }
        });
    }
    get data() {
        return this._data;
    }
    recalculateSr() {
        return __awaiter(this, void 0, void 0, function* () {
            this._data = yield SrCalculator_1.calculateSR(this._data);
            yield this._data.save();
            return this._data;
        });
    }
    getNameHistoryString() {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.getNameHistory();
            if (!history || history.length === 0)
                return null;
            let result = "";
            for (let item of [...new Set(history.filter(v => v.name !== this._data.name).map(v => v.name))]) {
                result += item + " | ";
            }
            return result.substring(0, result.length - 3);
        });
    }
    getNameHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._nameHistory)
                return this._nameHistory;
            const history = yield MinecraftAPI.nameHistoryForUuid(this._data.uuid.toString());
            this._nameHistory = history;
            return history;
        });
    }
    getRanking() {
        return __awaiter(this, void 0, void 0, function* () {
            return Ranking.defaultCache.get(this._data.uuid);
        });
    }
    reloadHypixelStats(isHighPriority) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield Player.loadHypixelStats(UUID_1.default.fromShortString(this._data.uuid), isHighPriority);
            this._data.name = stats.displayname;
            this._data.warlords = Player.getWarlordsStatsFromHypixelStats(stats);
            return yield this.recalculateSr();
        });
    }
    static getWarlordsStatsFromHypixelStats(hypixelPlayer) {
        if (!hypixelPlayer || !hypixelPlayer.stats)
            throw Exceptions_1.default.NOT_FOUND;
        return hypixelPlayer.stats.Battleground;
    }
    static loadHypixelStats(uuid, isHighPriority) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield q.add(() => __awaiter(this, void 0, void 0, function* () {
                return yield HypixelAPI.getPlayerByUuid(uuid, API_KEY);
            }), {
                priority: isHighPriority ? 1 : 0,
                heat: 1,
                queueTimeout: isHighPriority ? 20 * 1000 : 10 * 1000,
                executionTimeout: isHighPriority ? 15 * 1000 : 5 * 1000
            });
        });
    }
}
exports.Player = Player;
exports.defaultCache = new PlayerCache();
//# sourceMappingURL=Player.js.map