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
var utils_1 = require("../utils");
var kv = createClient({
    url: process.env['KV_REST_API_URL'] || '',
    token: process.env['KV_REST_API_TOKEN'] || '',
});
// Create a script that access kv storage and reset the hasClaimed value
function resetHasClaimed() {
    return __awaiter(this, void 0, void 0, function () {
        var eventData, count, result, cursor, users, threshold, ratios, deleteUsers, deletedCount, _i, users_1, fid, result_1, error_1, cursor_1, castCount, reactionCount, ratio, error_2, hasBet, multi;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, kv.hget("events", "sblviii-ml")];
                case 1:
                    eventData = _a.sent();
                    return [4 /*yield*/, kv.zcount("users", 0, 'inf')];
                case 2:
                    count = _a.sent();
                    console.log("Total users: ".concat(count));
                    return [4 /*yield*/, kv.zscan("users", 0, { count: 150 })];
                case 3:
                    result = (_a.sent());
                    cursor = result[0];
                    users = result[1];
                    _a.label = 4;
                case 4:
                    if (!cursor) return [3 /*break*/, 6];
                    return [4 /*yield*/, kv.zscan("users", cursor, { count: 150 })];
                case 5:
                    result = (_a.sent());
                    cursor = result[0];
                    users = users.concat(result[1]);
                    return [3 /*break*/, 4];
                case 6:
                    // Filter out every other element
                    users = users.filter(function (_, index) { return index % 2 === 0; });
                    threshold = 0.5;
                    ratios = [];
                    deleteUsers = [];
                    deletedCount = 0;
                    _i = 0, users_1 = users;
                    _a.label = 7;
                case 7:
                    if (!(_i < users_1.length)) return [3 /*break*/, 23];
                    fid = users_1[_i];
                    console.log("FID: ".concat(fid));
                    if (fid < 0) {
                        console.log('Skipping...');
                        return [3 /*break*/, 22];
                    }
                    result_1 = null;
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, utils_1.neynarClient.fetchAllCastsCreatedByUser(fid, { limit: 150 })];
                case 9:
                    result_1 = (_a.sent()).result;
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.error('Error: ', error_1);
                    return [3 /*break*/, 22];
                case 11:
                    cursor_1 = result_1.next.cursor;
                    castCount = result_1.casts.length;
                    reactionCount = result_1.casts.reduce(function (acc, cast) { return acc + cast.reactions.count; }, 0);
                    ratio = 0;
                    _a.label = 12;
                case 12:
                    if (!cursor_1) return [3 /*break*/, 17];
                    _a.label = 13;
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, utils_1.neynarClient.fetchAllCastsCreatedByUser(fid, { cursor: cursor_1, limit: 150 })];
                case 14:
                    result_1 = (_a.sent()).result;
                    return [3 /*break*/, 16];
                case 15:
                    error_2 = _a.sent();
                    console.error('Error: ', error_2);
                    return [3 /*break*/, 17];
                case 16:
                    cursor_1 = result_1.next.cursor;
                    castCount += result_1.casts.length;
                    reactionCount += result_1.casts.reduce(function (acc, cast) { return acc + cast.reactions.count; }, 0);
                    return [3 /*break*/, 12];
                case 17:
                    console.log('Total Number of Cast: ', castCount);
                    console.log('Total Number of Reactions: ', reactionCount);
                    if (castCount === 0) {
                        ratios.push(0);
                        return [3 /*break*/, 22];
                    }
                    ratio = reactionCount / castCount;
                    console.log('Ratio: ', ratio);
                    ratios.push(ratio);
                    if (!(ratio < threshold)) return [3 /*break*/, 21];
                    hasBet = eventData.bets.hasOwnProperty(fid);
                    console.log('Has Bet: ', hasBet);
                    if (!!hasBet) return [3 /*break*/, 21];
                    multi = kv.multi();
                    // Delete ueser since they are bots
                    console.log('Deleting user: ', fid);
                    deletedCount++;
                    deleteUsers.push(fid);
                    return [4 /*yield*/, multi.zrem('users', fid)];
                case 18:
                    _a.sent();
                    return [4 /*yield*/, multi.del(fid)];
                case 19:
                    _a.sent();
                    return [4 /*yield*/, multi.exec()];
                case 20:
                    _a.sent();
                    _a.label = 21;
                case 21:
                    console.log('\n');
                    _a.label = 22;
                case 22:
                    _i++;
                    return [3 /*break*/, 7];
                case 23:
                    console.log('Deleted Count: ', deletedCount);
                    console.log('Deleted Users: ', deleteUsers);
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    resetHasClaimed().then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
module.exports = resetHasClaimed;
