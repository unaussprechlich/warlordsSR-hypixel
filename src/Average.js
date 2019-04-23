"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Average {
    constructor(ADJUST, DHP, WL) {
        this.ADJUST = ADJUST;
        this.DHP = DHP;
        this.WL = WL;
    }
}
exports.Average = Average;
exports.PYROMANCER = new Average(110, 103187, 1.76);
exports.CRYOMANCER = new Average(90, 99546, 2.77);
exports.AQUAMANCER = new Average(135, 105896, 1.93);
exports.AVENGER = new Average(60, 104286, 2.21);
exports.CRUSADER = new Average(170, 93370, 2.77);
exports.PROTECTOR = new Average(100, 127081, 2.02);
exports.THUNDERLORD = new Average(155, 109217, 1.82);
exports.SPIRITGUARD = new Average(155, 129217, 1.82);
exports.EARTHWARDEN = new Average(85, 111751, 1.90);
exports.BERSERKER = new Average(10, 94848, 2.65);
exports.DEFENDER = new Average(-10, 97136, 2.54);
exports.REVENANT = new Average(100, 127081, 2.02);
