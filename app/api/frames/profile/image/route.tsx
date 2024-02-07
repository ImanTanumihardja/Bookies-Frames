import { ImageResponse, NextRequest, NextResponse } from 'next/server';
import FrameBase from '../../../../../src/components/FrameBase'
import { kv } from "@vercel/kv";
import { User } from '../../../../types';

const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        const accountAddress: string = req.nextUrl.searchParams.get("accountAddress") || ""
        const isFollowing: boolean = req.nextUrl.searchParams.get("isFollowing") ? "true" === req.nextUrl.searchParams.get("isFollowing") : false

        const profile = await (await fetch(`https://searchcaster.xyz/api/profiles?address=${accountAddress}`)).json().then((data) => data[0].body)
        const user : User = await kv.hgetall(accountAddress) || {points: 0, streak: 0, wins:0, losses:0, latestBet: {eventName: "", prediction: -1, wagerAmount: 0, timeStamp: 0}};

        return new ImageResponse(
            <FrameBase>
                    {isFollowing ?
                    <div style={{display: 'flex', flexDirection: 'column', width:'100%',}}>
                        <h1 style={{color: 'white'}}> <img style={{width: 50, height: 50, marginRight:10, borderRadius: 50}} src={profile.avatarUrl}/> {profile.username} </h1>
                        <table style={{}}>
                            <thead>
                                <tr>
                                    <th style={{color: 'white', fontSize:20, padding: 15}}> Dice </th>
                                    <th style={{color: 'white', fontSize:20, padding: 15}}> Wins </th>
                                    <th style={{color: 'white', fontSize:20, padding: 15}}> Losses </th>
                                    <th style={{color: 'white', fontSize:20, padding: 15}}> Streak </th>
                                </tr>
                            </thead>
                           <tbody>
                                <tr>
                                    <td style={{color: 'white', fontSize:20, padding: 15}}> {user.points} </td>
                                    <td style={{color: 'white', fontSize:20, padding: 15}}> {user.wins} </td>
                                    <td style={{color: 'white', fontSize:20, padding: 15}}> {user.losses} </td>
                                    <td style={{color: 'white', fontSize:20, padding: 15}}> {user.streak} </td>
                                </tr>
                           </tbody>
                            
                        </table>
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
