import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps } from '../../../../../../src/utils';
import { Event, Bet } from '../../../../../types';
import { kv } from '@vercel/kv';
import * as fs from "fs";
import { join } from 'path';

// Fonts
const fontPath = join(process.cwd(), 'PlusJakartaSans-Bold.ttf')
let fontData = fs.readFileSync(fontPath)

export async function GET(req: NextRequest) {
    try {
        const {fid, eventName} = getRequestProps(req, [RequestProps.FID, RequestProps.EVENT_NAME]); 
        
        // Wait for both user to be found and event to be found
        let bets : Record<string , Bet[]> | null = null;
        let event : Event | null = null;

        await Promise.all([kv.hget(fid.toString(), 'bets'), kv.hgetall(eventName)]).then( (res) => {
            bets = res[0] as Record<string , Bet[]> || null;
            event = res[1] as unknown as Event || null;
        });

        event = event as unknown as Event || null;

        if (!bets || Object.keys(bets).length === 0) throw new Error('User is null');

        // Get info for bet
        if (event === null) throw new Error('Event not found');

        const eventBets: Bet[] = bets[eventName] || [];

        if (!eventBets) throw new Error('No bets found');

        console.log(`${eventName}: ${eventBets.length} bets`);

        const date = new Date(parseInt(event.startDate.toString()));

        const imageResponse = new ImageResponse(
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '35%',
                        height: '100%',
                        background: 'linear-gradient(to right, #68b876, #457e8b, #0000b4)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
                    <h1 style={{color: 'white', fontSize:25, position: 'absolute', top: 0, left:20}}> {`(${date.toLocaleDateString()})`} </h1>
                    <h1 style={{color: 'white', fontSize: event.prompt.length > 50 ? 30 : event.prompt.length > 40 ? 35 : 45, justifyContent:'center', alignItems:'center', textAlign:'center', padding:25}}> {event.prompt} </h1>
                </div>
                <div style={{display:'flex', width:'65%', flexDirection:'column', alignItems: 'center', background:'white'}}>
                    {eventBets.reverse().slice(0, 7).map((bet: Bet | undefined, index: number) => {
                        return (
                            bet && 
                            <h3 key={index} style={{color: 'black', fontSize: 30, marginBottom:-5}}>
                                {event?.options[bet.pick]} | {bet.stake} {event?.result != -1 ? (bet.pick == event?.result ? '✅' : '❌') : ''}
                            </h3>
                        )
                    })}
                </div>
                {eventBets.length > 7 ?
                <h2 style={{color: 'black', fontSize:35, justifyContent:'center', margin:-10}}>. . .</h2>
                :
                <div></div>
                }
            </div>,
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
export const revalidate = 60;
export const dynamic = 'force-dynamic';
