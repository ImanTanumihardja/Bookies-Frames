import { FrameRequest, getFrameAccountAddress, getFrameMessage } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // let accountAddress: string | undefined = '';
  const { body } = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  // if (isValid) {
  //   try {
  //     accountAddress = await getFrameAccountAddress(message, { NEYNAR_API_KEY: 'NEYNAR_API_DOCS' });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  const buttonIndex = body.buttonIndex as number;

  return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://bookies-frames.vercel.app/${buttonIndex === 1 ? "49ers.gif" : "chiefs.gif"}" />
  </head></html>`);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
