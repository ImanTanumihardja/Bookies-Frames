import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateUrl, RequestProps, validateFrameMessage, neynarClient, BOOKIES_FID, FrameNames } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';
import { revalidatePath } from 'next/cache';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing } = message;

  // Check for fid prop in url and if there use that as fid
  const username : string = (req.nextUrl.searchParams.get("username") || message?.input || "")?.toLowerCase();

  let imageUrl: string = "";
  let input_text : string = "Enter another username";

  if (username !== "") {
    let profile: any = null;
    let user : User = DEFAULT_USER;
    let rank : number = -1;

    await neynarClient.lookupUserByUsername(username, BOOKIES_FID).then( (res ) => {
      profile = res?.result?.user
    })
    .catch ( (error) => {
      console.error(error);
      profile = null;
    })
    .finally(async () => {
        if (profile !== null) {
          let temp = await kv.zrevrank('users', profile?.fid || "");
          if (temp !== null) rank = temp;
          
          // Can skip if not found in kv
          if (rank !== -1) user = await kv.hgetall(profile?.fid?.toString() || "") || DEFAULT_USER;
        }

      console.log('User:' + user)
    
      imageUrl = generateUrl(`api/frames/${FrameNames.PROFILE_FINDER}/image`, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                              [RequestProps.USERNAME]: profile?.username || "", 
                                              [RequestProps.AVATAR_URL]: profile?.pfp.url || "", 
                                              [RequestProps.RANK]: rank, 
                                              [RequestProps.WINS]: user.wins, 
                                              [RequestProps.LOSSES]: user.losses, 
                                              [RequestProps.POINTS]: user.points, 
                                              [RequestProps.STREAK]: user.streak, 
                                              [RequestProps.NUM_BETS]: user.numBets}, true, true);
    });
  }
  else {
    throw new Error('Invalid username');
  }

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: [
      {
        label: 'Search',
        action: 'post',
      },
    ],
    inputText: input_text,
    postUrl: `${process.env['HOST']}/api/frames/${FrameNames.PROFILE_FINDER}`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  revalidatePath('/', 'layout')
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
