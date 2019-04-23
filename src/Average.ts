export class Average{

    ADJUST : number;
    DHP : number;
    WL : number;
    LOWERBOUND : number;

    constructor(ADJUST: number, DHP: number, WL: number) {
        this.ADJUST = ADJUST;
        this.DHP = DHP;
        this.WL = WL;
    }
}

export const PYROMANCER = new Average(110, 103187, 1.76);
export const CRYOMANCER = new Average(90, 99546 , 2.77);
export const AQUAMANCER = new Average(135, 105896, 1.93);
export const AVENGER    = new Average(60, 104286, 2.21);
export const CRUSADER   = new Average(170, 93370 , 2.77);
export const PROTECTOR  = new Average(100, 127081, 2.02);
export const THUNDERLORD= new Average(155, 109217, 1.82);
export const SPIRITGUARD= new Average(155, 129217, 1.82);
export const EARTHWARDEN= new Average(85, 111751, 1.90);
export const BERSERKER  = new Average(10, 94848 , 2.65);
export const DEFENDER   = new Average(-10, 97136 , 2.54);
export const REVENANT   = new Average(100, 127081 , 2.02);