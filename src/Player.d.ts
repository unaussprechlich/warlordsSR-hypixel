import { IPlayer } from "./PlayerDB";
import UUID from "hypixel-api-typescript/src/UUID";
import * as Ranking from "./Ranking";
export declare class PlayerCache {
    _cache: any;
    get(uuid: UUID): Promise<Player>;
    getDirect(uuid: UUID): any;
    contains(uuid: UUID): boolean;
}
export declare class Player {
    private readonly _data;
    private constructor();
    static init(uuid: UUID): Promise<any>;
    readonly data: IPlayer;
    reloadStats(): Promise<IPlayer>;
    getRanking(): Promise<Ranking.Ranking>;
}
export declare const defaultCache: PlayerCache;
