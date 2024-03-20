import { NextRequest, NextResponse, userAgent } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../src/components/AleaFrameBase'
import NotFollowing from '../../../../src/components/NotFollowing';
import { RequestProps, getRequestProps } from '../../../../src/utils';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

const MAX_QUESTIONS = 10;

export async function GET(req: NextRequest) {
    try {
        const {isFollowing, prompt: question, wins: count, losses: strikes} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.PROMPT, RequestProps.WINS, RequestProps.LOSSES]);

        const imageResponse = new ImageResponse(
            <FrameBase>
                {(count !== -1 && count !== MAX_QUESTIONS && strikes !== 3) && <h1 style={{color: 'white', position:'absolute', top: 10, right: 25, fontSize:25}}> {count}/{MAX_QUESTIONS}</h1>}
                {isFollowing ?
                    count === -1 ?
                    <div style={{display:'flex', flexDirection:'column', color: 'white', justifyContent:'center', alignItems:'center'}}>
                        <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}>Game Over!</h1>
                        <h1 style={{color: 'white', fontSize:35, justifyContent:'flex-start', alignItems:'center'}}>You have {3 - strikes} strikes left</h1>
                    </div>
                    :
                    strikes === 3 ?
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', textAlign:'center', margin:35}}>You have reached 3 strikes!</h1>
                    :
                    count === MAX_QUESTIONS ?
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'flex-start', alignItems:'center', margin:35}}>You got {count}/{MAX_QUESTIONS}!</h1>
                    :
                    <h1 style={{color: 'white', fontSize:45, justifyContent:'flex-start', alignItems:'center', margin:35}}>{question}</h1>
                    :
                    <NotFollowing/>
                }
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
