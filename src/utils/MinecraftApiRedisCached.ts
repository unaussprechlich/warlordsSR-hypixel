import * as MinecraftAPI from "minecraft-api"
import {redis} from "../../app";
import UUID from "hypixel-api-typescript/src/UUID";
import {StatusCodes} from "http-status-codes";
import {NameHistoryResponseModel} from "minecraft-api/index";
import {stringToUuid} from "./UUID";


const REDIS_KEY_PREFIX = "mojang"

const CACHE_TIME = 24 * 60 * 60 // 24 Hours

async function get(prefix : string, key : string){
    return redis.get(`${REDIS_KEY_PREFIX}:${prefix}:${key}`)
}

async function set(prefix : string, key : string, value : string){
    return redis.set(`${REDIS_KEY_PREFIX}:${prefix}:${key}`, value, ["EX", CACHE_TIME])
}

export async function uuidForName(name : string) : Promise<UUID>{
    const PREFIX = "uuidforname"

    const cacheResult = await get(PREFIX, name)

    if(cacheResult) return stringToUuid(cacheResult)

    const uuid_string = await MinecraftAPI.uuidForName(name);
    if(!uuid_string) throw {
        message : "Player with NAME:" + name.toString() + " not found!",
        status : StatusCodes.NOT_FOUND
    }
    const uuid = stringToUuid(uuid_string)
    await set(PREFIX, name, uuid.toString())
    return uuid
}

export async function nameHistoryForUuid(uuid : UUID) : Promise<Array<NameHistoryResponseModel>>{
    const PREFIX = "namehistoryforuuid"

    const cacheResult = await get(PREFIX, uuid.toString())

    if(cacheResult) return JSON.parse(cacheResult) as Array<NameHistoryResponseModel>;

    const history = await MinecraftAPI.nameHistoryForUuid(uuid.toString());
    await set(PREFIX, uuid.toString(), JSON.stringify(history))
    return history
}



