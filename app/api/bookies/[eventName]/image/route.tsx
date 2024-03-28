import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps } from '../../../../../src/utils';
import * as fs from "fs";
import { join } from 'path';
import { getCldImageUrl } from 'next-cloudinary';
import FrameBase from '../../../../../src/components/AleaFrameBase';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }) {
    try {
        const {time:startDate} = getRequestProps(req, [RequestProps.TIME]);

        const now = new Date().getTime();

        // Get hrs and mins till event
        const till = startDate - now;
        const hours = Math.ceil(((till) / (1000 * 60 * 60)) * 10) / 10;


        const imageUrl = getCldImageUrl({
            width: 960,
            height: 600,
            src: eventName
          });

        let imageResponse =  new ImageResponse(
            <FrameBase>
                <div style={{display:'flex'}}>
                    <img src={imageUrl} />
                    <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-5, right:15, textAlign:'start', textDecoration:'underline'}}>{now > startDate ? `Event Closed` : `Closes in: ${hours} hrs`}</h1>
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
export const dynamic = 'force-dynamic';
export const revalidate = 0;
