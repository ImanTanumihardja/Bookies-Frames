import { NextRequest, NextResponse } from 'next/server'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { FrameValidationData } from '@types';
const { getFrameHtml, /*getFrameMessage: validateFrameMessage */} = require('frames.js');
import {RequestProps, RequestPropsTypes, BOOKIES_FID} from '../utils/constants';
import {getFrameMessage as validateFrameMessage} from '@coinbase/onchainkit/frame';

export function getRequestProps(req: NextRequest, params: RequestProps[]): Record<string, any> {
    // Loop throug each RequestParams
    let returnParams: Record<string, any> = {}
    for (const key of params) {;
        if (!req.nextUrl.searchParams.has(key)) {
            // Throw error if required param is missing
            throw new Error(`Missing required param: ${key}`)
        }

        const value = decodeURIComponent(req.nextUrl.searchParams.get(key) || "")

        // Check if could be undefined or null
        if (value === "null" || value === "undefined") {
            returnParams[key] = null
            continue
        }

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

// export async function getFrameMessage(req: NextRequest, validate=true, viewerFid=BOOKIES_FID) {
//     const body = await req.json();

//     let message: FrameValidationData = {} as FrameValidationData;

//     message.button = body.untrustedData.buttonIndex
//     message.input = body.untrustedData.inputText
//     message.fid = body.untrustedData.fid
//     message.transactionId = body.untrustedData.transactionId 
//     message.connectedAddress = body.untrustedData.address
//     message.casterFID = body.untrustedData.castId.fid

//     // Use onchainkit to validate the frame message
//     if (validate) {
//         const data = await validateFrameMessage(body, 
//             {fetchHubContext: true, hubHttpUrl:process.env['HUB_HTTP_URL'], hubRequestOptions:{headers: {api_key: process.env['NEYNAR_API_KEY']}}});

//         if (!data.isValid) {
//             throw new Error('Invalid frame message');
//         }

//         message.following = data.requesterFollowsCaster
//         message.custodyAddress = data?.requesterCustodyAddress
//         message.verifiedAccounts = data?.requesterVerifiedAddresses
//         message.liked = data?.likedCast
//         message.recasted = data?.recastedCast
//         message.followingHost = await checkIsFollowing(message.fid, viewerFid)
//     }

//     return message
// }

// Onchainkit
export async function getFrameMessage(req: NextRequest, validate=true, viewerFid=BOOKIES_FID) {
    const body = await req.json();

    let frameValidationData: FrameValidationData = {} as FrameValidationData;

    frameValidationData.button = body.untrustedData.buttonIndex
    frameValidationData.input = body.untrustedData.inputText
    frameValidationData.fid = body.untrustedData.fid
    frameValidationData.transactionId = body.untrustedData.transactionId 
    frameValidationData.connectedAddress = body.untrustedData.address
    frameValidationData.casterFID = body.untrustedData.castId.fid

    // Use onchainkit to validate the frame message
    if (validate) {
        const {isValid, message} = await validateFrameMessage(body, {
            neynarApiKey: process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS', 
          });

        if (!isValid) {
            throw new Error('Invalid frame message');
        }

        frameValidationData.following = message?.following
        frameValidationData.custodyAddress = message?.interactor.custody_address
        frameValidationData.verifiedAccounts = message?.interactor.verified_accounts
        frameValidationData.liked = message?.liked
        frameValidationData.recasted = message?.recasted
        frameValidationData.followingHost = await checkIsFollowing(message.interactor.fid, viewerFid)
    }

    return frameValidationData
}

export function convertImpliedProbabilityToAmerican(impliedProbability: number):string {
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
  
    return impliedProbability > 0.5 ? '-' : '+' + americanOdds.toString();
}

export function calculatePayout(impliedProbability: number, stake: number){
    const payout = (1 / impliedProbability) * (stake)
    return payout
}