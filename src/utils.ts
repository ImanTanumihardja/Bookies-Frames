import { NextRequest, NextResponse } from 'next/server'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { User, Bet} from '../app/types';
import { FrameValidationData } from '../app/types';
import { ethers } from 'ethers';
const { getFrameHtml, getFrameMessage: validateFrameMessage } = require('frames.js');

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
  IS_MINED = 'isMined'
}

export enum Accounts {
    BOOKIES = 'bookies',
    ALEA = 'alea',
    BOTH = 'both'
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
    [RequestProps.IS_MINED]: false
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
    EVENTS = 'events',
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

export function getRequestProps(req: NextRequest, params: RequestProps[]): Record<string, any> {
    // Loop throug each RequestParams
    let returnParams: Record<string, any> = {}
    for (const key of params) {;
        if (!req.nextUrl.searchParams.has(key)) {
            // Throw error if required param is missing
            throw new Error(`Missing required param: ${key}`)
        }

        const value = decodeURIComponent(req.nextUrl.searchParams.get(key) || "")

        // Parse Props
        switch (typeof RequestPropsTypes[key]) {
            case 'string':
                returnParams[key] = value
                break;
            case 'number':
                const num = parseFloat(value)
                returnParams[key] = Number.isNaN(num) ? null : num
                break;
            case 'boolean':
                returnParams[key] = value === 'true';
                break;
            default: // array (Error)
                const array = value.split(',')
                const floatArray = array.map((item: string) => parseFloat(item))
                if (!floatArray.some(isNaN)) {
                    returnParams[key] = floatArray
                }
                else {
                    returnParams[key] = array // Just return normal
                }
                break;
        }
    }

    return returnParams
}

// Frames

export function notFollowingResponse(returnUrl:string) {
    return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: `${process.env['HOST']}/thumbnails/not-following.gif`,
          buttons: [
            {
              label:'Refresh', 
              action:'post',
              target: returnUrl
            },
            { 
              label: "Follow Us!", 
              action: 'link', 
              target: 'https://warpcast.com/alea.eth'
            }
          ],
          postUrl: returnUrl,
        }),
    );
}

export function notMinedResponse(returnUrl:string) {
    return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: `${process.env['HOST']}/thumbnails/not-mined.gif`,
          buttons: [
            {
              label:'Refresh', 
              action:'post',
              target: returnUrl
            },
            { 
              label: "Follow Us!", 
              action: 'link', 
              target: 'https://warpcast.com/bookies'
            }
          ],
          postUrl: returnUrl,
        }),
    );
}

export function generateUrl(extension: string, props: Record<string, any>, addTimestamp: boolean = false): string {
    let url = `${process.env['HOST']}/${extension}`;

    if (addTimestamp || process.env['HOST']?.includes('localhost') || process.env['HOST']?.includes('staging')) {
        url += `?timestamp=${new Date().getTime()}`
    }
    else {
        url += `?`
    }
    
    // Loop through each param
    for (const key in props) {
        url += `&${key}=${encodeURIComponent(props[key])}`
    }
    return url
}

// don't have an API key yet? get one at neynar.com
export const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS");

export async function checkIsFollowing(fid: number, viewerFid=BOOKIES_FID): Promise<boolean> {
    let isFollowing = true; // TEMPORARY FIX

    await neynarClient.fetchBulkUsers([fid], {viewerFid: viewerFid})
    .then(response => {
        isFollowing = response?.users[0]?.viewer_context?.followed_by || false; // TEMPORARY FIX
    })
    .catch(error => {
        console.error('Error fetching user by fid:', error);
        // Handle the error or perform additional actions
    });

    return isFollowing
}

export async function getFrameMessage(req: NextRequest, validate=true, viewerFid=BOOKIES_FID) {
    const body = await req.json();

    let message: FrameValidationData = {} as FrameValidationData;

    message.button = body.untrustedData.buttonIndex
    message.input = body.untrustedData.inputText
    message.fid = body.untrustedData.fid
    message.transactionId = body.untrustedData.transactionId 
    message.connectedAddress = body.untrustedData.address
    message.casterFID = body.untrustedData.castId.fid

    // Use onchainkit to validate the frame message
    if (validate) {
        const data = await validateFrameMessage(body, 
            {fetchHubContext: true, hubHttpUrl:process.env['HUB_HTTP_URL'], hubRequestOptions:{headers: {api_key: process.env['NEYNAR_API_KEY']}}});

        if (!data.isValid) {
            throw new Error('Invalid frame message');
        }

        message.following = data.requesterFollowsCaster
        message.custodyAddress = data?.requesterCustodyAddress
        message.verifiedAccounts = data?.requesterVerifiedAddresses
        message.liked = data?.likedCast
        message.recasted = data?.recastedCast
        message.followingHost = await checkIsFollowing(message.fid, viewerFid)
    }

    return message
}

export function convertImpliedProbabilityToAmerican(impliedProbability: number):number {
    if (impliedProbability <= 0 || impliedProbability >= 1) {
      throw new Error('Implied probability must be between 0 and 1 (exclusive).');
    }

    let americanOdds = 0;
  
    if (impliedProbability <= 0.5) {
        americanOdds =
            Math.round((10000 - ((impliedProbability * 100) * 100))/(impliedProbability * 100));
    }
    else {
        americanOdds =
            Math.round(((impliedProbability * 100) * 100) / (100 - (impliedProbability * 100)));
    }
  
    return americanOdds;
  }

export function calculatePayout(impliedProbability: number, stake: number){
    const payout = (1 / impliedProbability) * (stake)
    return payout
}