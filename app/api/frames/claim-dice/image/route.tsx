import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import { RequestProps, getRequestProps } from '../../../../../src/utils';

// Fonts
// const plusJakartaSans = fetch(
//     new URL(
//       '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
//       import.meta.url,
//     ),
//   ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const {hasClaimed, balance, validCaptcha} = getRequestProps(req, [RequestProps.HAS_CLAIMED, RequestProps.BALANCE, RequestProps.VALID_CAPTCHA]);

        const imageResponse = new ImageResponse(
            <FrameBase>
                    {!validCaptcha ?
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center'}}>CAPTCHA failed!</h1>
                    :
                    (!hasClaimed ? 
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center'}}> You received {balance} <img style={{width: 65, height: 65, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h1>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', alignItems:'flex-start'}}>
                        <h1 style={{color: 'white', fontSize:55}}> You already claimed </h1>
                        <h1 style={{color: 'white', fontSize:55, marginTop:-10, alignItems:'flex-start'}}> your free <img style={{width: 65, height: 65, marginLeft:10, marginRight:10}}src={`${process.env['HOST']}/dice.png`}/>!</h1>
                    </div>
                    )}
            </FrameBase>
            ,
            {
                width: 764, 
                height: 400, 
                // fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
                headers:{
                    'CDN-Cache-Control': 'public, s-maxage=60',
                    'Vercel-CDN-Cache-Control': 'public, s-maxage=60'
                }
            })
        imageResponse.headers.set('Cache-Control', 'public, s-maxage=60, max-age=60');
        return imageResponse;
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

// export const runtime = 'edge';
