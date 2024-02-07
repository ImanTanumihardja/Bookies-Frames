import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  // Verify the frame request
  const body: FrameRequest = await req.json();
  const frameName: string = req.nextUrl.pathname.split('/').pop() || "";
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    const accountAddress: string = req.nextUrl.searchParams.get('accountAddress') || message?.interactor.custody_address || "";
    const isFollowing: boolean = message.following;

    const imageUrl = `${process.env['HOST']}/api/frames/${frameName}/image?isFollowing=${isFollowing}&accountAddress=${accountAddress}&timestamp=${new Date().getTime()}`;

    return new NextResponse(
      getFrameHtmlResponse({
        buttons: isFollowing ? [{ label: "View Profile" }] : [{ label: "Follow", action: 'link', target: 'https://warpcast.com/bookies'}],
        image: `${imageUrl}`,
        post_url: `${process.env['HOST']}/api/frames/${frameName}`
      }),
    );
  } 
  else {
    return new NextResponse(
      getFrameHtmlResponse({
        image: `${process.env['HOST']}/superbowl.png`,
      }),
    );
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 


export const dynamic = 'force-dynamic';
