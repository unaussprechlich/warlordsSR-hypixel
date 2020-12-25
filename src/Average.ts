export class Average{

    ADJUST : number;
    DHP_RELVANT_PLAYER : number;
    DHP_ALL_PLAYERS : number;
    WL : number;
    DHP : number;

    constructor(ADJUST: number, DHP_RELVANT_PLAYER: number, DHP_ALL_PLAYERS: number,  WL: number) {
        this.DHP_ALL_PLAYERS = DHP_ALL_PLAYERS;
        this.DHP_RELVANT_PLAYER = DHP_RELVANT_PLAYER;
        this.ADJUST = ADJUST;
        this.DHP = Math.round((DHP_ALL_PLAYERS + DHP_RELVANT_PLAYER) / 2.0);
        this.WL = WL;
    }
}

export const PYROMANCER = new Average(0, 97695, 52789, 1);
export const CRYOMANCER = new Average(0, 93835 , 62240, 1);
export const AQUAMANCER = new Average(0, 119562, 85777,1);
export const AVENGER    = new Average(0, 101711, 55342,1);
export const CRUSADER   = new Average(0, 104832 , 77350,1);
export const PROTECTOR  = new Average(0, 142710, 110251,1);
export const THUNDERLORD= new Average(0, 107874, 60644,1);
export const SPIRITGUARD= new Average(0, 133380, 92371,1);
export const EARTHWARDEN= new Average(0, 119167, 73295,1);
export const BERSERKER  = new Average(0, 88993 , 47507,1);
export const DEFENDER   = new Average(0, 90839 , 108285,1);
export const REVENANT   = new Average(0, 135250, 100442,1);
