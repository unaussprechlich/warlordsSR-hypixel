"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToUuid = void 0;
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const http_status_codes_1 = require("http-status-codes");
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const uuidLongPatter = RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}?').compile();
function stringToUuid(str) {
    if (uuidLongPatter.test(str)) {
        return UUID_1.default.fromString(str);
    }
    else if (uuidShortPattern.test(str)) {
        return UUID_1.default.fromShortString(str);
    }
    else {
        throw {
            message: "Can't parse UUID!",
            status: http_status_codes_1.StatusCodes.BAD_REQUEST
        };
    }
}
exports.stringToUuid = stringToUuid;
//# sourceMappingURL=UUID.js.map