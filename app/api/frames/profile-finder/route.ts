import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateImageUrl, RequestProps, validateFrameMessage, neynarClient, BOOKIES_FID, FrameNames } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';

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

    await neynarClient.searchUser(username, BOOKIES_FID).then( (res) => {
      const users = res?.result?.users;
      profile = users?.length > 0 ? users[0] : null;
    })
    .catch ( (error) => {
      console.error(error);
      profile = null;
    })
    .finally(async () => {
        if (profile !== null) {
          rank = await kv.zrank('users', profile?.fid || "") || -1
          
          // Can skip if not found in kv
          if (rank !== -1) user = await kv.hgetall(profile?.fid?.toString() || "") || DEFAULT_USER;
        }
    
      imageUrl = generateImageUrl(FrameNames.PROFILE_FINDER, {[RequestProps.IS_FOLLOWING]: isFollowing, 
                                              [RequestProps.USERNAME]: profile?.username || "", 
                                              [RequestProps.AVATAR_URL]: profile?.pfp.url || "", 
                                              [RequestProps.RANK]: rank, 
                                              [RequestProps.WINS]: user.wins, 
                                              [RequestProps.LOSSES]: user.losses, 
                                              [RequestProps.POINTS]: user.points, 
                                              [RequestProps.STREAK]: user.streak, 
                                              [RequestProps.NUM_BETS]: user.numBets});
    });
  }
  else {
    imageUrl = `${process.env['HOST']}/thumbnails/FRAME_NAME.gif`
    input_text = "Enter a username";
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
    postUrl: `${process.env['HOST']}/api/frames/FRAME_NAME`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
