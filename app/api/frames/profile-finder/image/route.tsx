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
        const {isFollowing, rank, username, avatarUrl, wins, losses, balance, streak, numBets} = getRequestProps(req, [RequestProps.IS_FOLLOWING, 
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
                {isFollowing ?
                    (rank === -1 && !shortUsername && !pfpURL) ?
                    <h2 style={{color: 'white', fontSize:50, textAlign:'center'}}> No profile found!</h2>
                    :
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
                        <h1 style={{color: 'white', top:-25, left: 20, fontSize: 56, alignItems:'center'}}> 
                        <img
                            style={{ width: 65, maxHeight: 65, marginRight: 15, borderRadius: 50 }}
                            src={pfpURL}
                            alt={`${process.env['HOST']}/generic_pfp.png`}
                        />
                            {shortUsername} {rank !== -1 ? `(#${rank + 1})` : ''}
                        </h1>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', alignSelf:'center', top: -50}}>
                            <h2 style={{color: 'white', marginBottom:-10, fontSize:40}}> 🎲 Dice: {balance} </h2>
                            <h2 style={{color: 'white', marginBottom:-10, fontSize:40}}> 🔥 Streak: {streak} </h2>
                            <h2 style={{color: 'white', fontSize:40}}> 🎰 Total Bets: {numBets} ({wins}W - {losses}L)</h2>
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

export const runtime = 'edge';
