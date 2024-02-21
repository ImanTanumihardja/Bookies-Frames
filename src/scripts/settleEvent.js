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
// const { createClient  } = require("@vercel/kv");
var dotenv = require("dotenv");
dotenv.config({ path: ".env" });
var utils_1 = require("../utils");
var kv_1 = require("@vercel/kv");
var kv = (0, kv_1.createClient)({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
});
function settleEvent(eventName, result) {
    if (eventName === void 0) { eventName = ""; }
    if (result === void 0) { result = -1; }
    return __awaiter(this, void 0, void 0, function () {
        var eventData, event, betsData, cursor, bets, _loop_1, _i, bets_1, bet;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, kv.hget("events", "".concat(eventName))];
                case 1:
                    eventData = _a.sent();
                    if (eventData === null) {
                        throw new Error("Event: ".concat(eventName, " does not exist"));
                    }
                    if ((eventData === null || eventData === void 0 ? void 0 : eventData.startDate) > new Date().getTime()) {
                        throw new Error('Event has not started yet');
                    }
                    if ((eventData === null || eventData === void 0 ? void 0 : eventData.result) !== -1) {
                        throw new Error('Event has already been settled');
                    }
                    if (result === -1) {
                        throw new Error('Result is invalid');
                    }
                    console.log("Event: ".concat(eventName));
                    console.log(eventData);
                    // Set the result of the event
                    eventData.result = result;
                    event = {};
                    event[eventName] = eventData;
                    return [4 /*yield*/, kv.hset("events", event)];
                case 2:
                    _a.sent();
                    console.log("Set result of event: ".concat(eventName, " to ").concat(result));
                    return [4 /*yield*/, kv.zscan("users", 0, { count: 150 })];
                case 3:
                    betsData = (_a.sent());
                    cursor = betsData[0];
                    bets = betsData[1];
                    _a.label = 4;
                case 4:
                    if (!cursor) return [3 /*break*/, 6];
                    return [4 /*yield*/, kv.zscan("users", cursor, { count: 150 })];
                case 5:
                    betsData = (_a.sent());
                    cursor = betsData[0];
                    bets = bets.concat(betsData[1]);
                    return [3 /*break*/, 4];
                case 6:
                    _loop_1 = function (bet) {
                        var user, payout;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, kv.hgetall(bet === null || bet === void 0 ? void 0 : bet.fid.toString())];
                                case 1:
                                    user = _b.sent();
                                    if (!(user !== null)) return [3 /*break*/, 3];
                                    if (bet.prediction === result) {
                                        // Pay out the user
                                        console.log("Paying out user: ".concat(bet === null || bet === void 0 ? void 0 : bet.fid, " with wager: ").concat(bet.stake));
                                        payout = (0, utils_1.calculatePayout)(eventData.multiplier, eventData.odds[result], bet.stake, user === null || user === void 0 ? void 0 : user.streak);
                                        user.balance = parseInt(user === null || user === void 0 ? void 0 : user.balance.toString()) + payout;
                                        user.streak = parseInt(user === null || user === void 0 ? void 0 : user.streak.toString()) + 1;
                                        user.numBets = parseInt(user === null || user === void 0 ? void 0 : user.numBets.toString()) + 1;
                                        user.wins = parseInt(user === null || user === void 0 ? void 0 : user.wins.toString()) + 1;
                                        // Get user bets and update the settled variable for bet
                                        user.bets = user === null || user === void 0 ? void 0 : user.bets.map(function (b) {
                                            if (b.eventName === eventName && !b.settled && b.timeStamp === bet.timeStamp) {
                                                b.settled = true;
                                            }
                                            return b;
                                        });
                                    }
                                    else if (parseInt(bet === null || bet === void 0 ? void 0 : bet.fid.toString())) {
                                        // User lost
                                        console.log("User: ".concat(bet === null || bet === void 0 ? void 0 : bet.fid, " lost with wager: ").concat(bet.stake));
                                        user.streak = 0;
                                        user.numBets = parseInt(user.streak.toString()) + 1;
                                        user.losses = parseInt(user.losses.toString()) + 1;
                                    }
                                    return [4 /*yield*/, kv.hset(bet.fid.toString(), user).then(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        console.log("Settled user: ".concat(bet.fid));
                                                        // Update leaderboard;
                                                        return [4 /*yield*/, kv.zadd('users', { score: user.balance, member: bet.fid })];
                                                    case 1:
                                                        // Update leaderboard;
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }).catch(function (error) {
                                            throw new Error("Error updating user: ".concat(bet.fid));
                                        })];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, bets_1 = bets;
                    _a.label = 7;
                case 7:
                    if (!(_i < bets_1.length)) return [3 /*break*/, 10];
                    bet = bets_1[_i];
                    return [5 /*yield**/, _loop_1(bet)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    // Read in cli arguments
    var args = require('minimist')(process.argv.slice(2), { string: ['e'] });
    settleEvent(args['e'], args['r']).then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
module.exports = settleEvent;
