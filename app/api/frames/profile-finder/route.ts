import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateUrl, RequestProps, validateFrameMessage, neynarClient, BOOKIES_FID, FrameNames } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, fid, input} = message;
  console.log('FID: ', fid.toString())

  // Check for fid prop in url and if there use that as fid
  const username : string = (req.nextUrl.searchParams.get("username") || input || "")?.toLowerCase();
  console.log('Searched for: ', username)

  let imageUrl: string = "";
  let user : User = DEFAULT_USER;
  let rank : number | null = -1;
  let profile: any = null;

  if (username !== "") {
    await neynarClient.searchUser(username, BOOKIES_FID).then( (res) => {
      const profiles = res?.result?.users;
      if (profiles && profiles.length > 0) {
        profile = profiles[0]; // Get first profile
      }else {
        throw new Error('Profile-finder Error: Could not find user');
      }
    })
    .catch ( async (error) => {
      console.error('Profile-finder Error: Could not find user by username:', error);
      console.log('Trying to search by fid')

      try {
        // Try searching by fid
        const fid = parseInt(username);
        if (!fid) {
          throw new Error('Invalid fid');
        }

        profile = (await neynarClient.fetchBulkUsers([fid], {viewerFid: BOOKIES_FID})).users[0];
      } catch (error) {
        console.log('Profile-finder Error: Could not find user by fid:', error);
      }
    })
    .finally(async () => {
        if (profile !== null) {
          rank = await kv.zrevrank('leaderboard', profile?.fid || "");
          rank = rank === null ? -1 : rank;
          
          user = await kv.hgetall(profile?.fid?.toString() || "") || DEFAULT_USER;


          // Add users back to leaderboard if not already there
          if (rank === -1 && user !== DEFAULT_USER) {
            // Add user to leaderboard
            await kv.zadd('leaderboard', {score: user.balance, member: profile?.fid});
            rank = await kv.zrevrank('leaderboard', profile?.fid || "");
          }
        }
    
      imageUrl = generateUrl(`api/frames/${FrameNames.PROFILE_FINDER}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                              [RequestProps.USERNAME]: profile?.username || '', 
                                                                              [RequestProps.AVATAR_URL]: profile?.pfp_url || '', 
                                                                              [RequestProps.RANK]: rank, 
                                                                              [RequestProps.WINS]: user.wins, 
                                                                              [RequestProps.LOSSES]: user.losses, 
                                                                              [RequestProps.BALANCE]: user.balance, 
                                                                              [RequestProps.STREAK]: user.streak, 
                                                                              [RequestProps.NUM_BETS]: user.numBets}, true, true);
    });
  }
  else {
    throw new Error('Invalid username');
  }

  let postUrl = `${process.env['HOST']}/api/frames/${FrameNames.PROFILE_FINDER}`;
  let input_text : string | undefined = "Enter another username or fid";
  const eventNames = Object.keys((user as User).bets)
  console.log('Event Names: ', eventNames)

  if (rank !== -1 && eventNames.length > 0) {
    postUrl = generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}`, {[RequestProps.FID]: profile?.fid, [RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.INDEX]: -1, [RequestProps.ARRAY]: eventNames}, false, false)
    console.log(postUrl)
    input_text = undefined
  }

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? rank === -1 || eventNames.length === 0 ? [
      {
        label: 'Search',
        action: 'post',
      },
    ]
    :
    [
      {
        label: 'Search Again',
        action: 'link',
        target: 'https://warpcast.com/bookies'
      },
      {
        label: "Bets",
        action: 'post',
      },
    ]
    :
    [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
    inputText: input_text,
    postUrl: postUrl,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 

export const revalidate = 30;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
