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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
dotenv.config({ path: ".env" });
var utils_1 = require("../utils");
var kv_1 = require("@vercel/kv");
var kv = (0, kv_1.createClient)({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
});
function getEvent(eventName) {
    if (eventName === void 0) { eventName = "sblviii-ml"; }
    return __awaiter(this, void 0, void 0, function () {
        var eventData, maxValue, fids, bet, streak, payout, _a, _b, _c, _i, fid, count, bet;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, kv.hget("events", "".concat(eventName))];
                case 1:
                    eventData = _d.sent();
                    console.log("Event: ".concat(eventName));
                    console.log(eventData);
                    console.log("Total bets: ".concat((Object.keys((eventData === null || eventData === void 0 ? void 0 : eventData.bets) || {}).length)));
                    if (!((eventData === null || eventData === void 0 ? void 0 : eventData.result) !== -1)) return [3 /*break*/, 6];
                    maxValue = 0;
                    fids = [];
                    bet = void 0;
                    streak = 0;
                    payout = 0;
                    _a = eventData === null || eventData === void 0 ? void 0 : eventData.bets;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _d.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 5];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 4];
                    fid = _c;
                    bet = (eventData === null || eventData === void 0 ? void 0 : eventData.bets[parseInt(fid)]) || utils_1.DEFAULT_BET;
                    if (!(bet.prediction === (eventData === null || eventData === void 0 ? void 0 : eventData.result))) return [3 /*break*/, 4];
                    return [4 /*yield*/, kv.hget("".concat(fid), 'streak')];
                case 3:
                    streak = (_d.sent()) || 0;
                    payout = (0, utils_1.calculatePayout)((eventData === null || eventData === void 0 ? void 0 : eventData.multiplier) || 1, (eventData === null || eventData === void 0 ? void 0 : eventData.odds[eventData === null || eventData === void 0 ? void 0 : eventData.result]) || 0.5, bet.stake, streak);
                    if (payout > maxValue) {
                        fids = [fid];
                        maxValue = payout;
                    }
                    else if (payout === maxValue) {
                        fids.push(fid);
                    }
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("MAX WINNERS COUNT: ".concat(fids.length));
                    console.log("MAX WINNERS: ".concat(fids));
                    console.log("MAX WINNERS PAYOUT: ".concat(maxValue));
                    _d.label = 6;
                case 6:
                    count = 0;
                    for (bet in eventData === null || eventData === void 0 ? void 0 : eventData.bets) {
                        count++;
                    }
                    console.log("Total bets: ".concat(count));
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    // Read in cli arguments
    var args = require('minimist')(process.argv.slice(2), { string: ['e'] });
    getEvent(args['e']).then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
module.exports = getEvent;
