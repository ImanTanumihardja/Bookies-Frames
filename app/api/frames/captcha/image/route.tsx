import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        const image = req.nextUrl.searchParams.get('image')
        const imageResponse = new ImageResponse(
            <FrameBase>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <h2 style={{color: 'white', fontSize:50, justifyContent:'center', alignItems:'center', textAlign:'center'}}>Click the matching image</h2>
                    <h1 style={{color: 'white', fontSize:100, justifyContent:'center', alignItems:'center', }}>{image}</h1>
                    <h2 style={{color: 'white', fontSize:20, justifyContent:'center', alignItems:'center', textAlign:'center'}}>Need to make sure you are not a bot!</h2>
                </div>
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
