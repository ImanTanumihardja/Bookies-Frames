import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import NotFollowing from '../../../../../src/components/NotFollowing';
import { RequestProps, getRequestProps } from '../../../../../src/utils';
import { off } from 'process';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        let html = <></>; // Default empty React element
        const {isFollowing, prediction, stake, button} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.STAKE, RequestProps.PREDICTION, RequestProps.BUTTON_INDEX]);

        console.log(button, typeof button)
        if (!isFollowing) 
        { 
            html = <NotFollowing/>
        }
        else if (button == 2.0) {
            html = (<FrameBase>
                <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> You rejected the bet!</h1>
            </FrameBase>)
        } 
        else if (stake === 0 ){
            html = 
            <FrameBase>
                <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> You already placed a bet!</h1>
            </FrameBase>
        }
        else if (stake <= -1){
            html = 
            (<FrameBase>
                <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> You don't have enough dice!</h1>
            </FrameBase>)
        }
        else if (prediction === -1) {
            html = 
            <FrameBase>
                <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> Event is no longer taking bets!</h1>
            </FrameBase>
        }
        else {
            html = 
            <FrameBase>
                <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> Bet confirmed!</h1>
            </FrameBase>
        }

        return new ImageResponse(html, {
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
