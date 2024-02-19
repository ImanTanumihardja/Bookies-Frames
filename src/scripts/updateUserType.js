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
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
});
// Create a script that access kv storage and reset the hasClaimed value
function updateUserType() {
    return __awaiter(this, void 0, void 0, function () {
        var result, cursor, users, eventData, eventData2, count, _i, users_1, fid, user, bets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, kv.zscan("users", 0, { count: 150 })];
                case 1:
                    result = (_a.sent());
                    cursor = result[0];
                    users = result[1];
                    _a.label = 2;
                case 2:
                    if (!cursor) return [3 /*break*/, 4];
                    return [4 /*yield*/, kv.zscan("users", cursor, { count: 150 })];
                case 3:
                    result = (_a.sent());
                    cursor = result[0];
                    users = users.concat(result[1]);
                    return [3 /*break*/, 2];
                case 4:
                    // Filter out every other element
                    users = users.filter(function (fid, index) { return index % 2 === 0; });
                    console.log("Total users: ".concat(users.length));
                    return [4 /*yield*/, kv.hget("events", "nba-asg-ou")];
                case 5:
                    eventData = _a.sent();
                    return [4 /*yield*/, kv.hget("events", "nba-asg-ml")
                        // users = users.filter((fid:number) => fid === 313859)
                    ];
                case 6:
                    eventData2 = _a.sent();
                    count = 0;
                    if (!(eventData !== null || eventData2 !== null)) return [3 /*break*/, 11];
                    _i = 0, users_1 = users;
                    _a.label = 7;
                case 7:
                    if (!(_i < users_1.length)) return [3 /*break*/, 10];
                    fid = users_1[_i];
                    return [4 /*yield*/, kv.hgetall(fid)];
                case 8:
                    user = _a.sent();
                    if (user === null) {
                        console.log("User: ".concat(fid, " does not exist"));
                        // count++;
                        return [3 /*break*/, 9];
                    }
                    if (user.bets === undefined) {
                        console.log("User: ".concat(fid, " does not have any bets"), user);
                        // count++;
                        return [3 /*break*/, 9];
                    }
                    bets = user.bets;
                    // Check if user has a bet on nba-asg-ou if so check if they have bet in nba-asg-ou event
                    if (bets.includes('nba-asg-ou')) {
                        if ((eventData === null || eventData === void 0 ? void 0 : eventData.bets[fid.toString()]) === undefined) {
                            console.log("User: ".concat(fid, " does not have bet on nba-asg-ou event"));
                            count++;
                        }
                    }
                    // Check if user has a bet on nba-asg-ml if so check if they have bet in nba-asg-ml event
                    if (bets.includes('nba-asg-ml')) {
                        if ((eventData2 === null || eventData2 === void 0 ? void 0 : eventData2.bets[fid.toString()]) === undefined) {
                            console.log("User: ".concat(fid, " does not have bet on nba-asg-ml event"));
                            count++;
                        }
                    }
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10:
                    console.log("Total: ".concat(count));
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    updateUserType().then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
module.exports = updateUserType;
