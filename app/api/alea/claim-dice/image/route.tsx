import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '@components/AleaFrameBase'
import { getRequestProps } from '@utils';
import { RequestProps } from '@utils/constants';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

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
                        <h1 style={{color: 'white', fontSize:55}}> You already claimed!</h1>
                    </div>
                    )}
            </FrameBase>
            ,
            {
                width: 764, 
                height: 400, 
                fonts: [{ name: 'Plus_Jakarta_Sans_700', data: fontData, weight: 400 }],
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
export const dynamic = 'force-dynamic';