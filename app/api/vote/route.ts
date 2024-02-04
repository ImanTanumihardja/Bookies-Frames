import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let buttonIndex: number = 0;

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

   // Get the poll data from database
   let poll = await kv.hgetall('SBLVIII') || {niners: 0, chiefs: 0, voted: []}
   
  //  let niners: number = await kv.get('Niners') || 0
  //  let chiefs: number = await kv.get('Chiefs') || 0

  if (isValid) {
    buttonIndex = message?.button || 0;
    const fid = message?.interactor.fid || 0;

    // Check if voted before
    const voteExists = poll.voted.includes(fid);
    if (!voteExists) {
      if (buttonIndex === 2) {
        // Increment value for 49ers
        poll['niners']++
      }
      else if (buttonIndex === 1) {
        // Increment value for Chiefs
        poll['niners']++
      }
      poll['voted'].push(fid);
      const votedAsString = JSON.stringify(poll.voted);
      await kv.hset("SBLVIII", 'niners', poll.niners, 'chiefs', poll.chiefs, 'voted', votedAsString);
    }
  } 

  const imageUrl = `${process.env['HOST']}/api/image?buttonIndex=${buttonIndex}&niners=${poll.niners}&chiefs=${poll.chiefs}`;

  return new NextResponse(
    getFrameHtmlResponse({
      image: `${imageUrl}`,
      post_url: `${process.env['HOST']}/api/vote`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
