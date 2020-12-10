import UUID from "hypixel-api-typescript/src/UUID";
import {StatusCodes} from "http-status-codes";

const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const uuidLongPatter = RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}?').compile();


export function stringToUuid(str : string) : UUID{
    if(uuidLongPatter.test(str)) {
        return UUID.fromString(str)
    } else if(uuidShortPattern.test(str)){
        return UUID.fromShortString(str)
    } else {
        throw {
            message : "Can't parse UUID!",
            status : StatusCodes.BAD_REQUEST
        }
    }
}





