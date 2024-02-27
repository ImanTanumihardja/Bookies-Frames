import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, getRequestProps, RequestProps } from '../../../src/utils';
import { kv } from '@vercel/kv';

const PASSWORD: string = 'bookies123';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  console.log("Resetting user")
  const {string : password, fid} = getRequestProps(req, [RequestProps.STRING, RequestProps.FID]);  

  if (password !== PASSWORD) {
    return new NextResponse('Invalid password', {status: 401});
  }

  await kv.del(fid.toString());
  await kv.zrem(FrameNames.LEADERBOARD, fid.toString());

  return new NextResponse('User reset', {status: 200});
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 

export const revalidate = 0;
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
