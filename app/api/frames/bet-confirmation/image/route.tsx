import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import NotFollowing from '../../../../../src/components/NotFollowing';
import { RequestProps, getRequestProps } from '../../../../../src/utils';
import { kv } from '@vercel/kv';
import { Bet } from '../../../../types';

// Fonts
const plusJakartaSans = fetch(
    new URL(
      '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
      import.meta.url,
    ),
  ).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
    try {
        let text='' // Default empty React element
        const {isFollowing, pick, stake, buttonIndex, fid, eventName, options, time} = getRequestProps(req, [RequestProps.IS_FOLLOWING, RequestProps.EVENT_NAME, RequestProps.STAKE, RequestProps.PICK, RequestProps.BUTTON_INDEX, RequestProps.FID, RequestProps.OPTIONS, RequestProps.TIME]);

        // Get bets for this event by filtering the bets array for the eventName
        const bets = ((await kv.hget(fid?.toString() || "", 'bets')) || []);
        const betsArray = Array.isArray(bets) ? bets : [];

        // Ensure bets is an array before calling filter
        const filteredBets : Bet[] = betsArray.filter((bet: any) => bet.eventName === eventName);

        if (filteredBets === null) throw new Error('Bets not found');

        if (buttonIndex == 2) {
            text = 'You rejected the bet!'
        } 
        else if (stake <= -1){
            text =  "You don't have enough dice!"
        }
        else if (pick === -1) {
            text = "Event is over!"
        }
        else {
            text = "Bet confirmed!"
        }

        return new ImageResponse(
            (
            isFollowing ? 
            <div style={{display: 'flex', flexDirection:'row', height:'100%', width:'100%'}}>
                <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '65%',
                        height: '100%',
                        background: 'linear-gradient(to right, orange, #aa3855, purple)',
                        justifyContent: 'center',
                }}>
                    <h1 style={{color: 'white', fontSize:55, justifyContent:'center', alignItems:'center', margin:50}}> {text} </h1>
                </div>
                <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyItems:'flex-start',
                        width: '35%',
                        height: '100%',
                        background: 'white'}}>
                            <h1 style={{color: 'black', fontSize:35, justifyContent:'center', margin:5, marginTop: 20}}>Your Bets: </h1>
                            <div style={{display: 'flex', flexDirection:'column', alignItems: 'center'}}>
                                {filteredBets.reverse().slice(0, 6).map((bet: Bet, index: number) => { 
                                return (
                                    (bet.timeStamp === time) ?
                                    <h2 key={index} style={{color: 'black', fontSize:20, justifyContent:'center', margin:10, textDecoration:"underline"}}>{options[bet.pick]} | {bet.stake}</h2>
                                    :
                                    <h2 key={index} style={{color: 'black', fontSize:20, justifyContent:'center', margin:10}}>{options[bet.pick]} | {bet.stake}</h2>
                                )})}
                            </div>
                            {filteredBets.length > 6 ?
                            <h2 style={{color: 'black', fontSize:35, justifyContent:'center', margin:-10}}>. . .</h2>
                            :
                            <div></div>
                            }
                </div>
            </div>
            :
            <NotFollowing/>
            ), {
            width: 764, 
            height: 400, 
            fonts: [{ name: 'Plus_Jakarta_Sans_700', data: await plusJakartaSans, weight: 400 }],
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Could not generate image', { status: 500 });
    }
}

export const runtime = 'edge';
