"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    uuid: String,
    name: String,
    warlords_sr: {
        SR: Number,
        KD: Number,
        KDA: Number,
        WL: Number,
        plays: Number,
        DHP: Number,
        paladin: {
            DHP: Number,
            SR: Number,
            WL: Number,
            avenger: {
                DHP: Number,
                SR: Number,
                WL: Number
            },
            crusader: {
                DHP: Number,
                SR: Number,
                WL: Number
            },
            protector: {
                DHP: Number,
                SR: Number,
                WL: Number
            }
        },
        mage: {
            SR: Number,
            WL: Number,
            DHP: Number,
            pyromancer: {
                DHP: Number,
                SR: Number,
                WL: Number
            },
            aquamancer: {
                DHP: Number,
                SR: Number,
                WL: Number
            },
            cryomancer: {
                DHP: Number,
                SR: Number,
                WL: Number
            }
        },
        warrior: {
            DHP: Number,
            SR: Number,
            WL: Number,
            berserker: {
                DHP: Number,
                SR: Number,
                WL: Number
            },
            defender: {
                DHP: Number,
                SR: Number,
                WL: Number
            }
        },
        shaman: {
            DHP: Number,
            SR: Number,
            WL: Number,
            thunderlord: {
                DHP: Number,
                SR: Number,
                WL: Number
            },
            earthwarden: {
                DHP: Number,
                SR: Number,
                WL: Number
            }
        }
    },
    warlords: {
        assists: Number,
        damage: Number,
        deaths: Number,
        heal: Number,
        damage_prevented: Number,
        damage_taken: Number,
        kills: Number,
        life_leeched: Number,
        wins: Number,
        wins_blu: Number,
        wins_red: Number,
        losses: Number,
        penalty: Number,
        damage_warrior: Number,
        damage_prevented_warrior: Number,
        heal_warrior: Number,
        warrior_plays: Number,
        wins_warrior: Number,
        losses_warrior: Number,
        berserker_plays: Number,
        damage_berserker: Number,
        damage_prevented_berserker: Number,
        heal_berserker: Number,
        life_leeched_berserker: Number,
        wins_berserker: Number,
        losses_berserker: Number,
        wins_defender: Number,
        damage_defender: Number,
        defender_plays: Number,
        damage_prevented_defender: Number,
        heal_defender: Number,
        losses_defender: Number,
        damage_prevented_paladin: Number,
        damage_paladin: Number,
        heal_paladin: Number,
        paladin_plays: Number,
        wins_paladin: Number,
        losses_paladin: Number,
        avenger_plays: Number,
        damage_avenger: Number,
        damage_prevented_avenger: Number,
        heal_avenger: Number,
        wins_avenger: Number,
        losses_avenger: Number,
        losses_crusader: Number,
        crusader_plays: Number,
        heal_crusader: Number,
        damage_crusader: Number,
        damage_prevented_crusader: Number,
        wins_crusader: Number,
        damage_prevented_protector: Number,
        protector_plays: Number,
        wins_protector: Number,
        heal_protector: Number,
        damage_protector: Number,
        losses_protector: Number,
        damage_prevented_mage: Number,
        damage_mage: Number,
        mage_plays: Number,
        heal_mage: Number,
        wins_mage: Number,
        losses_mage: Number,
        damage_prevented_pyromancer: Number,
        damage_pyromancer: Number,
        heal_pyromancer: Number,
        wins_pyromancer: Number,
        pyromancer_plays: Number,
        losses_pyromancer: Number,
        cryomancer_plays: Number,
        heal_cryomancer: Number,
        damage_prevented_cryomancer: Number,
        losses_cryomancer: Number,
        damage_cryomancer: Number,
        wins_cryomancer: Number,
        damage_prevented_aquamancer: Number,
        wins_aquamancer: Number,
        damage_aquamancer: Number,
        aquamancer_plays: Number,
        heal_aquamancer: Number,
        losses_aquamancer: Number,
        heal_shaman: Number,
        damage_shaman: Number,
        losses_shaman: Number,
        shaman_plays: Number,
        damage_prevented_shaman: Number,
        wins_shaman: Number,
        heal_thunderlord: Number,
        thunderlord_plays: Number,
        damage_thunderlord: Number,
        losses_thunderlord: Number,
        damage_prevented_thunderlord: Number,
        wins_thunderlord: Number,
        damage_prevented_earthwarden: Number,
        losses_earthwarden: Number,
        damage_earthwarden: Number,
        heal_earthwarden: Number,
        earthwarden_plays: Number,
        wins_earthwarden: Number,
        wins_capturetheflag: Number,
        wins_capturetheflag_blu: Number,
        wins_capturetheflag_red: Number,
        flag_conquer_team: Number,
        flag_conquer_self: Number,
        wins_capturetheflag_b: Number,
        wins_capturetheflag_a: Number,
        wins_domination: Number,
        wins_domination_blu: Number,
        wins_domination_red: Number,
        wins_domination_a: Number,
        wins_domination_b: Number,
        wins_teamdeathmatch: Number,
        wins_teamdeathmatch_a: Number,
        wins_teamdeathmatch_blu: Number,
        wins_teamdeathmatch_red: Number,
        wins_teamdeathmatch_b: Number,
    }
});
class Average {
    constructor(ADJUST, DHP, WL) {
        this.ADJUST = ADJUST;
        this.DHP = DHP;
        this.WL = WL;
    }
}
const PYROMANCER = new Average(480, 103187, 1.76);
const CRYOMANCER = new Average(445, 99546, 2.77);
const AQUAMANCER = new Average(462, 105896, 1.93);
const AVENGER = new Average(470, 104286, 2.21);
const CRUSADER = new Average(460, 93370, 2.77);
const PROTECTOR = new Average(440, 127081, 2.02);
const THUNDERLORD = new Average(473, 109217, 1.82);
const EARTHWARDEN = new Average(440, 111751, 1.90);
const BERSERKER = new Average(463, 94848, 2.65);
const DEFENDER = new Average(447, 97136, 2.54);
const LEAVING_PUNISHMENT = 15;
const ANTI_SNIPER_TRESHOLD = 15000 + 7500;
const ANTI_DEFENDER_NOOB_THRESHOLD_HEAL = 3000;
const ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED = 40000;
schema.pre('save', function (next) {
    const stats = this.warlords;
    const sr = {
        SR: null,
        KD: null,
        KDA: null,
        WL: null,
        plays: null,
        DHP: null,
        paladin: {
            DHP: null,
            SR: null,
            WL: null,
            avenger: { SR: null, DHP: null, WL: null },
            crusader: { SR: null, DHP: null, WL: null },
            protector: { SR: null, DHP: null, WL: null },
        },
        mage: {
            SR: null,
            WL: null,
            DHP: null,
            pyromancer: { SR: null, DHP: null, WL: null },
            aquamancer: { SR: null, DHP: null, WL: null },
            cryomancer: { SR: null, DHP: null, WL: null },
        },
        warrior: {
            DHP: null,
            SR: null,
            WL: null,
            berserker: { SR: null, DHP: null, WL: null },
            defender: { SR: null, DHP: null, WL: null },
        },
        shaman: {
            DHP: null,
            SR: null,
            WL: null,
            thunderlord: { SR: null, DHP: null, WL: null },
            earthwarden: { SR: null, DHP: null, WL: null },
        }
    };
    sr.KD = calculateKD(stats.kills, stats.deaths);
    sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);
    if (stats.wins != null && stats.losses != null)
        sr.plays = stats.wins + stats.losses;
    sr.WL = calculateWL(stats.wins, stats.losses);
    sr.mage.WL = calculateWL(stats.wins_mage, stats.losses_mage);
    sr.mage.pyromancer.WL = calculateWL(stats.wins_pyromancer, stats.losses_pyromancer);
    sr.mage.aquamancer.WL = calculateWL(stats.wins_aquamancer, stats.losses_aquamancer);
    sr.mage.cryomancer.WL = calculateWL(stats.wins_cryomancer, stats.losses_aquamancer);
    sr.paladin.WL = calculateWL(stats.wins_paladin, stats.losses_paladin);
    sr.paladin.avenger.WL = calculateWL(stats.wins_avenger, stats.losses_avenger);
    sr.paladin.crusader.WL = calculateWL(stats.wins_crusader, stats.losses_crusader);
    sr.paladin.protector.WL = calculateWL(stats.wins_protector, stats.losses_protector);
    sr.shaman.WL = calculateWL(stats.wins_shaman, stats.losses_shaman);
    sr.shaman.thunderlord.WL = calculateWL(stats.wins_thunderlord, stats.losses_thunderlord);
    sr.shaman.earthwarden.WL = calculateWL(stats.wins_earthwarden, stats.losses_earthwarden);
    sr.warrior.WL = calculateWL(stats.wins_warrior, stats.losses_warrior);
    sr.warrior.berserker.WL = calculateWL(stats.wins_berserker, stats.losses_berserker);
    sr.warrior.defender.WL = calculateWL(stats.wins_defender, stats.losses_defender);
    sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);
    sr.mage.DHP = calculateDHP(stats.damage_mage, stats.heal_mage, stats.damage_prevented_mage, stats.mage_plays);
    sr.mage.pyromancer.DHP = calculateDHP(stats.damage_pyromancer, stats.heal_pyromancer, stats.damage_prevented_pyromancer, stats.pyromancer_plays);
    sr.mage.aquamancer.DHP = calculateDHP(stats.damage_aquamancer, stats.heal_aquamancer, stats.damage_prevented_aquamancer, stats.aquamancer_plays);
    sr.mage.cryomancer.DHP = calculateDHP(stats.damage_cryomancer, stats.heal_cryomancer, stats.damage_prevented_cryomancer, stats.cryomancer_plays);
    sr.paladin.DHP = calculateDHP(stats.damage_paladin, stats.heal_paladin, stats.damage_prevented_paladin, stats.paladin_plays);
    sr.paladin.avenger.DHP = calculateDHP(stats.damage_avenger, stats.heal_avenger, stats.damage_prevented_avenger, stats.avenger_plays);
    sr.paladin.crusader.DHP = calculateDHP(stats.damage_crusader, stats.heal_crusader, stats.damage_prevented_crusader, stats.crusader_plays);
    sr.paladin.protector.DHP = calculateDHP(stats.damage_protector, stats.heal_protector, stats.damage_prevented_protector, stats.protector_plays);
    sr.shaman.DHP = calculateDHP(stats.damage_shaman, stats.heal_shaman, stats.damage_prevented_shaman, stats.shaman_plays);
    sr.shaman.thunderlord.DHP = calculateDHP(stats.damage_thunderlord, stats.heal_thunderlord, stats.damage_prevented_thunderlord, stats.thunderlord_plays);
    sr.shaman.earthwarden.DHP = calculateDHP(stats.damage_earthwarden, stats.heal_earthwarden, stats.damage_prevented_earthwarden, stats.earthwarden_plays);
    sr.warrior.DHP = calculateDHP(stats.damage_warrior, stats.heal_warrior, stats.damage_prevented_warrior, stats.warrior_plays);
    sr.warrior.berserker.DHP = calculateDHP(stats.damage_berserker, stats.heal_berserker, stats.damage_prevented_berserker, stats.berserker_plays);
    sr.warrior.defender.DHP = calculateDHP(stats.damage_defender, stats.heal_defender, stats.damage_prevented_defender, stats.defender_plays);
    const antiSniperDHPValue = antiSniperDHP(stats.damage_pyromancer, stats.heal_pyromancer, stats.damage_prevented_pyromancer, stats.pyromancer_plays);
    sr.mage.pyromancer.SR = calculateSr(antiSniperDHPValue, stats.pyromancer_plays, sr.mage.pyromancer.WL, PYROMANCER, sr.plays, stats.penalty);
    sr.mage.aquamancer.SR = calculateSr(sr.mage.aquamancer.DHP, stats.aquamancer_plays, sr.mage.aquamancer.WL, AQUAMANCER, sr.plays, stats.penalty);
    sr.mage.cryomancer.SR = calculateSr(sr.mage.cryomancer.DHP, stats.cryomancer_plays, sr.mage.cryomancer.WL, CRYOMANCER, sr.plays, stats.penalty);
    sr.paladin.avenger.SR = calculateSr(sr.paladin.avenger.DHP, stats.avenger_plays, sr.paladin.avenger.WL, AVENGER, sr.plays, stats.penalty);
    sr.paladin.crusader.SR = calculateSr(sr.paladin.crusader.DHP, stats.crusader_plays, sr.paladin.crusader.WL, CRUSADER, sr.plays, stats.penalty);
    sr.paladin.protector.SR = calculateSr(sr.paladin.protector.DHP, stats.protector_plays, sr.paladin.protector.WL, PROTECTOR, sr.plays, stats.penalty);
    sr.shaman.thunderlord.SR = calculateSr(sr.shaman.thunderlord.DHP, stats.thunderlord_plays, sr.shaman.thunderlord.WL, THUNDERLORD, sr.plays, stats.penalty);
    sr.shaman.earthwarden.SR = calculateSr(sr.shaman.earthwarden.DHP, stats.earthwarden_plays, sr.shaman.earthwarden.WL, EARTHWARDEN, sr.plays, stats.penalty);
    sr.warrior.berserker.SR = calculateSr(sr.warrior.berserker.DHP, stats.berserker_plays, sr.warrior.berserker.WL, BERSERKER, sr.plays, stats.penalty);
    const antiDefenderN00bDHP = antiDefenderNoobDHP(stats.damage_defender, stats.heal_defender, stats.damage_prevented_defender, stats.defender_plays);
    sr.warrior.defender.SR = calculateSr(antiDefenderN00bDHP, stats.defender_plays, sr.warrior.defender.WL, DEFENDER, sr.plays, stats.penalty);
    sr.mage.SR = Math.round((vOr0(sr.mage.pyromancer.SR) + vOr0(sr.mage.aquamancer.SR) + vOr0(sr.mage.cryomancer.SR)) / 3);
    sr.paladin.SR = Math.round((vOr0(sr.paladin.avenger.SR) + vOr0(sr.paladin.crusader.SR) + vOr0(sr.paladin.protector.SR)) / 3);
    sr.shaman.SR = Math.round((vOr0(sr.shaman.thunderlord.SR) + vOr0(sr.shaman.earthwarden.SR)) / 2);
    sr.warrior.SR = Math.round((vOr0(sr.warrior.berserker.SR) + vOr0(sr.warrior.defender.SR)) / 2);
    sr.SR = Math.round(((vOr0(sr.paladin.SR) + vOr0(sr.mage.SR) + vOr0(sr.shaman.SR) + vOr0(sr.warrior.SR)) / 4));
    this.warlords_sr = sr;
    console.log("[SR|" + this.name + "] SR:" + sr.SR + " MAG:" + sr.mage.SR + " PAL:" + sr.mage.SR + " SHA:" + sr.shaman.SR + " WAR:" + sr.warrior.SR);
    next();
});
function vOr0(value) {
    if (value == null)
        return 0;
    return value;
}
function calculateWL(wins, losses) {
    if (losses == null || wins == null)
        return null;
    return round(wins / losses, 100);
}
function calculateKD(kills, deaths) {
    if (kills == null || deaths == null)
        return null;
    return round(kills / deaths, 100);
}
function calculateKDA(kills, deaths, assists) {
    if (kills == null || deaths == null || assists == null)
        return null;
    return round((kills + assists) / deaths, 100);
}
function antiDefenderNoobDHP(dmg, heal, prevented, plays) {
    if (dmg == null || heal == null || prevented == null)
        return null;
    const penalty = Math.log2((prevented / plays / ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED) + (heal / plays / ANTI_DEFENDER_NOOB_THRESHOLD_HEAL) + 1);
    return Math.round(((dmg + heal + prevented) * penalty) / plays);
}
function antiSniperDHP(dmg, heal, prevented, plays) {
    if (dmg == null || heal == null || prevented == null)
        return null;
    const penalty = Math.log2(((prevented + heal) / plays / ANTI_SNIPER_TRESHOLD) + 1);
    return Math.round(((dmg + heal + prevented) * penalty) / plays);
}
function calculateDHP(dmg, heal, prevented, plays) {
    if (dmg == null || heal == null || prevented == null || plays == null)
        return null;
    return Math.round((dmg + heal + prevented) / plays);
}
function calculateSr(dhp, specPlays, wl, average, plays, penalty) {
    if (dhp == null || specPlays == null || plays == null || wl == null || penalty == null || plays < 100 || wl > 20)
        return null;
    const penaltyPerPlay = Math.pow(((penalty * (specPlays / plays)) / specPlays) + 1, LEAVING_PUNISHMENT);
    const dipAdjusted = av10(dhp, average.DHP);
    const wlAdjusted = av10(wl / penaltyPerPlay, average.WL);
    if (dipAdjusted == null || wlAdjusted == null)
        return null;
    const tempSR = Math.log10(Math.pow(dipAdjusted * wlAdjusted, 2) + 1) * average.ADJUST - 1000;
    if (tempSR <= 0)
        return null;
    const SR = Math.round((Math.cos(tempSR / Math.PI / 500 + Math.PI) + 1) * 2500);
    if (SR <= 0)
        return null;
    else
        return SR;
}
function adjustV(valuePerGame, average) {
    return log10_x2(Math.log2((valuePerGame / average) + 1)) + 1;
}
function av10(valuePerGame, average) {
    const adjust = adjustV(valuePerGame, average);
    if (adjust <= 0)
        return null;
    return valuePerGame * adjust;
}
function av2(valuePerGame, average) {
    return log10_1At1(valuePerGame / average);
}
function log10_1At1(value) {
    return Math.log10(value + 0.5) - 0.176;
}
function log10_x2(value) {
    return Math.log10(value * value);
}
function round(zahl, n_stelle) {
    zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}
exports.Player = mongoose.model('Player', schema);
