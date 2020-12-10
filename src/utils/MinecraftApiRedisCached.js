"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameHistoryForUuid = exports.uuidForName = void 0;
const MinecraftAPI = require("minecraft-api");
const app_1 = require("../../app");
const http_status_codes_1 = require("http-status-codes");
const UUID_1 = require("./UUID");
const REDIS_KEY_PREFIX = "mojang";
const CACHE_TIME = 24 * 60 * 60;
function get(prefix, key) {
    return __awaiter(this, void 0, void 0, function* () {
        return app_1.redis.get(`${REDIS_KEY_PREFIX}:${prefix}:${key}`);
    });
}
function set(prefix, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        return app_1.redis.set(`${REDIS_KEY_PREFIX}:${prefix}:${key}`, value, ["EX", CACHE_TIME]);
    });
}
function uuidForName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const PREFIX = "uuidforname";
        const cacheResult = yield get(PREFIX, name);
        if (cacheResult)
            return UUID_1.stringToUuid(cacheResult);
        const uuid_string = yield MinecraftAPI.uuidForName(name);
        if (!uuid_string)
            throw {
                message: "Player with NAME:" + name.toString() + " not found!",
                status: http_status_codes_1.StatusCodes.NOT_FOUND
            };
        const uuid = UUID_1.stringToUuid(uuid_string);
        yield set(PREFIX, name, uuid.toString());
        return uuid;
    });
}
exports.uuidForName = uuidForName;
function nameHistoryForUuid(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        const PREFIX = "namehistoryforuuid";
        const cacheResult = yield get(PREFIX, uuid.toString());
        if (cacheResult)
            return JSON.parse(cacheResult);
        const history = yield MinecraftAPI.nameHistoryForUuid(uuid.toString());
        yield set(PREFIX, uuid.toString(), JSON.stringify(history));
        return history;
    });
}
exports.nameHistoryForUuid = nameHistoryForUuid;
//# sourceMappingURL=MinecraftApiRedisCached.js.map