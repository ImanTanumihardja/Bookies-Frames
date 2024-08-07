import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '@components/frames/AleaFrameBase'
import { getRequestProps } from '@utils';
import { RequestProps } from '@utils/constants';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        const {rank, username, avatarUrl, wins, losses, balance, streak, numBets} = getRequestProps(req, [
                                                                                                        RequestProps.RANK, 
                                                                                                        RequestProps.USERNAME, 
                                                                                                        RequestProps.AVATAR_URL, 
                                                                                                        RequestProps.WINS, 
                                                                                                        RequestProps.LOSSES, 
                                                                                                        RequestProps.BALANCE, 
                                                                                                        RequestProps.STREAK,
                                                                                                        RequestProps.NUM_BETS]);
        
        let pfpURL = undefined;
        let shortUsername = undefined;

        if (username && avatarUrl) {
            pfpURL = `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(avatarUrl)}`          
            shortUsername = username?.length > 10 ? username?.substring(0, 10) + "..." : username;      
        }                                                                            

        const imageResponse = new ImageResponse(
            <FrameBase>
                    {
                    (rank === -1 && !shortUsername && !pfpURL) ?
                    <h2 style={{color: 'white', fontSize:50, textAlign:'center'}}> No profile found!</h2>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
                        <h1 style={{color: 'white', top:-25, left: 20, fontSize: 56, alignItems:'center'}}> 
                        <img
                            style={{ width: 65, maxHeight: 65, marginRight: 15, borderRadius: 50 }}
                            src={pfpURL}
                            alt={`${process.env['NEXT_PUBLIC_HOST']}/generic_pfp.png`}
                        />
                            {shortUsername} {rank !== -1 ? `(#${rank + 1})` : ''}
                        </h1>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', alignSelf:'center', top: -50}}>
                            <h2 style={{color: 'white', marginBottom:-10, fontSize:40}}> 🎲 Balance: {Math.round(balance)} </h2>
                            <h2 style={{color: 'white', marginBottom:-10, fontSize:40}}> 🔥 Streak: {streak} </h2>
                            <h2 style={{color: 'white', fontSize:40}}> 🎰 Total Bets: {numBets} ({wins}W - {losses}L)</h2>
                        </div>
                    </div>
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