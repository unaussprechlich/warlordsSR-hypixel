"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WARLORDS = [
    {
        name: "mage",
        specs: [{
                name: "pyromancer",
                average: {
                    dhp: 0,
                    wl: 0
                }
            },
            {
                name: "aquamancer",
                average: {
                    dhp: 0,
                    wl: 0
                }
            },
            {
                name: "cryomancer",
                average: {
                    dhp: 0,
                    wl: 0
                }
            }
        ]
    },
    {
        name: "paladin",
        specs: [{
                name: "avenger",
                average: {
                    dhp: 0,
                    wl: 0
                }
            },
            {
                name: "crusader",
                average: {
                    dhp: 0,
                    wl: 0
                }
            },
            {
                name: "protector",
                average: {
                    dhp: 0,
                    wl: 0
                }
            }
        ]
    },
    {
        name: "shaman",
        specs: [{
                name: "thunderlord",
                average: {
                    dhp: 0,
                    wl: 0
                }
            },
            {
                name: "earthwarden",
                average: {
                    dhp: 0,
                    wl: 0
                }
            }
        ]
    },
    {
        name: "warrior",
        specs: [{
                name: "berserker",
                average: {
                    dhp: 0,
                    wl: 0
                }
            },
            {
                name: "defender",
                average: {
                    dhp: 0,
                    wl: 0
                }
            }
        ]
    }
];
async function loadAverage(players) {
    const v = AddAllPlayers();
    for (const player of players) {
        for (const warlord of WARLORDS) {
            for (const spec of warlord.specs) {
                v[spec.name].damage += vOr0(player.warlords["damage_" + spec.name]);
                v[spec.name].prevented += vOr0(player.warlords["damage_prevented_" + spec.name]);
                v[spec.name].heal += vOr0(player.warlords["heal_" + spec.name]);
                v[spec.name].wins += vOr0(player.warlords["wins_" + spec.name]);
                v[spec.name].plays += vOr0(player.warlords[spec.name + "_plays"]);
            }
        }
    }
    for (const warlord of WARLORDS) {
        for (const spec of warlord.specs) {
            v[spec.name].losses = v[spec.name].plays - v[spec.name].wins;
            v[spec.name].wl = calculateWL(v[spec.name].wins, v[spec.name].plays);
            v[spec.name].dhp = calculateDHP(v[spec.name].damage, v[spec.name].heal, v[spec.name].prevented, v[spec.name].plays);
        }
    }
    for (const warlord of WARLORDS) {
        for (const spec of warlord.specs) {
            spec.average = {
                dhp: v[spec.name].dhp,
                wl: v[spec.name].wl
            };
        }
    }
    console.log(JSON.stringify(v));
}
exports.loadAverage = loadAverage;
function AddAllPlayers() {
    return {
        pyromancer: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        cryomancer: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        aquamancer: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        avenger: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        crusader: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        protector: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        thunderlord: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        earthwarden: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        berserker: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
        defender: { damage: 0, prevented: 0, heal: 0, dhp: 0, wins: 0, losses: 0, plays: 0, wl: 0 },
    };
}
const LEAVING_PUNISHMENT = 15;
const ANTI_SNIPER_TRESHOLD = 18000 + 10000;
const ANTI_DEFENDER_NOOB_THRESHOLD_HEAL = 3000;
const ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED = 40000;
const AVERAGE_KDA = 7;
const AVERAGE_KD = 1;
const GAMES_PLAYED_TO_RANK = 80;
function calculateSR(player) {
    const stats = player.warlords;
    const sr = newWarlordsSr();
    sr.KD = calculateKD(stats.kills, stats.deaths);
    sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);
    sr.plays = calculateOverallPlays(stats.mage_plays, stats.paladin_plays, stats.shaman_plays, stats.warrior_plays);
    sr.WL = calculateWL(stats.wins, vOr0(sr.plays));
    stats.losses = vOr0(sr.plays) - stats.wins;
    sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);
    const antiSniperDHPValue = antiSniperDHP(stats.damage_pyromancer, stats.heal_pyromancer, stats.damage_prevented_pyromancer, stats.pyromancer_plays);
    const antiDefenderN00bDHP = antiDefenderNoobDHP(stats.damage_defender, stats.heal_defender, stats.damage_prevented_defender, stats.defender_plays);
    for (const warlord of WARLORDS) {
        stats["losses_" + warlord.name] = stats[warlord.name + "_plays"] - stats["wins_" + warlord.name];
        sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
        sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);
        for (const spec of warlord.specs) {
            stats["losses_" + spec.name] = stats[spec.name + "_plays"] - stats["wins_" + spec.name];
            sr[warlord.name][spec.name].WL = calculateWL(stats["wins_" + spec.name], stats[spec.name + "_plays"]);
            sr[warlord.name][spec.name].DHP = calculateDHP(stats["damage_" + spec.name], stats["heal_" + spec.name], stats["damage_prevented_" + spec.name], stats[spec.name + "_plays"]);
            let dhp = sr[warlord.name][spec.name].DHP;
            if (spec.name === "pyromancer") {
                dhp = antiSniperDHPValue;
            }
            else if (spec.name === "defender") {
                dhp = antiDefenderN00bDHP;
            }
            sr[warlord.name][spec.name].SR = calculateSr(dhp, stats[spec.name + "_plays"], sr[warlord.name][spec.name].WL, sr.KDA, spec.average, sr.plays, stats.penalty, sr.KD);
        }
    }
    sr.mage.SR = Math.round((vOr0(sr.mage.pyromancer.SR) + vOr0(sr.mage.aquamancer.SR) + vOr0(sr.mage.cryomancer.SR)) / 3);
    sr.paladin.SR = Math.round((vOr0(sr.paladin.avenger.SR) + vOr0(sr.paladin.crusader.SR) + vOr0(sr.paladin.protector.SR)) / 3);
    sr.shaman.SR = Math.round((vOr0(sr.shaman.thunderlord.SR) + vOr0(sr.shaman.earthwarden.SR)) / 2);
    sr.warrior.SR = Math.round((vOr0(sr.warrior.berserker.SR) + vOr0(sr.warrior.defender.SR)) / 2);
    if (sr.mage.SR == 0)
        sr.mage.SR = null;
    if (sr.paladin.SR == 0)
        sr.paladin.SR = null;
    if (sr.shaman.SR == 0)
        sr.shaman.SR = null;
    if (sr.warrior.SR == 0)
        sr.warrior.SR = null;
    sr.SR = Math.round(((vOr0(sr.paladin.SR) + vOr0(sr.mage.SR) + vOr0(sr.shaman.SR) + vOr0(sr.warrior.SR)) / 4));
    if (sr.SR == 0)
        sr.SR = null;
    return sr;
}
exports.calculateSR = calculateSR;
function calculateSr(dhp, specPlays, wl, kda, average, plays, penalty, kd) {
    if (dhp == null || specPlays == null || plays == null || wl == null || penalty == null || kda == null || kd == null || specPlays < GAMES_PLAYED_TO_RANK)
        return null;
    const penaltyPerPlay = Math.pow(((penalty * (specPlays / plays)) / specPlays) + 1, LEAVING_PUNISHMENT);
    const dhpAdjusted = adjust_dhp(dhp, average.dhp);
    const wlAdjusted = adjust_3_wl(wl / penaltyPerPlay, average.wl);
    const kdaAdjusted = adjust_dhp(kda, AVERAGE_KDA);
    const kdAdjusted = adjust_dhp(kd, AVERAGE_KD);
    const SR = Math.round((dhpAdjusted + wlAdjusted + (kdaAdjusted / 4) + (kdAdjusted / 4)) * 1000);
    if (SR <= 0)
        return null;
    else
        return SR;
}
function adjust_3_wl(v, averageRatio) {
    v = v - (1 - averageRatio);
    if (v > 10 / 4)
        return 2;
    else
        return (0 - Math.cos(((v) / Math.PI) + Math.PI) * 4) + 1;
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
    if (plays == null || wins == null)
        return null;
    return round(wins / (plays - wins), 100);
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
    if (dmg == null || heal == null || prevented == null || plays == null)
        return null;
    return Math.round((dmg + heal + prevented) / plays);
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
function calculateOverallPlays(magePlays, palPlays, shaPlays, warPlays) {
    if (magePlays == null)
        magePlays = 0;
    if (palPlays == null)
        palPlays = 0;
    if (shaPlays == null)
        shaPlays = 0;
    if (warPlays == null)
        warPlays = 0;
    return vOr0(magePlays + palPlays + shaPlays + warPlays);
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
function round(zahl, n_stelle) {
    zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}
function vOr0(value) {
    if (value == null)
        return 0;
    return value;
}
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
function newWarlordsSr() {
    return {
        SR: null,
        KD: null,
        KDA: null,
        WL: null,
        plays: null,
        DHP: null,
        realLosses: null,
        realPenalty: null,
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
}
