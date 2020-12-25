"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVENANT = exports.DEFENDER = exports.BERSERKER = exports.EARTHWARDEN = exports.SPIRITGUARD = exports.THUNDERLORD = exports.PROTECTOR = exports.CRUSADER = exports.AVENGER = exports.AQUAMANCER = exports.CRYOMANCER = exports.PYROMANCER = exports.Average = void 0;
class Average {
    constructor(ADJUST, DHP_RELVANT_PLAYER, DHP_ALL_PLAYERS, WL) {
        this.DHP_ALL_PLAYERS = DHP_ALL_PLAYERS;
        this.DHP_RELVANT_PLAYER = DHP_RELVANT_PLAYER;
        this.ADJUST = ADJUST;
        this.DHP = Math.round((DHP_ALL_PLAYERS + DHP_RELVANT_PLAYER) / 2.0);
        this.WL = WL;
    }
}
exports.Average = Average;
exports.PYROMANCER = new Average(0, 97695, 52789, 1);
exports.CRYOMANCER = new Average(0, 93835, 62240, 1);
exports.AQUAMANCER = new Average(0, 119562, 85777, 1);
exports.AVENGER = new Average(0, 101711, 55342, 1);
exports.CRUSADER = new Average(0, 104832, 77350, 1);
exports.PROTECTOR = new Average(0, 142710, 110251, 1);
exports.THUNDERLORD = new Average(0, 107874, 60644, 1);
exports.SPIRITGUARD = new Average(0, 133380, 92371, 1);
exports.EARTHWARDEN = new Average(0, 119167, 73295, 1);
exports.BERSERKER = new Average(0, 88993, 47507, 1);
exports.DEFENDER = new Average(0, 90839, 108285, 1);
exports.REVENANT = new Average(0, 135250, 100442, 1);
//# sourceMappingURL=Average.js.map