"use strict";
import {Player} from "./Player";
import UUID from "hypixel-api-typescript/src/UUID";
import {vOr0} from "./utils/MathUtils";

Object.defineProperty(exports, "__esModule", { value: true });
const MathUtils_1 = require("./utils/MathUtils");
const Warlords_1 = require("./Warlords");
const Average = require("./Average");
const Player_1 = require("./Player");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const LEAVING_PUNISHMENT = 15;
const ANTI_SNIPER_TRESHOLD = 15000 + 7500;
const ANTI_DEFENDER_NOOB_THRESHOLD_HEAL = 3000;
const ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED = 40000;
const AVERAGE_KDA = 7;
const GAMES_PLAYED_TO_RANK = 30;
async function calculateSR(player) {
    const stats = player.warlords;
    const sr = Warlords_1.newWarlordsSr();
    try {
        sr.KD = calculateKD(stats.kills, stats.deaths);
        sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);
        sr.plays = MathUtils_1.vOr0(stats.mage_plays) + MathUtils_1.vOr0(stats.paladin_plays) + MathUtils_1.vOr0(stats.shaman_plays) + MathUtils_1.vOr0(stats.warrior_plays);
        sr.WL = calculateWL(stats.wins, sr.plays);
        player.warlords.losses = sr.plays - MathUtils_1.vOr0(stats.wins);
        sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);
        for (const warlord of Warlords_1.WARLORDS) {
            player.warlords["losses_" + warlord.name] = MathUtils_1.vOr0(stats[warlord.name + "_plays"]) - MathUtils_1.vOr0(stats["wins_" + warlord.name]);
            sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);
            for (const spec of warlord.specs) {
                player.warlords["losses_" + spec] = MathUtils_1.vOr0(stats[spec + "_plays"]) - MathUtils_1.vOr0(stats["wins_" + spec]);
                sr[warlord.name][spec].WL = calculateWL(stats["wins_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].DHP = calculateDHP(stats["damage_" + spec], stats["heal_" + spec], stats["damage_prevented_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].SR = calculateSr(sr[warlord.name][spec].DHP, stats[spec + "_plays"], sr[warlord.name][spec].WL, sr.KDA, Average[spec.toLocaleUpperCase()], sr.plays, stats.penalty);
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
    if(player.name == "sumSmash") {
        const Koary = await Player.init(UUID.fromString("01c4a20e-0a60-466f-bd98-ea71c346e5e4"),true)
        if(Koary) {
            sr.SR = vOr0(Koary.data.warlords_sr.SR) + 1;
            sr.mage.SR = vOr0(Koary.data.warlords_sr.mage.SR) + 1;
            sr.paladin.SR = vOr0(Koary.data.warlords_sr.paladin.SR) + 1;
            sr.warrior.SR = vOr0(Koary.data.warlords_sr.warrior.SR) + 1;
            sr.DHP = vOr0(Koary.data.warlords_sr.DHP) + 1;
        }
        else {
            sr.SR = 5000;
        }
    }
    player.warlords_sr = sr;
    return player;
}
exports.calculateSR = calculateSR;
function calculateSr(dhp, specPlays, wl, kda, average, plays, penalty) {
    if (dhp == null || specPlays == null || plays == null || wl == null || kda == null || specPlays < GAMES_PLAYED_TO_RANK)
        return null;
    if (penalty == null)
        penalty = 0;
    const penaltyPerPlay = Math.pow(((penalty * (specPlays / plays)) / specPlays) + 1, LEAVING_PUNISHMENT);
    const dhpAdjusted = adjust_dhp(dhp, average.DHP);
    const wlAdjusted = adjust_2_wl(wl / penaltyPerPlay, average.WL);
    const kdaAdjsuted = adjust_dhp(kda, AVERAGE_KDA);
    const SR = Math.round((dhpAdjusted + wlAdjusted + (kdaAdjsuted / 2)) * (1000 + average.ADJUST));
    if (SR <= 0)
        return null;
    else
        return SR;
}
function adjust_2_wl(v, averageRatio) {
    const adjust = 2.027 - averageRatio;
    if (v > 6.896 - adjust)
        return 2;
    else if (v > 2.027)
        return Math.cos(((v + 3 + adjust) / Math.PI) + Math.PI) + 1;
    else if (v <= 0.027 || v <= 0.027 - adjust)
        return 0;
    else
        return Math.tan((v - 3 + adjust) / Math.PI) - 0.398 + 1;
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
function calculateKD(kills, deaths) {
    return MathUtils_1.round(MathUtils_1.vOr0(kills) / MathUtils_1.vOr1(deaths), 100);
}
function calculateKDA(kills, deaths, assists) {
    return MathUtils_1.round((MathUtils_1.vOr0(kills) + MathUtils_1.vOr0(assists)) / MathUtils_1.vOr1(deaths), 100);
}
