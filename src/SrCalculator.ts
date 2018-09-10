import {IPlayer, IWarlordsSR} from "./PlayerDB";

class Average{

    ADJUST : number;
    DHP : number;
    WL : number;
    LOWERBOUND : number;

    constructor(ADJUST: number, DHP: number, WL: number) {
        this.ADJUST = ADJUST;
        this.DHP = DHP;
        this.WL = WL;
    }
}

const PYROMANCER = new Average(110, 103187, 1.76);
const CRYOMANCER = new Average(90, 99546 , 2.77);
const AQUAMANCER = new Average(135, 105896, 1.93);
const AVENGER    = new Average(60, 104286, 2.21);
const CRUSADER   = new Average(170, 93370 , 2.77);
const PROTECTOR  = new Average(100, 127081, 2.02);
const THUNDERLORD= new Average(155, 109217, 1.82);
const EARTHWARDEN= new Average(85, 111751, 1.90);
const BERSERKER  = new Average(10, 94848 , 2.65);
const DEFENDER   = new Average(-10, 97136 , 2.54);

const LEAVING_PUNISHMENT = 15;
const ANTI_SNIPER_TRESHOLD = 15000 + 7500; //averagePrevented = 13431 averageHeals = 7215
const ANTI_DEFENDER_NOOB_THRESHOLD_HEAL = 3000; //average = 2640
const ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED = 40000; //average = 35000
const AVERAGE_KDA = 7; //real: 6.86034034034034;
const GAMES_PLAYED_TO_RANK = 80;

interface IWarlord {
    name : string
    specs : string []
}

export const WARLORDS : IWarlord[] = [
    {
        name : "mage",
        specs : [
            "pyromancer",
            "aquamancer",
            "cryomancer",
        ]
    },
    {
        name : "paladin",
        specs : [
            "avenger",
            "crusader",
            "protector"
        ]
    },
    {
        name : "shaman",
        specs : [
            "thunderlord",
            "earthwarden"
        ]
    },
    {
        name : "warrior",
        specs : [
            "berserker",
            "defender"
        ]
    }
];

export const CLAZZES = WARLORDS.map(value => value.name);


export function calculateSR(player : IPlayer) {
    const stats = player.warlords;
    const sr = newWarlordsSr();

    sr.KD = calculateKD(stats.kills, stats.deaths);
    sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);

    sr.plays = calculateOverallPlays(stats.mage_plays, stats.paladin_plays, stats.shaman_plays, stats.warrior_plays);

    const plays = stats.mage_plays + stats.paladin_plays + stats.shaman_plays + stats.warrior_plays;
    sr.WL = calculateWL(stats.wins, plays);
    stats.losses = plays - stats.wins;
    sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);

    for(const warlord of WARLORDS){

        stats["losses_" + warlord.name] = stats[warlord.name + "_plays"] - stats["wins_" + warlord.name];
        sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
        sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);

        for (const spec of warlord.specs){
            stats["losses_" + spec] = stats[spec + "_plays"] - stats["wins_" + spec];
            sr[warlord.name][spec].WL = calculateWL(stats["wins_" + spec], stats[spec + "_plays"]);
            sr[warlord.name][spec].DHP = calculateDHP(stats["damage_" + spec], stats["heal_" + spec], stats["damage_prevented_" + spec], stats[spec + "_plays"]);
        }
    }

    const antiSniperDHPValue = antiSniperDHP(
        stats.damage_pyromancer,
        stats.heal_pyromancer,
        stats.damage_prevented_pyromancer,
        stats.pyromancer_plays
    );

    // SR MAGE
    sr.mage.pyromancer.SR = calculateSr(
        antiSniperDHPValue,
        stats.pyromancer_plays,
        sr.mage.pyromancer.WL,
        sr.KDA,

        PYROMANCER,

        sr.plays,
        stats.penalty,
    );

    sr.mage.aquamancer.SR = calculateSr(
        sr.mage.aquamancer.DHP,
        stats.aquamancer_plays,
        sr.mage.aquamancer.WL,
        sr.KDA,

        AQUAMANCER,

        sr.plays,
        stats.penalty,
    );

    sr.mage.cryomancer.SR = calculateSr(
        sr.mage.cryomancer.DHP,
        stats.cryomancer_plays,
        sr.mage.cryomancer.WL,
        sr.KDA,

        CRYOMANCER,

        sr.plays,
        stats.penalty,
    );

    // SR PALADIN
    sr.paladin.avenger.SR = calculateSr(
        sr.paladin.avenger.DHP,
        stats.avenger_plays,
        sr.paladin.avenger.WL,
        sr.KDA,

        AVENGER,

        sr.plays,
        stats.penalty,
    );

    sr.paladin.crusader.SR = calculateSr(
        sr.paladin.crusader.DHP,
        stats.crusader_plays,
        sr.paladin.crusader.WL,
        sr.KDA,

        CRUSADER,

        sr.plays,
        stats.penalty,
    );

    sr.paladin.protector.SR = calculateSr(
        sr.paladin.protector.DHP,
        stats.protector_plays,
        sr.paladin.protector.WL,
        sr.KDA,

        PROTECTOR,

        sr.plays,
        stats.penalty,
    );

    // SR SHAMAN
    sr.shaman.thunderlord.SR = calculateSr(
        sr.shaman.thunderlord.DHP,
        stats.thunderlord_plays,
        sr.shaman.thunderlord.WL,
        sr.KDA,

        THUNDERLORD,

        sr.plays,
        stats.penalty,
    );

    sr.shaman.earthwarden.SR = calculateSr(
        sr.shaman.earthwarden.DHP,
        stats.earthwarden_plays,
        sr.shaman.earthwarden.WL,
        sr.KDA,

        EARTHWARDEN,

        sr.plays,
        stats.penalty,
    );

    // SR WARRIOR
    sr.warrior.berserker.SR = calculateSr(
        sr.warrior.berserker.DHP,
        stats.berserker_plays,
        sr.warrior.berserker.WL,
        sr.KDA,

        BERSERKER,

        sr.plays,
        stats.penalty,
    );

    const antiDefenderN00bDHP = antiDefenderNoobDHP(
        stats.damage_defender,
        stats.heal_defender,
        stats.damage_prevented_defender,
        stats.defender_plays
    );

    sr.warrior.defender.SR = calculateSr(
        antiDefenderN00bDHP,
        stats.defender_plays,
        sr.warrior.defender.WL,
        sr.KDA,

        DEFENDER,

        sr.plays,
        stats.penalty,
    );

    sr.mage.SR = Math.round((vOr0(sr.mage.pyromancer.SR) + vOr0(sr.mage.aquamancer.SR) + vOr0(sr.mage.cryomancer.SR)) / 3);
    sr.paladin.SR = Math.round((vOr0(sr.paladin.avenger.SR) + vOr0(sr.paladin.crusader.SR) + vOr0(sr.paladin.protector.SR))/3);
    sr.shaman.SR = Math.round((vOr0(sr.shaman.thunderlord.SR) + vOr0(sr.shaman.earthwarden.SR))/2);
    sr.warrior.SR = Math.round((vOr0(sr.warrior.berserker.SR) + vOr0(sr.warrior.defender.SR))/2);

    if(sr.mage.SR == 0) sr.mage.SR = null;
    if(sr.paladin.SR == 0) sr.paladin.SR = null;
    if(sr.shaman.SR == 0) sr.shaman.SR = null;
    if(sr.warrior.SR == 0) sr.warrior.SR = null;

    sr.SR = Math.round(((vOr0(sr.paladin.SR) + vOr0(sr.mage.SR) + vOr0(sr.shaman.SR) + vOr0(sr.warrior.SR))/4));

    if(sr.SR == 0) sr.SR = null;
    return sr;
}

/**
 *
 * @param {number | null} dhp
 * @param {number} specPlays
 * @param {number | null} wl
 * @param {number | null} kda
 * @param {Average} average
 * @param {number | null} plays
 * @param {number} penalty
 * @returns {any}
 */
function calculateSr(dhp : number | null, specPlays : number,  wl : number | null, kda : number | null, average : Average, plays : number | null, penalty : number){
    if(dhp == null || specPlays == null || plays == null || wl == null || penalty == null ||  kda == null || specPlays < GAMES_PLAYED_TO_RANK) return null;
    const penaltyPerPlay = Math.pow(((penalty * (specPlays / plays)) / specPlays) + 1, LEAVING_PUNISHMENT);
    const dhpAdjusted = adjust_dhp(dhp, average.DHP);
    const wlAdjusted = adjust_2_wl(wl / penaltyPerPlay, average.WL);
    const kdaAdjsuted = adjust_dhp(kda, AVERAGE_KDA);
    const SR= Math.round((dhpAdjusted + wlAdjusted + (kdaAdjsuted / 2)) * (1000 + average.ADJUST));

    if(SR <= 0) return null;
    else return SR;
}

// WIN/LOSS ------------------------------------------------------------------------------------------------------------

/**
 * A adjusting function to smooth stuff out :D
 *
 * This does smooth out the winrate between 0 and 2
 * values are capped at 6.8
 *
 * https://www.wolframalpha.com/input/?i=plot+%5B-cos((x+%2B+3)%2Fpi),+tan((x+-+3)%2Fpi)+%2B+0.35%5D+between+0+and+7
 * plot [-cos((x + 3)/pi), tan((x - 3)/pi) + 0.35] between 0 and 7
 *
 * @param {number} v
 * @param {number} averageRatio
 * @returns {number}
 */
function adjust_2_wl(v : number, averageRatio : number){
    const adjust = 2.027 - averageRatio;
    if(v > 6.896 - adjust) return 2;
    else if(v > 2.027) return Math.cos(((v + 3 + adjust) / Math.PI) + Math.PI) + 1;
    else if(v <= 0.027 || v <= 0.027 - adjust) return 0;
    else return Math.tan((v - 3 + adjust) / Math.PI) - 0.398 + 1;
}

function calculateWL(wins : number , plays : number){
    if(plays == null || wins == null ) return null;
    return round(wins / (plays - wins), 100);
}

// DHP -----------------------------------------------------------------------------------------------------------------

/**
 * Smooth and cap the DHP per game
 * it is capped at 2 times the average value
 *
 * https://www.wolframalpha.com/input/?i=plot+%5B-cos(x*PI%2F2)%5D+between+0+and+2
 * plot [-cos(x*PI/2)] between 0 and 2
 *
 * @param {number} v
 * @param {number} average
 * @returns {number}
 */
function adjust_dhp(v : number, average : number){
    const x = v / average;
    if(x >= 2) return 2;
    else if(x <= 0) return 0;
    else return Math.cos((x * Math.PI) / 2 + Math.PI) + 1;
}

function calculateDHP(dmg : number, heal : number, prevented : number, plays : number | null){
    if(dmg == null || heal == null || prevented == null || plays == null) return null;
    return Math.round((dmg  + heal + prevented)/plays);
}

/**
 * Punish  defender n00bs ;)
 * They need an average of 40.000 damage prevented per game and also 3.000 heal.
 * @param {number} dmg
 * @param {number} heal
 * @param {number} prevented
 * @param {number} plays
 * @returns {any}
 */
function antiDefenderNoobDHP(dmg : number, heal : number, prevented : number, plays : number){
    if(dmg == null || heal == null || prevented == null) return null;
    const penalty = Math.log2((prevented/plays/ ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED) + (heal/plays/ ANTI_DEFENDER_NOOB_THRESHOLD_HEAL) + 1);
    return Math.round(((dmg + heal + prevented) * penalty)/plays);
}

/**
 * Punish those freaking snipers ;)
 * A real pyro should have at least 15.000 prevented damage and 7500 healzzzz per game (values might be too low)
 * @param {number} dmg
 * @param {number} heal
 * @param {number} prevented
 * @param {number} plays
 * @returns {any}
 */
function antiSniperDHP(dmg : number, heal : number, prevented : number, plays : number){
    if(dmg == null || heal == null || prevented == null) return null;
    const penalty = Math.log2(((prevented + heal)/plays / ANTI_SNIPER_TRESHOLD) + 1);
    return Math.round(((dmg + heal + prevented) * penalty)/plays);
}

// OTHER ---------------------------------------------------------------------------------------------------------------

function calculateOverallPlays(magePlays, palPlays, shaPlays, warPlays){
    if(magePlays == null) magePlays = 0;
    if(palPlays == null) palPlays = 0;
    if(shaPlays == null) shaPlays = 0;
    if(warPlays == null) warPlays = 0;

    return magePlays + palPlays + shaPlays + warPlays;
}

function calculateKD(kills : number, deaths: number) : number | null{
    if(kills == null || deaths == null) return null;
    return round(kills / deaths, 100);
}

function calculateKDA(kills : number, deaths: number, assists : number) : number | null{
    if(kills == null || deaths == null || assists == null) return null;
    return round((kills + assists) / deaths, 100);
}

// MATH.shit -----------------------------------------------------------------------------------------------------------

function round(zahl,n_stelle) {
    zahl = (Math.round(zahl * n_stelle) / n_stelle);
    return zahl;
}

/**
 * Does return 0 if the value is null
 * @param {number | null} value
 * @returns {number}
 */
function vOr0(value : number | null) : number{
    if(value == null) return 0;
    return value;
}


//NOT USED #############################################################################################################

/**
 * A adjusting function to smooth stuff out :D
 *
 * https://www.wolframalpha.com/input/?i=plot+%5B(cos((x%2Fpi+%2B+pi))+%2B+0.8),+log10(x+%2B+0.5)+-+0.397%5D+between+0+and+10
 * plot [(cos((x/pi + pi)) + 0.8), log10(x + 0.5) - 0.397] between 0 and 10
 *
 * TODO: not in use
 *
 * @param {number} v
 * @param {number} averageRatio
 * @returns {number}
 */
function adjust_1_wl(v : number, averageRatio : number){
    const adjust = 2 - averageRatio;
    if(v > 10) return 1.8;
    else if(v > 2) return Math.cos(((v + adjust) / Math.PI) + Math.PI) + 0.8;
    else if(v <= adjust || v <= 0) return 0;
    else return Math.log10(v + 0.5 + adjust) - 0.398;
}

function adjustV(valuePerGame : number, average : number) : number{
    return log10_x2(Math.log2( (valuePerGame / average)+ 1)) + 1
}

function av10(valuePerGame : number, average : number) : number | null{
    const adjust = adjustV(valuePerGame, average);
    if(adjust <= 0) return null;
    return valuePerGame * adjust;
}

function av2(valuePerGame : number, average : number){
    return log10_1At1(valuePerGame / average)
}

function log10_1At1(value : number){
    return Math.log10(value + 0.5) - 0.176
}

function log10_x2(value : number){
    return Math.log10(value * value)
}

// EW Typescript #######################################################################################################

function newWarlordsSr() : IWarlordsSR{
    return {
        SR :  null,
        KD :  null,
        KDA :  null,
        WL :  null,
        plays :  null,
        DHP :  null,
        realLosses : null,
        realPenalty : null,

        paladin : {
            DHP :  null,
            SR :  null,
            WL :  null,
            avenger : {SR : null, DHP : null, WL : null},
            crusader : {SR : null, DHP : null, WL : null},
            protector : {SR : null, DHP : null, WL : null},
        },

        mage : {
            SR :  null,
            WL :  null,
            DHP :  null,
            pyromancer : {SR : null, DHP : null, WL : null},
            aquamancer : {SR : null, DHP : null, WL : null},
            cryomancer : {SR : null, DHP : null, WL : null},
        },

        warrior : {
            DHP :  null,
            SR :  null,
            WL :  null,
            berserker : {SR : null, DHP : null, WL : null},
            defender : {SR : null, DHP : null, WL : null},
        },

        shaman : {
            DHP :  null,
            SR :  null,
            WL :  null,
            thunderlord : {SR : null, DHP : null, WL : null},
            earthwarden : {SR : null, DHP : null, WL : null},
        }
    };
}
