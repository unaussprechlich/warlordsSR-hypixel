"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateSR = void 0;
const SrCalculator_1 = require("../SrCalculator");
const PlayerModel_1 = require("../db/PlayerModel");
function recalculateSR() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Recalculating SR ...");
        const projectedPlayers = yield PlayerModel_1.PlayerModel.find({}, { uuid: 1 });
        console.log("Players found:" + projectedPlayers.length);
        let count = 0;
        function recalculate(projectedPlayer) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let player = yield PlayerModel_1.PlayerModel.findOne({ uuid: projectedPlayer.uuid });
                    if (player != null) {
                        player = SrCalculator_1.calculateStatsAndSR(player);
                        yield player.save();
                        count++;
                        console.log("[Reloading|" + Math.round((count / projectedPlayers.length) * 100) + "%] " + player.name + " -> " + player.warlords_sr.SR + " SR");
                    }
                }
                catch (e) {
                    console.error(e);
                }
            });
        }
        for (let i = 0; i < projectedPlayers.length; i = i + 20) {
            yield Promise.all([
                recalculate(projectedPlayers[i]),
                recalculate(projectedPlayers[i + 1]),
                recalculate(projectedPlayers[i + 2]),
                recalculate(projectedPlayers[i + 3]),
                recalculate(projectedPlayers[i + 4]),
                recalculate(projectedPlayers[i + 5]),
                recalculate(projectedPlayers[i + 6]),
                recalculate(projectedPlayers[i + 7]),
                recalculate(projectedPlayers[i + 8]),
                recalculate(projectedPlayers[i + 9]),
                recalculate(projectedPlayers[i + 10]),
                recalculate(projectedPlayers[i + 11]),
                recalculate(projectedPlayers[i + 12]),
                recalculate(projectedPlayers[i + 13]),
                recalculate(projectedPlayers[i + 14]),
                recalculate(projectedPlayers[i + 15]),
                recalculate(projectedPlayers[i + 16]),
                recalculate(projectedPlayers[i + 17]),
                recalculate(projectedPlayers[i + 18]),
                recalculate(projectedPlayers[i + 19])
            ]);
        }
    });
}
exports.recalculateSR = recalculateSR;
//# sourceMappingURL=SrRecalculator.js.map