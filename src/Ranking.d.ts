export interface Ranking {
    overall?: number;
    paladin?: {
        overall?: number;
        avenger?: number;
        crusader?: number;
        protector?: number;
    };
    mage?: {
        overall?: number;
        pyromancer?: number;
        cryomancer?: number;
        aquamancer?: number;
    };
    shaman?: {
        overall?: number;
        thunderlord?: number;
        earthwarden?: number;
    };
    warrior?: {
        overall?: number;
        berserker?: number;
        defender?: number;
    };
}
export declare class RankingCache {
    _cache: any;
    get(uuid: String): Promise<Ranking>;
    private static loadRankFromDatabase;
    private static loadFromDatabase;
}
export declare const defaultCache: RankingCache;
