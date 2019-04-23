import * as mongoose from "mongoose";
import * as SrCalculator from "./SrCalculator"
import {PlayerSchema} from "./PlayerSchema";

export const PlayerModel = mongoose.model<IPlayer>('Player', PlayerSchema);

PlayerSchema.pre('save', function(next) {
    this["warlords_sr"] = SrCalculator.calculateSR(this as IPlayer);
    next()
});

export interface IStats{
    DHP : number | null,
    SR : number | null,
    WL : number | null
}

export interface IWarlordsSR{
    SR : number | null,
    KD : number | null,
    KDA : number | null,
    WL : number | null,
    plays : number | null,
    DHP : number | null,
    realLosses : number | null,
    realPenalty : number | null

    paladin : {
        DHP : number | null,
        SR : number | null,
        WL : number | null,
        avenger : IStats
        crusader : IStats
        protector : IStats
    },

    mage : {
        SR : number | null,
        WL : number | null,
        DHP : number | null,
        pyromancer : IStats
        aquamancer : IStats
        cryomancer : IStats
    },

    warrior : {
        DHP : number | null,
        SR : number | null,
        WL : number | null,
        berserker : IStats
        defender : IStats
        revenant : IStats
    },

    shaman : {
        DHP : number | null,
        SR : number | null,
        WL : number | null,
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

    //TL ---------------------------------------------------------------------------------------------------------//
    heal_thunderlord: number,
    thunderlord_plays: number,
    damage_thunderlord: number,
    losses_thunderlord: number,
    damage_prevented_thunderlord: number,
    wins_thunderlord: number,

    //REV ------------------------------------------------------------------------------------------------------//
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

    warlords_sr : IWarlordsSR,

    warlords : IWarlordsHypixelAPI
}




