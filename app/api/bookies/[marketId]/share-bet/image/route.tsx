import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { formatOdd, getRequestProps, neynarClient } from '@utils';
import { BOOKIES_FID, RequestProps } from '@utils/constants';
import * as fs from "fs";
import { join } from 'path';
import FrameBase from '@components/frames/BookiesFrameBase';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        const {prompt, options, odds, stake, pick, symbol, fid} = getRequestProps(req, [RequestProps.PROMPT, 
                                                                                     RequestProps.OPTIONS, 
                                                                                     RequestProps.ODDS, 
                                                                                     RequestProps.PICK,
                                                                                     RequestProps.STAKE, 
                                                                                     RequestProps.SYMBOL, 
                                                                                     RequestProps.FID]);

        // Get user profile
        const profile = (await neynarClient.fetchBulkUsers([fid], {viewerFid: BOOKIES_FID})).users[0];

        if (!profile) {
            throw new Error('User not found');
        }

        const formattedOdd = formatOdd(odds[pick]);


        let imageResponse =  new ImageResponse(
            <FrameBase logoW={75} logoH={75}>
                <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', alignItems: 'center'}}>
                    <h1 style={{position:"absolute", fontSize:25, top:10, left: 30, color:"white"}}> {prompt}</h1>
                    <img
                        style={{ maxWidth: 200, maxHeight: 200, borderRadius: 100 }}
                        src={profile.pfp_url}
                        alt={`${process.env['NEXT_PUBLIC_HOST']}/generic_pfp.png`}
                    />
                    <h1 style={{color: 'white', fontSize: 45, alignItems:'center', marginTop:0}}>@{profile.username}</h1>
                    <h1 style={{color:'white', padding:20, textAlign:"center"}}>{`${profile.display_name} bet ${stake} \$${symbol} on ${options[pick]} at ${formattedOdd}`}</h1>
                </div>
            </FrameBase>
            ,
            {
                width: 700, 
                height: 700, 
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
