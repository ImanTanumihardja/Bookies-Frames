import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateUrl, RequestProps, validateFrameMessage, neynarClient, BOOKIES_FID, FrameNames, getRequestProps, DatabaseKeys } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing, fid, input, button} = message;
  console.log('FID: ', fid.toString())

  let {fid: profileFID, index:lastEventIndex, array:eventNames, boolean:fromProfile} = getRequestProps(req, [RequestProps.FID, RequestProps.INDEX, RequestProps.ARRAY, RequestProps.BOOLEAN]);

  let user : User = DEFAULT_USER;
  let rank : number | null = -1;
  let profile: any = null;

  let imageUrl: string = "";
  let postUrl = `${process.env['HOST']}/api/frames/${FrameNames.PROFILE_FINDER}`;
  let input_text : string | undefined = "Enter another username or fid";

  // If on bets page figure out which event to show based on button press
  let currentEventIndex = lastEventIndex
  if (eventNames && lastEventIndex !== -1) {
    if (button === 1){
      currentEventIndex = lastEventIndex - 1;
    }
    else if ((button === 3 || button === 2) && !fromProfile) { // Increment index if not coming from profile page
      currentEventIndex = lastEventIndex + 1;
    }
  }

  const username : string = (req.nextUrl.searchParams.get("username") || input || '')?.toLowerCase();
  if (currentEventIndex === -1) { // Show the profile page
    if (!profileFID) { // Not coming from bets page
      // Check for fid prop in url and if there use that as fid
      console.log('Searched for: ', username)

      if (username === "") {
        throw new Error('Invalid username');
      }

      await neynarClient.searchUser(username, BOOKIES_FID).then( (res) => {
        const profiles = res?.result?.users;
        if (profiles && profiles.length > 0) {
          profile = profiles[0]; // Get first profile
        }else {
          throw new Error('Profile-finder Error: Could not find user');
        }
      }).catch ( async (error) => {
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


      // Add users back to leaderboard if not already there
      if (rank === -1 && user !== DEFAULT_USER) {
        // Add user to leaderboard
        await kv.zadd(DatabaseKeys.LEADERBOARD, {score: user.balance, member: profile?.fid});
        rank = await kv.zrevrank(DatabaseKeys.LEADERBOARD, profile?.fid || "");
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
                                                                            [RequestProps.NUM_BETS]: user.numBets}, true);

    if (rank === -1) { // No user or no bets give search page on post
      input_text = "Enter another username or fid";
      postUrl = generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: '', 
                                                                        [RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                        [RequestProps.INDEX]: -1, 
                                                                        [RequestProps.ARRAY]: '', 
                                                                        [RequestProps.BOOLEAN]: false}, false)
    }
    else { // User with bets give bets page on post
      input_text = undefined
      eventNames = Object.keys((user as User).bets)                                                   
      postUrl = generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: profile?.fid, 
                                                                        [RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                        [RequestProps.INDEX]: 0, 
                                                                        [RequestProps.ARRAY]: eventNames, 
                                                                        [RequestProps.BOOLEAN]: true}, false)
    }      

  }
  else { // Show the bets page
    if (eventNames.length > 0) {
      input_text = undefined
      imageUrl = generateUrl(`api/frames/${FrameNames.PROFILE_FINDER}/${FrameNames.BETS}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                                                  [RequestProps.FID]: profileFID, 
                                                                                                  [RequestProps.EVENT_NAME]: eventNames[currentEventIndex]}, true);

      postUrl = generateUrl(`/api/frames/${FrameNames.PROFILE_FINDER}`, {[RequestProps.FID]: profileFID, 
                                                                        [RequestProps.IS_FOLLOWING]: isFollowing, 
                                                                        [RequestProps.INDEX]: currentEventIndex, 
                                                                        [RequestProps.ARRAY]: eventNames,
                                                                        [RequestProps.BOOLEAN]: false}, false)
    }
  }

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? (currentEventIndex === -1 ? (rank === -1 || eventNames.length === 0 ? // No user or no bets
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
        action: 'link',
        target: generateUrl(`${FrameNames.PROFILE_FINDER}`, {}, false)
      },
      {
        label: "Bets",
        action: 'post',
      }
    ])
    :
    currentEventIndex === 0 && eventNames.length === 1 ? // First event and no others
    [
      {
        label: 'Back to Profile',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`${FrameNames.PROFILE_FINDER}`, {}, false)
      },
    ] 
    :
    currentEventIndex === eventNames.length - 1 ? // Last event with others
    [
      {
        label: '<',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'link',
        target: generateUrl(`${FrameNames.PROFILE_FINDER}`, {}, false)
      },
    ]
    :
    currentEventIndex === 0 && eventNames.length !== 1 ? // First event with others
    [
      {
        label: 'Back to Profile',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'post',
        target: generateUrl(`${FrameNames.PROFILE_FINDER}`, {}, false)
      },
      {
        label: '>',
        action: 'post'
      }
    ]
    :
    [
      {
        label: '<',
        action: 'post'
      },
      {
        label: 'Search Again',
        action: 'link',
        target: generateUrl(`${FrameNames.PROFILE_FINDER}`, {}, false)
      },
      {
        label: '>',
        action: 'post'
      }
    ])
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
