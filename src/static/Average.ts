export class Average{

    DHP_RELVANT_PLAYERS : number;
    DHP_ALL_PLAYERS : number;
    WL : number;
    DHP : number;

    constructor(DHP_RELVANT_PLAYERS: number, DHP_ALL_PLAYERS: number,  WL: number) {
        this.DHP_ALL_PLAYERS = DHP_ALL_PLAYERS;
        this.DHP_RELVANT_PLAYERS = DHP_RELVANT_PLAYERS;
        this.DHP = DHP_RELVANT_PLAYERS;
        this.WL = WL;
    }
}

