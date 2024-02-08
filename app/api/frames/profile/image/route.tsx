import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import { kv } from "@vercel/kv";
import { User } from '../../../../types';
import { RequestProps, getRequestProps, DEFAULT_USER } from '../../../../../src/utils';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const {isFollowing, fid} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.FID]);

        const profile = await (await fetch(`https://searchcaster.xyz/api/profiles?fid=${fid}`)).json().then((data) => data[0].body)
        const user : User | null = await kv.hgetall(fid) || DEFAULT_USER
        const rank : number | null = await kv.zrank('users', fid) 

        return new ImageResponse(
            <FrameBase>
                {isFollowing ?
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
                        <h1 style={{color: 'white', alignItems:'center', left:-30}}> 
                            {profile.avatarUrl && <img style={{width: 40, height: 40, marginRight:10, borderRadius: 50}} src={profile.avatarUrl}/>} 
                            {profile.username || ""} (#{rank})
                        </h1>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', alignSelf:'center', top:-30}}>
                            <h2 style={{color: 'white', marginBottom:-10}}> 🎲 Dice: {user.points} </h2>
                            <h2 style={{color: 'white', marginBottom:-10}}> 🔥 Streak: {user.streak} </h2>
                            <h2 style={{color: 'white'}}> 🎰 Total Bets: {user.numBets} ({user.wins}W - {user.wins}L)</h2>
                        </div>
                    </div>
                    :
                    <h2 style={{color: 'white', fontSize:40}}> You are not following Bookies</h2>
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
