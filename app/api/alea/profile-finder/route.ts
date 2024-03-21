import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateUrl, RequestProps, getFrameMessage, neynarClient, BOOKIES_FID, FrameNames, getRequestProps, DatabaseKeys, notFollowingResponse, ALEA_FID } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request
  const message = await getFrameMessage(req, true, ALEA_FID);

  const {followingBookies: isFollowing, fid, input} = message;
  console.log('FID: ', fid.toString())

  let {fid: profileFID} = getRequestProps(req, [RequestProps.FID]);

  if (profileFID === -1) { // Show profile-finder thumbnail
    return await GET(req);
  }

  if (!isFollowing) {
    // Call fetch to get not following thumbnail
    return notFollowingResponse(generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false))
  }

  let user : User = DEFAULT_USER;
  let rank : number | null = -1;
  let profile: any = null;
  let eventNames: string[] = [];

  let imageUrl: string = "";
  let postUrl = generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: ''}, false)
  let offset = 0;
  let count = 5;

  const username : string = (req.nextUrl.searchParams.get("username") || input || '')?.toLowerCase();
  if (!profileFID) { // Not coming from bets page
    // Check for fid prop in url and if there use that as fid
    console.log('Searched for: ', username)

    if (username === "") {
      throw new Error('Invalid username');
    }

    await neynarClient.searchUser(username, BOOKIES_FID).then( (res: any) => {
      const profiles = res?.result?.users;
      if (profiles && profiles.length > 0) {
        profile = profiles[0]; // Get first profile
      }else {
        throw new Error('Profile-finder Error: Could not find user');
      }
    }).catch ( async (error:any) => {
      console.error('Profile-finder Error: Could not find user by username:', error);
      console.log('Trying to search by fid')
    })
  }

  if (!profile) { // Coming from bets page or search by fid
    try {
      // Try searching by fid
      if (!profileFID && username === '') {
        throw new Error('Invalid fid');
      }

      const searchFID = profileFID || username;

      profile = (await neynarClient.fetchBulkUsers([searchFID], {viewerFid: BOOKIES_FID})).users[0];
    } catch (error) {
      console.log('Profile-finder Error: Could not find user by fid:', error);
    }
  }

  if (profile !== null) {
    rank = await kv.zrevrank(DatabaseKeys.LEADERBOARD, profile?.fid || "");
    rank = rank === null ? -1 : rank;
    
    user = await kv.hgetall(profile?.fid?.toString() || "") || DEFAULT_USER;

    eventNames = Object.keys((user as User).bets) 

    // Add users back to leaderboard if not already there
    if (rank === -1 && user !== DEFAULT_USER) {
      // Add user to leaderboard
      await kv.zadd(DatabaseKeys.LEADERBOARD, {score: user.balance, member: profile?.fid});
      rank = await kv.zrevrank(DatabaseKeys.LEADERBOARD, profile?.fid || "");
    }

    // Get rank in leaderboard 
    if (rank != null) {
      if (rank <= 5) {
        offset = -1;
        count = 5;
      }
      else {
        // Get nearest 5 ranks
        offset = Math.floor(rank / 5) * 5;
        count = 10;
      }
    }
  }

  imageUrl = generateUrl(`api/alea/${FrameNames.PROFILE_FINDER}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                          [RequestProps.USERNAME]: profile?.username || '', 
                                                                          [RequestProps.AVATAR_URL]: profile?.pfp_url || '', 
                                                                          [RequestProps.RANK]: rank, 
                                                                          [RequestProps.WINS]: user.wins, 
                                                                          [RequestProps.LOSSES]: user.losses, 
                                                                          [RequestProps.BALANCE]: user.balance, 
                                                                          [RequestProps.STREAK]: user.streak, 
                                                                          [RequestProps.NUM_BETS]: user.numBets}, true); 

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: (rank === -1 || eventNames.length === 0 ? // No user or no bets
    [
      {
        label: 'Search',
        action: 'post',
      },
    ]
    :
    [
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: -1}, false)
      },
      {
        label: "Bets",
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}`, {[RequestProps.FID]: profile?.fid, [RequestProps.INDEX]: 0, [RequestProps.ARRAY]: eventNames}, false)
      },
      {
        label: "Leaderboard",
        action: 'post',
        target: generateUrl(`/api/alea/${FrameNames.LEADERBOARD}`, {[RequestProps.OFFSET]: offset, [RequestProps.COUNT]: count}, false)
      }
    ]),
    inputText: rank === -1 || eventNames.length === 0 ? "Enter another username or fid" : undefined,
    postUrl: postUrl,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  const imageUrl = generateUrl(`thumbnails/${FrameNames.PROFILE_FINDER}.gif`, {}, true)

  const frame : Frame = {
    version: "vNext",
    buttons: [
      {
        label: 'Search',
        action: 'post',
      },
    ],
    inputText: 'Enter a username or fid',
    image: imageUrl,
    postUrl: generateUrl(`api/alea/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: ''}, false),
  };

  return new NextResponse(
    getFrameHtml(frame),
    {
      headers: {
        'content-type': 'text/html',
      },
    },
  );
}

export const revalidate = 30;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
