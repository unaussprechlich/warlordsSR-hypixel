"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVENANT = exports.DEFENDER = exports.BERSERKER = exports.EARTHWARDEN = exports.SPIRITGUARD = exports.THUNDERLORD = exports.PROTECTOR = exports.CRUSADER = exports.AVENGER = exports.AQUAMANCER = exports.CRYOMANCER = exports.PYROMANCER = exports.Average = void 0;
class Average {
    constructor(ADJUST, DHP, WL) {
        this.ADJUST = ADJUST;
        this.DHP = DHP;
        this.WL = WL;
    }
}
exports.Average = Average;
exports.PYROMANCER = new Average(0, 90000, 1);
exports.CRYOMANCER = new Average(0, 90000, 1);
exports.AQUAMANCER = new Average(0, 100000, 1);
exports.AVENGER = new Average(0, 90000, 1);
exports.CRUSADER = new Average(0, 90000, 1);
exports.PROTECTOR = new Average(0, 100000, 1);
exports.THUNDERLORD = new Average(0, 90000, 1);
exports.SPIRITGUARD = new Average(0, 100000, 1);
exports.EARTHWARDEN = new Average(0, 100000, 1);
exports.BERSERKER = new Average(0, 90000, 1);
exports.DEFENDER = new Average(0, 90000, 1);
exports.REVENANT = new Average(0, 90000, 1);
//# sourceMappingURL=Average.js.map