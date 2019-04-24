"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const SrCalculator = require("./SrCalculator");
const PlayerSchema_1 = require("./PlayerSchema");
exports.PlayerModel = mongoose.model('Player', PlayerSchema_1.PlayerSchema);
PlayerSchema_1.PlayerSchema.pre('save', function (next) {
    const result = SrCalculator.calculateSR(this);
    this.warlords_sr = result.warlords_sr;
    this.warlords = result.warlords;
    next();
});
