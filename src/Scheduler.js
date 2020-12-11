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
exports.init = void 0;
const scheduler = require("node-schedule");
const PlayerDB_1 = require("./PlayerDB");
function init() {
    scheduler.scheduleJob("0 0 * * *", removeAllZeNons);
    console.info("Scheduler | started!");
    removeAllZeNons().catch(console.error);
}
exports.init = init;
function removeAllZeNons() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield PlayerDB_1.PlayerModel.deleteMany({ "warlords_sr.plays": { $lt: 10 } });
            console.info("Scheduler | " + result.deletedCount + " Nons have been deleted :)");
        }
        catch (e) {
            console.error(e);
        }
    });
}
//# sourceMappingURL=Scheduler.js.map