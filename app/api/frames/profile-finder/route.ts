import { NextRequest, NextResponse } from 'next/server';
import { getFrameMessage, Frame, getFrameHtml } from "frames.js";
import { DEFAULT_USER, generateImageUrl, RequestProps, validateFrameMessage} from '../../../../src/utils';
import { User } from '../../../types';
import { kv } from '@vercel/kv';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const message = await validateFrameMessage(req);

  const {followingBookies: isFollowing , input} = message;

  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";

  const fid = parseInt(input);
  const profile = await (await fetch(`https://searchcaster.xyz/api/profiles?fid=${fid}`)).json().then((data) => data[0].body) || {}
  const user : User = await kv.hgetall(fid.toString()) || DEFAULT_USER;
  const rank : number = await kv.zrank('users', fid) || -1

  const imageUrl = generateImageUrl(frameName, {[RequestProps.IS_FOLLOWING]: isFollowing, [RequestProps.USERNAME]: profile.username, [RequestProps.AVATAR_URL]: profile.avatarUrl, [RequestProps.RANK]: rank, [RequestProps.WINS]: user.wins, [RequestProps.LOSSES]: user.losses, [RequestProps.POINTS]: user.points, [RequestProps.STREAK]: user.streak, [RequestProps.NUM_BETS]: user.numBets});

  const frame: Frame = {
    version: "vNext",
    image: imageUrl,
    buttons: isFollowing ? [{ label: "Refresh", action: 'post'}] : [{ label: "Follow Us!", action: 'link', target: 'https://warpcast.com/bookies'}],
    postUrl: `${process.env['HOST']}/api/frames/${frameName}`,
  };

  return new NextResponse(
    getFrameHtml(frame),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
