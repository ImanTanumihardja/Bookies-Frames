import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import * as fs from "fs";
import { join } from 'path';
import FrameBase from '@components/frames/BookiesFrameBase';
import { getRequestProps, RequestProps } from '@utils';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest, ) {
    try {
        let {username, avatarUrl, wins, losses, numBets, profitAndLoss} = getRequestProps(req, [RequestProps.USERNAME, 
                                                                                    RequestProps.AVATAR_URL, 
                                                                                    RequestProps.WINS, 
                                                                                    RequestProps.LOSSES, 
                                                                                    RequestProps.NUM_BETS,
                                                                                    RequestProps.PNL]);

        if (username && avatarUrl) {
            avatarUrl = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(avatarUrl)}`          
            username = username?.length > 10 ? username?.substring(0, 10) + "..." : username;      
        }   

        let imageResponse = new ImageResponse(
            <FrameBase logoW={75} logoH={75}>
                <div style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', alignItems: 'center'}}>
                    <h1 style={{position:"absolute", top:10, left: 30, color:"white"}}>Bookies Stats</h1>
                    <img
                        style={{ width: 200, maxHeight: 200, borderRadius: 100 }}
                        src={avatarUrl}
                        alt={`${process.env['NEXT_PUBLIC_HOST']}/generic_pfp.png`}
                    />
                    <h1 style={{color: 'white', fontSize: 45, alignItems:'center', marginTop:0}}>@{username}</h1>
                    <div style={{minWidth:'75%', display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', borderWidth:3, borderColor:"white"}}>
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <div style={{display: 'flex', flexDirection:"column", justifyContent: 'center', alignItems: 'center', padding:15}}>
                                <h2 style={{color: 'white', fontSize: 30, margin:2}}> BETS </h2>
                                <h2 style={{color: 'white', fontSize: 30, margin:0}}> {numBets} </h2>
                            </div>
                            <div style={{display: 'flex', flexDirection:"column", justifyContent: 'center', alignItems: 'center', padding:15}}>
                                <h2 style={{color: 'white', fontSize: 30, margin:2}}> WINS </h2>
                                <h2 style={{color: 'white', fontSize: 30, margin:0}}> {wins} </h2>
                            </div>
                            <div style={{display: 'flex', flexDirection:"column", justifyContent: 'center', alignItems: 'center', padding:15}}>
                                <h2 style={{color: 'white', fontSize: 30, margin:2}}> LOSSES </h2>
                                <h2 style={{color: 'white', fontSize: 30, margin:0}}> {losses} </h2>
                            </div>
                            <div style={{display: 'flex', flexDirection:"column", justifyContent: 'center', alignItems: 'center', padding:15}}>
                                <h2 style={{color: 'white', fontSize: 30, margin:2}}> P/L </h2>
                                <h2 style={{color: 'white', fontSize: 30, margin:0}}> {profitAndLoss}% </h2>
                            </div>
                        </div>
                    </div>
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
export const revalidate = 0;
