"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStatsAndSR = void 0;
const MathUtils_1 = require("./utils/MathUtils");
const Warlords_1 = require("./static/Warlords");
const Statics = require("./static/Statics");
function calculateStatsAndSR(player, forceRecalculate = false) {
    const stats = player.warlords;
    const sr = Warlords_1.newWarlordsSr();
    try {
        sr.plays = MathUtils_1.vOr0(stats.mage_plays) + MathUtils_1.vOr0(stats.paladin_plays) + MathUtils_1.vOr0(stats.shaman_plays) + MathUtils_1.vOr0(stats.warrior_plays);
        if (!forceRecalculate && player.warlords_sr && player.warlords_sr.plays && sr.plays == player.warlords_sr.plays) {
            return player;
        }
        else {
            player.lastTimeRecalculated = Date.now();
        }
        sr.KD = calculateKD(stats.kills, stats.deaths);
        sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);
        sr.WL = calculateWL(stats.wins, sr.plays);
        sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);
        player.warlords.losses = stats.losses = sr.plays - MathUtils_1.vOr0(stats.wins);
        sr.ACCURATE_WL = MathUtils_1.vOr0(stats.wins) / MathUtils_1.vOr1(stats.losses);
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
                sr[warlord.name][spec].SR = calculateSrForSpec(spec, sr[warlord.name][spec].DHP, stats[spec + "_plays"], sr[warlord.name][spec].WL, sr.KDA, sr.plays, stats.penalty);
                sr[warlord.name][spec].WINS = stats["wins_" + spec];
            }
            sr[warlord.name].SR = classSR(sr[warlord.name][warlord.specs[0]].SR, sr[warlord.name][warlord.specs[1]].SR, sr[warlord.name][warlord.specs[2]].SR);
        }
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
exports.calculateStatsAndSR = calculateStatsAndSR;
function calculateSrForSpec(specMame, dhp, specPlays, wl, kda, plays, penalty) {
    if (dhp == null || specPlays == null || plays == null || wl == null || kda == null)
        return null;
    const average = Statics[specMame.toLocaleUpperCase()];
    if (specPlays < Statics.GAMES_PLAYED_TO_RANK)
        return null;
    if (disqualify(dhp, specPlays, wl, kda, average, plays, penalty))
        return null;
    const srFromDHP = adjustTheAverage(dhp, average.DHP) * 2000;
    const srFromWL = adjustTheAverage(wl, average.WL) * 2000;
    const srFromKDA = adjustTheAverage(kda, Statics.AVERAGE_KDA) * 1000;
    const SR = Math.round(srFromDHP + srFromWL + srFromKDA);
    if (SR <= 0)
        return null;
    else
        return SR;
}
function disqualify(dhp, specPlays, wl, kda, average, plays, penalty) {
    if (wl > Statics.DISQUALIFY.MAX_WL)
        return true;
    if ((MathUtils_1.vOr0(penalty) / plays) * 100 >= Statics.DISQUALIFY.PERCENT_LEFT)
        return true;
    return false;
}
function adjustTheAverage(value, staticAverage) {
    const average = value / staticAverage;
    if (average >= 5)
        return 1.0;
    else if (average <= 0)
        return 0.0;
    return 1.00699 + (-1.02107 / (1.01398 + Math.pow(average, 3.09248)));
}
function calculateKD(kills, deaths) {
    return MathUtils_1.round(MathUtils_1.vOr0(kills) / MathUtils_1.vOr1(deaths), 100.0);
}
function calculateKDA(kills, deaths, assists) {
    return MathUtils_1.round((MathUtils_1.vOr0(kills) + MathUtils_1.vOr0(assists)) / MathUtils_1.vOr1(deaths), 100.0);
}
function calculateDHP(dmg, heal, prevented, plays) {
    return Math.round((MathUtils_1.vOr0(dmg) + MathUtils_1.vOr0(heal) + MathUtils_1.vOr0(prevented)) / MathUtils_1.vOr1(plays));
}
function classSR(damageSpecSR, healingSpecSR, defenceSpecSR) {
    const SR = Math.round((MathUtils_1.vOr0(damageSpecSR) + MathUtils_1.vOr0(healingSpecSR) + MathUtils_1.vOr0(defenceSpecSR)) / 3.0);
    if (SR == 0)
        return null;
    else
        return SR;
}
function calculateWL(wins, plays) {
    return MathUtils_1.round(MathUtils_1.vOr0(wins) / MathUtils_1.vOr1(MathUtils_1.vOr0(plays) - MathUtils_1.vOr0(wins)), 100.0);
}
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
//# sourceMappingURL=SrCalculator.js.map