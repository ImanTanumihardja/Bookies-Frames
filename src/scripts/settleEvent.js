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
        var eventData, event, multi, _a, _b, _c, _i, fid, bet, user, payout;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, kv.hget("events", "".concat(eventName))];
                case 1:
                    eventData = _d.sent();
                    if (eventData === null) {
                        throw new Error("Event: ".concat(eventName, " does not exist"));
                    }
                    if ((eventData === null || eventData === void 0 ? void 0 : eventData.startDate) > new Date().getTime()) {
                        throw new Error('Event has not started yet');
                    }
                    console.log("Event: ".concat(eventName));
                    console.log(eventData);
                    // Set the result of the event
                    eventData.result = result;
                    event = {};
                    event[eventName] = eventData;
                    return [4 /*yield*/, kv.hset("events", event)];
                case 2:
                    _d.sent();
                    console.log("Set result of event: ".concat(eventName, " to ").concat(result));
                    return [4 /*yield*/, kv.multi()];
                case 3:
                    multi = _d.sent();
                    _a = eventData === null || eventData === void 0 ? void 0 : eventData.bets;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _d.label = 4;
                case 4:
                    if (!(_i < _b.length)) return [3 /*break*/, 14];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 13];
                    fid = _c;
                    bet = eventData === null || eventData === void 0 ? void 0 : eventData.bets[parseInt(fid)];
                    return [4 /*yield*/, kv.hgetall(fid)];
                case 5:
                    user = _d.sent();
                    if (!(bet.prediction === result && user !== null)) return [3 /*break*/, 9];
                    // Pay out the user
                    console.log("Paying out user: ".concat(fid, " with wager: ").concat(bet.stake));
                    payout = (0, utils_1.calculatePayout)(eventData.multiplier, eventData.odds[result], bet.stake, user === null || user === void 0 ? void 0 : user.streak);
                    user.points = parseInt(user === null || user === void 0 ? void 0 : user.points.toString()) + payout;
                    user.streak = parseInt(user === null || user === void 0 ? void 0 : user.streak.toString()) + 1;
                    user.numBets = parseInt(user === null || user === void 0 ? void 0 : user.numBets.toString()) + 1;
                    user.wins = parseInt(user === null || user === void 0 ? void 0 : user.wins.toString()) + 1;
                    return [4 /*yield*/, multi.hset(fid.toString(), user)];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, multi.zadd('users', { score: user.points, member: fid })];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, multi.exec()];
                case 8:
                    _d.sent();
                    return [3 /*break*/, 13];
                case 9:
                    if (!(parseInt(fid) && user !== null)) return [3 /*break*/, 13];
                    // User lost
                    console.log("User: ".concat(fid, " lost with wager: ").concat(bet.stake));
                    user.streak = 0;
                    user.numBets = parseInt(user.streak.toString()) + 1;
                    user.losses = parseInt(user.losses.toString()) + 1;
                    return [4 /*yield*/, multi.hset(fid.toString(), user)];
                case 10:
                    _d.sent();
                    return [4 /*yield*/, multi.zadd('users', { score: user.points, member: fid })];
                case 11:
                    _d.sent();
                    return [4 /*yield*/, multi.exec()];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 4];
                case 14: return [2 /*return*/];
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
