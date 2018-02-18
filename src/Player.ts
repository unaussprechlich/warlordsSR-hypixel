import {IPlayer, PlayerModel} from "./PlayerDB";
import UUID from "hypixel-api-typescript/src/UUID";
import * as HypixelAPI from "hypixel-api-typescript";
import * as Ranking from "./Ranking";
import * as Cache from "cache";

const API_KEY = UUID.fromString("0e867be9-477c-4b6f-8f58-7b3a035c7e0d");

export class PlayerCache{

    _cache = new Cache(5 * 60 * 1000);

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

    static async init(uuid : UUID){
        if(defaultCache.contains(uuid)) return defaultCache.getDirect(uuid);

        const data = await PlayerModel.findOne({uuid : uuid.toShortString()}).exec();
        if(data && data.uuid == uuid.toShortString()) return new Player(data);

        const hypixelPlayer = await HypixelAPI.getPlayerByUuid(uuid, API_KEY);

        if(!hypixelPlayer) throw "[HypixelAPI] EMPTY RESPONSE";
        if(!hypixelPlayer.stats) throw "[HypixelAPI] empty STATS";
        if(!hypixelPlayer.stats.Battleground) throw "[HypixelAPI] empty stats for BATTLEGROUND(Warlords)";

        const model = new PlayerModel({
            uuid: hypixelPlayer.uuid,
            name : hypixelPlayer.displayname,

            warlords : hypixelPlayer.stats.Battleground
        });

        await model.save();

        return new Player(model);
    }

    get data(){
        return this._data;
    }

    async reloadStats(){
        await this._data.save();
        return this._data;
    }

    async getRanking() {
        return Ranking.defaultCache.get(this._data.uuid)
    }
}

export const defaultCache = new PlayerCache();


