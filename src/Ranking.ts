import * as Cache from "cache";
import {PlayerModel} from "./PlayerDB";
import {redis} from "../app";
import UUID from "hypixel-api-typescript/src/UUID";

const CACHE_TIME = 24 * 60 * 60; // 24 hours

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
        spiritguard? : number
        earthwarden? : number
    }

    warrior? : {
        overall? : number
        berserker? : number
        defender? : number
        revenant? : number
    }
}

export class RankingCache{

    public static async get(uuid : UUID) : Promise<Ranking>{
        const cacheResult = await redis.get(`wsr:rank:${uuid.toString()}`)
        if(cacheResult){
            console.info(`[WarlordsSR|RankingCache] hit for ${uuid}`)
            return JSON.parse(cacheResult)
        } else{
            const result = await RankingCache.loadFromDatabase(uuid);
            await redis.set(`wsr:rank:${uuid}`, JSON.stringify(result), ["EX", CACHE_TIME])
            return result;
        }
    }

    private static async loadRankFromDatabase(srField : string, uuid : UUID){

        let sortObj = {};
        sortObj[`warlords_sr.${srField}`] = -1;

        let matchObj = {};
        matchObj[`warlords_sr.${srField}`] = {$exists : true, $ne: null};

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
                    "players.uuid": uuid.toShortString()
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

    private static async loadFromDatabase(uuid : UUID){
        return {
            overall : await RankingCache.loadRankFromDatabase("warlords_sr.SR", uuid),

            paladin : {
                overall : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.SR", uuid),
                avenger : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.avenger.SR", uuid),
                crusader : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.crusader.SR", uuid),
                protector : await RankingCache.loadRankFromDatabase("warlords_sr.paladin.protector.SR", uuid),
            },

            warrior : {
                overall : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.SR", uuid),
                berserker : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.berserker.SR", uuid),
                defender : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.defender.SR", uuid),
                revenant : await RankingCache.loadRankFromDatabase("warlords_sr.warrior.revenant.SR", uuid),
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
                spiritguard : await RankingCache.loadRankFromDatabase("warlords_sr.shaman.spiritguard.SR", uuid),
                earthwarden : await RankingCache.loadRankFromDatabase("warlords_sr.shaman.earthwarden.SR", uuid),
            }
        };
    }
}

export const defaultCache = new RankingCache();
