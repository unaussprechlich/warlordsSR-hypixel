"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerDB_1 = require("./PlayerDB");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const HypixelAPI = require("hypixel-api-typescript");
const Ranking = require("./Ranking");
const Cache = require("cache");
const Queue_1 = require("./Queue");
const Exceptions_1 = require("hypixel-api-typescript/src/Exceptions");
const SrCalculator_1 = require("./SrCalculator");
if (!process.env.API_KEY)
    throw "Missing Hypixel API-KEY, please provide it with the environment variable 'API_KEY'!";
const API_KEY = UUID_1.default.fromString(process.env.API_KEY);
const q = new Queue_1.Queue();
const INTERVAL_TIME = 5 * 1000;
const CACHE_TIME = 10 * 60 * 1000;
class PlayerCache {
    constructor() {
        this._cache = new Cache(CACHE_TIME);
        this._interval = setInterval(async () => {
            try {
                const playerDB = await PlayerDB_1.PlayerModel.aggregate([
                    { $sample: { size: 1 } },
                    { $project: { _id: 0, uuid: 1 } }
                ]).exec();
                const uuid = UUID_1.default.fromShortString(playerDB[0].uuid);
                const player = await this.get(uuid, false);
                console.log("[PlayerCache|RandomReload] " + player.data.uuid + " -> " + player.data.warlords_sr.SR + " SR");
            }
            catch (err) {
                console.error("[PlayerCache] something went wrong while reloading a random player: " + err);
            }
        }, INTERVAL_TIME);
    }
    async get(uuid, isHighPriority = true) {
        if (this._cache.get(uuid))
            return this._cache.get(uuid);
        else {
            const result = await Player.init(uuid, isHighPriority);
            this._cache.put(uuid, result);
            return result;
        }
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
    static async init(uuid, isHighPriority = false) {
        if (exports.defaultCache.contains(uuid))
            return exports.defaultCache.getDirect(uuid);
        const data = await PlayerDB_1.PlayerModel.findOne({ uuid: uuid.toShortString() }).exec();
        if (data && data.uuid == uuid.toShortString()) {
            const player = new Player(data);
            await player.reloadHypixelStats(isHighPriority);
            return player;
        }
        else {
            const hypixelPlayer = await Player.loadHypixelStats(uuid, isHighPriority);
            let model = new PlayerDB_1.PlayerModel({
                uuid: hypixelPlayer.uuid,
                name: hypixelPlayer.displayname,
                warlords: this.getWarlordsStatsFromHypixelStats(hypixelPlayer)
            });
            model = SrCalculator_1.calculateSR(model);
            await model.save();
            return new Player(model);
        }
    }
    get data() {
        return this._data;
    }
    async recalculateSr() {
        this._data = SrCalculator_1.calculateSR(this._data);
        await this._data.save();
        return this._data;
    }
    async getRanking() {
        return Ranking.defaultCache.get(this._data.uuid);
    }
    async reloadHypixelStats(isHighPriority) {
        const stats = await Player.loadHypixelStats(UUID_1.default.fromShortString(this._data.uuid), isHighPriority);
        this._data.name = stats.displayname;
        this._data.warlords = Player.getWarlordsStatsFromHypixelStats(stats);
        return await this.recalculateSr();
    }
    static getWarlordsStatsFromHypixelStats(hypixelPlayer) {
        if (!hypixelPlayer || !hypixelPlayer.stats)
            throw Exceptions_1.default.NULL_POINTER;
        return hypixelPlayer.stats.Battleground;
    }
    static async loadHypixelStats(uuid, isHighPriority) {
        return await q.add(async () => {
            return await HypixelAPI.getPlayerByUuid(uuid, API_KEY);
        }, {
            priority: isHighPriority ? 1 : 0,
            heat: 1,
            queueTimeout: isHighPriority ? 20 * 1000 : 10 * 1000,
            executionTimeout: isHighPriority ? 15 * 1000 : 5 * 1000
        });
    }
}
exports.Player = Player;
exports.defaultCache = new PlayerCache();
