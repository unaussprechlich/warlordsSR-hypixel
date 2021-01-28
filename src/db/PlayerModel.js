"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerModel = void 0;
const mongoose = require("mongoose");
const PlayerSchema_1 = require("./PlayerSchema");
const Statics_1 = require("../static/Statics");
exports.PlayerModel = mongoose.model('Player', PlayerSchema_1.PlayerSchema);
exports.PlayerModel.schema.virtual("isInactive").get(function () {
    return (this.lastLogin && this.lastLogin < Date.now() - Statics_1.INACTIVE_AFTER)
        || (this.lastTimeRecalculated && this.lastTimeRecalculated < Date.now() - Statics_1.INACTIVE_AFTER);
});
//# sourceMappingURL=PlayerModel.js.map