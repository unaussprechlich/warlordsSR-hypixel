"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function round(zahl, n_stelle) {
    zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}
exports.round = round;
function vOr0(value) {
    if (value == null)
        return 0;
    return value;
}
exports.vOr0 = vOr0;
function adjust_1_wl(v, averageRatio) {
    const adjust = 2 - averageRatio;
    if (v > 10)
        return 1.8;
    else if (v > 2)
        return Math.cos(((v + adjust) / Math.PI) + Math.PI) + 0.8;
    else if (v <= adjust || v <= 0)
        return 0;
    else
        return Math.log10(v + 0.5 + adjust) - 0.398;
}
exports.adjust_1_wl = adjust_1_wl;
function adjustV(valuePerGame, average) {
    return log10_x2(Math.log2((valuePerGame / average) + 1)) + 1;
}
exports.adjustV = adjustV;
function av10(valuePerGame, average) {
    const adjust = adjustV(valuePerGame, average);
    if (adjust <= 0)
        return null;
    return valuePerGame * adjust;
}
exports.av10 = av10;
function av2(valuePerGame, average) {
    return log10_1At1(valuePerGame / average);
}
exports.av2 = av2;
function log10_1At1(value) {
    return Math.log10(value + 0.5) - 0.176;
}
exports.log10_1At1 = log10_1At1;
function log10_x2(value) {
    return Math.log10(value * value);
}
exports.log10_x2 = log10_x2;
