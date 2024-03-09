import { NextRequest, NextResponse } from 'next/server'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { User, Bet} from '../app/types';
import { FrameValidationData } from '../app/types';
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
  URL = 'url'
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
    [RequestProps.URL] : ""
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
    BOS_DAL_ML = 'bos-dal-ml',
}

export enum DatabaseKeys {
    LEADERBOARD = 'leaderboard',
    BETS = 'bets',
    POLL = 'poll',
}

export const BOOKIES_FID = 244367;

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
                returnParams[key] = parseFloat(value || "0")
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

export function notFollowingResponse(returnUrl:string) {
    return new NextResponse(
        getFrameHtml({
          version: "vNext",
          image: `${process.env['HOST']}/thumbnails/not-following.gif`,
          buttons: [
            {
              label:'Try Again', 
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
export const neynarClient = new NeynarAPIClient(process.env['NEYNAR_API_KEY'] || "");

export async function checkIsFollowingBookies(fid: number): Promise<boolean> {
    let isFollowing = false; // TEMPORARY FIX

    await neynarClient.fetchBulkUsers([fid], {viewerFid: BOOKIES_FID})
    .then(response => {
        isFollowing = response?.users[0]?.viewer_context?.followed_by || false; // TEMPORARY FIX

    })
    .catch(error => {
        console.error('Error fetching user by fid:', error);
        // Handle the error or perform additional actions
    });
    
    return isFollowing
}


export async function getFrameMessage(req: NextRequest, validate=true) {
    const body = await req.json();

    let message: FrameValidationData = {} as FrameValidationData;

    // Use onchainkit to validate the frame message
    if (validate) {
        const data = await validateFrameMessage(body);

        if (!data.isValid) {
            throw new Error('Invalid frame message');
        }

        message.button = data?.buttonIndex
        message.following = data.requesterFollowsCaster
        message.input = data?.inputText
        message.fid = data?.requesterFid
        message.custody_address = data?.requesterCustodyAddress
        message.verified_accounts = data?.requesterVerifiedAddresses
        message.liked = data?.likedCast
        message.recasted = data?.recastedCast
        message.transactionId = data?.transaction_id // TODO hopefuly change once added to framesjs

        message.followingBookies = await checkIsFollowingBookies(message.fid)
    }
    else { // Not validating frame message
        message.button = body.untrustedData.buttonIndex
        message.input = body.untrustedData.inputText
        message.fid = body.untrustedData.fid
        message.transactionId = body.untrustedData.transactionId 
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

export function calculatePayout(multiplier: number, impliedProbability: number, stake: number, streak: number = 0){
    const payout = multiplier * (1 / impliedProbability) * (stake) // TODO add streak
    return Math.round(payout)
}