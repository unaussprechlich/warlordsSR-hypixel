import {Average} from "./Average";

/**
 * If a players value is bigger than the disqualifier, the player will
 * no longer be able to rank until they drop below it.
 */
export const DISQUALIFY = {
    MAX_WL: 5,
    PERCENT_LEFT: 4
}

export const INACTIVE_AFTER = 1000 * 60 * 60 * 24 * 100

/**
 * The current average KDA =
 * KDA ranked players: 3.85
 * KDA all players: 2.67
 */
const AVERAGE_KDA_RANKED_PLAYERS = 3.85
const AVERAGE_KDA_ALL_PLAYERS = 2.67
export const AVERAGE_KDA = (AVERAGE_KDA_RANKED_PLAYERS + AVERAGE_KDA_ALL_PLAYERS) / 2.0;

export const GAMES_PLAYED_TO_RANK = 50;

export const PYROMANCER  = new Average(109706,  52789, 1);
export const CRYOMANCER  = new Average(103596,  62240, 1);
export const AQUAMANCER  = new Average(131094, 85777,  1);
export const AVENGER     = new Average(113914, 55342,  1);
export const CRUSADER    = new Average(114263, 77350,  1);
export const PROTECTOR   = new Average(153370, 110251, 1);
export const THUNDERLORD = new Average(121714, 60644,  1);
export const SPIRITGUARD = new Average(152469, 92371,  1);
export const EARTHWARDEN = new Average(131804, 73295,  1);
export const BERSERKER   = new Average(99964,  47507,  1);
export const DEFENDER    = new Average(98341,  108285, 1);
export const REVENANT    = new Average(150710, 100442, 1);
