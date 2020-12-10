"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSR = void 0;
const MathUtils_1 = require("./utils/MathUtils");
const Warlords_1 = require("./Warlords");
const Average = require("./Average");
const DISQUALIFY = {
    MAX_WL: 5,
    PERCENT_LEFT: 5
};
const AVERAGE_KDA = 5;
const GAMES_PLAYED_TO_RANK = 50;
function calculateSR(player) {
    const stats = player.warlords;
    const sr = Warlords_1.newWarlordsSr();
    try {
        sr.KD = calculateKD(stats.kills, stats.deaths);
        sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);
        sr.plays = MathUtils_1.vOr0(stats.mage_plays) + MathUtils_1.vOr0(stats.paladin_plays) + MathUtils_1.vOr0(stats.shaman_plays) + MathUtils_1.vOr0(stats.warrior_plays);
        sr.WL = calculateWL(stats.wins, sr.plays);
        stats.losses = sr.plays - MathUtils_1.vOr0(stats.wins);
        sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);
        for (const warlord of Warlords_1.WARLORDS) {
            stats["losses_" + warlord.name] = MathUtils_1.vOr0(stats[warlord.name + "_plays"]) - MathUtils_1.vOr0(stats["wins_" + warlord.name]);
            sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].LEVEL = calculateLevel(warlord.name, stats);
            sr[warlord.name].WINS = MathUtils_1.vOr0(stats["wins_" + warlord.name]);
            for (const spec of warlord.specs) {
                stats["losses_" + spec] = MathUtils_1.vOr0(stats[spec + "_plays"]) - MathUtils_1.vOr0(stats["wins_" + spec]);
                sr[warlord.name][spec].WL = calculateWL(stats["wins_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].DHP = calculateDHP(stats["damage_" + spec], stats["heal_" + spec], stats["damage_prevented_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].SR = calculateSr(sr[warlord.name][spec].DHP, stats[spec + "_plays"], sr[warlord.name][spec].WL, sr.KDA, Average[spec.toLocaleUpperCase()], sr.plays, stats.penalty);
                sr[warlord.name][spec].WINS = stats["wins_" + spec];
            }
        }
        sr.mage.SR = Math.round((MathUtils_1.vOr0(sr.mage.pyromancer.SR) + MathUtils_1.vOr0(sr.mage.aquamancer.SR) + MathUtils_1.vOr0(sr.mage.cryomancer.SR)) / 3);
        sr.paladin.SR = Math.round((MathUtils_1.vOr0(sr.paladin.avenger.SR) + MathUtils_1.vOr0(sr.paladin.crusader.SR) + MathUtils_1.vOr0(sr.paladin.protector.SR)) / 3);
        sr.shaman.SR = Math.round((MathUtils_1.vOr0(sr.shaman.thunderlord.SR) + MathUtils_1.vOr0(sr.shaman.spiritguard.SR) + MathUtils_1.vOr0(sr.shaman.earthwarden.SR)) / 3);
        sr.warrior.SR = Math.round((MathUtils_1.vOr0(sr.warrior.berserker.SR) + MathUtils_1.vOr0(sr.warrior.defender.SR) + MathUtils_1.vOr0(sr.warrior.revenant.SR)) / 3);
        if (sr.mage.SR == 0)
            sr.mage.SR = null;
        if (sr.paladin.SR == 0)
            sr.paladin.SR = null;
        if (sr.shaman.SR == 0)
            sr.shaman.SR = null;
        if (sr.warrior.SR == 0)
            sr.warrior.SR = null;
        sr.SR = Math.round(((MathUtils_1.vOr0(sr.paladin.SR) + MathUtils_1.vOr0(sr.mage.SR) + MathUtils_1.vOr0(sr.shaman.SR) + MathUtils_1.vOr0(sr.warrior.SR)) / 4));
        if (sr.SR == 0)
            sr.SR = null;
    }
    catch (e) {
        console.error(e);
    }
    player.warlords_sr = sr;
    return player;
}
exports.calculateSR = calculateSR;
function calculateLevel(warlord, stats) {
    return MathUtils_1.vOr0(stats[warlord + "_skill1"])
        + MathUtils_1.vOr0(stats[warlord + "_skill2"])
        + MathUtils_1.vOr0(stats[warlord + "_skill3"])
        + MathUtils_1.vOr0(stats[warlord + "_skill4"])
        + MathUtils_1.vOr0(stats[warlord + "_skill5"])
        + MathUtils_1.vOr0(stats[warlord + "_cooldown"])
        + MathUtils_1.vOr0(stats[warlord + "_critchance"])
        + MathUtils_1.vOr0(stats[warlord + "_critmultiplier"])
        + MathUtils_1.vOr0(stats[warlord + "_energy"])
        + MathUtils_1.vOr0(stats[warlord + "_health"]);
}
function calculateSr(dhp, specPlays, wl, kda, average, plays, penalty) {
    if (dhp == null || specPlays == null || plays == null || wl == null || kda == null || specPlays < GAMES_PLAYED_TO_RANK)
        return null;
    if (disqualify(dhp, specPlays, wl, kda, average, plays, penalty))
        return null;
    const dhpAdjusted = adjust_dhp(dhp, average.DHP);
    const wlAdjusted = adjust_wl(wl, average.WL);
    const kdaAdjusted = adjust_dhp(kda, AVERAGE_KDA);
    const SR = Math.round((dhpAdjusted + wlAdjusted + (kdaAdjusted / 2)) * (1000 + average.ADJUST));
    if (SR <= 0)
        return null;
    else
        return SR;
}
function disqualify(dhp, specPlays, wl, kda, average, plays, penalty) {
    if (wl > DISQUALIFY.MAX_WL)
        return true;
    if (penalty == null)
        penalty = 0;
    if ((penalty / plays) * 100 >= 5)
        return true;
    return false;
}
function adjust_wl(v, averageRatio) {
    v = v * 2 + 0.027 - (averageRatio - 1);
    if (v > 2.027)
        return Math.cos(((v + 3) / Math.PI) + Math.PI) + 1;
    else if (v <= 0.027)
        return 0;
    else
        return Math.tan((v - 3) / Math.PI) - 0.35 + 1;
}
function calculateWL(wins, plays) {
    return MathUtils_1.round(MathUtils_1.vOr0(wins) / MathUtils_1.vOr1(MathUtils_1.vOr0(plays) - MathUtils_1.vOr0(wins)), 100);
}
function adjust_dhp(v, average) {
    const x = v / average;
    if (x >= 2)
        return 2;
    else if (x <= 0)
        return 0;
    else
        return Math.cos((x * Math.PI) / 2 + Math.PI) + 1;
}
function calculateDHP(dmg, heal, prevented, plays) {
    return Math.round((MathUtils_1.vOr0(dmg) + MathUtils_1.vOr0(heal) + MathUtils_1.vOr0(prevented)) / MathUtils_1.vOr1(plays));
}
function calculateKD(kills, deaths) {
    return MathUtils_1.round(MathUtils_1.vOr0(kills) / MathUtils_1.vOr1(deaths), 100);
}
function calculateKDA(kills, deaths, assists) {
    return MathUtils_1.round((MathUtils_1.vOr0(kills) + MathUtils_1.vOr0(assists)) / MathUtils_1.vOr1(deaths), 100);
}
//# sourceMappingURL=SrCalculator.js.map