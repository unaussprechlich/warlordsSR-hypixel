import {IWarlordsSR} from "./PlayerDB";

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
            "spiritguard",
            "earthwarden"
        ]
    },
    {
        name : "warrior",
        specs : [
            "berserker",
            "defender",
            "revenant"
        ]
    }
];

export const CLAZZES = WARLORDS.map(value => value.name);

export function newWarlordsSr() : IWarlordsSR{
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
            revenant : {SR : null, DHP : null, WL : null}
        },

        shaman : {
            DHP :  null,
            SR :  null,
            WL :  null,
            thunderlord : {SR : null, DHP : null, WL : null},
            earthwarden : {SR : null, DHP : null, WL : null},
            spiritguard : {SR : null, DHP : null, WL : null}
        }
    };
}