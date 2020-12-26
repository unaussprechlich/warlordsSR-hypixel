import {IPlayer, IWarlordsHypixelAPI, PlayerModel} from "./db/PlayerModel";
import UUID from "hypixel-api-typescript/src/UUID";
import * as HypixelAPI from "hypixel-api-typescript";
import {Queue} from "./utils/Queue";
import Exception from "hypixel-api-typescript/src/Exceptions";
import {calculateStatsAndSR} from "./SrCalculator";
import * as MinecraftApiCached from "./utils/MinecraftApiRedisCached";
import * as MinecraftAPI from "minecraft-api/index";
import {redis} from "../app";
import {stringToUuid} from "./utils/UUID";
import {RankingCache} from "./Ranking";

if (!process.env.API_KEY) throw "Missing Hypixel API-KEY, please provide it with the environment variable 'API_KEY'!";
const API_KEY = UUID.fromString(process.env.API_KEY);
const q = new Queue();

const CACHE_TIME = 12 * 60 * 60; // 12 hours
export const MANUAL_RELOAD_COOLDOWN_TIME = 15 * 60; // 15 min

interface IRedisPlayer {
    data: IPlayer
    nameHistory?: Array<MinecraftAPI.NameHistoryResponseModel>
}

export default class Player {

    private readonly _uuid: UUID;
    private _data: IPlayer;
    private _nameHistory?: Array<MinecraftAPI.NameHistoryResponseModel>

    private constructor(data: IPlayer, nameHistory?: Array<MinecraftAPI.NameHistoryResponseModel>) {
        this._data = data;
        this._uuid = stringToUuid(data.uuid.toString())
    }

    public static async init(uuid: UUID, isHighPriority: boolean = false, shouldReloadIfNotOnCooldown: boolean = false): Promise<Player> {

        const cacheResult = await this.loadFromRedis(uuid)

        if (cacheResult) {
            if (!shouldReloadIfNotOnCooldown) {
                console.info(`[WarlordsSR|PlayerCache] hit for ${uuid.toShortString()}`)
                return cacheResult;
            } else {
                const shouldReload = await cacheResult.shouldReloadManually()
                if (!shouldReload) {
                    console.info(`[WarlordsSR|PlayerCache] hit for ${uuid.toShortString()}`)
                    return cacheResult;
                }
            }
        }

        const data = await PlayerModel.findOne({uuid: uuid.toShortString()}).exec();

        let player: Player;

        if (data && data.uuid == uuid.toShortString()) {
            player = new Player(data);
            await player.reloadHypixelStats(isHighPriority);
        } else {
            const hypixelPlayer = await Player.loadHypixelStats(uuid, isHighPriority);
            const warlordsStats = this.getWarlordsStatsFromHypixelStats(hypixelPlayer);

            let model = new PlayerModel({
                uuid: uuid.toShortString(),
                name: hypixelPlayer.displayname,
                warlords: warlordsStats
            });

            model = await calculateStatsAndSR(model);

            await model.save();
            player = new Player(model);
        }

        await player.getNameHistory()
        await player.saveToRedis()

        return player;
    }

    public get uuid() {
        return this._uuid
    }

    private static async loadFromRedis(uuid: UUID): Promise<Player | undefined> {
        const result = await redis.get(`wsr:${uuid.toString()}`)

        if (result) {
            const redisPlayer = JSON.parse(result) as IRedisPlayer
            return new Player(redisPlayer.data, redisPlayer.nameHistory)
        } else {
            return undefined
        }
    }

    private async saveToRedis(overrideCacheTime?: number) {
        if (this.data?.warlords_sr?.SR !== null && this.data.warlords_sr.SR > 0) {
            console.info(`SETTING RELOAD TIME FOR ${this.uuid.toShortString()}`)
            await redis.set(`wsr:reloadcooldown:${this.uuid.toShortString()}`,
                Date.now().toString()
                , ["EX", MANUAL_RELOAD_COOLDOWN_TIME])
        }
        await redis.set(`wsr:${this.uuid.toString()}`, JSON.stringify({
            data: this._data,
            nameHistory: this._nameHistory || null
        }), ["EX", overrideCacheTime ? overrideCacheTime : CACHE_TIME])
    }

    get data() {
        return this._data;
    }


    async recalculateSr() {
        this._data = await calculateStatsAndSR(this._data);
        await this._data.save();
        return this._data;
    }

    async getNameHistoryString() {
        const history = await this.getNameHistory();
        if (!history || history.length === 0) return null;
        let result = "";
        for (let item of [...new Set(history.filter(v => v.name !== this._data.name).map(v => v.name))]) {
            result += item + " | "
        }
        return result.substring(0, result.length - 3)
    }

    async getNameHistory() {
        if (this._nameHistory) return this._nameHistory;
        return MinecraftApiCached.nameHistoryForUuid(this.uuid);
    }

    async getRanking(checkForManualReload: boolean = false) {
        if (checkForManualReload) {
            return RankingCache.get(this.uuid, await this.shouldReloadManually())
        }
        return RankingCache.get(this.uuid)
    }

    async reloadHypixelStats(isHighPriority: boolean) {
        const stats = await Player.loadHypixelStats(this.uuid, isHighPriority);
        this._data.name = stats.displayname;
        this._data.warlords = Player.getWarlordsStatsFromHypixelStats(stats);
        return await this.recalculateSr();
    }

    static getWarlordsStatsFromHypixelStats(hypixelPlayer: HypixelAPI.Player) {
        if (!hypixelPlayer || !hypixelPlayer.stats) throw Exception.NOT_FOUND;
        return hypixelPlayer.stats.Battleground as IWarlordsHypixelAPI;
    }

    async getManualReloadCooldown() {
        return redis.get(`wsr:reloadcooldown:${this.uuid.toShortString()}`)
    }

    private async shouldReloadManually() {
        if (this.data.warlords_sr.SR == null || this.data.warlords_sr.SR <= 0)
            return false
        const reloadCooldown = await this.getManualReloadCooldown()
        return reloadCooldown == null
    }

    static async loadHypixelStats(uuid: UUID, isHighPriority: boolean) {
        return await q.add(async () => {
            return await HypixelAPI.getPlayerByUuid(uuid, API_KEY);
        }, {
            priority: isHighPriority ? 1 : 0,
            heat: 1,
            queueTimeout: isHighPriority ? 20 * 1000 : 10 * 1000,
            executionTimeout: isHighPriority ? 15 * 1000 : 5 * 1000
        });
    }
};
