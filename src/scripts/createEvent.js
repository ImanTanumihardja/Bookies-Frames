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
var createClient = require("@vercel/kv").createClient;
var dotenv = require("dotenv");
dotenv.config({ path: ".env" });
var kv = createClient({
    url: process.env['KV_REST_API_URL'],
    token: process.env['KV_REST_API_TOKEN'],
});
function createEvent(eventName, startDate, odds, multiplier, options, prompt) {
    if (eventName === void 0) { eventName = 'nba-asg-ml'; }
    if (startDate === void 0) { startDate = 1708304400000; }
    if (odds === void 0) { odds = [0.5, 0.5]; }
    if (multiplier === void 0) { multiplier = 1; }
    if (options === void 0) { options = ["West", "East"]; }
    if (prompt === void 0) { prompt = "Over or under 363.5 points?"; }
    return __awaiter(this, void 0, void 0, function () {
        var event;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event = {};
                    event[eventName] = { startDate: startDate, poll: [0, 0], bets: {}, result: -1, odds: odds, multiplier: multiplier, options: options, prompt: prompt };
                    return [4 /*yield*/, kv.hset("events", event)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, kv.hget("events", "".concat(eventName))];
                case 2:
                    event = _a.sent();
                    console.log("Event: ".concat(eventName));
                    console.log(event);
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    // Read in cli arguments
    var args = require('minimist')(process.argv.slice(2), { string: ['e'] });
    createEvent().then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
module.exports = createEvent;
