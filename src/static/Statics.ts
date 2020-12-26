import {Average} from "./Average";

/**
 * If a players value is bigger than the disqualifier, the player will
 * no longer be able to rank until they drop below it.
 */
export const DISQUALIFY = {
    MAX_WL: 5,
    PERCENT_LEFT: 4
}

/**
 * The current average KDA =
 * KDA ranked players: 3.85
 * KDA all players: 2.67
 */
const AVERAGE_KDA_RANKED_PLAYERS = 3.85
const AVERAGE_KDA_ALL_PLAYERS = 2.67
export const AVERAGE_KDA = (AVERAGE_KDA_RANKED_PLAYERS + AVERAGE_KDA_ALL_PLAYERS) / 2.0;

export const GAMES_PLAYED_TO_RANK = 30;

export const PYROMANCER  = new Average(97695,  52789,  1);
export const CRYOMANCER  = new Average(93835,  62240,  1);
export const AQUAMANCER  = new Average(119562, 85777,  1);
export const AVENGER     = new Average(101711, 55342,  1);
export const CRUSADER    = new Average(104832, 77350,  1);
export const PROTECTOR   = new Average(142710, 110251, 1);
export const THUNDERLORD = new Average(107874, 60644,  1);
export const SPIRITGUARD = new Average(133380, 92371,  1);
export const EARTHWARDEN = new Average(119167, 73295,  1);
export const BERSERKER   = new Average(88993,  47507,  1);
export const DEFENDER    = new Average(90839,  108285, 1);
export const REVENANT    = new Average(135250, 100442, 1);
