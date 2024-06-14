import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { getRequestProps, neynarClient } from '@utils';
import { RequestProps } from '@utils/constants';
import * as fs from "fs";
import { join } from 'path';
import { getCldImageUrl } from 'next-cloudinary';
import FrameBase from '@components/BookiesFrameBase';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest, { params: { eventName } }: { params: { eventName: string } }) {
    try {
        const {time: startDate} = getRequestProps(req, [RequestProps.TIME]);

        const now = new Date().getTime() / 1000;

        // Get hrs and mins till event
        const till = startDate - now;
        const hours = Math.ceil(((till) / (60 * 60)) * 10) / 10;

        let imageUrl, profile, pfpURL, prompt = null;
        
        imageUrl = getCldImageUrl({
            width: 960,
            height: 600,
            src: eventName
        });
    
    
        // Check if have thumbnail
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (!response.ok) {
            imageUrl = null;
            
            const {prompt:prompt_, fid:creator} = getRequestProps(req, [RequestProps.PROMPT, RequestProps.FID]);
            prompt = prompt_;

            if (prompt && creator)
            {
                // Get creator profile from fid
                profile = (await neynarClient.fetchBulkUsers([creator])).users[0];
                pfpURL = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(profile.pfp_url)}` 
            }
        }

        let imageResponse = new ImageResponse(
            <FrameBase>
                <div style={{width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems: 'center'}}>
                        {imageUrl
                        ? 
                        <img src={imageUrl} />
                        :
                        <div style={{width: 650, height: 310, backgroundColor: 'white', display: 'flex', flexDirection:'column', justifyContent:'center', alignItems: 'center', borderRadius: "75px"}}>
                            <h1 style={{textAlign:'center', color: 'black', fontSize: 40, fontWeight: 'bold', margin:10}}>{prompt}</h1>
                            <h2 style={{textAlign:'center', color: 'black', fontSize: 30, fontWeight: 'bold'}}>Created by: @{profile.username} <img style={{ width: 40, maxHeight: 40, marginLeft: 5, marginRight: 5, borderRadius: 50 }} src={pfpURL}/></h2>
                        </div>}
                    <h1 style={{color: 'white', fontSize:20, position:'absolute', bottom:-10, right:15, textAlign:'start', textDecoration:'underline'}}>{now > startDate ? `Event Closed` : `Closes in: ${hours} hrs`}</h1>
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
