"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const MinecraftAPI = require("minecraft-api");
const Player = require("../src/Player");
const UUID_1 = require("hypixel-api-typescript/src/UUID");
const uuidShortPattern = RegExp('^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}?').compile();
const uuidLongPatter = RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}?').compile();
const minecraftPlayernamePattern = RegExp("[a-zA-Z0-9_]{1,16}").compile();
router.get('/*', async function (req, res, next) {
    try {
        const url = req.baseUrl.split("/");
        console.log(url);
        if (!url[2])
            throw "No name/uuid provided";
        let uuid;
        if (minecraftPlayernamePattern.test(url[2])) {
            try {
                uuid = UUID_1.default.fromShortString(await MinecraftAPI.uuidForName(url[2]));
            }
            catch (e) {
                throw { message: "PLAYER NOT FOUND!", error: { code: 404 } };
            }
        }
        else if (uuidShortPattern.test(url[2])) {
            uuid = UUID_1.default.fromShortString(url[2]);
        }
        else if (uuidLongPatter.test(url[2])) {
            uuid = UUID_1.default.fromString(url[2]);
        }
        else {
            throw "The provided path is not of type uuid or username.";
        }
        const player = await Player.defaultCache.get(uuid);
        const ranking = await player.getRanking();
        if (player == null)
            throw "Player with UUID:" + uuid.toString() + " not found!";
        res.render('player', {
            PAGE_TITLE: "Player | " + player.data.name,
            PLAYER: player.data,
            RANKING: ranking
        });
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});
module.exports = router;
