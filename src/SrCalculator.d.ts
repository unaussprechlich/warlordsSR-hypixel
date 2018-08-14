import { IPlayer, IWarlordsSR } from "./PlayerDB";
export declare function loadAverage(players: IPlayer[]): Promise<void>;
export declare function calculateSR(player: IPlayer): IWarlordsSR;
