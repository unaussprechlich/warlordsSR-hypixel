"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerDB_1 = require("./PlayerDB");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const HypixelAPI = require("hypixel-api-typescript");
const Ranking = require("./Ranking");
const Cache = require("cache");
const Queue_1 = require("./Queue");
const Exceptions_1 = require("hypixel-api-typescript/src/Exceptions");
const API_KEY = UUID_1.default.fromString("0e867be9-477c-4b6f-8f58-7b3a035c7e0d");
const q = new Queue_1.Queue();
const INTERVAL_TIME = 5 * 1000;
const CACHE_TIME = 10 * 60 * 1000;
const REALDEAL_UUID = UUID_1.default.fromShortString("a0b2152f24a948ceb4f5c980b33939e7");
const ZWERGI_UUID = UUID_1.default.fromShortString("f144204d72de440799d4a1fbed50437b");
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
            const model = new PlayerDB_1.PlayerModel({
                uuid: hypixelPlayer.uuid,
                name: hypixelPlayer.displayname,
                warlords: this.getWarlordsStatsFromHypixelStats(hypixelPlayer)
            });
            await model.save();
            return new Player(model);
        }
    }
    get data() {
        return this._data;
    }
    async recalculateSr() {
        await this._data.save();
        return this._data;
    }
    async getRanking() {
        return Ranking.defaultCache.get(this._data.uuid);
    }
    async reloadHypixelStats(isHighPriority) {
        const stats = await Player.loadHypixelStats(UUID_1.default.fromShortString(this._data.uuid), isHighPriority);
        this._data.warlords = Player.getWarlordsStatsFromHypixelStats(stats);
        return await this.recalculateSr();
    }
    static getWarlordsStatsFromHypixelStats(hypixelPlayer) {
        if (!hypixelPlayer || !hypixelPlayer.stats)
            throw Exceptions_1.default.NULL_POINTER;
        return hypixelPlayer.stats.Battleground;
    }
    static async loadHypixelStats(uuid, isHighPriority) {
        if (uuid.toString() == REALDEAL_UUID.toString())
            uuid = ZWERGI_UUID;
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
