import * as mongoose from "mongoose";
import {INACTIVE_AFTER} from "../static/Statics";
import {IPlayer, IWeapon, PlayerModel} from "./PlayerModel";

export const PlayerSchema = new mongoose.Schema({
    uuid : String,
    name : String,
    lastLogin : Number,
    lastTimeRecalculated : Number,

    warlords_sr : {
        SR : Number,
        KD : Number,
        KDA : Number,
        WL : Number,
        ACCURATE_WL : Number,
        plays : Number,
        DHP : Number,

        paladin : {
            DHP : Number,
            SR : Number,
            WL : Number,
            LEVEL : Number,
            WINS : Number,
            avenger : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            crusader : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            protector : {
                DHP : Number,
                SR: Number,
                WL: Number,
                WINS : Number
            }
        },

        mage : {
            SR : Number,
            WL : Number,
            DHP : Number,
            LEVEL : Number,
            WINS : Number,
            pyromancer : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            aquamancer : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            cryomancer : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            }
        },

        warrior : {
            DHP : Number,
            SR : Number,
            WL : Number,
            LEVEL : Number,
            WINS : Number,
            berserker : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            defender : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            revenant : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            }
        },

        shaman : {
            DHP : Number,
            SR : Number,
            WL : Number,
            LEVEL : Number,
            WINS : Number,
            thunderlord : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            spiritguard : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            },
            earthwarden : {
                DHP : Number,
                SR : Number,
                WL : Number,
                WINS : Number
            }
        }
    },

    warlords : {

        //general ######################################################################################################
        assists: Number,
        damage: Number,
        deaths: Number,
        heal: Number,
        damage_prevented: Number,
        damage_taken: Number,
        kills: Number,
        life_leeched: Number,
        wins: Number,
        wins_blu: Number,
        wins_red: Number,
        losses: Number,
        penalty: Number,

        //Warrior ######################################################################################################
        damage_warrior: Number,
        damage_prevented_warrior: Number,
        heal_warrior: Number,
        warrior_plays: Number,
        wins_warrior: Number,
        losses_warrior: Number,

        warrior_skill1 : Number,
        warrior_skill2 : Number,
        warrior_skill3 : Number,
        warrior_skill4 : Number,
        warrior_skill5 : Number,
        warrior_cooldown : Number,
        warrior_critchance : Number,
        warrior_critmultiplier : Number,
        warrior_energy : Number,
        warrior_health : Number,

        //BERS -------------------------------------------------------------------------------------------------------//
        berserker_plays: Number,
        damage_berserker: Number,
        damage_prevented_berserker: Number,
        heal_berserker: Number,
        life_leeched_berserker: Number,
        wins_berserker: Number,
        losses_berserker: Number,

        //REV --------------------------------------------------------------------------------------------------------//
        wins_revenant: Number,
        damage_revenant: Number,
        revenant_plays: Number,
        damage_prevented_revenant: Number,
        heal_revenant: Number,
        losses_revenant: Number,

        //DEF --------------------------------------------------------------------------------------------------------//
        wins_defender: Number,
        damage_defender: Number,
        defender_plays: Number,
        damage_prevented_defender: Number,
        heal_defender: Number,
        losses_defender: Number,

        //Paladin ######################################################################################################
        damage_prevented_paladin: Number,
        damage_paladin: Number,
        heal_paladin: Number,
        paladin_plays: Number,
        wins_paladin: Number,
        losses_paladin: Number,

        paladin_skill1 : Number,
        paladin_skill2 : Number,
        paladin_skill3 : Number,
        paladin_skill4 : Number,
        paladin_skill5 : Number,
        paladin_cooldown : Number,
        paladin_critchance : Number,
        paladin_critmultiplier : Number,
        paladin_energy : Number,
        paladin_health : Number,

        //AVENGER ----------------------------------------------------------------------------------------------------//
        avenger_plays: Number,
        damage_avenger: Number,
        damage_prevented_avenger: Number,
        heal_avenger: Number,
        wins_avenger: Number,
        losses_avenger: Number,

        //CRUS -------------------------------------------------------------------------------------------------------//
        losses_crusader: Number,
        crusader_plays: Number,
        heal_crusader: Number,
        damage_crusader: Number,
        damage_prevented_crusader: Number,
        wins_crusader: Number,

        //PROT -------------------------------------------------------------------------------------------------------//
        damage_prevented_protector: Number,
        protector_plays: Number,
        wins_protector: Number,
        heal_protector: Number,
        damage_protector: Number,
        losses_protector: Number,


        //Mage #########################################################################################################
        damage_prevented_mage: Number,
        damage_mage: Number,
        mage_plays: Number,
        heal_mage: Number,
        wins_mage: Number,
        losses_mage: Number,

        mage_skill1 : Number,
        mage_skill2 : Number,
        mage_skill3 : Number,
        mage_skill4 : Number,
        mage_skill5 : Number,
        mage_cooldown : Number,
        mage_critchance : Number,
        mage_critmultiplier : Number,
        mage_energy : Number,
        mage_health : Number,

        //PYRO -------------------------------------------------------------------------------------------------------//
        damage_prevented_pyromancer: Number,
        damage_pyromancer: Number,
        heal_pyromancer: Number,
        wins_pyromancer: Number,
        pyromancer_plays: Number,
        losses_pyromancer: Number,

        //CRYO -------------------------------------------------------------------------------------------------------//
        cryomancer_plays: Number,
        heal_cryomancer: Number,
        damage_prevented_cryomancer: Number,
        losses_cryomancer: Number,
        damage_cryomancer: Number,
        wins_cryomancer: Number,

        //AQUA -------------------------------------------------------------------------------------------------------//
        damage_prevented_aquamancer: Number,
        wins_aquamancer: Number,
        damage_aquamancer: Number,
        aquamancer_plays: Number,
        heal_aquamancer: Number,
        losses_aquamancer: Number,

        //Shaman #######################################################################################################
        heal_shaman: Number,
        damage_shaman: Number,
        losses_shaman: Number,
        shaman_plays: Number,
        damage_prevented_shaman: Number,
        wins_shaman: Number,

        shaman_skill1 : Number,
        shaman_skill2 : Number,
        shaman_skill3 : Number,
        shaman_skill4 : Number,
        shaman_skill5 : Number,
        shaman_cooldown : Number,
        shaman_critchance : Number,
        shaman_critmultiplier : Number,
        shaman_energy : Number,
        shaman_health : Number,

        //TL ---------------------------------------------------------------------------------------------------------//
        heal_thunderlord: Number,
        thunderlord_plays: Number,
        damage_thunderlord: Number,
        losses_thunderlord: Number,
        damage_prevented_thunderlord: Number,
        wins_thunderlord: Number,

        //SPIRIT -----------------------------------------------------------------------------------------------------//
        damage_prevented_spiritguard: Number,
        losses_spiritguard: Number,
        damage_spiritguard: Number,
        heal_spiritguard: Number,
        spiritguard_plays: Number,
        wins_spiritguard: Number,


        //EARTH ------------------------------------------------------------------------------------------------------//
        damage_prevented_earthwarden: Number,
        losses_earthwarden: Number,
        damage_earthwarden: Number,
        heal_earthwarden: Number,
        earthwarden_plays: Number,
        wins_earthwarden: Number,


        //Gamemodes ####################################################################################################

        //CTF --------------------------------------------------------------------------------------------------------//
        wins_capturetheflag: Number,
        wins_capturetheflag_blu: Number,
        wins_capturetheflag_red: Number,
        flag_conquer_team: Number,
        flag_conquer_self: Number,
        wins_capturetheflag_b: Number,
        wins_capturetheflag_a: Number,

        //DOM --------------------------------------------------------------------------------------------------------//
        wins_domination: Number,
        wins_domination_blu: Number,
        wins_domination_red: Number,
        wins_domination_a: Number,
        wins_domination_b: Number,

        //TDM --------------------------------------------------------------------------------------------------------//
        wins_teamdeathmatch: Number,
        wins_teamdeathmatch_a: Number,
        wins_teamdeathmatch_blu: Number,
        wins_teamdeathmatch_red: Number,
        wins_teamdeathmatch_b: Number,

        //WEAPONS
        weapon_inventory : [
            {
                spec : {
                    spec : Number,
                    playerClass : Number,
                },
                ability: Number,
                abilityBoost: Number,
                damage: Number,
                energy: Number,
                chance: Number,
                multiplier: Number,
                health: Number,
                cooldown: Number,
                movement: Number,
                material: String,
                id: Number,
                category: String,
                crafted: Boolean,
                upgradeMax: Number,
                upgradeTimes: Number,
                unlocked: Boolean,
            }
        ],
    }
});
