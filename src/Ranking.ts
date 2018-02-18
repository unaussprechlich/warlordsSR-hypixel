import * as Cache from "cache";
import {PlayerModel} from "./PlayerDB";

export interface Ranking{
    overall? : number

    paladin? : {
        overall? : number
        avenger? : number
        crusader? : number
        protector? : number
    }

    mage? : {
        overall? : number
        pyromancer? : number
        cryomancer? : number
        aquamancer? : number
    }

    shaman? : {
        overall? : number
        thunderlord? : number
        earthwarden? : number
    }

    warrior? : {
        overall? : number
        berserker? : number
        defender? : number
    }
}

export class RankingCache{

    _cache = new Cache(15 * 60 * 1000);

    async get(uuid : String) : Promise<Ranking>{
        if(this._cache.get(uuid)) return this._cache.get(uuid);
        else{
            const result = await RankingCache.loadFromDatabase(uuid);
            this._cache.put(uuid, result);
            return result;
        }
    }

    private static async loadRankFromDatabase(srField : string, uuid : String){

        let sortObj = {};
        sortObj[srField] = -1;

        let matchObj = {};
        matchObj[srField] = {$exists : true, $ne: null};

        const result = (await PlayerModel.aggregate([
            {
                $match : matchObj
            },
            {
                $sort: sortObj
            },
            {
                $group: {
                    _id : false,
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
                $project : {
                    _id : 0,
                    rank : {$sum : ["$ranking", 1]}
                }
            }
        ]))[0];

        if(result) return result.rank;
        else return null;
    }

    private static async loadFromDatabase(uuid : String){
        return {
            overall : await RankingCache.loadRankFromDatabase("warlords_sr.SR", uuid),

            paladin : {
                overall : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.SR", uuid),
                avenger : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.avenger.SR", uuid),
                crusader : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.protector.SR", uuid),
                protector : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.crusader.SR", uuid),
            },

            warrior : {
                overall : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.SR", uuid),
                berserker : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.berserker.SR", uuid),
                defender : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.defender.SR", uuid),
            },
            mage : {
                overall : await RankingCache.loadRankFromDatabase("warlords_sr.mage.SR", uuid),
                pyromancer : await RankingCache.loadRankFromDatabase("warlords_sr.mage.pyromancer.SR", uuid),
                cryomancer : await RankingCache.loadRankFromDatabase("warlords_sr.mage.cryomancer.SR", uuid),
                aquamancer : await RankingCache.loadRankFromDatabase("warlords_sr.mage.aquamancer.SR", uuid),
            },
            shaman : {
                overall : await RankingCache.loadRankFromDatabase("warlords_sr.shaman.SR", uuid),
                thunderlord : await RankingCache.loadRankFromDatabase("warlords_sr.shaman.thunderlord.SR", uuid),
                earthwarden : await RankingCache.loadRankFromDatabase("warlords_sr.shaman.earthwarden.SR", uuid),
            }
        };
    }
}

export const defaultCache = new RankingCache();