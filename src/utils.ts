import { NextRequest } from 'next/server'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { User, Bet} from '../app/types';
import { getFrameMessage as getFrameMessageOnchain } from '@coinbase/onchainkit'
import { FrameValidationData } from '../app/types';

export enum RequestProps {
    FID = 'fid',
    IS_FOLLOWING = 'isFollowing',
    HAS_CLAIMED = 'hasClaimed',
    AMOUNT = 'amount',
    AVATAR_URL = 'avatarUrl',
    USERNAME = 'username',
    RANK = 'rank',
    WINS = 'wins',
    LOSSES = 'losses',
    POINTS = 'points',
    NUM_BETS = 'numBets',
    BUTTON_INDEX = 'buttonIndex',
    INPUT_TEXT = 'inputText',
    STREAK = 'streak',
    OPTIONS = 'options',
    PROMPT = 'prompt',
    EVENT_NAME = 'eventName',
    PREDICTION = 'prediction',
    MULTIPLIER = 'multiplier',
    TIMESTAMP = 'timestamp',
    ODDS = 'odds',
    BALANCE = 'balance',
    POLL = 'poll',
}

export enum FrameNames {
    CLAIM_DICE = 'claim-dice',
    PROFILE_FINDER = 'profile-finder',
    SBLVIII_ML = 'sblviii-ml',
}

export const RequestPropsTypes = {
    [RequestProps.FID]: 0,
    [RequestProps.IS_FOLLOWING]: true,
    [RequestProps.HAS_CLAIMED]: true,
    [RequestProps.AMOUNT]: 0,
    [RequestProps.AVATAR_URL]: "",
    [RequestProps.USERNAME]: "",
    [RequestProps.RANK]: 0,
    [RequestProps.WINS]: 0,
    [RequestProps.LOSSES]: 0,
    [RequestProps.POINTS]: 0,
    [RequestProps.NUM_BETS]: 0,
    [RequestProps.BUTTON_INDEX]: 0,
    [RequestProps.INPUT_TEXT]: "",
    [RequestProps.OPTIONS]: [],
    [RequestProps.PROMPT]: "",
    [RequestProps.STREAK]: 0,
    [RequestProps.EVENT_NAME]: "",
    [RequestProps.PREDICTION]: 0,
    [RequestProps.MULTIPLIER]: 0,
    [RequestProps.TIMESTAMP]: 0,
    [RequestProps.ODDS]: [],
    [RequestProps.BALANCE]: 0,
    [RequestProps.POLL]: [],
}

export const BOOKIES_FID = 244367;

export const DEFAULT_USER: User = {
    points: 0,
    streak: 0,
    wins: 0,
    losses: 0,
    numBets: 0,
    hasClaimed: false,
}

export const DEFAULT_BET: Bet = {
    eventName: "",
    wagerAmount: 0,
    prediction: -1,
    timeStamp: 0
}

export const DEFAULT_FRAME_VALIDATION_DATA: FrameValidationData = {
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

export function getRequestProps(req: NextRequest, params: RequestProps[]): Record<string, any> {
    // Loop throug each RequestParams
    let returnParams: Record<string, any> = {}
    for (const key of params) {;
        if (!req.nextUrl.searchParams.has(key)) {
            // Throw error if required param is missing
            throw new Error(`Missing required param: ${key}`)
        }

        const value = decodeURIComponent(req.nextUrl.searchParams.get(key) || "")

        console.log(value)

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
                returnParams[key] = value.split(',')
                break;
        }
    }

    return returnParams
}

export function generateImageUrl(frameName: string, params: Record<string, any>, addTimestamp: boolean = false): string {
    let url = `${process.env['HOST']}/api/frames/${frameName}/image?`

    if (addTimestamp || process.env['HOST']?.includes('localhost') || process.env['HOST']?.includes('staging')) {
        url += `timestamp=${new Date().getTime()}`
    }

    // Loop through each param
    for (const key in params) {
        url += `&${key}=${encodeURIComponent(params[key])}`
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


export async function validateFrameMessage(req: NextRequest) {
    const body = await req.json();

    let message: FrameValidationData = DEFAULT_FRAME_VALIDATION_DATA

    try {
        // Use onchainkit to validate the frame message
        const data = await getFrameMessageOnchain(body, { neynarApiKey: process.env['NEYNAR_API_KEY'] });

        if (!data.isValid) {
            throw new Error('Invalid frame message');
        }

        message.button = data?.message?.button || 0
        message.following = data?.message?.following || false
        message.input = data?.message?.input || ""
        message.fid = data?.message?.interactor.fid || 0
        message.custody_address = data?.message?.interactor.custody_address || ""
        message.verified_accounts = data?.message?.interactor.verified_accounts || []
        message.liked = data?.message?.liked || false
        message.recasted = data?.message?.recasted || false

        message.followingBookies = true //await checkIsFollowingBookies(message.fid) // TEMPORARY FIX

    }
    catch (error) {
        throw new Error(`Error validating: ${error}`)

    }

    return message
}

export function convertImpliedProbabilityToAmerican(impliedProbability: number) {
    if (impliedProbability <= 0 || impliedProbability >= 1) {
      throw new Error('Implied probability must be between 0 and 1 (exclusive).');
    }
  
    const americanOdds = impliedProbability === 0
      ? Infinity  // Represents infinite odds for a probability of 0
      : Math.round((10000 - (impliedProbability * 100 * 100))/(impliedProbability * 100));
  
    return americanOdds;
  }