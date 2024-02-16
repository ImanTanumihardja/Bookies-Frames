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
exports.calculatePayout = exports.convertImpliedProbabilityToAmerican = exports.validateFrameMessage = exports.checkIsFollowingBookies = exports.neynarClient = exports.generateUrl = exports.getRequestProps = exports.DEFAULT_FRAME_VALIDATION_DATA = exports.DEFAULT_BET = exports.DEFAULT_USER = exports.BOOKIES_FID = exports.RequestPropsTypes = exports.FrameNames = exports.RequestProps = void 0;
var nodejs_sdk_1 = require("@neynar/nodejs-sdk");
var frames_js_1 = require("frames.js");
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
    RequestProps["POINTS"] = "points";
    RequestProps["NUM_BETS"] = "numBets";
    RequestProps["BUTTON_INDEX"] = "buttonIndex";
    RequestProps["INPUT_TEXT"] = "inputText";
    RequestProps["STREAK"] = "streak";
    RequestProps["OPTIONS"] = "options";
    RequestProps["PROMPT"] = "prompt";
    RequestProps["EVENT_NAME"] = "eventName";
    RequestProps["PREDICTION"] = "prediction";
    RequestProps["MULTIPLIER"] = "multiplier";
    RequestProps["TIMESTAMP"] = "timestamp";
    RequestProps["ODDS"] = "odds";
    RequestProps["BALANCE"] = "balance";
    RequestProps["POLL"] = "poll";
    RequestProps["VALID_CAPTCHA"] = "validCaptcha";
})(RequestProps || (exports.RequestProps = RequestProps = {}));
var FrameNames;
(function (FrameNames) {
    FrameNames["CLAIM_DICE"] = "claim-dice";
    FrameNames["PROFILE_FINDER"] = "profile-finder";
    FrameNames["SBLVIII_ML"] = "sblviii-ml";
    FrameNames["BETSLIP"] = "betslip";
    FrameNames["BET_CONFIRMATION"] = "bet-confirmation";
    FrameNames["CAPTCHA"] = "captcha";
})(FrameNames || (exports.FrameNames = FrameNames = {}));
exports.RequestPropsTypes = (_a = {},
    _a[RequestProps.FID] = 0,
    _a[RequestProps.IS_FOLLOWING] = true,
    _a[RequestProps.HAS_CLAIMED] = true,
    _a[RequestProps.STAKE] = 0,
    _a[RequestProps.AVATAR_URL] = "",
    _a[RequestProps.USERNAME] = "",
    _a[RequestProps.RANK] = 0,
    _a[RequestProps.WINS] = 0,
    _a[RequestProps.LOSSES] = 0,
    _a[RequestProps.POINTS] = 0,
    _a[RequestProps.NUM_BETS] = 0,
    _a[RequestProps.BUTTON_INDEX] = 0,
    _a[RequestProps.INPUT_TEXT] = "",
    _a[RequestProps.OPTIONS] = [],
    _a[RequestProps.PROMPT] = "",
    _a[RequestProps.STREAK] = 0,
    _a[RequestProps.EVENT_NAME] = "",
    _a[RequestProps.PREDICTION] = 0,
    _a[RequestProps.MULTIPLIER] = 0,
    _a[RequestProps.TIMESTAMP] = 0,
    _a[RequestProps.ODDS] = [],
    _a[RequestProps.BALANCE] = 0,
    _a[RequestProps.POLL] = [],
    _a[RequestProps.VALID_CAPTCHA] = true,
    _a);
exports.BOOKIES_FID = 244367;
exports.DEFAULT_USER = {
    balance: 0,
    availableBalance: 0,
    streak: 0,
    wins: 0,
    losses: 0,
    numBets: 0,
    hasClaimed: false,
    bets: [],
};
exports.DEFAULT_BET = {
    stake: 0,
    odd: 0.5,
    prediction: -1,
    timeStamp: 0,
};
exports.DEFAULT_FRAME_VALIDATION_DATA = {
    button: 0,
    following: false,
    followingBookies: false,
    input: "",
    fid: 0,
    custody_address: "",
    verified_accounts: [],
    liked: false,
    recasted: false,
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
                    console.log('floatArray:', key);
                }
                else {
                    returnParams[key] = array; // Just return normal
                }
                console.log(returnParams[key]);
                break;
        }
    }
    return returnParams;
}
exports.getRequestProps = getRequestProps;
function generateUrl(extension, props, addTimestamp, isImageURL) {
    var _a, _b, _c, _d;
    if (addTimestamp === void 0) { addTimestamp = false; }
    if (isImageURL === void 0) { isImageURL = false; }
    var url = "".concat(process.env['HOST'], "/").concat(extension);
    if (isImageURL && (addTimestamp || ((_a = process.env['HOST']) === null || _a === void 0 ? void 0 : _a.includes('localhost')) || ((_b = process.env['HOST']) === null || _b === void 0 ? void 0 : _b.includes('staging')))) {
        url += "?version=".concat(process.env['VERSION']);
        url += "&timestamp=".concat(new Date().getTime());
    }
    else if (addTimestamp || ((_c = process.env['HOST']) === null || _c === void 0 ? void 0 : _c.includes('localhost')) || ((_d = process.env['HOST']) === null || _d === void 0 ? void 0 : _d.includes('staging'))) {
        url += "?timestamp=".concat(new Date().getTime());
    }
    else {
        url += "?version=".concat(process.env['VERSION']);
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
function checkIsFollowingBookies(fid) {
    return __awaiter(this, void 0, void 0, function () {
        var isFollowing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isFollowing = false;
                    return [4 /*yield*/, exports.neynarClient.fetchBulkUsers([fid], { viewerFid: exports.BOOKIES_FID })
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
exports.checkIsFollowingBookies = checkIsFollowingBookies;
function validateFrameMessage(req, checkFollowingBookies) {
    var _a, _b, _c;
    if (checkFollowingBookies === void 0) { checkFollowingBookies = true; }
    return __awaiter(this, void 0, void 0, function () {
        var body, message, data, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, req.json()];
                case 1:
                    body = _d.sent();
                    message = exports.DEFAULT_FRAME_VALIDATION_DATA;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, frames_js_1.validateFrameMessage)(body)];
                case 3:
                    data = _d.sent();
                    if (!data.isValid) {
                        throw new Error('Invalid frame message');
                    }
                    // message.button = data?.message?.button || 0
                    // message.following = data?.message?.following || false
                    // message.input = data?.message?.input || ""
                    // message.fid = data?.message?.interactor.fid || 0
                    // message.custody_address = data?.message?.interactor.custody_address || ""
                    // message.verified_accounts = data?.message?.interactor.verified_accounts || []
                    // message.liked = data?.message?.liked || false
                    // message.recasted = data?.message?.recasted || false
                    // message = { ...message, ...data.message }
                    message.button = ((_a = data === null || data === void 0 ? void 0 : data.message) === null || _a === void 0 ? void 0 : _a.data.frameActionBody.buttonIndex) || 0;
                    message.input = ((_b = data === null || data === void 0 ? void 0 : data.message) === null || _b === void 0 ? void 0 : _b.data.frameActionBody.inputText.toString()) || "";
                    message.fid = ((_c = data === null || data === void 0 ? void 0 : data.message) === null || _c === void 0 ? void 0 : _c.data.fid) || 0;
                    if (checkFollowingBookies) {
                        message.followingBookies = true; //await checkIsFollowingBookies(message.fid)
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    throw new Error("Error validating: ".concat(error_1));
                case 5: return [2 /*return*/, message];
            }
        });
    });
}
exports.validateFrameMessage = validateFrameMessage;
function convertImpliedProbabilityToAmerican(impliedProbability) {
    if (impliedProbability <= 0 || impliedProbability >= 1) {
        throw new Error('Implied probability must be between 0 and 1 (exclusive).');
    }
    var americanOdds = Math.round((10000 - ((impliedProbability * 100) * 100)) / (impliedProbability * 100));
    return americanOdds;
}
exports.convertImpliedProbabilityToAmerican = convertImpliedProbabilityToAmerican;
function calculatePayout(multiplier, impliedProbability, stake, streak) {
    if (streak === void 0) { streak = 0; }
    return multiplier * (1 / impliedProbability) * (stake); // TODO add streak
}
exports.calculatePayout = calculatePayout;
