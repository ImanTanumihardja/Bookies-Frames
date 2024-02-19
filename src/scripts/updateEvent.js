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
var fs = require('fs');
var kv_1 = require("@vercel/kv");
var kv = (0, kv_1.createClient)({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
});
function getEvent(eventName) {
    if (eventName === void 0) { eventName = "nba-asg-ml"; }
    return __awaiter(this, void 0, void 0, function () {
        var eventData, _i, _a, _b, key, value, fid, bet, user, newStake, event_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, kv.hget("events", "".concat(eventName))];
                case 1:
                    eventData = _c.sent();
                    console.log("Event: ".concat(eventName));
                    console.log(eventData);
                    console.log("Total bets: ".concat((Object.keys((eventData === null || eventData === void 0 ? void 0 : eventData.bets) || {}).length)));
                    if (!(eventData !== null)) return [3 /*break*/, 7];
                    _i = 0, _a = Object.entries(eventData.bets);
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    _b = _a[_i], key = _b[0], value = _b[1];
                    fid = Number(key);
                    bet = value;
                    if (!(parseFloat(bet.stake.toString()) % 1 !== 0)) return [3 /*break*/, 4];
                    console.log("User: ".concat(fid, " has a float stake: ").concat(value.stake));
                    return [4 /*yield*/, kv.hgetall(fid.toString())];
                case 3:
                    user = (_c.sent()) || null;
                    if (user) {
                        newStake = Math.ceil(value.stake);
                        console.log('New Stake:', newStake);
                        console.log('Available Bal: ', user === null || user === void 0 ? void 0 : user.availableBalance);
                        console.log('Bal: ', user === null || user === void 0 ? void 0 : user.balance);
                        eventData.bets[Number(fid)].stake = newStake;
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    event_1 = {};
                    event_1[eventName] = eventData;
                    return [4 /*yield*/, kv.hset("events", event_1)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [4 /*yield*/, kv.hget("events", "".concat(eventName))];
                case 8:
                    // Get evetn data again to check if the new bets were added
                    eventData = _c.sent();
                    console.log("Event: ".concat(eventName));
                    console.log(eventData);
                    console.log("Total bets: ".concat((Object.keys((eventData === null || eventData === void 0 ? void 0 : eventData.bets) || {}).length)));
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
