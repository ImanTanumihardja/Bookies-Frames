import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import NotFollowing from '../../../../../src/components/NotFollowing';
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
        const {isFollowing, rank, username, avatarUrl, wins, losses, points, streak, numBets, hasProfile} = getRequestProps(req, [RequestProps.IS_FOLLOWING, 
                                                                                                                        RequestProps.RANK, 
                                                                                                                        RequestProps.USERNAME, 
                                                                                                                        RequestProps.AVATAR_URL, 
                                                                                                                        RequestProps.WINS, 
                                                                                                                        RequestProps.LOSSES, 
                                                                                                                        RequestProps.POINTS, 
                                                                                                                        RequestProps.STREAK,
                                                                                                                        RequestProps.NUM_BETS,
                                                                                                                        RequestProps.HAS_PROFILE
                                                                                                                    ]);

        return new ImageResponse(
            <FrameBase>
                {isFollowing ?
                    (rank === -1 && hasProfile) ?
                    <h2 style={{color: 'white', fontSize:40, textAlign:'center'}}> No profile found</h2>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
                        <h1 style={{color: 'white', alignItems:'center', left:-30}}> 
                            <img style={{width: 40, height: 40, marginRight:10, borderRadius: 50}} src={avatarUrl}/>
                            {username} {rank !== -1 ? `(#${rank})` : ''}
                        </h1>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', alignSelf:'center', top:-30}}>
                            <h2 style={{color: 'white', marginBottom:-10}}> 🎲 Dice: {points} </h2>
                            <h2 style={{color: 'white', marginBottom:-10}}> 🔥 Streak: {streak} </h2>
                            <h2 style={{color: 'white'}}> 🎰 Total Bets: {numBets} ({wins}W - {losses}L)</h2>
                        </div>
                    </div>
                    :
                    <NotFollowing/>
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
