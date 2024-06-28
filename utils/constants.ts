import { Bet, User } from "@types";
import { ethers } from "ethers";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";


export enum Accounts {
    BOOKIES = 'bookies',
    ALEA = 'alea',
    BOTH = 'both'
}

export enum RequestProps {
    FID = 'fid',
    IS_FOLLOWING = 'isFollowing',
    HAS_CLAIMED = 'hasClaimed',
    STAKE = 'stake',
    AVATAR_URL = 'avatarUrl',
    USERNAME = 'username',
    RANK = 'rank',
    WINS = 'wins',
    LOSSES = 'losses',
    NUM_BETS = 'numBets',
    BUTTON_INDEX = 'buttonIndex',
    INPUT_TEXT = 'inputText',
    STREAK = 'streak',
    OPTIONS = 'options',
    PROMPT = 'prompt',
    EVENT_NAME = 'eventName',
    PICK = 'pick',
    MULTIPLIER = 'multiplier',
    TIME = 'time',
    ODDS = 'odds',
    BALANCE = 'balance',
    POLL = 'poll',
    VALID_CAPTCHA = 'validCaptcha',
    CAPTCHA_INDEX = 'captchaIndex',
    INDEX = 'index',
    ARRAY = 'array',
    ODD = 'odd',
    STRING = "string",
    RESULT = "result",
    OFFSET = 'offset',
    COUNT = 'count',
    BOOLEAN = 'boolean',
    URL = 'url',
    REDIRECT = 'redirect',
    TRANSACTION_HASH = 'transactionHash',
    ADDRESS = 'address',
    IS_MINED = 'isMined',
    PERCENT_FILLED = 'percentFilled',
    SYMBOL = 'symbol'
  }

  export const RequestPropsTypes = {
    [RequestProps.FID]: 0,
    [RequestProps.IS_FOLLOWING]: true,
    [RequestProps.HAS_CLAIMED]: true,
    [RequestProps.STAKE]: 0.0,
    [RequestProps.AVATAR_URL]: "",
    [RequestProps.USERNAME]: "",
    [RequestProps.RANK]: 0,
    [RequestProps.WINS]: 0,
    [RequestProps.LOSSES]: 0,
    [RequestProps.NUM_BETS]: 0,
    [RequestProps.BUTTON_INDEX]: 0,
    [RequestProps.INPUT_TEXT]: "",
    [RequestProps.OPTIONS]: [],
    [RequestProps.PROMPT]: "",
    [RequestProps.STREAK]: 0,
    [RequestProps.EVENT_NAME]: "",
    [RequestProps.PICK]: 0,
    [RequestProps.MULTIPLIER]: 0,
    [RequestProps.TIME]: 0,
    [RequestProps.ODDS]: [],
    [RequestProps.BALANCE]: 0.0,
    [RequestProps.POLL]: [],
    [RequestProps.VALID_CAPTCHA]: true,
    [RequestProps.CAPTCHA_INDEX]: 0,
    [RequestProps.INDEX] : 0,
    [RequestProps.ARRAY] : [],
    [RequestProps.ODD] : 0.5,
    [RequestProps.STRING] : "",
    [RequestProps.RESULT] : 0,
    [RequestProps.OFFSET] : 0,
    [RequestProps.COUNT] : 0,
    [RequestProps.BOOLEAN] : true,
    [RequestProps.URL] : "",
    [RequestProps.REDIRECT] : true,
    [RequestProps.TRANSACTION_HASH] : "",
    [RequestProps.ADDRESS] : "",
    [RequestProps.IS_MINED]: false,
    [RequestProps.PERCENT_FILLED]: 0.0,
    [RequestProps.SYMBOL]: ""
}

export enum FrameNames {
    CLAIM_DICE = 'claim-dice',
    PROFILE_FINDER = 'profile-finder',
    BETSLIP = 'betslip',
    BET_CONFIRMATION = 'bet-confirmation',
    TRIVIA = 'trivia',
    CAPTCHA = 'captcha',
    EVENT_THUMBNAIL = 'event-thumbnail',
    LEADERBOARD = 'leaderboard',
    BETS = 'bets',
    INFO = 'info',
    PLACE_BET = 'place-bet',
    EVENT = 'event',
}

export enum Transactions {
    APPROVE = 'approve',
    PLACE_BET = 'place-bet',
}

export enum DatabaseKeys {
    LEADERBOARD = 'leaderboard',
    BETTORS = 'bettors',
    POLL = 'poll',
    MARKETS = 'markets',
    REFERRALS = "referrals",
    ADDRESSES = "addresses",
    BETS = "BETS",
}

export const Outcomes = {
    OUTCOME1 : BigInt("0"),
    OUTCOME2 : BigInt("1000000000000000000"),
    TIE : BigInt("500000000000000000"),
    UNRESOLVABLE : ethers.MaxInt256,
    UNSETTLED : BigInt("-1000000000000000000"),
  }

export const BOOKIES_FID = 244367;
export const ALEA_FID = 391387;

export const ODDS_DECIMALS = 4
export const PICK_DECIMALS = 18

export const STAKE_LIMIT = 5000;

export const DEFAULT_USER: User = {
    balance: 100,
    streak: 0,
    wins: 0,
    losses: 0,
    numBets: 0,
    hasClaimed: true,
    bets: {}
}

export const DEFAULT_BET: Bet = {
    stake: 0,
    odd: 0.5,
    pick: -1,
    timeStamp: 0,
    settled: false
}

export const myChain = defineChain(8453)

export const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
})