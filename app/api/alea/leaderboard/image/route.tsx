import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import FrameBase from '@components/AleaFrameBase'
import { getRequestProps } from '@utils';
import { RequestProps, DatabaseKeys } from '@utils/constants';
import { kv } from "@vercel/kv";
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        const {offset} = getRequestProps(req, [RequestProps.OFFSET]);
        let count = 10
        if (offset === 0) count = 5 

        // Get 10 users from the leaderboard from cursor
        const users : number[] = await kv.zrange(DatabaseKeys.LEADERBOARD, '+inf', 0, {byScore: true, rev:true, offset: offset, count: count, withScores:true});

        if (users.length === 0) {
            console.error('No users found');
        }

        const fids = users.filter((_:any, index:number) => index % 2 === 0);
        const scores = users.filter((_:any, index) => index % 2 !== 0);

        console.log('FIDS: ', fids)

        // Get all profiles from fids
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', api_key: process.env['NEYNAR_API_KEY'] || ''}
          };
          
          const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${encodeURIComponent(fids.toString())}`, options);
          const data = await response.json();
          const profiles = data.users || [];

        if (profiles.length !== fids.length) {
            throw new Error('Profiles and users length do not match');
        }

        // For each user generate a string that represents the users info
        const usersInfo = profiles.map((profile:any, index: number) => {
            if (profile) {
                const shortUsername = profile.username?.length > 7 ? profile.username?.substring(0, 7) + "... " : profile.username;  
                return `${offset + index + 1}. ${shortUsername}: ${Math.round(scores[index])}`
            }
        })

        let imageResponse = new ImageResponse(
            <FrameBase>
                <div style={{display:'flex', flexDirection:'row', width:'100%', height:'100%', justifyContent:'center'}}>
                    <h1 style={{color: 'white', fontSize:55, padding:10, position:'absolute', top: -25, left: 15}}>Leaderboard</h1>
                    {offset === 0 ?
                    <div style={{display:'flex', height:'85%', flexDirection:'column', justifyContent:'center', flexWrap: 'wrap', top:50}}>
                        {profiles.map((profile: any, index: number) => {
                            const shortUsername = profile.username?.length > 10 ? profile.username?.substring(0, 10) + "... " : profile.username;  
                            return (
                                profile && 
                                <h3 key={index} style={{color: 'white', fontSize: 35, marginBottom:0}}> 
                                    {`${offset + index + 1}.` }
                                    <img style={{ width: 40, maxHeight: 40, marginLeft: 15, marginRight: 10, borderRadius: 50, top:5 }} src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_jpg,w_168/${encodeURI(profiles[index].pfp_url)}`} alt={`${process.env['HOST']}/generic_pfp.png`} /> 
                                    {`${shortUsername}: ${Math.round(scores[index])}`}
                                </h3>
                            )
                        })}
                    </div>
                    :
                    <div style={{display:'flex', height:'75%', flexDirection:'column', justifyContent:'flex-start', flexWrap: 'wrap', top:60, left:50}}>
                        {usersInfo.map((userInfo: string | undefined, index: number) => {
                            return (
                                userInfo && 
                                <h3 key={index} style={{color: 'white', fontSize: 30, marginRight: index < profiles.length ? '100px' : '0', marginBottom:-5}}>{userInfo}</h3>
                            )
                        })}
                    </div>
                    }
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
        return imageResponse
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

// export const runtime = 'edge';
export const revalidate = 60;
export const dynamic = 'force-dynamic';