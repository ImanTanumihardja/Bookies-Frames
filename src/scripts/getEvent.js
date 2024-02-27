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
        var eventData, betsData, cursor, fids, maxValue, fids_2, streak, payout, _i, fids_1, fid, user, bets, _a, bets_1, bet;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, kv.hgetall("".concat(eventName))];
                case 1:
                    eventData = _b.sent();
                    console.log("Event: ".concat(eventName));
                    console.log(eventData);
                    return [4 /*yield*/, kv.zscan("leaderboard", 0, { count: 150 })];
                case 2:
                    betsData = (_b.sent());
                    cursor = betsData[0];
                    fids = betsData[1];
                    _b.label = 3;
                case 3:
                    if (!cursor) return [3 /*break*/, 5];
                    return [4 /*yield*/, kv.zscan("leaderboard", cursor, { count: 150 })];
                case 4:
                    betsData = (_b.sent());
                    cursor = betsData[0];
                    fids = fids.concat(betsData[1]);
                    return [3 /*break*/, 3];
                case 5:
                    console.log("Total bets: ".concat(fids.length / 2));
                    if (!((eventData === null || eventData === void 0 ? void 0 : eventData.result) != -1)) return [3 /*break*/, 10];
                    maxValue = 0;
                    fids_2 = [];
                    streak = 0;
                    payout = 0;
                    _i = 0, fids_1 = fids_2;
                    _b.label = 6;
                case 6:
                    if (!(_i < fids_1.length)) return [3 /*break*/, 9];
                    fid = fids_1[_i];
                    return [4 /*yield*/, kv.hgetall(fid.toString())];
                case 7:
                    user = _b.sent();
                    if (user === null) {
                        console.error("User: ".concat(fid, " does not exist"));
                        return [3 /*break*/, 8];
                    }
                    bets = user === null || user === void 0 ? void 0 : user.bets[eventName];
                    for (_a = 0, bets_1 = bets; _a < bets_1.length; _a++) {
                        bet = bets_1[_a];
                        if (bet.pick === (eventData === null || eventData === void 0 ? void 0 : eventData.result)) {
                            payout = (0, utils_1.calculatePayout)((eventData === null || eventData === void 0 ? void 0 : eventData.multiplier) || 1, (eventData === null || eventData === void 0 ? void 0 : eventData.odds[eventData === null || eventData === void 0 ? void 0 : eventData.result]) || 0.5, bet.stake, streak);
                            if (payout > maxValue) {
                                fids_2 = [fid];
                                maxValue = payout;
                            }
                            else if (payout === maxValue) {
                                fids_2.push(fid);
                            }
                        }
                    }
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("MAX WINNERS COUNT: ".concat(fids_2.length));
                    console.log("MAX WINNERS: ".concat(fids_2));
                    console.log("MAX WINNERS PAYOUT: ".concat(maxValue));
                    _b.label = 10;
                case 10: return [2 /*return*/];
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
