import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import { RequestProps, getRequestProps } from '../../../../../src/utils';
import NotFollowing from '../../../../../src/components/NotFollowing';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const {isFollowing, hasClaimed, amount} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.HAS_CLAIMED, RequestProps.AMOUNT]);

        return new ImageResponse(
            <FrameBase>
                    {isFollowing ?
                    !hasClaimed ? 
                    <h1 style={{color: 'white', fontSize:40, justifyContent:'center'}}> You received {amount} <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h1>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
                        <h1 style={{color: 'white', fontSize:40}}> You already claimed </h1>
                        <h1 style={{color: 'white', fontSize:40, marginTop:-10}}> your free <img style={{width: 50, height: 50, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h1>
                    </div>
                    :
                        <NotFollowing/>
                    }
            </FrameBase>
            ,
            {
                width: 600, 
                height: 400, 
                fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
            })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
