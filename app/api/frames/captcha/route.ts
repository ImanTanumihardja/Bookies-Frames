import { NextRequest, NextResponse } from 'next/server';
import { kv } from "@vercel/kv";
import { User} from '../../../types';
import { RequestProps, generateUrl, DEFAULT_USER, validateFrameMessage } from '../../../../src/utils';
import { FrameNames } from '../../../../src/utils';
import { getFrameHtmlResponse } from '@coinbase/onchainkit';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const images = ['🎩', '🏆', '🤑', '🏇'] 

  // Generate random number between 0 and 3
  const randomIndex = Math.floor(Math.random() * 4);

  const imageUrl = `${process.env['HOST']}/api/frames/captcha/image/?timestamp=${new Date().getTime()}&image=${images[randomIndex]}`;

  return new NextResponse(
    getFrameHtmlResponse({
      image: imageUrl,
      buttons: [{label:'🎩'}, {label:'🏆'}, {label:'🤑'}, {label:'🏇'}],
      postUrl: `${process.env['HOST']}/api/frames/${FrameNames.CLAIM_DICE}?captcha=${randomIndex}`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
} 

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
