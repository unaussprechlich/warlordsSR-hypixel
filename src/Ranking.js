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
exports.defaultCache = exports.RankingCache = void 0;
const PlayerDB_1 = require("./PlayerDB");
const app_1 = require("../app");
const CACHE_TIME = 24 * 60 * 60;
class RankingCache {
    static get(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheResult = yield app_1.redis.get(`wsr:rank:${uuid.toString()}`);
            if (cacheResult) {
                console.info(`[WarlordsSR|RankingCache] hit for ${uuid}`);
                return JSON.parse(cacheResult);
            }
            else {
                const result = yield RankingCache.loadFromDatabase(uuid);
                yield app_1.redis.set(`wsr:rank:${uuid}`, JSON.stringify(result), ["EX", CACHE_TIME]);
                return result;
            }
        });
    }
    static loadRankFromDatabase(srField, uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            let sortObj = {};
            sortObj[`warlords_sr.${srField}`] = -1;
            let matchObj = {};
            matchObj[`warlords_sr.${srField}`] = { $exists: true, $ne: null };
            const result = (yield PlayerDB_1.PlayerModel.aggregate([
                {
                    $match: matchObj
                },
                {
                    $sort: sortObj
                },
                {
                    $group: {
                        _id: false,
                        players: {
                            $push: {
                                uuid: "$uuid"
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$players",
                        includeArrayIndex: "ranking"
                    }
                },
                {
                    $match: {
                        "players.uuid": uuid.toShortString()
                    }
                },
                {
                    $project: {
                        _id: 0,
                        rank: { $sum: ["$ranking", 1] }
                    }
                }
            ]))[0];
            if (result)
                return result.rank;
            else
                return null;
        });
    }
    static loadFromDatabase(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                overall: yield RankingCache.loadRankFromDatabase("warlords_sr.SR", uuid),
                paladin: {
                    overall: yield RankingCache.loadRankFromDatabase("warlords_sr.paladin.SR", uuid),
                    avenger: yield RankingCache.loadRankFromDatabase("warlords_sr.paladin.avenger.SR", uuid),
                    crusader: yield RankingCache.loadRankFromDatabase("warlords_sr.paladin.crusader.SR", uuid),
                    protector: yield RankingCache.loadRankFromDatabase("warlords_sr.paladin.protector.SR", uuid),
                },
                warrior: {
                    overall: yield RankingCache.loadRankFromDatabase("warlords_sr.warrior.SR", uuid),
                    berserker: yield RankingCache.loadRankFromDatabase("warlords_sr.warrior.berserker.SR", uuid),
                    defender: yield RankingCache.loadRankFromDatabase("warlords_sr.warrior.defender.SR", uuid),
                    revenant: yield RankingCache.loadRankFromDatabase("warlords_sr.warrior.revenant.SR", uuid),
                },
                mage: {
                    overall: yield RankingCache.loadRankFromDatabase("warlords_sr.mage.SR", uuid),
                    pyromancer: yield RankingCache.loadRankFromDatabase("warlords_sr.mage.pyromancer.SR", uuid),
                    cryomancer: yield RankingCache.loadRankFromDatabase("warlords_sr.mage.cryomancer.SR", uuid),
                    aquamancer: yield RankingCache.loadRankFromDatabase("warlords_sr.mage.aquamancer.SR", uuid),
                },
                shaman: {
                    overall: yield RankingCache.loadRankFromDatabase("warlords_sr.shaman.SR", uuid),
                    thunderlord: yield RankingCache.loadRankFromDatabase("warlords_sr.shaman.thunderlord.SR", uuid),
                    spiritguard: yield RankingCache.loadRankFromDatabase("warlords_sr.shaman.spiritguard.SR", uuid),
                    earthwarden: yield RankingCache.loadRankFromDatabase("warlords_sr.shaman.earthwarden.SR", uuid),
                }
            };
        });
    }
}
exports.RankingCache = RankingCache;
exports.defaultCache = new RankingCache();
//# sourceMappingURL=Ranking.js.map