import {IPlayer, IWarlordsHypixelAPI, PlayerModel} from "./PlayerDB";
import UUID from "hypixel-api-typescript/src/UUID";
import * as HypixelAPI from "hypixel-api-typescript";
import * as Ranking from "./Ranking";
import * as Cache from "cache";
import {Queue} from "./Queue";
import Exception from "hypixel-api-typescript/src/Exceptions";

const API_KEY = UUID.fromString("0e867be9-477c-4b6f-8f58-7b3a035c7e0d");
const q = new Queue();
const INTERVAL_TIME = 5 * 1000; //5 sec
const CACHE_TIME = 5 * 60 * 1000; // 5 min

const REALDEAL_UUID = UUID.fromShortString("a0b2152f24a948ceb4f5c980b33939e7");
const ZWERGI_UUID = UUID.fromShortString("f144204d72de440799d4a1fbed50437b");

export class PlayerCache{

    private _cache = new Cache(CACHE_TIME);
    private _interval;

    constructor(){
        this._interval = setInterval(async () => {
            try{

                const playerDB = await PlayerModel.aggregate([
                    { $sample: { size: 1 } },
                    { $project: {_id : 0, uuid : 1}}
                ]).exec() ;

                const uuid = UUID.fromShortString(playerDB[0].uuid);
                const player = await this.get(uuid);

                console.log("[PlayerCache|RandomReload] " + player.data.uuid + " -> " + player.data.warlords_sr.SR + " SR");

            } catch(err){
                console.error("[PlayerCache] something went wrong while reloading a random player: " + err);
            }
        }, INTERVAL_TIME)
    }

    async get(uuid : UUID) : Promise<Player>{
        if(this._cache.get(uuid)) return this._cache.get(uuid);
        else{
            const result = await Player.init(uuid);
            this._cache.put(uuid, result);
            return result;
        }
    }

    getDirect(uuid : UUID){
        return this._cache.get(uuid);
    }

    contains(uuid : UUID){
        return this._cache.get(uuid) != null;
    }
}

export class Player{

    private readonly _data : IPlayer;

    private constructor(data : IPlayer){
        this._data = data;
    }

    static async init(uuid : UUID) : Promise<Player>{
        if(defaultCache.contains(uuid)) return defaultCache.getDirect(uuid);

        const data = await PlayerModel.findOne({uuid : uuid.toShortString()}).exec();

        if(data && data.uuid == uuid.toShortString()){
            const player = new Player(data);
            await player.reloadHypixelStats()
            return player;
        } else {
            const hypixelPlayer = await Player.loadHypixelStats(uuid);

            const model = new PlayerModel({
                uuid: hypixelPlayer.uuid,
                name : hypixelPlayer.displayname,
                warlords : this.getWarlordsStatsFromHypixelStats(hypixelPlayer)
            });

            await model.save();
            return new Player(model);
        }
    }

    get data(){
        return this._data;
    }

    async recalculateSr(){
        await this._data.save();
        return this._data;
    }

    async getRanking() {
        return Ranking.defaultCache.get(this._data.uuid)
    }

    async reloadHypixelStats(){
        const stats = await Player.loadHypixelStats(UUID.fromShortString(this._data.uuid as string));
        this._data.warlords = Player.getWarlordsStatsFromHypixelStats(stats);
        return await this.recalculateSr();
    }

    static getWarlordsStatsFromHypixelStats(hypixelPlayer : HypixelAPI.Player){
        if(!hypixelPlayer || !hypixelPlayer.stats) throw Exception.NULL_POINTER;
        return hypixelPlayer.stats.Battleground as IWarlordsHypixelAPI;
    }

    static async loadHypixelStats(uuid : UUID){
        if(uuid.toString() == REALDEAL_UUID.toString())
            uuid = ZWERGI_UUID;
        return await q.add(async () => {
            return await HypixelAPI.getPlayerByUuid(uuid, API_KEY);
        }, {
            heat : 1,
            queueTimeout : 5 * 1000
        });
    }
}

export const defaultCache = new PlayerCache();
