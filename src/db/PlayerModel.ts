import * as mongoose from "mongoose";
import {PlayerSchema} from "./PlayerSchema";
import {INACTIVE_AFTER} from "../static/Statics";

export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);

export interface IStats{
    DHP : number | null,
    SR : number | null,
    WL : number | null,
    WINS : number | null
}

export interface IWarlordsSR{
    SR : number | null,
    KD : number | null,
    KDA : number | null,
    WL : number | null,
    ACCURATE_WL : number | null,
    plays : number | null,
    DHP : number | null,
    realLosses : number | null,
    realPenalty : number | null

    paladin : {
        DHP : number | null
        SR : number | null
        WL : number | null
        LEVEL : number | null
        WINS : number | null
        avenger : IStats
        crusader : IStats
        protector : IStats
    },

    mage : {
        SR : number | null
        WL : number | null
        DHP : number | null
        LEVEL : number | null
        WINS : number | null
        pyromancer : IStats
        aquamancer : IStats
        cryomancer : IStats
    },

    warrior : {
        DHP : number | null
        SR : number | null
        WL : number | null
        LEVEL : number | null
        WINS : number | null
        berserker : IStats
        defender : IStats
        revenant : IStats
    },

    shaman : {
        DHP : number | null
        SR : number | null
        WL : number | null
        LEVEL : number | null
        WINS : number | null
        thunderlord : IStats
        earthwarden : IStats
        spiritguard : IStats
    }
}

export interface IWarlordsHypixelAPI{

    //general ######################################################################################################
    assists: number,
    damage: number,
    deaths: number,
    heal: number,
    damage_prevented: number,
    damage_taken: number,
    kills: number,
    life_leeched: number,
    wins: number,
    wins_blu: number,
    wins_red: number,
    losses: number,
    penalty: number,

    //Warrior ######################################################################################################
    damage_warrior: number,
    damage_prevented_warrior: number,
    heal_warrior: number,
    warrior_plays: number,
    wins_warrior: number,
    losses_warrior: number,

    warrior_skill1 : number
    warrior_skill2 : number
    warrior_skill3 : number
    warrior_skill4 : number
    warrior_skill5 : number
    warrior_cooldown : number
    warrior_critchance : number
    warrior_critmultiplier : number
    warrior_energy : number
    warrior_health : number

    //BERS -------------------------------------------------------------------------------------------------------//
    berserker_plays: number,
    damage_berserker: number,
    damage_prevented_berserker: number,
    heal_berserker: number,
    life_leeched_berserker: number,
    wins_berserker: number,
    losses_berserker: number,

    //DEF --------------------------------------------------------------------------------------------------------//
    wins_defender: number,
    damage_defender: number,
    defender_plays: number,
    damage_prevented_defender: number,
    heal_defender: number,
    losses_defender: number,

    //REV ------------------------------------------------------------------------------------------------------//
    damage_prevented_revenant: number,
    losses_revenant: number,
    damage_revenant: number,
    heal_revenant: number,
    revenant_plays: number,
    wins_revenant: number,

    //Paladin ######################################################################################################
    damage_prevented_paladin: number,
    damage_paladin: number,
    heal_paladin: number,
    paladin_plays: number,
    wins_paladin: number,
    losses_paladin: number,

    paladin_skill1 : number
    paladin_skill2 : number
    paladin_skill3 : number
    paladin_skill4 : number
    paladin_skill5 : number
    paladin_cooldown : number
    paladin_critchance : number
    paladin_critmultiplier : number
    paladin_energy : number
    paladin_health : number


    //AVENGER ----------------------------------------------------------------------------------------------------//
    avenger_plays: number,
    damage_avenger: number,
    damage_prevented_avenger: number,
    heal_avenger: number,
    wins_avenger: number,
    losses_avenger: number,

    //CRUS -------------------------------------------------------------------------------------------------------//
    losses_crusader: number,
    crusader_plays: number,
    heal_crusader: number,
    damage_crusader: number,
    damage_prevented_crusader: number,
    wins_crusader: number,

    //PROT -------------------------------------------------------------------------------------------------------//
    damage_prevented_protector: number,
    protector_plays: number,
    wins_protector: number,
    heal_protector: number,
    damage_protector: number,
    losses_protector: number,


    //Mage #########################################################################################################
    damage_prevented_mage: number,
    damage_mage: number,
    mage_plays: number,
    heal_mage: number,
    wins_mage: number,
    losses_mage: number,

    mage_skill1 : number
    mage_skill2 : number
    mage_skill3 : number
    mage_skill4 : number
    mage_skill5 : number
    mage_cooldown : number
    mage_critchance : number
    mage_critmultiplier : number
    mage_energy : number
    mage_health : number


    //PYRO -------------------------------------------------------------------------------------------------------//
    damage_prevented_pyromancer: number,
    damage_pyromancer: number,
    heal_pyromancer: number,
    wins_pyromancer: number,
    pyromancer_plays: number,
    losses_pyromancer: number,

    //CRYO -------------------------------------------------------------------------------------------------------//
    cryomancer_plays: number,
    heal_cryomancer: number,
    damage_prevented_cryomancer: number,
    losses_cryomancer: number,
    damage_cryomancer: number,
    wins_cryomancer: number,

    //AQUA -------------------------------------------------------------------------------------------------------//
    damage_prevented_aquamancer: number,
    wins_aquamancer: number,
    damage_aquamancer: number,
    aquamancer_plays: number,
    heal_aquamancer: number,
    losses_aquamancer: number,

    //Shaman #######################################################################################################
    heal_shaman: number,
    damage_shaman: number,
    losses_shaman: number,
    shaman_plays: number,
    damage_prevented_shaman: number,
    wins_shaman: number,

    shaman_skill1 : number
    shaman_skill2 : number
    shaman_skill3 : number
    shaman_skill4 : number
    shaman_skill5 : number
    shaman_cooldown : number
    shaman_critchance : number
    shaman_critmultiplier : number
    shaman_energy : number
    shaman_health : number


    //TL ---------------------------------------------------------------------------------------------------------//
    heal_thunderlord: number,
    thunderlord_plays: number,
    damage_thunderlord: number,
    losses_thunderlord: number,
    damage_prevented_thunderlord: number,
    wins_thunderlord: number,

    //SPIRIT ------------------------------------------------------------------------------------------------------//
    damage_prevented_spiritguard: number,
    losses_spiritguard: number,
    damage_spiritguard: number,
    heal_spiritguard: number,
    spiritguard_plays: number,
    wins_spiritguard: number,

    //EARTH ------------------------------------------------------------------------------------------------------//
    damage_prevented_earthwarden: number,
    losses_earthwarden: number,
    damage_earthwarden: number,
    heal_earthwarden: number,
    earthwarden_plays: number,
    wins_earthwarden: number,


    //Gamemodes ####################################################################################################

    //CTF --------------------------------------------------------------------------------------------------------//
    wins_capturetheflag: number,
    wins_capturetheflag_blu: number,
    wins_capturetheflag_red: number,
    flag_conquer_team: number,
    flag_conquer_self: number,
    wins_capturetheflag_b: number,
    wins_capturetheflag_a: number,

    //DOM --------------------------------------------------------------------------------------------------------//
    wins_domination: number,
    wins_domination_blu: number,
    wins_domination_red: number,
    wins_domination_a: number,
    wins_domination_b: number,

    //TDM --------------------------------------------------------------------------------------------------------//
    wins_teamdeathmatch: number,
    wins_teamdeathmatch_a: number,
    wins_teamdeathmatch_blu: number,
    wins_teamdeathmatch_red: number,
    wins_teamdeathmatch_b: number,
}

export interface IPlayer extends mongoose.Document{
    uuid : String,
    name : String,
    lastTimeRecalculated? : number,
    lastLogin?: number,
    warlords : IWarlordsHypixelAPI
    warlords_sr : IWarlordsSR
}

PlayerModel.schema.virtual("isInactive").get(function (this: IPlayer) {
    return (this.lastLogin && this.lastLogin < Date.now() - INACTIVE_AFTER)
        || (this.lastTimeRecalculated && this.lastTimeRecalculated < Date.now() - INACTIVE_AFTER)
})




