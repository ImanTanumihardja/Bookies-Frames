import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import { DEFAULT_USER, RequestProps, getRequestProps } from '../../../../../src/utils';
import { kv } from '@vercel/kv';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        let text='' // Default empty React element
        const {pick, stake, buttonIndex, fid} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.STAKE, RequestProps.PICK, RequestProps.BUTTON_INDEX, RequestProps.FID]);

        // Get user
        const bets = await kv.hget(fid?.toString() || "", 'bets');

        if (bets === null) throw new Error('Bets not found');

        if (buttonIndex == 2) {
            text = 'You rejected the bet!'
        } 
        else if (stake <= -1){
            text =  "You don't have enough dice!"
        }
        else if (pick === -1) {
            text = "Event is no longer taking bets!"
        }
        else {
            text = "Bet confirmed!"
        }

        return new ImageResponse(
            (
                <FrameBase>
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> {text} </h1>
                </FrameBase>
            ), {
            width: 764, 
            height: 400, 
            fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
