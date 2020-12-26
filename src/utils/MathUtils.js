"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vOr1 = exports.vOr0 = exports.round = void 0;
function round(zahl, n_stelle) {
    zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}
exports.round = round;
function vOr0(value) {
    if (!value || isNaN(value) || value < 0)
        return 0;
    return value;
}
exports.vOr0 = vOr0;
function vOr1(value) {
    if (!value || isNaN(value) || value <= 0)
        return 1;
    return value;
}
exports.vOr1 = vOr1;
//# sourceMappingURL=MathUtils.js.map