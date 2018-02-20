"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
router.get('/', async function (req, res, next) {
    try {
        res.render('index', { PAGE_TITLE: 'WarlordsSR' });
    }
    catch (err) {
        next(err);
    }
});
module.exports = router;
