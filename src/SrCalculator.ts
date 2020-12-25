import {IPlayer, IWarlordsHypixelAPI} from "./PlayerDB";
import {round, vOr0, vOr1} from "./utils/MathUtils";
import {newWarlordsSr, WARLORDS} from "./Warlords";
import * as Average from "./Average";

const DISQUALIFY = {
    MAX_WL : 5,
    PERCENT_LEFT : 4
}

const AVERAGE_KDA = (3.85 + 2.67) / 2.0;
const GAMES_PLAYED_TO_RANK = 30;

export function calculateSR(player : IPlayer) : IPlayer {
    const stats = player.warlords;
    const sr = newWarlordsSr();

    try{
        sr.KD  = calculateKD(stats.kills, stats.deaths);
        sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);

        sr.plays = vOr0(stats.mage_plays) + vOr0(stats.paladin_plays) + vOr0(stats.shaman_plays) + vOr0(stats.warrior_plays);
        sr.WL = calculateWL(stats.wins, sr.plays);
        sr.ACCURATE_WL = vOr0(stats.wins) / vOr1(vOr0(sr.plays) - vOr0(stats.wins));
        stats.losses = sr.plays - vOr0(stats.wins);
        sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);

        for(const warlord of WARLORDS){

            stats["losses_" + warlord.name] = vOr0(stats[warlord.name + "_plays"]) - vOr0(stats["wins_" + warlord.name]);
            sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].LEVEL = calculateLevel(warlord.name, stats);
            sr[warlord.name].WINS = vOr0(stats["wins_" + warlord.name]);

            for (const spec of warlord.specs){
                stats["losses_" + spec] = vOr0(stats[spec + "_plays"]) - vOr0(stats["wins_" + spec]);
                sr[warlord.name][spec].WL = calculateWL(stats["wins_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].DHP = calculateDHP(stats["damage_" + spec], stats["heal_" + spec], stats["damage_prevented_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].SR = calculateSr(
                    sr[warlord.name][spec].DHP,
                    stats[spec + "_plays"],
                    sr[warlord.name][spec].WL,
                    sr.KDA,
                    Average[spec.toLocaleUpperCase()],
                    sr.plays,
                    stats.penalty,
                );
                sr[warlord.name][spec].WINS = stats["wins_" + spec]
            }
        }

        sr.mage.SR    = Math.round((vOr0(sr.mage.pyromancer.SR)    + vOr0(sr.mage.aquamancer.SR)    + vOr0(sr.mage.cryomancer.SR)) / 3);
        sr.paladin.SR = Math.round((vOr0(sr.paladin.avenger.SR)    + vOr0(sr.paladin.crusader.SR)   + vOr0(sr.paladin.protector.SR))/3);
        sr.shaman.SR  = Math.round((vOr0(sr.shaman.thunderlord.SR) + vOr0(sr.shaman.spiritguard.SR) + vOr0(sr.shaman.earthwarden.SR))/3);
        sr.warrior.SR = Math.round((vOr0(sr.warrior.berserker.SR)  + vOr0(sr.warrior.defender.SR)   + vOr0(sr.warrior.revenant.SR))/3);

        if(sr.mage.SR == 0)    sr.mage.SR    = null;
        if(sr.paladin.SR == 0) sr.paladin.SR = null;
        if(sr.shaman.SR == 0)  sr.shaman.SR  = null;
        if(sr.warrior.SR == 0) sr.warrior.SR = null;

        sr.SR = Math.round(((vOr0(sr.paladin.SR) + vOr0(sr.mage.SR) + vOr0(sr.shaman.SR) + vOr0(sr.warrior.SR))/4));

        if(sr.SR == 0) sr.SR = null;

    }catch (e) {
        console.error(e)
    }

    player.warlords_sr = sr;
    return player;

}

function calculateLevel(warlord : string, stats : IWarlordsHypixelAPI) : number {
    return vOr0(stats[warlord + "_skill1"])
        + vOr0(stats[warlord + "_skill2"])
        + vOr0(stats[warlord + "_skill3"])
        + vOr0(stats[warlord + "_skill4"])
        + vOr0(stats[warlord + "_skill5"])
        + vOr0(stats[warlord + "_cooldown"])
        + vOr0(stats[warlord + "_critchance"])
        + vOr0(stats[warlord + "_critmultiplier"])
        + vOr0(stats[warlord + "_energy"])
        + vOr0(stats[warlord + "_health"])
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
function calculateSr(dhp : number | null, specPlays : number,  wl : number | null, kda : number | null, average : Average.Average, plays : number | null, penalty : number | null){
    if(dhp == null || specPlays == null || plays == null || wl == null ||  kda == null || specPlays < GAMES_PLAYED_TO_RANK) return null;

    if(disqualify(dhp, specPlays, wl, kda, average, plays, penalty)) return null;

    const dhpAdjusted = adjust_cos(dhp, average.DHP);
    const wlAdjusted = adjust_tanCos(wl, average.WL);
    const kdaAdjusted = adjust_tanCos(kda, AVERAGE_KDA);
    const SR= Math.round((dhpAdjusted + wlAdjusted + (kdaAdjusted / 2)) * (1000 + average.ADJUST));

    if(SR <= 0) return null;
    else return SR;
}

function disqualify(dhp : number, specPlays : number,  wl : number, kda : number, average : Average.Average, plays : number, penalty : number | null) : boolean {
    if(wl > DISQUALIFY.MAX_WL) return true;
    if((vOr0(penalty)/ plays) * 100 >= DISQUALIFY.PERCENT_LEFT) return true

    return false;
}

// WIN/LOSS ------------------------------------------------------------------------------------------------------------

/**
 * A adjusting function to smooth stuff out :D
 *
 * values are capped at 6.8 -> 3.4 times average
 *
 * https://www.wolframalpha.com/input/?i=plot+%5B-cos((x+%2B+3)%2Fpi),+tan((x+-+3)%2Fpi)+%2B+0.35%5D+between+0+and+7
 * plot [-cos((x + 3)/pi), tan((x - 3)/pi) + 0.35] between 0 and 7
 *
 * @param {number} v
 * @param {number} averageRatio
 * @returns {number}
 */
function adjust_tanCos(v : number, average : number){
    v = (v/average)*2 + 0.027
    if(v > 2.027) return Math.min( Math.cos(((v + 3) / Math.PI) + Math.PI) + 1, 2);
    else if(v <= 0.027) return 0;
    else return Math.max(Math.tan((v - 3) / Math.PI) + 0.35 + 1, 0);
}

function calculateWL(wins : number , plays : number){
    return round(vOr0(wins) / vOr1(vOr0(plays) - vOr0(wins)), 100.0);
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
function adjust_cos(v : number, average : number){
    const x = v / average;
    if(x >= 2) return 2;
    else if(x <= 0) return 0;
    else return Math.cos((x * Math.PI) / 2 + Math.PI) + 1;
}

function calculateDHP(dmg : number, heal : number, prevented : number, plays : number | null){
    return Math.round((vOr0(dmg)  + vOr0(heal) + vOr0(prevented))/vOr1(plays));
}

// OTHER ---------------------------------------------------------------------------------------------------------------

function calculateKD(kills : number, deaths: number) : number | null{
    return round(vOr0(kills) / vOr1(deaths), 100.0);
}

function calculateKDA(kills : number, deaths: number, assists : number) : number | null{
    return round((vOr0(kills) + vOr0(assists)) / vOr1(deaths), 100.0);
}


