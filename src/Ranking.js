"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cache = require("cache");
const PlayerDB_1 = require("./PlayerDB");
class RankingCache {
    constructor() {
        this._cache = new Cache(15 * 60 * 1000);
    }
    async get(uuid) {
        if (this._cache.get(uuid))
            return this._cache.get(uuid);
        else {
            const result = await RankingCache.loadFromDatabase(uuid);
            this._cache.put(uuid, result);
            return result;
        }
    }
    static async loadRankFromDatabase(srField, uuid) {
        let sortObj = {};
        sortObj[srField] = -1;
        let matchObj = {};
        matchObj[srField] = { $exists: true, $ne: null };
        const result = (await PlayerDB_1.PlayerModel.aggregate([
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
                    "players.uuid": uuid
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
    }
    static async loadFromDatabase(uuid) {
        return {
            overall: await RankingCache.loadRankFromDatabase("warlords_sr.SR", uuid),
            paladin: {
                overall: await RankingCache.loadRankFromDatabase("warlords_sr.paladin.SR", uuid),
                avenger: await RankingCache.loadRankFromDatabase("warlords_sr.paladin.avenger.SR", uuid),
                crusader: await RankingCache.loadRankFromDatabase("warlords_sr.paladin.crusader.SR", uuid),
                protector: await RankingCache.loadRankFromDatabase("warlords_sr.paladin.protector.SR", uuid),
            },
            warrior: {
                overall: await RankingCache.loadRankFromDatabase("warlords_sr.warrior.SR", uuid),
                berserker: await RankingCache.loadRankFromDatabase("warlords_sr.warrior.berserker.SR", uuid),
                defender: await RankingCache.loadRankFromDatabase("warlords_sr.warrior.defender.SR", uuid),
                revenant: await RankingCache.loadRankFromDatabase("warlords_sr.warrior.revenant.SR", uuid),
            },
            mage: {
                overall: await RankingCache.loadRankFromDatabase("warlords_sr.mage.SR", uuid),
                pyromancer: await RankingCache.loadRankFromDatabase("warlords_sr.mage.pyromancer.SR", uuid),
                cryomancer: await RankingCache.loadRankFromDatabase("warlords_sr.mage.cryomancer.SR", uuid),
                aquamancer: await RankingCache.loadRankFromDatabase("warlords_sr.mage.aquamancer.SR", uuid),
            },
            shaman: {
                overall: await RankingCache.loadRankFromDatabase("warlords_sr.shaman.SR", uuid),
                thunderlord: await RankingCache.loadRankFromDatabase("warlords_sr.shaman.thunderlord.SR", uuid),
                spiritguard: await RankingCache.loadRankFromDatabase("warlords_sr.shaman.spiritguard.SR", uuid),
                earthwarden: await RankingCache.loadRankFromDatabase("warlords_sr.shaman.earthwarden.SR", uuid),
            }
        };
    }
}
exports.RankingCache = RankingCache;
exports.defaultCache = new RankingCache();
