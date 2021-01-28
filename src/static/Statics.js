"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVENANT = exports.DEFENDER = exports.BERSERKER = exports.EARTHWARDEN = exports.SPIRITGUARD = exports.THUNDERLORD = exports.PROTECTOR = exports.CRUSADER = exports.AVENGER = exports.AQUAMANCER = exports.CRYOMANCER = exports.PYROMANCER = exports.GAMES_PLAYED_TO_RANK = exports.AVERAGE_KDA = exports.INACTIVE_AFTER = exports.DISQUALIFY = void 0;
const Average_1 = require("./Average");
exports.DISQUALIFY = {
    MAX_WL: 5,
    PERCENT_LEFT: 4
};
exports.INACTIVE_AFTER = 1000 * 60 * 60 * 24 * 100;
const AVERAGE_KDA_RANKED_PLAYERS = 3.85;
const AVERAGE_KDA_ALL_PLAYERS = 2.67;
exports.AVERAGE_KDA = (AVERAGE_KDA_RANKED_PLAYERS + AVERAGE_KDA_ALL_PLAYERS) / 2.0;
exports.GAMES_PLAYED_TO_RANK = 30;
exports.PYROMANCER = new Average_1.Average(109706, 52789, 1);
exports.CRYOMANCER = new Average_1.Average(103596, 62240, 1);
exports.AQUAMANCER = new Average_1.Average(131094, 85777, 1);
exports.AVENGER = new Average_1.Average(113914, 55342, 1);
exports.CRUSADER = new Average_1.Average(114263, 77350, 1);
exports.PROTECTOR = new Average_1.Average(153370, 110251, 1);
exports.THUNDERLORD = new Average_1.Average(121714, 60644, 1);
exports.SPIRITGUARD = new Average_1.Average(152469, 92371, 1);
exports.EARTHWARDEN = new Average_1.Average(131804, 73295, 1);
exports.BERSERKER = new Average_1.Average(99964, 47507, 1);
exports.DEFENDER = new Average_1.Average(98341, 108285, 1);
exports.REVENANT = new Average_1.Average(150710, 100442, 1);
//# sourceMappingURL=Statics.js.map