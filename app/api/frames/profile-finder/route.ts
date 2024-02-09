import { NextRequest, NextResponse } from 'next/server';
import { Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateImageUrl, RequestProps, validateFrameMessage, neynarClient } from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing } = message;

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";

  // Check for fid prop in url and if there use that as fid
  const username : string = (req.nextUrl.searchParams.get("username") || message.input).toLowerCase();

  let profile: any;

  // Get username from neynar
  await neynarClient.lookupUserByUsername(username).then( (res) => {
    profile = res.result?.user;
  })
  .catch ( (error) => {
    console.error('Error fetching user by fid:', error);
    // Set default profile
    profile = {username: "", pfp: {url: ""}}
  })
  .finally(async () => {
    let user : User = DEFAULT_USER;
    let rank : number = -1

    if (profile) {
      // Check our database if farcasts profile exists
      user = await kv.hgetall(profile?.fid.toString()) || DEFAULT_USER;
      rank = await kv.zrank('users', profile?.fid) || -1
    }

    const imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.USERNAME]: profile.username, [RequestProps.AVATAR_URL]: profile.pfp.url, [RequestProps.RANK]: rank, [RequestProps.WINS]: user.wins, [RequestProps.LOSSES]: user.losses, [RequestProps.POINTS]: user.points, [RequestProps.STREAK]: user.streak, [RequestProps.NUM_BETS]: user.numBets});

    const frame: Frame = {
      version: "vNext",
      image: imageUrl,
      buttons: isFollowing ? [{ label: "Back", action: 'post'}] : [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
      postUrl: `${process.env['HOST']}/${frameName}`,
    };
    
    return new NextResponse(
      getFrameHtml(frame),
    );
  });

  // Catch errors
  return new NextResponse(`Error: Could not POST profile-finder`, { status: 500 });
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
