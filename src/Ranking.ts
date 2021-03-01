import {PlayerModel} from "./db/PlayerModel";
import {redis} from "../app";
import UUID from "hypixel-api-typescript/src/UUID";
import {INACTIVE_AFTER} from "./static/Statics";

const CACHE_TIME = 2 * 60 * 60; // 2 hours

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

    /**
     * Loads the latest rank if not in cache.
     * The RankingCache does not contain any manual reload logic. Use Player.getRanking() instead.
     * @param uuid
     * @param reloadManually
     */
    public static async get(uuid : UUID, reloadManually : boolean = false) : Promise<Ranking>{
        if(!reloadManually){
            const cacheResult = await redis.get(`wsr:rank:${uuid.toString()}`)
            if(cacheResult) {
                console.info(`[WarlordsSR|RankingCache] hit for ${uuid}`)
                return JSON.parse(cacheResult)
            }
        }

        const result = await RankingCache.loadFromDatabase(uuid);
        await redis.set(`wsr:rank:${uuid}`, JSON.stringify(result), ["EX", CACHE_TIME])
        return result;
    }

    private static async loadRankFromDatabase(srField : string, uuid : UUID){

        let sortObj = {};
        sortObj[`warlords_sr.${srField}`] = -1;

        let matchObj = {};
        matchObj[`warlords_sr.${srField}`] = {$exists : true, $ne: null};

        //Filter out inactive players
        matchObj[`$or`] = [{
            $and: [
                {'lastTimeRecalculated': {$exists: false}},
                {'lastLogin': {$exists: false}}
            ]
            }, {
            $and: [
                {'lastTimeRecalculated': {$exists: true}},
                {'lastLogin': {$exists: true}},
                {'lastTimeRecalculated': {$gt: Date.now() - INACTIVE_AFTER}},
                {'lastLogin': {$gt: Date.now() - INACTIVE_AFTER}}
            ]}
        ]

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

        //Be careful! Don't swap any names!
        const [
            overall,
            paladin_overall,
            paladin_avenger,
            paladin_crusader,
            paladin_protector,
            warrior_overall,
            warrior_berserker,
            warrior_defender,
            warrior_revenant,
            mage_overall,
            mage_pyromancer,
            mage_cryomancer,
            mage_aquamancer,
            shaman_overall,
            shaman_thunderlord,
            shaman_spiritguard,
            shaman_earthwarden
        ] = await  Promise.all([
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
        ])

        return  {
            overall : overall,
            paladin : {
                overall : paladin_overall,
                avenger : paladin_avenger ,
                crusader : paladin_crusader,
                protector : paladin_protector,
            },
            warrior : {
                overall : warrior_overall,
                berserker : warrior_berserker,
                defender : warrior_defender,
                revenant : warrior_revenant,
            },
            mage : {
                overall : mage_overall,
                pyromancer : mage_pyromancer,
                cryomancer : mage_cryomancer,
                aquamancer : mage_aquamancer,
            },
            shaman : {
                overall : shaman_overall,
                thunderlord : shaman_thunderlord,
                spiritguard : shaman_spiritguard,
                earthwarden : shaman_earthwarden,
            }
        };
    }
}
