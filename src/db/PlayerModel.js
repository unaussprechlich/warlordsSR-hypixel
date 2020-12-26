"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModel = void 0;
const mongoose = require("mongoose");
const PlayerSchema_1 = require("./PlayerSchema");
exports.PlayerModel = mongoose.model('Player', PlayerSchema_1.PlayerSchema);
//# sourceMappingURL=PlayerModel.js.map