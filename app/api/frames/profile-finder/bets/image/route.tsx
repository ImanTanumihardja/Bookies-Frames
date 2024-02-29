import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { RequestProps, getRequestProps } from '../../../../../../src/utils';
import { Event, Bet } from '../../../../../types';
import { kv } from '@vercel/kv';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

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
                        width: '65%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <img src={`${process.env['HOST']}/Full_logo.png`} style={{ width: 120, height: 40, position: 'absolute', bottom:10, left:10}}/>
                    <div style={{display: 'flex', flexDirection:'column', justifyContent:'center', alignContent:'center', width:'100%', height:'100%'}}>
                        <h1 style={{color: 'white', fontSize:50, bottom: 10, textAlign:'center', margin:10}}> {event.prompt} {`(${date.toLocaleDateString()})`}</h1>
                    </div>
                </div>
                <div style={{display:'flex', width:'35%', flexDirection:'column', alignItems: 'center'}}>
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
export const revalidate = 30;
