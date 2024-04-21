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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePayout = exports.convertImpliedProbabilityToAmerican = exports.getFrameMessage = exports.checkIsFollowing = exports.neynarClient = exports.generateUrl = exports.notMinedResponse = exports.notFollowingResponse = exports.getRequestProps = exports.DEFAULT_BET = exports.DEFAULT_USER = exports.STAKE_LIMIT = exports.PICK_DECIMALS = exports.ODDS_DECIMALS = exports.ALEA_FID = exports.BOOKIES_FID = exports.Outcomes = exports.DatabaseKeys = exports.Transactions = exports.FrameNames = exports.RequestPropsTypes = exports.Accounts = exports.RequestProps = void 0;
var server_1 = require("next/server");
var nodejs_sdk_1 = require("@neynar/nodejs-sdk");
var ethers_1 = require("ethers");
var _b = require('frames.js'), getFrameHtml = _b.getFrameHtml, validateFrameMessage = _b.getFrameMessage;
var RequestProps;
(function (RequestProps) {
    RequestProps["FID"] = "fid";
    RequestProps["IS_FOLLOWING"] = "isFollowing";
    RequestProps["HAS_CLAIMED"] = "hasClaimed";
    RequestProps["STAKE"] = "stake";
    RequestProps["AVATAR_URL"] = "avatarUrl";
    RequestProps["USERNAME"] = "username";
    RequestProps["RANK"] = "rank";
    RequestProps["WINS"] = "wins";
    RequestProps["LOSSES"] = "losses";
    RequestProps["NUM_BETS"] = "numBets";
    RequestProps["BUTTON_INDEX"] = "buttonIndex";
    RequestProps["INPUT_TEXT"] = "inputText";
    RequestProps["STREAK"] = "streak";
    RequestProps["OPTIONS"] = "options";
    RequestProps["PROMPT"] = "prompt";
    RequestProps["EVENT_NAME"] = "eventName";
    RequestProps["PICK"] = "pick";
    RequestProps["MULTIPLIER"] = "multiplier";
    RequestProps["TIME"] = "time";
    RequestProps["ODDS"] = "odds";
    RequestProps["BALANCE"] = "balance";
    RequestProps["POLL"] = "poll";
    RequestProps["VALID_CAPTCHA"] = "validCaptcha";
    RequestProps["CAPTCHA_INDEX"] = "captchaIndex";
    RequestProps["INDEX"] = "index";
    RequestProps["ARRAY"] = "array";
    RequestProps["ODD"] = "odd";
    RequestProps["STRING"] = "string";
    RequestProps["RESULT"] = "result";
    RequestProps["OFFSET"] = "offset";
    RequestProps["COUNT"] = "count";
    RequestProps["BOOLEAN"] = "boolean";
    RequestProps["URL"] = "url";
    RequestProps["REDIRECT"] = "redirect";
    RequestProps["TRANSACTION_HASH"] = "transactionHash";
    RequestProps["ADDRESS"] = "address";
    RequestProps["IS_MINED"] = "isMined";
})(RequestProps || (exports.RequestProps = RequestProps = {}));
var Accounts;
(function (Accounts) {
    Accounts["BOOKIES"] = "bookies";
    Accounts["ALEA"] = "alea";
    Accounts["BOTH"] = "both";
})(Accounts || (exports.Accounts = Accounts = {}));
exports.RequestPropsTypes = (_a = {},
    _a[RequestProps.FID] = 0,
    _a[RequestProps.IS_FOLLOWING] = true,
    _a[RequestProps.HAS_CLAIMED] = true,
    _a[RequestProps.STAKE] = 0.0,
    _a[RequestProps.AVATAR_URL] = "",
    _a[RequestProps.USERNAME] = "",
    _a[RequestProps.RANK] = 0,
    _a[RequestProps.WINS] = 0,
    _a[RequestProps.LOSSES] = 0,
    _a[RequestProps.NUM_BETS] = 0,
    _a[RequestProps.BUTTON_INDEX] = 0,
    _a[RequestProps.INPUT_TEXT] = "",
    _a[RequestProps.OPTIONS] = [],
    _a[RequestProps.PROMPT] = "",
    _a[RequestProps.STREAK] = 0,
    _a[RequestProps.EVENT_NAME] = "",
    _a[RequestProps.PICK] = 0,
    _a[RequestProps.MULTIPLIER] = 0,
    _a[RequestProps.TIME] = 0,
    _a[RequestProps.ODDS] = [],
    _a[RequestProps.BALANCE] = 0.0,
    _a[RequestProps.POLL] = [],
    _a[RequestProps.VALID_CAPTCHA] = true,
    _a[RequestProps.CAPTCHA_INDEX] = 0,
    _a[RequestProps.INDEX] = 0,
    _a[RequestProps.ARRAY] = [],
    _a[RequestProps.ODD] = 0.5,
    _a[RequestProps.STRING] = "",
    _a[RequestProps.RESULT] = 0,
    _a[RequestProps.OFFSET] = 0,
    _a[RequestProps.COUNT] = 0,
    _a[RequestProps.BOOLEAN] = true,
    _a[RequestProps.URL] = "",
    _a[RequestProps.REDIRECT] = true,
    _a[RequestProps.TRANSACTION_HASH] = "",
    _a[RequestProps.ADDRESS] = "",
    _a[RequestProps.IS_MINED] = false,
    _a);
var FrameNames;
(function (FrameNames) {
    FrameNames["CLAIM_DICE"] = "claim-dice";
    FrameNames["PROFILE_FINDER"] = "profile-finder";
    FrameNames["BETSLIP"] = "betslip";
    FrameNames["BET_CONFIRMATION"] = "bet-confirmation";
    FrameNames["TRIVIA"] = "trivia";
    FrameNames["CAPTCHA"] = "captcha";
    FrameNames["EVENT_THUMBNAIL"] = "event-thumbnail";
    FrameNames["LEADERBOARD"] = "leaderboard";
    FrameNames["BETS"] = "bets";
    FrameNames["INFO"] = "info";
    FrameNames["PLACE_BET"] = "place-bet";
    FrameNames["EVENT"] = "event";
})(FrameNames || (exports.FrameNames = FrameNames = {}));
var Transactions;
(function (Transactions) {
    Transactions["APPROVE"] = "approve";
    Transactions["PLACE_BET"] = "place-bet";
})(Transactions || (exports.Transactions = Transactions = {}));
var DatabaseKeys;
(function (DatabaseKeys) {
    DatabaseKeys["LEADERBOARD"] = "leaderboard";
    DatabaseKeys["BETTORS"] = "bettors";
    DatabaseKeys["POLL"] = "poll";
})(DatabaseKeys || (exports.DatabaseKeys = DatabaseKeys = {}));
exports.Outcomes = {
    OUTCOME1: BigInt("0"),
    OUTCOME2: BigInt("1000000000000000000"),
    TIE: BigInt("500000000000000000"),
    UNRESOLVABLE: ethers_1.ethers.MaxInt256,
    UNSETTLED: BigInt("-1000000000000000000"),
};
exports.BOOKIES_FID = 244367;
exports.ALEA_FID = 391387;
exports.ODDS_DECIMALS = 4;
exports.PICK_DECIMALS = 18;
exports.STAKE_LIMIT = 5000;
exports.DEFAULT_USER = {
    balance: 100,
    streak: 0,
    wins: 0,
    losses: 0,
    numBets: 0,
    hasClaimed: true,
    bets: {}
};
exports.DEFAULT_BET = {
    stake: 0,
    odd: 0.5,
    pick: -1,
    timeStamp: 0,
    settled: false
};
function getRequestProps(req, params) {
    // Loop throug each RequestParams
    var returnParams = {};
    for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var key = params_1[_i];
        ;
        if (!req.nextUrl.searchParams.has(key)) {
            // Throw error if required param is missing
            throw new Error("Missing required param: ".concat(key));
        }
        var value = decodeURIComponent(req.nextUrl.searchParams.get(key) || "");
        // Parse Props
        switch (typeof exports.RequestPropsTypes[key]) {
            case 'string':
                returnParams[key] = value;
                break;
            case 'number':
                returnParams[key] = parseFloat(value || "0");
                break;
            case 'boolean':
                returnParams[key] = value === 'true';
                break;
            default: // array (Error)
                var array = value.split(',');
                var floatArray = array.map(function (item) { return parseFloat(item); });
                if (!floatArray.some(isNaN)) {
                    returnParams[key] = floatArray;
                }
                else {
                    returnParams[key] = array; // Just return normal
                }
                break;
        }
    }
    return returnParams;
}
exports.getRequestProps = getRequestProps;
// Frames
function notFollowingResponse(returnUrl) {
    return new server_1.NextResponse(getFrameHtml({
        version: "vNext",
        image: "".concat(process.env['HOST'], "/thumbnails/not-following.gif"),
        buttons: [
            {
                label: 'Refresh',
                action: 'post',
                target: returnUrl
            },
            {
                label: "Follow Us!",
                action: 'link',
                target: 'https://warpcast.com/alea.eth'
            }
        ],
        postUrl: returnUrl,
    }));
}
exports.notFollowingResponse = notFollowingResponse;
function notMinedResponse(returnUrl) {
    return new server_1.NextResponse(getFrameHtml({
        version: "vNext",
        image: "".concat(process.env['HOST'], "/thumbnails/not-mined.gif"),
        buttons: [
            {
                label: 'Refresh',
                action: 'post',
                target: returnUrl
            },
            {
                label: "Follow Us!",
                action: 'link',
                target: 'https://warpcast.com/bookies'
            }
        ],
        postUrl: returnUrl,
    }));
}
exports.notMinedResponse = notMinedResponse;
function generateUrl(extension, props, addTimestamp) {
    var _a, _b;
    if (addTimestamp === void 0) { addTimestamp = false; }
    var url = "".concat(process.env['HOST'], "/").concat(extension);
    if (addTimestamp || ((_a = process.env['HOST']) === null || _a === void 0 ? void 0 : _a.includes('localhost')) || ((_b = process.env['HOST']) === null || _b === void 0 ? void 0 : _b.includes('staging'))) {
        url += "?timestamp=".concat(new Date().getTime());
    }
    else {
        url += "?";
    }
    // Loop through each param
    for (var key in props) {
        url += "&".concat(key, "=").concat(encodeURIComponent(props[key]));
    }
    return url;
}
exports.generateUrl = generateUrl;
// don't have an API key yet? get one at neynar.com
exports.neynarClient = new nodejs_sdk_1.NeynarAPIClient(process.env['NEYNAR_API_KEY'] || "");
function checkIsFollowing(fid, viewerFid) {
    if (viewerFid === void 0) { viewerFid = exports.BOOKIES_FID; }
    return __awaiter(this, void 0, void 0, function () {
        var isFollowing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isFollowing = false;
                    return [4 /*yield*/, exports.neynarClient.fetchBulkUsers([fid], { viewerFid: viewerFid })
                            .then(function (response) {
                            var _a, _b;
                            isFollowing = ((_b = (_a = response === null || response === void 0 ? void 0 : response.users[0]) === null || _a === void 0 ? void 0 : _a.viewer_context) === null || _b === void 0 ? void 0 : _b.followed_by) || false; // TEMPORARY FIX
                        })
                            .catch(function (error) {
                            console.error('Error fetching user by fid:', error);
                            // Handle the error or perform additional actions
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, isFollowing];
            }
        });
    });
}
exports.checkIsFollowing = checkIsFollowing;
function getFrameMessage(req, validate, viewerFid) {
    if (validate === void 0) { validate = true; }
    if (viewerFid === void 0) { viewerFid = exports.BOOKIES_FID; }
    return __awaiter(this, void 0, void 0, function () {
        var body, message, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, req.json()];
                case 1:
                    body = _b.sent();
                    message = {};
                    message.button = body.untrustedData.buttonIndex;
                    message.input = body.untrustedData.inputText;
                    message.fid = body.untrustedData.fid;
                    message.transactionId = body.untrustedData.transactionId;
                    message.connectedAddress = body.untrustedData.address;
                    if (!validate) return [3 /*break*/, 4];
                    return [4 /*yield*/, validateFrameMessage(body, { fetchHubContext: true, hubHttpUrl: process.env['HUB_HTTP_URL'], hubRequestOptions: { headers: { api_key: process.env['NEYNAR_API_KEY'] } } })];
                case 2:
                    data = _b.sent();
                    if (!data.isValid) {
                        throw new Error('Invalid frame message');
                    }
                    message.following = data.requesterFollowsCaster;
                    message.custodyAddress = data === null || data === void 0 ? void 0 : data.requesterCustodyAddress;
                    message.verifiedAccounts = data === null || data === void 0 ? void 0 : data.requesterVerifiedAddresses;
                    message.liked = data === null || data === void 0 ? void 0 : data.likedCast;
                    message.recasted = data === null || data === void 0 ? void 0 : data.recastedCast;
                    _a = message;
                    return [4 /*yield*/, checkIsFollowing(message.fid, viewerFid)];
                case 3:
                    _a.followingHost = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, message];
            }
        });
    });
}
exports.getFrameMessage = getFrameMessage;
function convertImpliedProbabilityToAmerican(impliedProbability) {
    if (impliedProbability <= 0 || impliedProbability >= 1) {
        throw new Error('Implied probability must be between 0 and 1 (exclusive).');
    }
    var americanOdds = 0;
    if (impliedProbability <= 0.5) {
        americanOdds =
            Math.round((10000 - ((impliedProbability * 100) * 100)) / (impliedProbability * 100));
    }
    else {
        americanOdds =
            Math.round(((impliedProbability * 100) * 100) / (100 - (impliedProbability * 100)));
    }
    return americanOdds;
}
exports.convertImpliedProbabilityToAmerican = convertImpliedProbabilityToAmerican;
function calculatePayout(impliedProbability, stake) {
    var payout = (1 / impliedProbability) * (stake);
    return payout;
}
exports.calculatePayout = calculatePayout;
