import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '../../../../../src/components/FrameBase'
import NotFollowing from '../../../../../src/components/NotFollowing';
import { RequestProps, getRequestProps } from '../../../../../src/utils';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const {isFollowing, rank, username, avatarUrl, wins, losses, points, streak, numBets} = getRequestProps(req, [RequestProps.IS_FOLLOWING, 
                                                                                                                        RequestProps.RANK, 
                                                                                                                        RequestProps.USERNAME, 
                                                                                                                        RequestProps.AVATAR_URL, 
                                                                                                                        RequestProps.WINS, 
                                                                                                                        RequestProps.LOSSES, 
                                                                                                                        RequestProps.POINTS, 
                                                                                                                        RequestProps.STREAK,
                                                                                                                        RequestProps.NUM_BETS]);

        return new ImageResponse(
            <FrameBase>
                {isFollowing ?
                    (rank === -1 && !username) ?
                    <h2 style={{color: 'white', fontSize:50, textAlign:'center'}}> No profile found!</h2>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
                        <h1 style={{color: 'white', top:-50, left: 20, fontSize: 56, alignItems:'center'}}> 
                        <img
                            style={{ width: 65, height: 65, marginRight: 10, borderRadius: 50 }}
                            src={avatarUrl}
                            alt={`${process.env['HOST']}/generic_pfp.png`}
                            onError={(e) => {
                                console.log('error'); // Change to the URL of your fallback image
                            }}
                        />
                            {username} {rank !== -1 ? `(#${rank + 1})` : ''}
                        </h1>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', alignSelf:'center', top: -40}}>
                            <h2 style={{color: 'white', marginBottom:-10, fontSize:30}}> 🎲 Dice: {points} </h2>
                            <h2 style={{color: 'white', marginBottom:-10, fontSize:30}}> 🔥 Streak: {streak} </h2>
                            <h2 style={{color: 'white', fontSize:30}}> 🎰 Total Bets: {numBets} ({wins}W - {losses}L)</h2>
                        </div>
                    </div>
                    :
                    <NotFollowing/>
                }
            </FrameBase>
            ,
            {
                width: 764, 
                height: 400, 
                fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
            })
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
