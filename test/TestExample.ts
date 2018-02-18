import { expect } from 'chai';
import {Ranking, RankingCache} from "../src/Ranking";
import { suite, test, slow, timeout } from "mocha-typescript";
import * as mongoose from "mongoose"
import {Player} from "./PlayerDB";
require("mongoose").Promise = global.Promise;

mongoose.connect('mongodb://localhost/hypixel');


const UUID_STR = '4064d7ecc2124a1cb252ecc0403a2824';
const UUID_STR_2 = "5df8ba4c27964b0d9815a237c0aeb9bb";

@suite class TestExample{



    @test("INIT")
    public async init(){
        try{
            const result = await Player.findOne({uuid : UUID_STR}).exec();
            return Promise.resolve(result);
        }catch (err){
            return Promise.reject(err)
        }

    }


    @test("AGGREGATION", timeout(1000 * 20))
    public async testAggregation(){
        try{

            const result : Ranking= {
                overall : await this.loadRankFromDatabase("warlords_sr.SR"),

                paladin : {
                    overall : await this.loadRankFromDatabase("warlords_sr.paladin.SR"),
                    avenger : await this.loadRankFromDatabase("warlords_sr.paladin.avenger.SR"),
                    crusader : await this.loadRankFromDatabase("warlords_sr.paladin.protector.SR"),
                    protector : await this.loadRankFromDatabase("warlords_sr.paladin.crusader.SR"),
                },

                warrior : {
                    overall : await this.loadRankFromDatabase("warlords_sr.warrior.SR"),
                    berserker : await this.loadRankFromDatabase("warlords_sr.warrior.berserker.SR"),
                    defender : await this.loadRankFromDatabase("warlords_sr.warrior.defender.SR"),
                },
                mage : {
                    overall : await this.loadRankFromDatabase("warlords_sr.mage.SR"),
                    pyromancer : await this.loadRankFromDatabase("warlords_sr.mage.pyromancer.SR"),
                    cryomancer : await this.loadRankFromDatabase("warlords_sr.mage.cryomancer.SR"),
                    aquamancer : await this.loadRankFromDatabase("warlords_sr.v.aquamancer.SR"),
                },
                shaman : {
                    overall : await this.loadRankFromDatabase("warlords_sr.shaman.SR"),
                    thunderlord : await this.loadRankFromDatabase("warlords_sr.shaman.thunderlord.SR"),
                    earthwarden : await this.loadRankFromDatabase("warlords_sr.v.earthwarden.SR"),
                }
            };


            console.log(JSON.stringify(result));
            return Promise.resolve(result);
        }catch (err){
            return Promise.reject(err)
        }

    }

    public async loadRankFromDatabase(srField : string){

        let sortObj = {};
        sortObj[srField] = -1;

        let matchObj = {};
        matchObj[srField] = {$exists : true};

        const result = (await Player.aggregate([
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
                    "players.uuid": UUID_STR_2
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
}
