import { NextRequest } from 'next/server'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { User, Bet} from '../app/types';
import { getFrameMessage as getFrameMessageOnchain } from '@coinbase/onchainkit'
import { FrameValidationData } from '../app/types';

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
    VALID_CAPTCHA = 'valid_captcha',
}

export enum FrameNames {
    CLAIM_DICE = 'claim-dice',
    PROFILE_FINDER = 'profile-finder',
    SBLVIII_ML = 'sblviii-ml',
    BETSLIP = 'betslip',
    BET_CONFIRMATION = 'bet-confirmation',
    CAPTCHA = 'captcha',
}

export const RequestPropsTypes = {
    [RequestProps.FID]: 0,
    [RequestProps.IS_FOLLOWING]: true,
    [RequestProps.HAS_CLAIMED]: true,
    [RequestProps.STAKE]: 0,
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
    [RequestProps.VALID_CAPTCHA]: true,
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
    stake: 0,
    prediction: -1,
    timeStamp: 0,
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
                    console.log('floatArray:', key)
                }
                else {
                    returnParams[key] = array // Just return normal
                }
                console.log(returnParams[key])
                break;
        }
    }

    return returnParams
}

export function generateUrl(extension: string, props: Record<string, any>, addTimestamp: boolean = false, isImageURL: boolean = false): string {
    let url = `${process.env['HOST']}/${extension}`;

    if(isImageURL && (addTimestamp || process.env['HOST']?.includes('localhost') || process.env['HOST']?.includes('staging'))){
        url += `?version=${process.env['VERSION']}`
        url += `&timestamp=${new Date().getTime()}`
    }
    else if (addTimestamp || process.env['HOST']?.includes('localhost') || process.env['HOST']?.includes('staging')) {
        url += `?timestamp=${new Date().getTime()}`
    }
    else{
        url += `?version=${process.env['VERSION']}`
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


export async function validateFrameMessage(req: NextRequest, checkFollowingBookies=true) {
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

        if (checkFollowingBookies){
            message.followingBookies = true //await checkIsFollowingBookies(message.fid)
        }

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
  
    const americanOdds =
      Math.round((10000 - ((impliedProbability * 100) * 100))/(impliedProbability * 100));
  
    return americanOdds;
  }

export function calculatePayout(multiplier: number, impliedProbability: number, stake: number, streak: number = 0){
    return multiplier * (1 / impliedProbability) * (stake + streak)
}