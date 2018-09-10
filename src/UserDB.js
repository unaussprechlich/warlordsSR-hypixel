"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.UserSchema = new mongoose.Schema({
    name: String,
    password: String
});
exports.UserModel = mongoose.model('User', exports.UserSchema);
