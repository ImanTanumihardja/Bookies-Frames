import { NextRequest, NextResponse } from 'next/server';
import { FrameNames, RequestProps, generateUrl, getFrameMessage } from '../../../../src/utils';
import { getFrameHtml} from "frames.js";


export async function POST(req: NextRequest): Promise<Response> {
  // Verify the frame request

  // Generate random number between 0 and 3
  const randomIndex = Math.floor(Math.random() * 4);

  const imageUrl = generateUrl(`api/alea/${FrameNames.CAPTCHA}/image/`, {[RequestProps.CAPTCHA_INDEX]: randomIndex}, true);

  return new NextResponse(
    getFrameHtml({
      version: "vNext",
      image: imageUrl,
      buttons: [{label:'🎩', action:'post'}, {label:'🏆', action:'post'}, {label:'🤑', action:'post'}, {label:'🏇', action:'post'}],
      postUrl: generateUrl(`api/alea/${FrameNames.CLAIM_DICE}`, {[RequestProps.CAPTCHA_INDEX]: randomIndex}, false),
    }),
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
