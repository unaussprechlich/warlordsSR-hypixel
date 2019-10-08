import {IPlayer} from "./PlayerDB";
import {round, vOr0, vOr1} from "./utils/MathUtils";
import {newWarlordsSr, WARLORDS} from "./Warlords";
import * as Average from "./Average";
import {Player} from "./Player";
import UUID from "hypixel-api-typescript/src/UUID";

const LEAVING_PUNISHMENT = 15;
const ANTI_SNIPER_TRESHOLD = 15000 + 7500; //averagePrevented = 13431 averageHeals = 7215
const ANTI_DEFENDER_NOOB_THRESHOLD_HEAL = 3000; //average = 2640
const ANTI_DEFENDER_NOOB_THRESHOLD_PREVENTED = 40000; //average = 35000
const AVERAGE_KDA = 7; //real: 6.86034034034034;
const GAMES_PLAYED_TO_RANK = 30;

export async function calculateSR(player : IPlayer) : Promise<IPlayer> {
    const stats = player.warlords;
    const sr = newWarlordsSr();

    try{
        sr.KD  = calculateKD(stats.kills, stats.deaths);
        sr.KDA = calculateKDA(stats.kills, stats.deaths, stats.assists);

        sr.plays = vOr0(stats.mage_plays) + vOr0(stats.paladin_plays) + vOr0(stats.shaman_plays) + vOr0(stats.warrior_plays);
        sr.WL = calculateWL(stats.wins, sr.plays);
        player.warlords.losses = sr.plays - vOr0(stats.wins);
        sr.DHP = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);

        for(const warlord of WARLORDS){

            player.warlords["losses_" + warlord.name] = vOr0(stats[warlord.name + "_plays"]) - vOr0(stats["wins_" + warlord.name]);
            sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);

            for (const spec of warlord.specs){
                player.warlords["losses_" + spec] = vOr0(stats[spec + "_plays"]) - vOr0(stats["wins_" + spec]);
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
    if(player.name == "sumSmash") {
        const Koary = await Player.init(UUID.fromString("01c4a20e-0a60-466f-bd98-ea71c346e5e4"),true)
        if(Koary) {
            sr.SR = vOr0(Koary.data.warlords_sr.SR) + 1;
            sr.mage.SR = vOr0(Koary.data.warlords_sr.mage.SR) + 1;
            sr.paladin.SR = vOr0(Koary.data.warlords_sr.paladin.SR) + 1;
            sr.warrior.SR = vOr0(Koary.data.warlords_sr.warrior.SR) + 1;
            sr.shaman.SR = vOr0(Koary.data.warlords_sr.shaman.SR) + 1;
            sr.DHP = vOr0(Koary.data.warlords_sr.DHP) + 1;
        }
        else {
            sr.SR = 5000;
        }
    }
    player.warlords_sr = sr;
    return player;

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
function calculateSr(dhp : number | null, specPlays : number,  wl : number | null, kda : number | null, average : Average.Average, plays : number | null, penalty : number){
    if(dhp == null || specPlays == null || plays == null || wl == null ||  kda == null || specPlays < GAMES_PLAYED_TO_RANK) return null;
    if(penalty == null) penalty = 0;
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
    return round(vOr0(wins) / vOr1(vOr0(plays) - vOr0(wins)), 100);
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
    return Math.round((vOr0(dmg)  + vOr0(heal) + vOr0(prevented))/vOr1(plays));
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

function calculateKD(kills : number, deaths: number) : number | null{
    return round(vOr0(kills) / vOr1(deaths), 100);
}

function calculateKDA(kills : number, deaths: number, assists : number) : number | null{
    return round((vOr0(kills) + vOr0(assists)) / vOr1(deaths), 100);
}


