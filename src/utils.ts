import { NextRequest } from 'next/server'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FarcasterProfile, User, Bet} from '../app/types';

export enum RequestProps {
    FID = 'fid',
    IS_FOLLOWING = 'isFollowing',
    HAS_CLAIMED = 'hasClaimed',
    AMOUNT = 'amount',
}

export const RequestPropsTypes = {
    [RequestProps.FID]: 0,
    [RequestProps.IS_FOLLOWING]: true,
    [RequestProps.HAS_CLAIMED]: true,
    [RequestProps.AMOUNT]: 0,
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

export function getRequestProps(req: NextRequest, params: RequestProps[]): Record<string, any> {
    // Loop throug each RequestParams
    let returnParams: Record<string, any> = {}
    for (const key of params) {;
        if (!req.nextUrl.searchParams.has(key)) {
            // Throw error if required param is missing
            throw new Error(`Missing required param: ${key}`)
        }

        const value = req.nextUrl.searchParams.get(key) || ''

        // Parse Props
        switch (typeof RequestPropsTypes[key]) {
            case 'string':
                returnParams[key] = value
                break;
            case 'number':
                returnParams[key] = parseInt(value)
                break;
            case 'boolean':
                returnParams[key] = value.toLowerCase() === 'true';
                break;
        }
    }

    return returnParams
}

export function generateImageUrl(frameName: string, params: Record<string, any>): string {
    let url = `${process.env['HOST']}/api/frames/${frameName}/image?`

    if (process.env['HOST']?.includes('localhost') || process.env['HOST']?.includes('staging')) {
        url += `?timestamp=${new Date().getTime()}`
    }

    // Loop through each param
    for (const key in params) {
        url += `&${key}=${params[key]}`
    }
    return url
}

// don't have an API key yet? get one at neynar.com
const client = new NeynarAPIClient(process.env['NEYNAR_API_KEY'] || "");


export async function getIsFollowing(fid: number): Promise<boolean> {
    let cursor: string | null = "";
    let users: unknown[] = [];
    do {
      const result = await client.fetchUserFollowing(fid, {
        limit: 150,
        cursor,
      });
      users = users.concat(result.result.users);
      cursor = result.result.next.cursor;
      console.log(cursor);
    } while (cursor !== "" && cursor !== null);

    const following = users as FarcasterProfile[];
    // Lopp through each user and check if the user is following bookie
    let isFollowing = false;
    for (const account of following) {
      if (account.fid === BOOKIES_FID) {
        isFollowing = true;
        break;
      }
    }

    return isFollowing;
}