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
const PlayerDB_1 = require("./PlayerDB");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const HypixelAPI = require("hypixel-api-typescript");
const Ranking = require("./Ranking");
const Cache = require("cache");
const API_KEY = UUID_1.default.fromString("0e867be9-477c-4b6f-8f58-7b3a035c7e0d");
class PlayerCache {
    constructor() {
        this._cache = new Cache(5 * 60 * 1000);
    }
    get(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._cache.get(uuid))
                return this._cache.get(uuid);
            else {
                const result = yield Player.init(uuid);
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
    static init(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (exports.defaultCache.contains(uuid))
                return exports.defaultCache.getDirect(uuid);
            const data = yield PlayerDB_1.PlayerModel.findOne({ uuid: uuid.toShortString() }).exec();
            if (data && data.uuid == uuid.toShortString())
                return new Player(data);
            const hypixelPlayer = yield HypixelAPI.getPlayerByUuid(uuid, API_KEY);
            if (!hypixelPlayer)
                throw "[HypixelAPI] EMPTY RESPONSE";
            if (!hypixelPlayer.stats)
                throw "[HypixelAPI] empty STATS";
            if (!hypixelPlayer.stats.Battleground)
                throw "[HypixelAPI] empty stats for BATTLEGROUND(Warlords)";
            const model = new PlayerDB_1.PlayerModel({
                uuid: hypixelPlayer.uuid,
                name: hypixelPlayer.displayname,
                warlords: hypixelPlayer.stats.Battleground
            });
            yield model.save();
            return new Player(model);
        });
    }
    get data() {
        return this._data;
    }
    reloadStats() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._data.save();
            return this._data;
        });
    }
    getRanking() {
        return __awaiter(this, void 0, void 0, function* () {
            return Ranking.defaultCache.get(this._data.uuid);
        });
    }
}
exports.Player = Player;
exports.defaultCache = new PlayerCache();
