export class Average{

    ADJUST : number;
    DHP : number;
    WL : number;

    constructor(ADJUST: number, DHP: number, WL: number) {
        this.ADJUST = ADJUST;
        this.DHP = DHP;
        this.WL = WL;
    }
}

export const PYROMANCER = new Average(0, 90000, 1);
export const CRYOMANCER = new Average(0, 90000 , 1);
export const AQUAMANCER = new Average(0, 90000, 1);
export const AVENGER    = new Average(0, 90000, 1);
export const CRUSADER   = new Average(0, 90000 , 1);
export const PROTECTOR  = new Average(0, 90000, 1);
export const THUNDERLORD= new Average(0, 90000, 1);
export const SPIRITGUARD= new Average(0, 90000, 1);
export const EARTHWARDEN= new Average(0, 90000, 1);
export const BERSERKER  = new Average(0, 90000 , 1);
export const DEFENDER   = new Average(0, 90000 , 1);
export const REVENANT   = new Average(0, 90000, 1);
