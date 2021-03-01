import {IPlayer, IWarlordsHypixelAPI} from "./db/PlayerModel";
import {round, vOr0, vOr1} from "./utils/MathUtils";
import {newWarlordsSr, WARLORDS} from "./static/Warlords";
import * as Statics from "./static/Statics";
import {Average} from "./static/Average";

/**
 * Calculate the stats and SR for a player.
 * The maximum SR a player can earn is 5000.
 *
 * @param player
 * @param forceRecalculate
 */
export function calculateStatsAndSR(player: IPlayer, forceRecalculate : boolean = false): IPlayer {
    const stats = player.warlords;
    const sr = newWarlordsSr();

    try {
        sr.plays = vOr0(stats.mage_plays) + vOr0(stats.paladin_plays) + vOr0(stats.shaman_plays) + vOr0(stats.warrior_plays);

        if(!forceRecalculate && player.warlords_sr && player.warlords_sr.plays && sr.plays == player.warlords_sr.plays){
            return player;
        } else {
            player.lastTimeRecalculated = Date.now()
        }

        sr.KD    = calculateKD(stats.kills, stats.deaths);
        sr.KDA   = calculateKDA(stats.kills, stats.deaths, stats.assists);

        sr.WL    = calculateWL(stats.wins, sr.plays);
        sr.DHP   = calculateDHP(stats.damage, stats.heal, stats.damage_prevented, sr.plays);

        player.warlords.losses = stats.losses = sr.plays - vOr0(stats.wins);
        sr.ACCURATE_WL = vOr0(stats.wins) / vOr1(stats.losses);

        for (const warlord of WARLORDS) {

            stats["losses_" + warlord.name] = vOr0(stats[warlord.name + "_plays"]) - vOr0(stats["wins_" + warlord.name]);
            sr[warlord.name].WL = calculateWL(stats["wins_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].DHP = calculateDHP(stats["damage_" + warlord.name], stats["heal_" + warlord.name], stats["damage_prevented_" + warlord.name], stats[warlord.name + "_plays"]);
            sr[warlord.name].LEVEL = calculateLevel(warlord.name, stats);
            sr[warlord.name].WINS = vOr0(stats["wins_" + warlord.name]);

            for (const spec of warlord.specs) {
                stats["losses_" + spec] = vOr0(stats[spec + "_plays"]) - vOr0(stats["wins_" + spec]);
                sr[warlord.name][spec].WL = calculateWL(stats["wins_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].DHP = calculateDHP(stats["damage_" + spec], stats["heal_" + spec], stats["damage_prevented_" + spec], stats[spec + "_plays"]);
                sr[warlord.name][spec].SR = calculateSrForSpec(
                    spec,
                    sr[warlord.name][spec].DHP,
                    stats[spec + "_plays"],
                    sr[warlord.name][spec].WL,
                    sr.KDA,
                    sr.plays,
                    stats.penalty,
                );
                sr[warlord.name][spec].WINS = stats["wins_" + spec]
            }

            sr[warlord.name].SR = classSR(
                sr[warlord.name][warlord.specs[0]].SR,
                sr[warlord.name][warlord.specs[1]].SR,
                sr[warlord.name][warlord.specs[2]].SR,
            )
        }

        sr.SR = Math.round(((vOr0(sr.paladin.SR) + vOr0(sr.mage.SR) + vOr0(sr.shaman.SR) + vOr0(sr.warrior.SR)) / 4));

        if (sr.SR == 0) sr.SR = null;

    } catch (e) {
        console.error(e)
    }

    player.warlords_sr = sr;
    return player;
}

/**
 * Calculate the SR for a spec
 */
function calculateSrForSpec(specMame : string, dhp: number | null, specPlays: number, wl: number | null, kda: number | null, plays: number | null, penalty: number | null) {
    if (dhp == null || specPlays == null || plays == null || wl == null || kda == null) return null;

    //Get the average for that spec
    const average = Statics[specMame.toLocaleUpperCase()]

    //set SR to null if the player has not played enough games yet
    if(specPlays < Statics.GAMES_PLAYED_TO_RANK)  return null

    //set SR to null if the player is disqualified
    if (disqualify(dhp, specPlays, wl, kda, average, plays, penalty)) return null;

    //    Category    % of SR                                    Maximum SR
    const srFromDHP = adjustTheAverage(dhp, average.DHP)         * 2000;
    const srFromWL  = adjustTheAverage(wl, average.WL)           * 2000;
    const srFromKDA = adjustTheAverage(kda, Statics.AVERAGE_KDA) * 1000;

    const SR = Math.round(srFromDHP + srFromWL + srFromKDA);

    if (SR <= 0) return null;
    else return SR;
}

/**
 * Determine if a player should be disqualified for a SR category
 */
function disqualify(dhp: number, specPlays: number, wl: number, kda: number, average: Average, plays: number, penalty: number | null): boolean {
    //Check if the WL of the player is too high
    if (wl > Statics.DISQUALIFY.MAX_WL) return true;

    //Check if the player has left too many games
    if ((vOr0(penalty) / plays) * 100 >= Statics.DISQUALIFY.PERCENT_LEFT) return true

    //Nope he is fine
    return false;
}

/**
 * This function is used to determins how many % of SR a player should earn
 * for the stat category.
 *
 * We want to have a fair distribution with only the super bad players stuck
 * at SR < 20% of maximum SR. Most players should be ranked around 50% of the maximum SR.
 *
 * Also with this function the SR does no longer have any "hard caps" if you perform 2x the
 * average you will gain 90% of the SR for that category. This represents a "soft cap". Until 5x
 * the average you can only gain 10% more SR.
 *
 * https://www.wolframalpha.com/input/?i=plot+%5B1.00699+%2B+%28-1.02107%2F%281.01398+%2B+x%5E3.09248%29%29%5D+between+0+and+5
 *
 * Average  SR %
 * 0.0      0%
 * 1.0      50%
 * 2.0      90%
 * 5.0      100%
 *
 * @param value
 * @param staticAverage
 */
function adjustTheAverage(value: number, staticAverage: number){
    const average = value / staticAverage

    if(average >= 5) return 1.0
    else if(average <= 0) return 0.0

    return 1.00699 + (-1.02107 / (1.01398 + Math.pow(average, 3.09248)))
}

// Helper --------------------------------------------------------------------------------------------------------------

function calculateKD(kills: number, deaths: number): number | null {
    return round(vOr0(kills) / vOr1(deaths), 100.0);
}

function calculateKDA(kills: number, deaths: number, assists: number): number | null {
    return round((vOr0(kills) + vOr0(assists)) / vOr1(deaths), 100.0);
}

function calculateDHP(dmg: number, heal: number, prevented: number, plays: number | null) {
    return Math.round((vOr0(dmg) + vOr0(heal) + vOr0(prevented)) / vOr1(plays));
}

function classSR(damageSpecSR, healingSpecSR, defenceSpecSR){
    const SR = Math.round((vOr0(damageSpecSR)+vOr0(healingSpecSR)+vOr0(defenceSpecSR))/3.0);
    if(SR == 0) return null
    else return SR
}

function calculateWL(wins: number, plays: number) {
    return round(vOr0(wins) / vOr1(vOr0(plays) - vOr0(wins)), 100.0);
}

function calculateLevel(warlord: string, stats: IWarlordsHypixelAPI): number {
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
