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
exports.RankingCache = void 0;
const PlayerModel_1 = require("./db/PlayerModel");
const app_1 = require("../app");
const Statics_1 = require("./static/Statics");
const CACHE_TIME = 2 * 60 * 60;
class RankingCache {
    static get(uuid, reloadManually = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!reloadManually) {
                const cacheResult = yield app_1.redis.get(`wsr:rank:${uuid.toString()}`);
                if (cacheResult) {
                    console.info(`[WarlordsSR|RankingCache] hit for ${uuid}`);
                    return JSON.parse(cacheResult);
                }
            }
            const result = yield RankingCache.loadFromDatabase(uuid);
            yield app_1.redis.set(`wsr:rank:${uuid}`, JSON.stringify(result), ["EX", CACHE_TIME]);
            return result;
        });
    }
    static loadRankFromDatabase(srField, uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            let sortObj = {};
            sortObj[`warlords_sr.${srField}`] = -1;
            let matchObj = {};
            matchObj[`warlords_sr.${srField}`] = { $exists: true, $ne: null };
            matchObj[`$and`] = [
                { 'lastTimeRecalculated': { $exists: true } },
                { 'lastLogin': { $exists: true } },
                { 'lastTimeRecalculated': { $gt: Date.now() - Statics_1.INACTIVE_AFTER } },
                { 'lastLogin': { $gt: Date.now() - Statics_1.INACTIVE_AFTER } }
            ];
            const result = (yield PlayerModel_1.PlayerModel.aggregate([
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
            const [overall, paladin_overall, paladin_avenger, paladin_crusader, paladin_protector, warrior_overall, warrior_berserker, warrior_defender, warrior_revenant, mage_overall, mage_pyromancer, mage_cryomancer, mage_aquamancer, shaman_overall, shaman_thunderlord, shaman_spiritguard, shaman_earthwarden] = yield Promise.all([
                RankingCache.loadRankFromDatabase("SR", uuid),
                RankingCache.loadRankFromDatabase("paladin.SR", uuid),
                RankingCache.loadRankFromDatabase("paladin.avenger.SR", uuid),
                RankingCache.loadRankFromDatabase("paladin.crusader.SR", uuid),
                RankingCache.loadRankFromDatabase("paladin.protector.SR", uuid),
                RankingCache.loadRankFromDatabase("warrior.SR", uuid),
                RankingCache.loadRankFromDatabase("warrior.berserker.SR", uuid),
                RankingCache.loadRankFromDatabase("warrior.defender.SR", uuid),
                RankingCache.loadRankFromDatabase("warrior.revenant.SR", uuid),
                RankingCache.loadRankFromDatabase("mage.SR", uuid),
                RankingCache.loadRankFromDatabase("mage.pyromancer.SR", uuid),
                RankingCache.loadRankFromDatabase("mage.cryomancer.SR", uuid),
                RankingCache.loadRankFromDatabase("mage.aquamancer.SR", uuid),
                RankingCache.loadRankFromDatabase("shaman.SR", uuid),
                RankingCache.loadRankFromDatabase("shaman.thunderlord.SR", uuid),
                RankingCache.loadRankFromDatabase("shaman.spiritguard.SR", uuid),
                RankingCache.loadRankFromDatabase("shaman.earthwarden.SR", uuid),
            ]);
            return {
                overall: overall,
                paladin: {
                    overall: paladin_overall,
                    avenger: paladin_avenger,
                    crusader: paladin_crusader,
                    protector: paladin_protector,
                },
                warrior: {
                    overall: warrior_overall,
                    berserker: warrior_berserker,
                    defender: warrior_defender,
                    revenant: warrior_revenant,
                },
                mage: {
                    overall: mage_overall,
                    pyromancer: mage_pyromancer,
                    cryomancer: mage_cryomancer,
                    aquamancer: mage_aquamancer,
                },
                shaman: {
                    overall: shaman_overall,
                    thunderlord: shaman_thunderlord,
                    spiritguard: shaman_spiritguard,
                    earthwarden: shaman_earthwarden,
                }
            };
        });
    }
}
exports.RankingCache = RankingCache;
//# sourceMappingURL=Ranking.js.map