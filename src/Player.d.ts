import { IPlayer, IWarlordsHypixelAPI } from "./PlayerDB";
import UUID from "hypixel-api-typescript/src/UUID";
import * as HypixelAPI from "hypixel-api-typescript";
import * as Ranking from "./Ranking";
export declare class PlayerCache {
    private _cache;
    private _interval;
    constructor();
    get(uuid: UUID): Promise<Player>;
    getDirect(uuid: UUID): any;
    contains(uuid: UUID): boolean;
}
export declare class Player {
    private readonly _data;
    private constructor();
    static init(uuid: UUID): Promise<Player>;
    readonly data: IPlayer;
    recalculateSr(): Promise<IPlayer>;
    getRanking(): Promise<Ranking.Ranking>;
    reloadHypixelStats(): Promise<IPlayer>;
    static getWarlordsStatsFromHypixelStats(hypixelPlayer: HypixelAPI.Player): IWarlordsHypixelAPI;
    static loadHypixelStats(uuid: UUID): Promise<HypixelAPI.Player>;
}
export declare const defaultCache: PlayerCache;
